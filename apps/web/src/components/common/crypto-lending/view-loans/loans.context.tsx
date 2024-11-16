import { getLoans } from "@/utils/simpletuja/crypto-lending";
import {
  CryptoLoan,
  GetLoansResponse,
  NftFiLoanStatus,
} from "@simpletuja/shared";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

type PaginationState = GetLoansResponse["pagination"] & {
  totalPages: number;
  startItem: number;
  endItem: number;
};

type LoansContextType = {
  isLoading: boolean;
  loans: CryptoLoan[];
  pagination: PaginationState;
  status: NftFiLoanStatus;
  toPage: (pageNumber: number) => Promise<void>;
};

const LoansContext = createContext<LoansContextType | undefined>(undefined);

const DEFAULT_PAGE_SIZE = 100;

interface LoansProviderProps {
  children: ReactNode;
  status: NftFiLoanStatus;
}

const getStatusesFilter = (status: NftFiLoanStatus): NftFiLoanStatus[] => {
  switch (status) {
    case NftFiLoanStatus.Active:
      return [
        NftFiLoanStatus.Active,
        NftFiLoanStatus.Defaulted,
        NftFiLoanStatus.LiquidationFailed,
      ];
    case NftFiLoanStatus.Repaid:
      return [NftFiLoanStatus.Repaid];
    case NftFiLoanStatus.Liquidated:
      return [
        NftFiLoanStatus.Liquidated,
        NftFiLoanStatus.NftTransferred,
        NftFiLoanStatus.NftTransferFailed,
      ];
    default:
      return [status];
  }
};

export const LoansProvider: React.FC<LoansProviderProps> = ({
  children,
  status,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loans, setLoans] = useState<CryptoLoan[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    startItem: 0,
    endItem: 0,
  });

  const fetchLoans = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getLoans({
        statuses: getStatusesFilter(status),
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setLoans(response.items);
      setPagination({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        total: response.pagination.total,
        totalPages: Math.ceil(response.pagination.total / DEFAULT_PAGE_SIZE),
        startItem: (page - 1) * DEFAULT_PAGE_SIZE + 1,
        endItem: Math.min(page * DEFAULT_PAGE_SIZE, response.pagination.total),
      });
    } catch (error) {
      console.error(`Error fetching ${status} loans:`, error);
      setLoans([]);
      setPagination({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
      });
      toast.error(`Error fetching ${status} loans`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toPage = async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages) {
      return;
    }
    await fetchLoans(pageNumber);
  };

  return (
    <LoansContext.Provider
      value={{
        isLoading,
        loans,
        pagination,
        status,
        toPage,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
};

export const useLoans = () => {
  const context = useContext(LoansContext);
  if (!context) {
    throw new Error("useLoans must be used within a LoansProvider");
  }
  return context;
};
