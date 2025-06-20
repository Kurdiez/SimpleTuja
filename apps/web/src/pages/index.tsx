import FeaturesSection from "@/components/pages/marketing/FeaturesSection";
import HeroSection from "@/components/pages/marketing/HeroSection";
import HowItWorksSection from "@/components/pages/marketing/HowItWorksSection";
import TopNav from "@/components/pages/marketing/TopNav";
// import StatsSection from "@/components/pages/marketing/StatsSection";
// import PricingSection from "@/components/pages/marketing/PricingSection";
import CtaSection from "@/components/pages/marketing/CtaSection";
import Footer from "@/components/pages/marketing/Footer";

export default function Example(): JSX.Element {
  return (
    <>
      <TopNav />
      <HeroSection />
      {/* <StatsSection /> */}
      <FeaturesSection />
      <HowItWorksSection />
      {/* <PricingSection /> */}
      <CtaSection />
      <Footer />
    </>
  );
}
