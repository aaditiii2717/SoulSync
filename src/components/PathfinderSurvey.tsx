import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Users, 
  BookHeart, 
  Sparkles, 
  CheckCircle2,
  BrainCircuit,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

const questions = [
  {
    id: "need",
    question: "What feels most important right now?",
    options: [
      { id: "vent", label: "I just need to be heard by someone", icon: Users, recommendation: "peer" },
      { id: "tools", label: "I want practical tools to cope", icon: BrainCircuit, recommendation: "resources" },
      { id: "space", label: "I need space to process my thoughts", icon: BookHeart, recommendation: "chat" }
    ]
  },
  {
    id: "pace",
    question: "How would you like to start?",
    options: [
      { id: "slow", label: "Slower (Reflective/Journaling)", icon: Heart, recommendation: "check-in" },
      { id: "direct", label: "Direct (Conversational)", icon: Sparkles, recommendation: "chat" }
    ]
  }
];

export function PathfinderSurvey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const getRecommendation = () => {
    if (answers.need === "vent") return {
      title: "Peer-to-Peer Support",
      desc: "It sounds like human connection would feel best today. Our verified student listeners can offer a warm, judgment-free space.",
      cta: "Find a Peer Listener",
      link: "/peer-match"
    };
    if (answers.need === "tools") return {
      title: "Resilience Toolset",
      desc: "Practical techniques can help ground you in this moment. Explore our breathing guides and grounding toolkits.",
      cta: "Explore Resources",
      link: "/resources"
    };
    return {
      title: "Emotionally Aware AI Chat",
      desc: "Starting a conversation can help untangle what's on your mind. Our AI is designed to slow down and listen at your pace.",
      cta: "Start Conversing",
      link: "/chat"
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="relative mx-auto max-w-4xl px-4">
      <div className="glass-card rounded-[3rem] p-10 sm:p-16 shadow-2xl relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative z-10"
            >
              <div className="mb-10">
                <div className="flex gap-2 mb-6">
                  {questions.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-slate-100"}`} 
                    />
                  ))}
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                  {questions[step].question}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions[step].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(questions[step].id, option.id)}
                    className="group relative flex flex-col items-center gap-6 rounded-[2.5rem] bg-white/50 border border-slate-100 p-8 text-center transition-all duration-500 hover:bg-white hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <option.icon className="h-7 w-7" />
                    </div>
                    <span className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-safe/10 text-safe">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-display text-4xl font-semibold mb-4">Your Pathfinder Suggestion</h3>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed mb-10">
                {recommendation.desc}
              </p>

              <div className="rounded-[2.5rem] bg-slate-50 border border-slate-100 p-10 mb-10 inline-block text-left w-full max-w-2xl">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                       <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-display text-xl font-semibold">{recommendation.title}</h4>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    Based on your pace today, this path offers the softest entry point to the support SoulSync provides.
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => window.location.href = recommendation.link}
                  className="h-14 rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                >
                  {recommendation.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setStep(0); setIsCompleted(false); setAnswers({}); }}
                  className="h-14 rounded-full px-8"
                >
                  Start Over
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
