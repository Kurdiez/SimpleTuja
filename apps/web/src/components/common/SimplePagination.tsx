import React from "react";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  contentAboveDivider?: boolean;
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  contentAboveDivider = false,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const content = (
    <div className="flex items-center justify-between w-full">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-300">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalItems === 0}
          className="relative inline-flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-700 focus-visible:outline-offset-0 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalItems === 0}
          className="relative ml-3 inline-flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-700 focus-visible:outline-offset-0 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <nav aria-label="Pagination" className="flex flex-col px-4 py-3 sm:px-6">
      {contentAboveDivider ? (
        <>
          {content}
          <div className="border-t border-gray-700 bg-gray-900 w-full mt-3" />
        </>
      ) : (
        <>
          <div className="border-t border-gray-700 bg-gray-900 w-full mb-3" />
          {content}
        </>
      )}
    </nav>
  );
};

export default SimplePagination;
