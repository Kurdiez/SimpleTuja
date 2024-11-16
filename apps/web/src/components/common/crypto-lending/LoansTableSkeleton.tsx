import React from "react";

const LoansTableSkeleton: React.FC = () => {
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
            {[1, 2, 3].map((index) => (
              <tr key={index}>
                <td className="py-4 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="flex items-start">
                    <div className="h-32 w-32 lg:h-10 lg:w-10 flex-shrink-0">
                      <div className="h-full w-full rounded-full bg-gray-700 animate-pulse" />
                    </div>
                    <div className="ml-4 lg:hidden w-full">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="space-y-1 min-w-0">
                            <div className="h-5 w-20 bg-gray-700 rounded animate-pulse" />
                            <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Desktop view base columns */}
                {[...Array(7)].map((_, i) => (
                  <td
                    key={i}
                    className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell"
                  >
                    <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoansTableSkeleton;
