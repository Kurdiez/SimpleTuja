import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CryptoToken,
  CryptoTokenAddress,
  CryptoTokenDecimals,
  WithdrawTokenStatus,
} from '@simpletuja/shared';
import Big from 'big.js';
import {
  ContractTransactionResponse,
  ethers,
  TransactionResponse,
} from 'ethers';
import { Repository } from 'typeorm';
import { ConfigService } from '~/config';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending/crypto-lending-user-state.entity';

@Injectable()
export class InvestmentWalletService {
  constructor(
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly userStateRepo: Repository<CryptoLendingUserStateEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getTokenBalances(userId: string): Promise<Record<CryptoToken, string>> {
    const balances = await Promise.all([
      this.getTokenBalance(userId, CryptoToken.ETH),
      this.getTokenBalance(userId, CryptoToken.WETH),
      this.getTokenBalance(userId, CryptoToken.DAI),
      this.getTokenBalance(userId, CryptoToken.USDC),
    ]);

    return {
      [CryptoToken.ETH]: balances[0].toString(),
      [CryptoToken.WETH]: balances[1].toString(),
      [CryptoToken.DAI]: balances[2].toString(),
      [CryptoToken.USDC]: balances[3].toString(),
    };
  }

  async getTokenBalance(userId: string, token: CryptoToken): Promise<Big> {
    const userState = await this.userStateRepo.findOneOrFail({
      where: { userId },
    });

    const wallet = new ethers.Wallet(userState.walletPrivateKey);
    const providerUrl = this.configService.get('PROVIDER_URL');
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const connectedWallet = wallet.connect(provider);

    let rawBalance: bigint;
    if (token === CryptoToken.ETH) {
      rawBalance = await provider.getBalance(connectedWallet.address);
    } else {
      const tokenContract = new ethers.Contract(
        CryptoTokenAddress[token],
        ['function balanceOf(address) view returns (uint256)'],
        provider,
      );
      rawBalance = await tokenContract.balanceOf(connectedWallet.address);
    }

    return new Big(ethers.formatUnits(rawBalance, CryptoTokenDecimals[token]));
  }

  async withdrawToken(
    userId: string,
    token: CryptoToken,
    amount: string,
    destinationAddress: string,
  ): Promise<true | WithdrawTokenStatus> {
    const userState = await this.userStateRepo.findOneOrFail({
      where: { userId },
    });

    const wallet = new ethers.Wallet(userState.walletPrivateKey);
    const providerUrl = this.configService.get('PROVIDER_URL');

    let provider: ethers.JsonRpcProvider;
    try {
      provider = new ethers.JsonRpcProvider(providerUrl);
    } catch {
      return WithdrawTokenStatus.NetworkOutage;
    }

    const connectedWallet = wallet.connect(provider);

    // Check token balance
    const currentBalance = await this.getTokenBalance(userId, token);
    if (currentBalance.lt(amount)) {
      return WithdrawTokenStatus.InsufficientTokenBalance;
    }

    try {
      let transactionResponse:
        | TransactionResponse
        | ContractTransactionResponse;
      const amountInWei = ethers.parseUnits(amount, CryptoTokenDecimals[token]);

      if (token === CryptoToken.ETH) {
        transactionResponse = await connectedWallet.sendTransaction({
          to: destinationAddress,
          value: amountInWei,
        });
      } else {
        // Define the interface for ERC20 token
        const tokenInterface = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address) view returns (uint256)',
        ]);

        const tokenContract = new ethers.Contract(
          CryptoTokenAddress[token],
          tokenInterface,
          connectedWallet,
        );

        // Call transfer function with properly ordered parameters
        transactionResponse = await tokenContract.transfer(
          destinationAddress,
          amountInWei,
        );
      }

      await transactionResponse.wait();
      return true;
    } catch (error) {
      // Check if error is due to insufficient gas
      if (
        error.code === 'INSUFFICIENT_FUNDS' ||
        error.message?.includes('insufficient funds')
      ) {
        return WithdrawTokenStatus.InsufficientEthForGasFee;
      }
      // For any other unexpected errors, throw them up
      throw error;
    }
  }
}
