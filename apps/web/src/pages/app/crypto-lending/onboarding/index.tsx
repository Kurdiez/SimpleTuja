import AppLayout from "@/components/common/app-layout/AppLayout";
import Onboarding from "@/components/pages/crypto-lending/onboarding/onboarding";

const OnboardingPage: React.FC = () => {
  return (
    <AppLayout pageTitle="Crypto Lending - Onboarding">
      <Onboarding />
    </AppLayout>
  );
};

export default OnboardingPage;
