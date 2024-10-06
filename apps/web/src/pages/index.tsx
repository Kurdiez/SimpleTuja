import TopNav from "../components/TopNav";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";

export default function Example(): JSX.Element {
  return (
    <div className="bg-gray-900 dark:bg-gray-900">
      {" "}
      {/* Set the background color here */}
      <TopNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
}
