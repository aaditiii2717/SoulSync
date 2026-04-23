import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  MessageCircleOff, 
  Users, 
  BookHeart, 
  Sparkles, 
  CheckCircle2,
  BrainCircuit,
  Heart
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Link } from "@tanstack/react-router";

type SurveyStep = "intro" | "feeling" | "preference" | "result";

interface PathResult {
  title: string;
  description: string;
  icon: any;
  link: string;
  actionLabel: string;
}

const paths: Record<string, PathResult> = {
  ai: {
    title: "AI Grounding Chat",
    description: "Perfect for immediate relief. Start an anonymous, guided conversation with our emotionally-aware AI to find your footing.",
    icon: BrainCircuit,
    link: "/chat",
    actionLabel: "Begin AI Session"
  },
  peer: {
    title: "Verified Peer Match",
    description: "Sometimes you just need a human. Match with a verified student volunteer who has been exactly where you are.",
    icon: Users,
    link: "/peer-match",
    actionLabel: "Find a Peer Listener"
  },
  resources: {
    title: "Quiet Resilience Hub",
    description: "Prefer space? Explore our curated resources, mood journals, and self-care tools designed for student life.",
    icon: BookHeart,
    link: "/resources",
    actionLabel: "Explore Resources"
  }
};

export function PathfinderSurvey() {
  const [step, setStep] = useState<SurveyStep>("intro");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [preference, setPreference] = useState<string | null>(null);

  const getResult = (): PathResult => {
    if (preference === "human") return paths.peer;
    if (feeling === "overwhelmed" || feeling === "anxious") return paths.ai;
    return paths.resources;
  };

  const handleReset = () => {
    setStep("intro");
    setFeeling(null);
    setPreference(null);
  };

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Find Your Way
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                  Not sure where to start?
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                  SoulSync offers different levels of support depending on how much energy you have today. Let's find your path in 30 seconds.
                </p>
              </div>
              <Button 
                variant="hero" 
                size="xl" 
                className="h-16 rounded-3xl px-12 text-lg shadow-xl"
                onClick={() => setStep("feeling")}
              >
                Find My Support Path <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === "feeling" && (
            <motion.div
              key="feeling"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <h3 className="font-display text-3xl font-semibold">How are you feeling right now?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "overwhelmed", label: "Overwhelmed & Heavy", icon: Sparkles },
                  { id: "lonely", label: "Lonely / Need Connection", icon: Users },
                  { id: "anxious", label: "Anxious / Panicked", icon: Heart },
                  { id: "curious", label: "Just Exploring Resources", icon: BookHeart },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFeeling(item.id);
                      setStep("preference");
                    }}
                    className="flex items-center gap-4 p-6 rounded-3xl bg-white/60 border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all shadow-sm text-left group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "preference" && (
            <motion.div
              key="preference"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <h3 className="font-display text-3xl font-semibold">Which feels better today?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setPreference("ai");
                    setStep("result");
                  }}
                  className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/60 border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all shadow-sm group"
                >
                  <div className="h-16 w-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-2">
                    <BrainCircuit className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-slate-800 text-lg">AI Reflection</span>
                    <span className="text-sm text-muted-foreground">Private, instant, guided chat</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPreference("human");
                    setStep("result");
                  }}
                  className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/60 border-2 border-transparent hover:border-primary/30 hover:bg-white transition-all shadow-sm group"
                >
                  <div className="h-16 w-16 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-rose-600" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-slate-800 text-lg">Human Listening</span>
                    <span className="text-sm text-muted-foreground">Matched with a verified peer</span>
                  </div>
                </button>
              </div>
              <button 
                onClick={() => setStep("feeling")}
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to mood check-in
              </button>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-safe/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-safe ring-1 ring-safe/20">
                <CheckCircle2 className="h-4 w-4" /> Recommended for You
              </div>
              
              <Card className="mx-auto max-w-2xl rounded-[3rem] p-8 sm:p-12 border-none shadow-2xl bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="relative text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const Icon = getResult().icon;
                      return <Icon className="h-10 w-10 text-primary" />;
                    })()}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-display text-4xl font-black">{getResult().title}</h3>
                    <p className="text-lg leading-relaxed text-slate-600 max-w-lg mx-auto">
                      {getResult().description}
                    </p>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={getResult().link}>
                      <Button variant="hero" size="xl" className="h-14 rounded-2xl px-10 shadow-lg">
                        {getResult().actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="xl" 
                      className="h-14 rounded-2xl px-10 border-2"
                      onClick={handleReset}
                    >
                      Restart Quiz
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
