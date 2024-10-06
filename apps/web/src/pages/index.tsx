import TopNav from "../components/TopNav";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import StatsSection from "@/components/StatsSection";

export default function Example(): JSX.Element {
  return (
    <div className="bg-gray-900 dark:bg-gray-900">
      <TopNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
}
