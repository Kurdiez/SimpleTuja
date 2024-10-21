import React, { useState, useCallback, useEffect } from "react";
import { CryptoToken, LoanEligibleNftCollectionsDto } from "@simpletuja/shared";
import LoadSpinner from "@/components/common/LoadSpinner";
import { debounce } from "lodash";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";

type LoanEligibleNftCollectionsListProps = {
  nftCollections: LoanEligibleNftCollectionsDto;
  isLoading: boolean;
  token: CryptoToken;
  ltvThreshold: number;
  onAmountSelected: (amount: number) => void;
  initialAmount: number;
};

export function LoanEligibleNftCollectionsList({
  nftCollections,
  isLoading,
  token,
  ltvThreshold,
  onAmountSelected,
  initialAmount = 0,
}: LoanEligibleNftCollectionsListProps): React.ReactElement {
  const [depositAmount, setDepositAmount] = useState<string>(
    initialAmount.toString()
  );
  const [highlightedCollections, setHighlightedCollections] = useState<
    string[]
  >([]);

  const updateHighlightedCollections = useCallback(
    (amount: number) => {
      const newHighlightedCollections = nftCollections
        .filter(
          (collection) => amount > collection.avgTopBids * (ltvThreshold / 100)
        )
        .map((collection) => collection.openSeaSlug);
      setHighlightedCollections(newHighlightedCollections);
    },
    [nftCollections, ltvThreshold]
  );

  const debouncedUpdateHighlights = useCallback(
    debounce((amount: number) => updateHighlightedCollections(amount), 500),
    [updateHighlightedCollections]
  );

  useEffect(() => {
    const numericAmount = parseFloat(depositAmount);
    if (!isNaN(numericAmount)) {
      debouncedUpdateHighlights(numericAmount);
    } else {
      setHighlightedCollections([]);
    }
    return () => {
      debouncedUpdateHighlights.cancel();
    };
  }, [depositAmount, debouncedUpdateHighlights]);

  useEffect(() => {
    // Update highlighted collections when the component mounts
    updateHighlightedCollections(initialAmount);
  }, [initialAmount, updateHighlightedCollections]);

  if (isLoading) {
    return <LoadSpinner />;
  }

  const sortedCollections = [...nftCollections].sort(
    (a, b) => b.loanCount - a.loanCount
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(e.target.value);
  };

  const handleSave = () => {
    const numericAmount = parseFloat(depositAmount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      onAmountSelected(numericAmount);
    } else {
      toast.error("Please enter a valid amount greater than 0");
    }
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  };

  return (
    <div className="w-full">
      <p className="text-sm text-gray-300 mb-4">
        Below is a list of popular NFT collections for lending, sorted by how
        often they&apos;re used for loans. The highest loan-to-value (LTV) ratio
        you&apos;ve set is{" "}
        <span className="text-primary font-semibold">{ltvThreshold}%</span>.
        This means you can lend up to this percentage of an NFT&apos;s value.
      </p>
      <p className="text-sm text-gray-300 mb-4">
        Enter your deposit amount in{" "}
        <span className="text-primary font-semibold">{token}</span> to see which
        collections you can afford to lend against.{" "}
        <span className="text-green-500 font-semibold">
          Collections highlighted in green
        </span>{" "}
        are those you can currently afford to lend to, based on your deposit and
        LTV settings.
      </p>
      <div className="flex mb-4">
        <input
          type="number"
          min="0.000001"
          step="any"
          value={depositAmount}
          onChange={handleInputChange}
          className="flex-grow p-2 bg-gray-700 text-white rounded-l"
          placeholder={`Enter your ${token} deposit amount`}
        />
        <Button onClick={handleSave} className="rounded-l-none">
          Save
        </Button>
      </div>
      <ul role="list" className="divide-y divide-gray-700">
        {sortedCollections.map((collection) => (
          <li
            key={collection.openSeaSlug}
            className={`py-4 px-4 ${
              highlightedCollections.includes(collection.openSeaSlug)
                ? "bg-green-900"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-200">
                {collection.name}
              </h3>
              <a
                href={`https://opensea.io/collection/${collection.openSeaSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-gray-400">
              Loan Count:{" "}
              <span className="text-primary">{collection.loanCount}</span>
            </p>
            <p className="text-xs text-gray-400">
              Avg. Top Bids:{" "}
              <span className="text-primary">
                {formatNumber(collection.avgTopBids)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
