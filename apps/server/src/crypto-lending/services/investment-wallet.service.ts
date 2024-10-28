import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CryptoToken,
  CryptoTokenDecimals,
  CryptoTokenAddress,
} from '@simpletuja/shared';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import Big from 'big.js';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { ConfigService } from '~/config';

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
}
