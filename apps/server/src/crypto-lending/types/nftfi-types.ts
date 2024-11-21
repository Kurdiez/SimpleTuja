import { NftFiLoanStatus } from '@simpletuja/shared';

export interface NftFiLoanOffer {
  id: string;
  type: string;
  date: {
    offered: string;
  };
  nft: {
    id: string;
    address: string;
    project: {
      name: string;
    };
  };
  lender: {
    address: string;
    nonce: string;
  };
  borrower: {
    address: string;
  };
  terms: {
    loan: {
      unit: string;
      duration: number;
      repayment: number;
      principal: number;
      apr: number;
      cost: number;
      currency: string;
      expiry: number;
      interest: {
        prorated: boolean;
        bps: number | null;
      };
      origination: number;
      effectiveApr: number;
    };
  };
  signature: string;
  errors: {
    [scope: string]: {
      status: string;
      type: string;
      msg: string;
    }[];
  } | null;
}

export interface NftFiPaginatedResponse<T> {
  pagination: { total: number };
  data: {
    results: T[];
  };
  error: any | null;
}

export interface NftFiActiveLoan {
  id: number;
  status: NftFiLoanStatus;
  date: {
    started: string;
    repaid: string | null;
    due: string;
  };
  nft: {
    id: string;
    address: string;
    name: string;
    project: {
      name: string;
    };
    image: {
      uri: string;
    };
  };
  borrower: {
    address: string;
  };
  lender: {
    address: string;
  };
  terms: {
    loan: {
      duration: number;
      repayment: number;
      principal: number;
      apr: number;
      interest: number;
      currency: string;
      unit: string;
    };
  };
  nftfi: {
    contract: {
      name: string;
    };
  };
}

export enum NftFiLoanSortBy {
  Repayment = 'repayment',
  Interest = 'interest',
  Apr = 'apr',
  Duration = 'duration',
  DueDate = 'dueDate',
  NftName = 'nftName',
}

export enum NftFiLoanSortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface NftFiLoanSort {
  by: NftFiLoanSortBy;
  direction: NftFiLoanSortDirection;
}

export enum NftFiApiLoanStatus {
  Active = 'active',
  Repaid = 'repaid',
  Defaulted = 'defaulted',
  Liquidated = 'liquidated',
}
