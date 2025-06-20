import LoanSettingsForm from "@/components/common/crypto-lending/LoanSettingsForm";
import { LoanSettingsUpdateDto } from "@simpletuja/shared";
import { useCryptoLending } from "../../../common/crypto-lending/crypto-lending.context";

interface LoanSettingsProps {
  onLoanSettingsSaved?: () => void;
  showTitle?: boolean;
}

export default function LoanSettings({
  onLoanSettingsSaved,
  showTitle = true,
}: LoanSettingsProps) {
  const { updateLoanSettings, userState } = useCryptoLending();

  const handleSubmit = async (data: LoanSettingsUpdateDto) => {
    await updateLoanSettings(data);
    onLoanSettingsSaved?.();
  };

  const settings = userState
    ? {
        oneWeekLTV: userState.oneWeekLTV,
        twoWeeksLTV: userState.twoWeeksLTV,
        oneMonthLTV: userState.oneMonthLTV,
        twoMonthsLTV: userState.twoMonthsLTV,
        threeMonthsLTV: userState.threeMonthsLTV,
        foreclosureWalletAddress: userState.foreclosureWalletAddress ?? "",
      }
    : undefined;

  return (
    <LoanSettingsForm
      onSubmit={handleSubmit}
      settings={settings}
      showTitle={showTitle}
    />
  );
}
