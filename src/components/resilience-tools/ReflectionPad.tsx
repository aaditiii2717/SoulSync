import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trash2, ShieldCheck, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReflectionPad() {
  const [content, setContent] = useState("");
  const [isRelieved, setIsRelieved] = useState(false);

  const handleRelief = () => {
    if (!content.trim()) return;
    setIsRelieved(true);
    setTimeout(() => {
      setContent("");
      setIsRelieved(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] border border-primary/10 min-h-[400px] relative overflow-hidden">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-primary">
          <PenLine className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resilience Tool</span>
      </div>

      <div className="text-center mb-6 w-full max-w-md">
         <h3 className="text-2xl font-display font-black mb-1">Reflection Pad</h3>
         <p className="text-slate-500 text-sm">A zero-trace space to offload your thoughts.</p>
      </div>

      <AnimatePresence mode="wait">
        {!isRelieved ? (
          <motion.div
            key="pad"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="w-full max-w-md flex-1 flex flex-col gap-4"
          >
            <div className="relative flex-1 flex flex-col">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's weighing on you? Let it out here. Nothing is saved once you release it."
                className="flex-1 min-h-[180px] rounded-[1.5rem] bg-white border-2 border-slate-100 focus:border-primary/30 p-6 text-sm resize-none shadow-sm transition-all"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">
                 <ShieldCheck className="h-3 w-3" /> Zero-Trace
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full rounded-2xl h-14 shadow-lg group"
              disabled={!content.trim()}
              onClick={handleRelief}
            >
              <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Release and Clear
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="relief"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center flex flex-col items-center justify-center flex-1"
          >
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              <Send className="h-10 w-10 animate-ping-once" />
            </div>
            <h3 className="text-2xl font-display font-black mb-2">Released into the void.</h3>
            <p className="text-slate-500 text-sm">Your thoughts have been cleared. Take a deep breath.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
