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
    <div className="relative isolate min-h-screen overflow-hidden">
      <EmotionalBackdrop />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <NGOImpactSection />
        <WorkflowSection />
        <ImpactDashboard />
        <SafetyGovernance />
        <ComparisonSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
