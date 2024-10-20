// import { useModal } from "../../modal.context";
import { CryptoToken, LoanEligibleNftCollectionsDto } from "@simpletuja/shared";
import { useEffect, useState } from "react";
import { getLoanEligibleNftCollections } from "@/utils/simpletuja/cypto-lending";
import { LoanEligibleNftCollectionsList } from "./LoanEligibleNftCollectionsList";

type OnboardingFundAccountAmountModalProps = {
  onAmountSelected: (amount: number) => void;
  token: CryptoToken;
  ltvThreshold: number;
};

export function OnboardingFundAccountAmountModal({
  // onAmountSelected,
  token,
  ltvThreshold,
}: OnboardingFundAccountAmountModalProps) {
  // const { closeModal } = useModal();
  const [nftCollections, setNftCollections] =
    useState<LoanEligibleNftCollectionsDto>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNftCollections = async () => {
      const collections = await getLoanEligibleNftCollections();
      setNftCollections(collections);
      setIsLoading(false);
    };
    fetchNftCollections();
  }, []);

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
          onAmountSelected={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </div>
  );
}
