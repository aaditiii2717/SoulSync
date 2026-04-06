import { createFileRoute } from "@tanstack/react-router";

import { ComparisonSection } from "@/components/ComparisonSection";
import { CTASection } from "@/components/CTASection";
import { EmotionalBackdrop } from "@/components/EmotionalBackdrop";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
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
        <WorkflowSection />
        <ComparisonSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
