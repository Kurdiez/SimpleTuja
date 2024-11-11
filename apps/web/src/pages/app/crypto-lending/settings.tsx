import AppLayout from "@/components/common/app-layout/AppLayout";
import LoanSettings from "@/components/pages/crypto-lending/onboarding/LoanSettings";
import React, { useCallback } from "react";
import toast from "react-hot-toast";

const Settings: React.FC = () => {
  const onLoanSettingsSaved = useCallback(() => {
    toast.success("Loan settings saved successfully");
  }, []);

  return (
    <AppLayout pageTitle="Crypto Lending - Loan Settings">
      <div className="pb-4">
        <LoanSettings
          onLoanSettingsSaved={onLoanSettingsSaved}
          showTitle={false}
        />
      </div>
    </AppLayout>
  );
};

export default Settings;
