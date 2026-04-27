import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Apple, Zap, Users, Moon, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const factors = [
  { id: "hungry", label: "Hungry?", icon: Apple, advice: "When was your last meal? Even a small snack can stabilize your blood sugar and mood." },
  { id: "angry", label: "Angry?", icon: Zap, advice: "Anger often masks other feelings. Take a moment to name what's actually hurting." },
  { id: "lonely", label: "Lonely?", icon: Users, advice: "Deep breath. You are not alone. Consider checking in with our AI companion or booking a peer call." },
  { id: "tired", label: "Tired?", icon: Moon, advice: "Physical exhaustion amplifies all emotions. 20 minutes of rest can change your perspective." },
];

export function HALTDiagnostic() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current = factors.find(f => f.id === selectedId);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-calm/5 to-transparent rounded-[2.5rem] border border-calm/10 min-h-[400px] relative overflow-hidden">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-calm">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resilience Tool</span>
      </div>

      <AnimatePresence mode="wait">
        {!selectedId ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
            <h3 className="text-2xl font-display font-black mb-2">HALT Check</h3>
            <p className="text-slate-500 mb-8 max-w-[240px] mx-auto text-sm">
              Stop. Which of these are you feeling right now?
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {factors.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl hover:border-calm/40 hover:shadow-md transition-all active:scale-95"
                >
                  {React.createElement(f.icon, { className: "h-8 w-8 text-calm" })}
                  <p className="font-bold text-sm">{f.label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="advice" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center max-w-xs">
            <div className="h-20 w-20 bg-calm/10 rounded-full flex items-center justify-center text-calm mx-auto mb-6">
               {current && React.createElement(current.icon, { className: "h-10 w-10" })}
            </div>
            <h3 className="text-2xl font-display font-black mb-4">You&apos;re feeling {selectedId}</h3>
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-8">
              <p className="text-sm text-slate-600 leading-relaxed">
                {current?.advice}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl flex-1" onClick={() => setSelectedId(null)}>
                 Check another
              </Button>
              <Button variant="hero" className="rounded-xl flex-1 bg-calm hover:bg-calm/90">
                 Thanks
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
