import React from "react";

const CollectionLoanOffersCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-900 px-4 py-5 sm:px-6 animate-pulse">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 mt-4 flex items-center">
          <div className="shrink-0">
            <div className="size-12 rounded-full bg-gray-700" />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <div className="h-5 w-48 bg-gray-700 rounded" />
            <div className="size-5 bg-gray-700 rounded-full" />
          </div>
        </div>
        <div className="ml-4 mt-4">
          <div className="h-4 w-24 bg-gray-700 rounded" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="border-t border-gray-700 pt-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="h-4 w-16 bg-gray-700 rounded mb-1" />
                  <div className="h-5 w-24 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionLoanOffersCardSkeleton;
