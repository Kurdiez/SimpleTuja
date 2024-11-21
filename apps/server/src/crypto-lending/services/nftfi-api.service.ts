import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import NFTfi from '@nftfi/js';
import { CryptoToken, CryptoTokenAddress } from '@simpletuja/shared';
import Big from 'big.js';
import { Repository } from 'typeorm';
import { CustomException } from '~/commons/errors/custom-exception';
import { ConfigService } from '~/config';
import { CryptoLendingUserStateEntity } from '~/database/entities/crypto-lending-user-state.entity';
import {
  NftFiActiveLoan,
  NftFiApiLoanStatus,
  NftFiLoanOffer,
  NftFiLoanSort,
  NftFiPaginatedResponse,
} from '../types/nftfi-types';

interface QueueItem {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

@Injectable()
export class NftFiApiService {
  private requestQueue: QueueItem[] = [];
  private processingQueue = false;
  private requestsThisMinute = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 90;
  private nextResetTime: Date;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CryptoLendingUserStateEntity)
    private readonly cryptoLendingUserStateRepo: Repository<CryptoLendingUserStateEntity>,
  ) {
    this.nextResetTime = this.calculateNextMinute();
    this.startQueueProcessor();
  }

  async getOffersForWallet(
    walletPrivateKey: string,
  ): Promise<NftFiLoanOffer[]> {
    return this.enqueueRequest(async () => {
      const nftfiClient = await this.getNftFiClient(walletPrivateKey);
      return this.fetchAllPages<NftFiLoanOffer>((page) =>
        nftfiClient.offers.get({
          pagination: { page, limit: 10 },
        }),
      );
    });
  }

  async getOffersForUser(userId: string) {
    return this.enqueueRequest(async () => {
      const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
        where: { userId },
      });
      return await this.getOffersForWallet(userState.walletPrivateKey);
    });
  }

  async getAllOffersForCollection(
    collectionAddress: string,
  ): Promise<NftFiLoanOffer[]> {
    const nftfiClient = await this.getNftFiClient();
    return this.fetchAllPages<NftFiLoanOffer>((page) =>
      this.enqueueRequest(() =>
        nftfiClient.offers.get({
          filters: {
            nft: { address: collectionAddress },
          },
          pagination: { page, limit: 10 },
        }),
      ),
    );
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
    return this.enqueueRequest(async () => {
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

      return result;
    });
  }

  async getTokenAllowanceForWallet(
    walletPrivateKey: string,
    token: CryptoToken,
  ): Promise<Big> {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const allowance = await nftfiClient.erc20.allowance({
      token: { address: CryptoTokenAddress[token] },
      nftfi: {
        contract: { name: nftfiClient.config.protocol.v3.erc20Manager.v1.name },
      },
    });
    return new Big(allowance.toString());
  }

  async getTokenAllowanceForUser(
    userId: string,
    token: CryptoToken,
  ): Promise<Big> {
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
    return this.enqueueRequest(async () => {
      const nftfiClient = await this.getNftFiClient(walletPrivateKey);

      const options = {
        token: { address: CryptoTokenAddress[token] },
        nftfi: {
          contract: {
            name: nftfiClient.config.protocol.v3.erc20Manager.v1.name,
          },
        },
      };

      return await nftfiClient.erc20.approveMax(options);
    });
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

  async getLentLoansForWallet(
    walletPrivateKey: string,
    status: NftFiApiLoanStatus,
  ): Promise<NftFiActiveLoan[]> {
    return this.enqueueRequest(async () => {
      const nftfiClient = await this.getNftFiClient(walletPrivateKey);
      return this.fetchAllPages<NftFiActiveLoan>((page) =>
        nftfiClient.loans.get({
          filters: {
            lender: { address: nftfiClient.account.getAddress() },
            status: status,
          },
          pagination: { page, limit: 10 },
        }),
      );
    });
  }

  async getLentLoansForUser(userId: string, status: NftFiApiLoanStatus) {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    return await this.getLentLoansForWallet(userState.walletPrivateKey, status);
  }

  async getLentLoansForWalletPaginated(
    walletPrivateKey: string,
    status: NftFiApiLoanStatus,
    page: number,
    limit: number = 10,
    sort?: NftFiLoanSort,
  ): Promise<NftFiPaginatedResponse<NftFiActiveLoan>> {
    return this.enqueueRequest(async () => {
      const nftfiClient = await this.getNftFiClient(walletPrivateKey);

      return nftfiClient.loans.get({
        filters: {
          status,
          lender: {
            address: nftfiClient.account.getAddress(),
          },
        },
        pagination: { page, limit },
        sort,
      });
    });
  }

  async getLentLoansForUserPaginated(
    userId: string,
    status: NftFiApiLoanStatus,
    page: number,
    limit: number = 10,
    sort?: NftFiLoanSort,
  ) {
    const userState = await this.cryptoLendingUserStateRepo.findOneOrFail({
      where: { userId },
    });
    return await this.getLentLoansForWalletPaginated(
      userState.walletPrivateKey,
      status,
      page,
      limit,
      sort,
    );
  }

  async liquidateLoan(walletPrivateKey: string, nftfiLoanId: string) {
    const nftfiClient = await this.getNftFiClient(walletPrivateKey);
    const result = await nftfiClient.loans.liquidate({
      loan: { id: nftfiLoanId },
    });

    if (result.error || result.errors) {
      throw new CustomException(
        'Failed to liquidate loan with NFTfi due to an error',
        {
          errorFromNftfi: result.error || result.errors,
          walletPrivateKey,
          nftfiLoanId,
        },
      );
    }

    return result.success;
  }

  private async enqueueRequest<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({ execute, resolve, reject });
      this.processQueue();
    });
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      const now = new Date();
      if (now >= this.nextResetTime) {
        this.requestsThisMinute = 0;
        this.nextResetTime = this.calculateNextMinute();
        this.processQueue();
      }
    }, 1000);
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (
      this.requestQueue.length > 0 &&
      this.requestsThisMinute < this.MAX_REQUESTS_PER_MINUTE
    ) {
      const request = this.requestQueue[0];

      try {
        const result = await request.execute();
        this.requestsThisMinute++;
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      } finally {
        this.requestQueue.shift();
      }
    }

    this.processingQueue = false;

    if (this.requestQueue.length > 0) {
      const timeUntilNextMinute = this.nextResetTime.getTime() - Date.now();
      setTimeout(() => this.processQueue(), timeUntilNextMinute);
    }
  }

  private calculateNextMinute(): Date {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() + 1,
      0,
      0,
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

  private async fetchAllPages<T>(
    fetchPage: (page: number) => Promise<NftFiPaginatedResponse<T>>,
  ): Promise<T[]> {
    const allResults: T[] = [];
    const PageSize = 10;
    let currentPage = 1;

    while (true) {
      const result = await fetchPage(currentPage);
      const pageResults = result.data.results;

      if (!pageResults.length) {
        break;
      }

      allResults.push(...pageResults);

      if (pageResults.length < PageSize) {
        break;
      }

      currentPage++;
    }

    return allResults;
  }
}
