import { createFileRoute } from "@tanstack/react-router";

import { ComparisonSection } from "@/components/ComparisonSection";
import { CTASection } from "@/components/CTASection";
import { EmotionalBackdrop } from "@/components/EmotionalBackdrop";
import { FeaturesSection } from "@/components/FeaturesSection";
import { NGOImpactSection } from "@/components/NGOImpactSection";
import { SafetyGovernance } from "@/components/SafetyGovernance";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ImpactDashboard } from "@/components/ImpactDashboard";
import { Navbar } from "@/components/Navbar";
import { WorkflowSection } from "@/components/WorkflowSection";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative isolate min-h-screen bg-background overflow-x-hidden">
      <EmotionalBackdrop />
      <div className="relative z-10 bg-background/20 backdrop-blur-[2px]">
        <Navbar />
        <HeroSection />
        <div className="relative z-20 bg-background/60 backdrop-blur-sm">
          <FeaturesSection />
          <NGOImpactSection />
          <WorkflowSection />
        </div>
        <div className="relative z-10">
          <ImpactDashboard />
          <SafetyGovernance />
          <ComparisonSection />
          <CTASection />
          <Footer />
        </div>
      </div>
    </div>
  );
}
