import OpenseaIcon from "@/components/icons/OpenseaIcon";
import { CryptoLoan } from "@simpletuja/shared";
import React from "react";

interface LoansTableProps {
  loans: CryptoLoan[];
}

const formatApr = (apr: string): string => {
  const num = parseFloat(apr);
  return `~${num.toFixed(2)}`;
};

const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dateObj);
};

export const LoansTable: React.FC<LoansTableProps> = ({ loans }) => {
  const getOpenSeaAssetUrl = (contractAddress: string, tokenId: string) =>
    `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;

  return (
    <div className="-mx-4 mt-8 sm:-mx-0 overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-0"
              >
                NFT
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Collection
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Token ID
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Currency
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Principal
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                APR
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Repayment
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-200 lg:table-cell"
              >
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="py-4 pl-4 pr-3 text-sm sm:pl-0 w-auto">
                  <div className="flex items-center">
                    <div className="h-32 w-32 lg:h-10 lg:w-10 flex-shrink-0">
                      <img
                        className="h-full w-full rounded-full object-cover"
                        src={loan.nftImageUrl}
                        alt={`${loan.nftCollection.name} #${loan.nftTokenId}`}
                        width={128}
                        height={128}
                      />
                    </div>
                    <div className="ml-4">
                      <dl className="font-normal lg:hidden">
                        <dt className="mt-2 text-gray-500">Collection</dt>
                        <dd className="text-gray-200">
                          {loan.nftCollection.name}
                        </dd>
                        <dt className="mt-2 text-gray-500">Token ID</dt>
                        <dd className="text-gray-200 flex items-center gap-2">
                          #{loan.nftTokenId}
                          <a
                            href={getOpenSeaAssetUrl(
                              loan.nftCollection.contractAddress,
                              loan.nftTokenId
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block hover:opacity-80 transition-opacity"
                          >
                            <OpenseaIcon className="w-4 h-4" />
                          </a>
                        </dd>
                        <dt className="mt-2 text-gray-500">Currency</dt>
                        <dd className="text-gray-200">{loan.token}</dd>
                        <dt className="mt-2 text-gray-500">Principal</dt>
                        <dd className="text-gray-200">{loan.loanPrincipal}</dd>
                        <dt className="mt-2 text-gray-500">APR</dt>
                        <dd className="text-gray-200">
                          {formatApr(loan.loanApr)}%
                        </dd>
                        <dt className="mt-2 text-gray-500">Repayment</dt>
                        <dd className="text-gray-200">{loan.loanRepayment}</dd>
                        <dt className="mt-2 text-gray-500">Due Date</dt>
                        <dd className="text-gray-200">
                          {formatDateTime(loan.dueAt)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {loan.nftCollection.name}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  <div className="flex items-center gap-2">
                    #{loan.nftTokenId}
                    <a
                      href={getOpenSeaAssetUrl(
                        loan.nftCollection.contractAddress,
                        loan.nftTokenId
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block hover:opacity-80 transition-opacity"
                    >
                      <OpenseaIcon className="w-4 h-4" />
                    </a>
                  </div>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {loan.token}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {loan.loanPrincipal}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {formatApr(loan.loanApr)}%
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {loan.loanRepayment}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">
                  {formatDateTime(loan.dueAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
