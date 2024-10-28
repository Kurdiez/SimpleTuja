import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '~/config';
import NFTfi from '@nftfi/js';
import { NftFiLoanOffer } from '../types/nftfi-types';
import { CustomException } from '~/commons/errors/custom-exception';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import { Repository } from 'typeorm';
import { CryptoToken, CryptoTokenAddress } from '@simpletuja/shared';

const CollectionLoanOfferContractName = 'v2-3.loan.fixed.collection';

@Injectable()
export class NftFiApiService {
  private readonly logger = new Logger(NftFiApiService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
  ) {}

  async getOffersForWallet(
    walletPrivateKey: string,
  ): Promise<NftFiLoanOffer[]> {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const offers = await nftfiClient.offers.get();
    return offers as NftFiLoanOffer[];
  }

  async getOffersForUser(userId: string) {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    return await this.getOffersForWallet(userState.walletPrivateKey);
  }

  async getAllOffersForCollection(collectionAddress: string) {
    const nftfiClient = await this.getNftFiClient();
    const offers = await nftfiClient.offers.get({
      filters: {
        nft: {
          address: collectionAddress,
        },
      },
    });
    return offers as NftFiLoanOffer[];
  }

  async makeLoanOffer({
    walletPrivateKey,
    collectionAddress,
    currencyAddress,
    principal,
    apr,
    durationInDays,
    originationFee,
    interestProrated,
  }: {
    walletPrivateKey: string;
    collectionAddress: string;
    currencyAddress: string;
    principal: number;
    apr: number;
    durationInDays: number;
    originationFee: number;
    interestProrated: boolean;
  }) {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const aprBufferPerDay = 0.1;
    const aprWithBuffer = aprBufferPerDay * durationInDays + apr;
    const numSecondsInDay = 86400;
    const terms = {
      currency: currencyAddress,
      principal,
      repayment: nftfiClient.utils.calcRepaymentAmount(
        principal,
        aprWithBuffer,
        durationInDays,
      ),
      duration: numSecondsInDay * durationInDays,
      expiry: numSecondsInDay * 1,
      origination: originationFee,
      interest: { prorated: interestProrated },
    };
    const loanOfferType = nftfiClient.config.protocol.v3.type.collection.name;

    const result = await nftfiClient.offers.create({
      type: loanOfferType,
      nft: { address: collectionAddress },
      terms,
    });

    if (result.error || result.errors) {
      throw new CustomException('Failed to make loan offer with NFTfi', {
        terms,
        errorFromNftfi: result.error || result.errors,
      });
    }
  }

  async getTokenAllowanceForWallet(
    walletPrivateKey: string,
    token: CryptoToken,
  ) {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const allowance = await nftfiClient.erc20.allowance({
      token: { address: CryptoTokenAddress[token] },
      nftfi: {
        contract: { name: CollectionLoanOfferContractName },
      },
    });
    return allowance.toString();
  }

  async getTokenAllowanceForUser(userId: string, token: CryptoToken) {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    return await this.getTokenAllowanceForWallet(
      userState.walletPrivateKey,
      token,
    );
  }

  async approveTokenMaxAllowanceForWallet(
    walletPrivateKey: string,
    token: CryptoToken,
  ) {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);

    const options = {
      token: { address: CryptoTokenAddress[token] },
      nftfi: {
        contract: {
          name: nftfiClient.config.protocol.v3.erc20Manager.v1.name,
        },
      },
    };

    const result = await nftfiClient.erc20.approveMax(options);

    console.log('options: ', JSON.stringify(options, null, 2));
    console.log('result: ', JSON.stringify(result, null, 2));

    return result;
  }

  async approveTokenMaxAllowanceForUser(userId: string, token: CryptoToken) {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    return await this.approveTokenMaxAllowanceForWallet(
      userState.walletPrivateKey,
      token,
    );
  }

  private async getNftFiClient(walletPrivateKey?: string) {
    const nftfiApiKey = this.configService.get('NFTFI_API_KEY');
    const providerUrl = this.configService.get('PROVIDER_URL');
    return await NFTfi.init({
      config: {
        api: { key: nftfiApiKey },
      },
      ethereum: {
        account: { privateKey: walletPrivateKey },
        provider: { url: providerUrl },
      },
    });
  }
}
