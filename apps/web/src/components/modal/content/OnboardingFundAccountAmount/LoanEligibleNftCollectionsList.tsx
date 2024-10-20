import React, { useState, useCallback, useEffect } from "react";
import { CryptoToken, LoanEligibleNftCollectionsDto } from "@simpletuja/shared";
import LoadSpinner from "@/components/common/LoadSpinner";
import { debounce } from "lodash";
import Button from "@/components/common/Button";

type LoanEligibleNftCollectionsListProps = {
  nftCollections: LoanEligibleNftCollectionsDto;
  isLoading: boolean;
  token: CryptoToken;
  ltvThreshold: number;
  onAmountSelected: (amount: number) => void;
};

export function LoanEligibleNftCollectionsList({
  nftCollections,
  isLoading,
  token = CryptoToken.WETH,
  ltvThreshold = 0.5,
  onAmountSelected,
}: LoanEligibleNftCollectionsListProps): React.ReactElement {
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [highlightedCollections, setHighlightedCollections] = useState<
    string[]
  >([]);

  const updateHighlightedCollections = useCallback(
    (amount: number) => {
      const newHighlightedCollections = nftCollections
        .filter((collection) => amount > collection.avgTopBids * ltvThreshold)
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
    }
  };

  return (
    <div className="w-full">
      <p className="text-sm text-gray-300 mb-4">
        Explore top NFT collections for lending in{" "}
        <span className="text-primary">{token}</span>, sorted by popularity.
        Enter your deposit amount to see eligible collections highlighted in
        real-time.
      </p>
      <div className="flex mb-4">
        <input
          type="number"
          min="0"
          step="any"
          value={depositAmount}
          onChange={handleInputChange}
          className="flex-grow p-2 bg-gray-700 text-white rounded-l"
          placeholder="Enter your deposit amount"
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
                {collection.avgTopBids.toFixed(2)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
