import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BreathingVisualizer() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase === "idle") return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (phase === "inhale" && prev >= 4) {
          setPhase("hold");
          return 0;
        }
        if (phase === "hold" && prev >= 4) {
          setPhase("exhale");
          return 0;
        }
        if (phase === "exhale" && prev >= 4) {
          setPhase("inhale");
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const startSession = () => {
    setPhase("inhale");
    setSeconds(0);
  };

  const resetSession = () => {
    setPhase("idle");
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] border border-primary/10 overflow-hidden relative min-h-[400px]">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-primary">
          <Wind className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resilience Tool</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <h3 className="text-2xl font-display font-black mb-2">Safe Breath</h3>
            <p className="text-slate-500 mb-8 max-w-[240px] mx-auto text-sm">
              Follow the expanding circle to regulate your nervous system.
            </p>
            <Button variant="hero" size="lg" className="rounded-2xl" onClick={startSession}>
              <Play className="mr-2 h-4 w-4" /> Start Exercise
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center mb-12">
              {/* Outer Glow */}
              <motion.div
                animate={{
                  scale: phase === "inhale" ? [1, 1.4] : phase === "exhale" ? [1.4, 1] : phase === "hold" ? 1.4 : 1,
                  opacity: phase === "hold" ? 0.4 : 0.2
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute w-48 h-48 bg-primary rounded-full blur-3xl"
              />

              {/* Main Circle */}
              <motion.div
                animate={{
                  scale: phase === "inhale" ? [1, 1.4] : phase === "exhale" ? [1.4, 1] : phase === "hold" ? 1.4 : 1,
                  backgroundColor: phase === "hold" ? "var(--primary)" : "rgba(var(--primary-rgb), 0.8)",
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
              >
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">{phase}</p>
                  <p className="text-2xl font-black">{4 - seconds}</p>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-4">
               <Button variant="outline" className="rounded-xl" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex gap-2">
         {[1, 2, 3, 4].map(i => (
           <div key={i} className={`h-1 rounded-full transition-all duration-1000 ${i <= seconds && phase !== "idle" ? "w-8 bg-primary" : "w-4 bg-slate-100"}`} />
         ))}
      </div>
    </div>
  );
}
