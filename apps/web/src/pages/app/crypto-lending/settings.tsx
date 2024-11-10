import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import LoanSettings from "@/components/pages/crypto-lending/onboarding/LoanSettings";
import React, { useCallback } from "react";
import toast from "react-hot-toast";

const Settings: React.FC = () => {
  const onLoanSettingsSaved = useCallback(() => {
    toast.success("Loan settings saved successfully");
  }, []);

  return (
    <CryptoLendingLayout>
      <div className="pb-4">
        <LoanSettings onLoanSettingsSaved={onLoanSettingsSaved} />
      </div>
    </CryptoLendingLayout>
  );
};

export default Settings;
