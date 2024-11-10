import LoanSettingsForm from "@/components/common/LoanSettingsForm";
import { LoanSettingsUpdateDto } from "@simpletuja/shared";
import { useCryptoLending } from "../crypto-lending.context";

interface LoanSettingsProps {
  onLoanSettingsSaved?: () => void;
}

export default function LoanSettings({
  onLoanSettingsSaved,
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

  return <LoanSettingsForm onSubmit={handleSubmit} settings={settings} />;
}
