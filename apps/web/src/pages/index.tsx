import TopNav from "@/components/pages/marketing/TopNav";
import HeroSection from "@/components/pages/marketing/HeroSection";
import FeaturesSection from "@/components/pages/marketing/FeaturesSection";
import HowItWorksSection from "@/components/pages/marketing/HowItWorksSection";
import StatsSection from "@/components/pages/marketing/StatsSection";
import PricingSection from "@/components/pages/marketing/PricingSection";
import CtaSection from "@/components/pages/marketing/CtaSection";
import Footer from "@/components/pages/marketing/Footer";

export default function Example(): JSX.Element {
  return (
    <div className="bg-gray-900 dark:bg-gray-900">
      <TopNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
