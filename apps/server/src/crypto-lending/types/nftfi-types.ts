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
