import { TextMD, TextSM } from "@/components/common/Typography";
import BlurIcon from "@/components/icons/BlurIcon";
import OpenseaIcon from "@/components/icons/OpenseaIcon";
import { CryptoLoanOffer } from "@simpletuja/shared";
import React from "react";
import { GroupedLoanOffer } from "./active-loan-offers.context";

interface CollectionLoanOffersCardProps {
  offerGroup: GroupedLoanOffer;
}

const formatDuration = (durationInSeconds: number): string => {
  const days = durationInSeconds / (24 * 60 * 60);
  return `${days} days`;
};

const formatNumber = (value: string): string => {
  const num = parseFloat(value);
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
};

const formatApr = (apr: string): string => {
  const num = parseFloat(apr);
  return `~${num.toFixed(2)}`;
};

const LoanOfferRow: React.FC<{ offer: CryptoLoanOffer }> = ({ offer }) => (
  <div className="mt-3 border-t border-gray-700 pt-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      <div>
        <TextSM className="text-gray-400">Currency: </TextSM>
        <TextMD className="text-gray-200">{offer.loanCurrency}</TextMD>
      </div>
      <div>
        <TextSM className="text-gray-400">Duration: </TextSM>
        <TextMD className="text-gray-200">
          {formatDuration(offer.loanDuration)}
        </TextMD>
      </div>
      <div>
        <TextSM className="text-gray-400">Principal: </TextSM>
        <TextMD className="text-gray-200">
          {formatNumber(offer.loanPrincipal)}
        </TextMD>
      </div>
      <div>
        <TextSM className="text-gray-400">APR: </TextSM>
        <TextMD className="text-gray-200">{formatApr(offer.loanApr)}%</TextMD>
      </div>
      <div>
        <TextSM className="text-gray-400">Repayment: </TextSM>
        <TextMD className="text-gray-200">
          {formatNumber(offer.loanRepayment)}
        </TextMD>
      </div>
    </div>
  </div>
);

export const CollectionLoanOffersCard: React.FC<
  CollectionLoanOffersCardProps
> = ({ offerGroup }) => {
  const openSeaUrl = offerGroup.collectionOpenSeaSlug
    ? `https://opensea.io/collection/${offerGroup.collectionOpenSeaSlug}`
    : null;

  const blurUrl = offerGroup.collectionOpenSeaSlug
    ? `https://blur.io/eth/collection/${offerGroup.collectionOpenSeaSlug}`
    : null;

  return (
    <div className="bg-gray-900 px-4 py-5 sm:px-6">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 mt-4 flex items-center">
          <div className="shrink-0">
            <img
              alt={offerGroup.collectionName}
              src={offerGroup.collectionImageUrl || ""}
              className="size-12 rounded-full object-cover"
            />
          </div>
          <div className="ml-4 flex items-center gap-2">
            <TextMD weight="bold" className="text-gray-100 pr-2">
              {offerGroup.collectionName}
            </TextMD>
            {openSeaUrl && (
              <a
                href={openSeaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <OpenseaIcon className="w-5 h-5" />
              </a>
            )}
            {blurUrl && (
              <a
                href={blurUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <BlurIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
        <div className="ml-4 mt-4">
          <TextSM className="text-gray-400">
            {offerGroup.offers.length} active offers
          </TextSM>
        </div>
      </div>

      <div className="mt-4">
        {offerGroup.offers.map((offer) => (
          <LoanOfferRow key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
};
