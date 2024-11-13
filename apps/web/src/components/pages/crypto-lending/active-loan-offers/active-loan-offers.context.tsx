import { getLoanOffers } from "@/utils/simpletuja/crypto-lending";
import { CryptoLoanOffer, GetLoanOffersResponse } from "@simpletuja/shared";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

export type GroupedLoanOffer = {
  collectionId: string;
  collectionName: string;
  collectionImageUrl: string | null;
  collectionOpenSeaSlug: string | null;
  offers: CryptoLoanOffer[];
};

type PaginationState = GetLoanOffersResponse["pagination"] & {
  totalPages: number;
  startItem: number;
  endItem: number;
};

type ActiveLoanOffersContextType = {
  isLoading: boolean;
  items: CryptoLoanOffer[];
  activeCollectionLoanOffers: GroupedLoanOffer[];
  pagination: PaginationState;
  toPage: (pageNumber: number) => Promise<void>;
};

const ActiveLoanOffersContext = createContext<
  ActiveLoanOffersContextType | undefined
>(undefined);

const DEFAULT_PAGE_SIZE = 100;

export const ActiveLoanOffersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<CryptoLoanOffer[]>([]);
  const [activeCollectionLoanOffers, setActiveCollectionLoanOffers] = useState<
    GroupedLoanOffer[]
  >([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, // Start at the first page
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    startItem: 0,
    endItem: 0,
  });

  const fetchLoanOffers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getLoanOffers({
        isActive: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setItems(response.items);
      setPagination({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        total: response.pagination.total,
        totalPages: Math.ceil(response.pagination.total / DEFAULT_PAGE_SIZE),
        startItem: (page - 1) * DEFAULT_PAGE_SIZE + 1,
        endItem: Math.min(page * DEFAULT_PAGE_SIZE, response.pagination.total),
      });
    } catch (error) {
      console.error("Error fetching active loan offers:", error);
      setItems([]);
      setPagination({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
      });
      toast.error("Error fetching active loan offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanOffers(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const groupedByCollection = items.reduce<Record<string, GroupedLoanOffer>>(
      (acc, item) => {
        const collectionId = item.nftCollection.id;

        if (!acc[collectionId]) {
          acc[collectionId] = {
            collectionId,
            collectionName: item.nftCollection.name,
            collectionImageUrl: item.nftCollection.imageUrl,
            collectionOpenSeaSlug: item.nftCollection.openSeaSlug,
            offers: [],
          };
        }

        acc[collectionId].offers.push(item);
        return acc;
      },
      {}
    );

    const getDurationInDays = (durationInSeconds: number): number => {
      return durationInSeconds / 86400; // Convert seconds to days
    };

    Object.values(groupedByCollection).forEach((group) => {
      group.offers.sort(
        (a, b) =>
          getDurationInDays(a.loanDuration) - getDurationInDays(b.loanDuration)
      );
    });

    const sortedGroups = Object.values(groupedByCollection).sort((a, b) =>
      a.collectionName.localeCompare(b.collectionName)
    );

    setActiveCollectionLoanOffers(sortedGroups);
  }, [items]);

  const toPage = async (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages) {
      return;
    }
    await fetchLoanOffers(pageNumber);
  };

  return (
    <ActiveLoanOffersContext.Provider
      value={{
        isLoading,
        items,
        activeCollectionLoanOffers,
        pagination,
        toPage,
      }}
    >
      {children}
    </ActiveLoanOffersContext.Provider>
  );
};

export const useActiveLoanOffers = () => {
  const context = useContext(ActiveLoanOffersContext);
  if (!context) {
    throw new Error(
      "useActiveLoanOffers must be used within an ActiveLoanOffersProvider"
    );
  }
  return context;
};
