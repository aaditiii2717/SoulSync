import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { BookOpen, Heart, Brain, Shield, Sun, Users, Phone, Lightbulb, Sparkles, Wind, Map, Activity, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BreathingVisualizer } from "@/components/resilience-tools/BreathingVisualizer";
import { GroundingJourney } from "@/components/resilience-tools/GroundingJourney";
import { HALTDiagnostic } from "@/components/resilience-tools/HALTDiagnostic";
import { ReflectionPad } from "@/components/resilience-tools/ReflectionPad";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
});

const resources = [
  {
    icon: Brain,
    title: "Understanding Anxiety",
    description: "Learn what anxiety is, why it happens, and practical techniques to manage anxious thoughts in daily life.",
    tags: ["Anxiety", "Self-help"],
  },
  {
    icon: Heart,
    title: "Building Emotional Resilience",
    description: "Develop skills to bounce back from setbacks and handle emotional challenges with more confidence.",
    tags: ["Resilience", "Growth"],
  },
  {
    icon: Sun,
    title: "Mindfulness & Breathing",
    description: "Simple breathing exercises and mindfulness techniques you can practice anywhere, anytime.",
    tags: ["Mindfulness", "Breathing"],
  },
  {
    icon: Shield,
    title: "Recognizing Burnout",
    description: "Signs of academic and emotional burnout, and steps to recover before it gets worse.",
    tags: ["Burnout", "Academic"],
  },
  {
    icon: Users,
    title: "Building Support Networks",
    description: "How to cultivate healthy friendships and support systems in college and beyond.",
    tags: ["Social", "Connection"],
  },
  {
    icon: Phone,
    title: "Crisis Helplines",
    description: "A curated list of verified helplines and emergency contacts available 24/7 for immediate support.",
    tags: ["Emergency", "Safety"],
  },
  {
    icon: Lightbulb,
    title: "Study-Life Balance",
    description: "Tips for managing academic pressure while maintaining your mental well-being.",
    tags: ["Academic", "Balance"],
  },
  {
    icon: BookOpen,
    title: "Journaling for Wellness",
    description: "How expressive writing and gratitude journaling can improve emotional health and self-awareness.",
    tags: ["Journaling", "Wellness"],
  },
];

const interactiveTools = [
  { id: "breathing", label: "Safe Breath", icon: Wind, component: BreathingVisualizer, color: "text-primary", bg: "bg-primary/5" },
  { id: "grounding", label: "Grounding Journey", icon: Map, component: GroundingJourney, color: "text-safe", bg: "bg-safe/5" },
  { id: "halt", label: "HALT Check", icon: Activity, component: HALTDiagnostic, color: "text-calm", bg: "bg-calm/5" },
  { id: "reflection", label: "Reflection Pad", icon: PenLine, component: ReflectionPad, color: "text-primary", bg: "bg-primary/5" },
];

function ResourcesPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const CurrentTool = interactiveTools.find(t => t.id === activeTool)?.component;

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            2026 Winner&apos;s Suite
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight">
            Knowledge & <span className="text-gradient">Resilience</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Explore our curated library of self-help guides or take immediate action with our suite of interactive resilience tools.
          </p>
        </motion.div>

        {/* Interactive Workspace Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-black flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Interactive Workspace
            </h2>
            {activeTool && (
              <Button variant="ghost" onClick={() => setActiveTool(null)} className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Close Workspace
              </Button>
            )}
          </div>

          {!activeTool ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {interactiveTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-primary/30 hover:shadow-xl transition-all group text-center"
                >
                  <div className={`h-16 w-16 ${tool.bg} ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display font-black text-lg mb-1">{tool.label}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Tool</p>
                </button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                 {CurrentTool && <CurrentTool />}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-[2rem] bg-amber-50 border-2 border-amber-200 p-8 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
             <Shield className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Professional Guidance</h4>
            <p className="text-sm text-amber-800/80 leading-relaxed">
              These tools and resources are for educational and self-regulation purposes. They do not replace professional therapy. If you are in immediate crisis, please use our <strong>Crisis Helplines</strong> section.
            </p>
          </div>
        </motion.div>

        {/* Resource Library Grid */}
        <section>
          <h2 className="text-2xl font-display font-black flex items-center gap-2 mb-8">
            <BookOpen className="h-6 w-6 text-primary" />
            Curated Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => (
              <ResourceCard key={r.title} {...r} index={i} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
