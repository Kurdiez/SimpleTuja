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
                  <div className="flex items-center">
                    <div className="h-32 w-32 lg:h-10 lg:w-10 flex-shrink-0">
                      <div className="h-full w-full rounded-full bg-gray-700" />
                    </div>
                    <div className="ml-4 lg:hidden">
                      <dl className="font-normal">
                        {[
                          "Collection",
                          "Token ID",
                          "Currency",
                          "Principal",
                          "APR",
                          "Repayment",
                          "Due Date",
                        ].map((label) => (
                          <React.Fragment key={label}>
                            <dt className="mt-2 text-gray-500">{label}</dt>
                            <dd className="h-5 w-24 bg-gray-700 rounded" />
                          </React.Fragment>
                        ))}
                      </dl>
                    </div>
                  </div>
                </td>
                {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                  <td
                    key={cell}
                    className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell"
                  >
                    <div className="h-5 w-24 bg-gray-700 rounded" />
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
