import React, { useState, useEffect } from "react";
import { LocalStorageKey } from "../../../utils/const";

const CryptoLendingDescription: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedValue = localStorage.getItem(
      LocalStorageKey.CryptoLendingDescClosed
    );
    setIsCollapsed(storedValue === "true");
    setIsLoading(false);
  }, []);

  const toggleCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem(
      LocalStorageKey.CryptoLendingDescClosed,
      newValue.toString()
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="mb-6 text-gray-400">
      <div
        className="flex items-center cursor-pointer text-primary-dark mb-2"
        onClick={toggleCollapse}
      >
        <span className="mr-2">{isCollapsed ? "▶" : "▼"}</span>
        {isCollapsed ? "Description (click to expand)" : "Close description"}
      </div>
      {!isCollapsed && (
        <>
          <p className="mb-2">
            Welcome to Crypto P2P Lending, powered by{" "}
            <a
              href="https://nftfi.com"
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              NFTfi
            </a>{" "}
            and enhanced by <span className="text-primary">STJ</span>.
            Here&apos;s what you need to know:
          </p>
          <ul className="list-disc-custom mb-2 space-y-1">
            <li>
              <a
                href="https://nftfi.com"
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                NFTfi
              </a>{" "}
              enables peer-to-peer loans using NFTs as collateral
            </li>
            <li>Borrowers use NFTs to secure ETH or DAI loans from Lenders</li>
            <li>NFTs are held in escrow until loan repayment or default</li>
            <li>
              <span className="text-primary">STJ</span> supercharges your
              lending experience on{" "}
              <a
                href="https://nftfi.com"
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                NFTfi
              </a>{" "}
              by:
              <ul className="list-circle-custom mt-1 space-y-1">
                <li>
                  Analyzing NFT collections to identify lower-risk opportunities
                </li>
                <li>
                  Automatically creating multiple loan offers across eligible
                  collections
                </li>
                <li>Refreshing offers daily to adapt to market volatility</li>
                <li>
                  Customizing lending strategies based on your preferences
                </li>
              </ul>
            </li>
          </ul>
          <p className="mt-2">
            Experience smarter, automated crypto lending with{" "}
            <span className="text-primary">STJ</span> on{" "}
            <a
              href="https://nftfi.com"
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              NFTfi
            </a>{" "}
            today!
          </p>
        </>
      )}
    </div>
  );
};

export default CryptoLendingDescription;
