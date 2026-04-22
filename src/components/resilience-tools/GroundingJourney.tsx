import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ChevronRight, Check, Eye, Hand, AudioLines, Flower, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: 5, label: "Things you see", icon: Eye, instruction: "Name 5 things you can see right now." },
  { id: 4, label: "Things you can touch", icon: Hand, instruction: "Acknowledge 4 things you can touch." },
  { id: 3, label: "Things you hear", icon: AudioLines, instruction: "Listen for 3 distinct sounds." },
  { id: 2, label: "Things you smell", icon: Flower, instruction: "Notice 2 scents in the air." },
  { id: 1, label: "Thing you taste", icon: Utensils, instruction: "Focus on 1 thing you can taste." },
];

export function GroundingJourney() {
  const [currentStep, setCurrentStep] = useState(-1);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setCurrentStep(steps.length);
    }
  };

  const reset = () => setCurrentStep(-1);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-safe/5 to-transparent rounded-[2.5rem] border border-safe/10 min-h-[400px] relative overflow-hidden">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-safe">
          <Map className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resilience Tool</span>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === -1 ? (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
            <h3 className="text-2xl font-display font-black mb-2">Grounding Journey</h3>
            <p className="text-slate-500 mb-8 max-w-[240px] mx-auto text-sm">
              Use the 5-4-3-2-1 technique to reconnect with the physical world.
            </p>
            <Button variant="hero" className="rounded-2xl bg-safe hover:bg-safe/90" onClick={next}>
              Begin Journey
            </Button>
          </motion.div>
        ) : currentStep < steps.length ? (
          <motion.div key={`step-${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center w-full max-w-sm">
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 bg-safe/10 rounded-3xl flex items-center justify-center text-safe relative">
                {React.createElement(steps[currentStep].icon, { className: "h-10 w-10" })}
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-safe text-white rounded-full flex items-center justify-center font-black">
                  {steps[currentStep].id}
                </div>
              </div>
            </div>
            <h4 className="text-xl font-display font-black mb-2">{steps[currentStep].label}</h4>
            <p className="text-slate-500 mb-8 text-sm">{steps[currentStep].instruction}</p>
            <Button variant="outline" className="rounded-xl border-safe/20 text-safe w-full" onClick={next}>
              I've noticed them <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="h-20 w-20 bg-safe/10 rounded-full flex items-center justify-center text-safe mx-auto mb-6">
              <Check className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-display font-black mb-2">Well Grounded</h3>
            <p className="text-slate-500 mb-8 text-sm">You've finished your journey. How do you feel now?</p>
            <Button variant="outline" className="rounded-xl" onClick={reset}>Try Again</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicators at bottom */}
      <div className="mt-8 flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? "w-8 bg-safe" : "w-4 bg-slate-100"}`} />
        ))}
      </div>
    </div>
  );
}
