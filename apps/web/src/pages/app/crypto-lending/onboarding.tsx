import { CryptoLendingLayout } from "@/components/pages/crypto-lending/CryptoLendingLayout";
import Onboarding from "@/components/pages/crypto-lending/onboarding/onboarding";

const OnboardingPage: React.FC = () => {
  return (
    <CryptoLendingLayout>
      <Onboarding />
    </CryptoLendingLayout>
  );
};

export default OnboardingPage;
