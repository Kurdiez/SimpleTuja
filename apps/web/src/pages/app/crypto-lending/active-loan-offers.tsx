import AppLayout from "@/components/common/app-layout/AppLayout";
import CollectionLoanOffersCard from "@/components/common/CollectionLoanOffersCard";
import CollectionLoanOffersCardSkeleton from "@/components/common/CollectionLoanOffersCardSkeleton";
import EmptyState from "@/components/common/EmptyState";
import SimplePagination from "@/components/common/SimplePagination";
import {
  ActiveLoanOffersProvider,
  useActiveLoanOffers,
} from "@/components/pages/crypto-lending/active-loan-offers/active-loan-offers.context";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import React from "react";

const ActiveLoanOffersContent: React.FC = () => {
  const { activeCollectionLoanOffers, pagination, toPage, isLoading } =
    useActiveLoanOffers();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <CollectionLoanOffersCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (pagination.total === 0) {
      return (
        <EmptyState
          icon={NoSymbolIcon}
          label="No active loan offers available"
        />
      );
    }

    return (
      <div className="space-y-4">
        {activeCollectionLoanOffers.map((offerGroup) => (
          <CollectionLoanOffersCard
            key={offerGroup.collectionId}
            offerGroup={offerGroup}
          />
        ))}
      </div>
    );
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

const ActiveLoanOffers: React.FC = () => {
  return (
    <ActiveLoanOffersProvider>
      <AppLayout pageTitle="Crypto Lending - Active Loan Offers">
        <ActiveLoanOffersContent />
      </AppLayout>
    </ActiveLoanOffersProvider>
  );
};

export default ActiveLoanOffers;
