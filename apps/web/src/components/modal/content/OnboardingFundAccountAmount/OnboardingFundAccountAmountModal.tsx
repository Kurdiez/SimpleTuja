import { useModal } from "../../modal.context";
import { CryptoToken, LoanEligibleNftCollectionsDto } from "@simpletuja/shared";
import { useEffect, useState } from "react";
import {
  getCryptoExchangeRates,
  getLoanEligibleNftCollections,
} from "@/utils/simpletuja/cypto-lending";
import { LoanEligibleNftCollectionsList } from "./LoanEligibleNftCollectionsList";
import toast from "react-hot-toast";

type OnboardingFundAccountAmountModalProps = {
  onAmountSelected: (amount: number) => void;
  token: CryptoToken;
  ltvThreshold: number;
  initialAmount: number;
};

export function OnboardingFundAccountAmountModal({
  onAmountSelected,
  token,
  ltvThreshold,
  initialAmount,
}: OnboardingFundAccountAmountModalProps) {
  const { closeModal } = useModal();
  const [nftCollections, setNftCollections] =
    useState<LoanEligibleNftCollectionsDto>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collections, rates] = await Promise.all([
          getLoanEligibleNftCollections(),
          getCryptoExchangeRates(),
        ]);

        if (token !== CryptoToken.WETH) {
          collections.forEach((collection) => {
            collection.avgTopBids = collection.avgTopBids * rates[token];
          });
        }

        setNftCollections(collections);
        setIsLoading(false);
      } catch {
        toast.error("Error fetching necessary data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAmountSelected = (amount: number) => {
    if (amount > 0) {
      onAmountSelected(amount);
      closeModal();
    } else {
      toast.error("Please enter a valid amount greater than 0");
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight pb-5 border-b border-gray-700 text-gray-100">
          Deposit Amount
        </h2>
      </div>

      <div className="flex justify-center my-10 text-gray-300">
        <LoanEligibleNftCollectionsList
          nftCollections={nftCollections}
          isLoading={isLoading}
          token={token}
          ltvThreshold={ltvThreshold}
          onAmountSelected={handleAmountSelected}
          initialAmount={initialAmount} // Pass the initial amount
        />
      </div>
    </div>
  );
}
