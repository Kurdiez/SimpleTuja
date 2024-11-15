import AppLayout from "@/components/common/app-layout/AppLayout";
import {
  LoansProvider,
  useLoans,
} from "@/components/common/crypto-lending/loans.context";
import { LoansTable } from "@/components/common/crypto-lending/LoansTable";
import LoansTableSkeleton from "@/components/common/crypto-lending/LoansTableSkeleton";
import EmptyState from "@/components/common/EmptyState";
import SimplePagination from "@/components/common/SimplePagination";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { NftFiLoanStatus } from "@simpletuja/shared";
import React from "react";

const LoansByStatusContent: React.FC = () => {
  const { loans, pagination, toPage, isLoading } = useLoans();

  const renderContent = () => {
    if (isLoading) {
      return <LoansTableSkeleton />;
    }

    if (pagination.total === 0) {
      return <EmptyState icon={NoSymbolIcon} label="No loans available" />;
    }

    return <LoansTable loans={loans} />;
  };

  return (
    <div className="space-y-6">
      <SimplePagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={toPage}
        contentAboveDivider={true}
      />

      {renderContent()}

      {!isLoading && pagination.total > 0 && (
        <SimplePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.total}
          onPageChange={toPage}
        />
      )}
    </div>
  );
};

interface LoansByStatusProps {
  status: NftFiLoanStatus;
  pageTitle: string;
}

export const LoansByStatus: React.FC<LoansByStatusProps> = ({
  status,
  pageTitle,
}) => {
  return (
    <LoansProvider status={status}>
      <AppLayout pageTitle={pageTitle}>
        <LoansByStatusContent />
      </AppLayout>
    </LoansProvider>
  );
};
