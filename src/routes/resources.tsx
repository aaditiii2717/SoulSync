import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { BookOpen, Heart, Brain, Shield, Sun, Users, Phone, Lightbulb, X, Wind, Sparkles, Map, Activity, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CRISIS_HELPLINES } from "@/constants/partners";
import { BreathingVisualizer } from "@/components/resilience-tools/BreathingVisualizer";
import { GroundingJourney } from "@/components/resilience-tools/GroundingJourney";
import { HALTDiagnostic } from "@/components/resilience-tools/HALTDiagnostic";
import { ReflectionPad } from "@/components/resilience-tools/ReflectionPad";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
});

const resourceDetails: Record<string, any> = {
  "Understanding Anxiety": {
    content: "Anxiety is the body's natural response to stress, especially common in high-pressure student environments. It's a signal to pause and reset, not a failure.",
    steps: [
      "The 5-4-3-2-1 Grounding: Identify 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
      "Acknowledge and Accept: Instead of fighting the feeling, say 'I am noticing a feeling of anxiety right now.'",
      "Paced Breathing: Use the SoulSync breathing guide below to settle your nervous system."
    ],
    tool: "grounding"
  },
  "Mindfulness & Breathing": {
    content: "Mindfulness is about being present in the moment—a superpower for students dealing with exam pressure and career uncertainty.",
    steps: [
      "Mindful Minute: Focus entirely on the sensation of air entering and leaving your nostrils for 60 seconds.",
      "The Body Scan: Mentally scan from your head to your toes, noticing where you might be holding stress.",
      "Judgment-Free Observation: Watch your thoughts like passing clouds—don't judge them, just observe."
    ],
    tool: "breathing"
  },
  "Building Emotional Resilience": {
    content: "Resilience is the ability to bounce back from setbacks. It's built through flexibility and radical self-compassion.",
    steps: [
      "Reframing: Ask 'What can I learn from this challenge?' instead of 'Why is this happening to me?'",
      "Self-Compassion: Treat yourself with the same kindness you would show a close friend.",
      "Focus on the Controllable: Dedicate your energy only to things within your power today."
    ]
  },
  "Recognizing Burnout": {
    content: "Academic burnout is real and common. It happens when high stress meets inadequate recovery over a long period.",
    steps: [
      "The HALT Check: Are you Hungry, Angry, Lonely, or Tired? Address these foundational needs first.",
      "The Power of 'No': Practice setting a boundary today to protect your study-life balance.",
      "Active Rest: Do something that truly recharges you (e.g., a walk, hobby) rather than passive scrolling."
    ],
    tool: "halt"
  },
  "Study-Life Balance": {
    content: "True balance is a rhythmic flow, not a static 50/50 split. Sustainability is the key to student academic success.",
    steps: [
      "Pomodoro Sprints: Work for 25 minutes, then take a 5-minute movement break. Repeat 4 times, then take 30 mins off.",
      "Hardest Tasks First: Schedule your most demanding subjects for when your energy is highest (usually morning).",
      "Digital Sunset: Try to disconnect from all school-related screens 1 hour before bedtime."
    ]
  },
  "Building Support Networks": {
    content: "India's strength lies in community. Building your tribe involves consistent, mutual vulnerability and shared experiences.",
    steps: [
      "One Connection Today: Reach out to a peer just to say 'Hi' or ask how their day is going.",
      "Shared Struggle: Open up about shared academic pressure—it reduces individual isolation.",
      "Club Participation: Join a university group based on a passion to find like-minded people."
    ]
  },
  "Journaling for Wellness": {
    content: "Journaling is 'thinking on paper.' It helps process complex emotions and clears your mental workspace.",
    steps: [
      "Gratitude Sprints: List 3 specific things you are grateful for today (e.g., a good cup of chai, a clear sky).",
      "The Brain Dump: Spend 10 minutes writing every worry on paper to get it out of your head.",
      "Letter to the Future: Write to your future self about what you're proud of overcoming right now."
    ],
    tool: "reflection"
  },
  "Crisis Helplines": {
    content: "You are not alone. Professional, anonymous support is available in India 24/7. These contacts are verified and ready to listen.",
    steps: CRISIS_HELPLINES.map(h => `${h.name} (${h.hours}): ${h.number} (${h.type})`),
    isUrgent: true
  }
};

const resources = [
  { icon: Brain, title: "Understanding Anxiety", tags: ["Anxiety", "Self-help"], description: "Manage anxious thoughts with grounded techniques." },
  { icon: Heart, title: "Building Emotional Resilience", tags: ["Resilience", "Growth"], description: "Develop the mental flexibility to bounce back." },
  { icon: Sun, title: "Mindfulness & Breathing", tags: ["Mindfulness", "Breathing"], description: "Simple exercises to stay present and calm." },
  { icon: Shield, title: "Recognizing Burnout", tags: ["Burnout", "Academic"], description: "Signs of academic burnout and recovery steps." },
  { icon: Users, title: "Building Support Networks", tags: ["Social", "Connection"], description: "Cultivate healthy friendships and tribes." },
  { icon: Phone, title: "Crisis Helplines", tags: ["Emergency", "Safety"], description: "Verified 24/7 support contacts for India." },
  { icon: Lightbulb, title: "Study-Life Balance", tags: ["Academic", "Balance"], description: "Tips for managing pressure and well-being." },
  { icon: BookOpen, title: "Journaling for Wellness", tags: ["Journaling", "Wellness"], description: "Expressive writing techniques for health." },
];

function ResourcesPage() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const selectedResource = selectedTitle ? resources.find(r => r.title === selectedTitle) : null;
  const details = selectedTitle ? resourceDetails[selectedTitle] : null;

  if (!isMounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen pt-16 bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Modern Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            2026 Winner&apos;s Suite
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight text-slate-800">
            Knowledge & <span className="text-gradient">Resilience</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
            A high-performance toolset for mental well-being, designed for the Indian student context and the Google Solution Challenge.
          </p>
        </motion.div>

        {/* India Awareness Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="md:col-span-3 rounded-[2.5rem] bg-slate-900 p-10 text-white overflow-hidden relative shadow-2xl flex flex-col justify-center"
           >
              <div className="relative z-10 max-w-2xl">
                 <h3 className="font-display text-3xl font-black mb-4">Integrated Indian Safety Net</h3>
                 <p className="text-white/70 text-sm leading-relaxed font-medium">
                    We've collaborated with national helplines and leading NGOs to provide instant, anonymous access to professional support. Every tool in this library is curated for the unique academic and cultural context of India.
                 </p>
                 <div className="mt-8 flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 font-bold">🇮🇳</div>
                    <div className="self-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Regional Compliance</p>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Verified Resilience Hub Standard</p>
                    </div>
                 </div>
              </div>
              <Shield className="absolute -right-10 -bottom-10 h-64 w-64 text-white/[0.03]" />
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.1 }}
             className="rounded-[2.5rem] bg-amber-50 border-2 border-amber-200 p-8 flex flex-col justify-center text-center group hover:bg-slate-900 transition-all duration-500 shadow-sm"
           >
              <Phone className="h-10 w-10 text-amber-600 mx-auto mb-4 group-hover:text-white transition-colors" />
              <h4 className="font-display font-black text-slate-800 mb-2 group-hover:text-white transition-colors">Emergency?</h4>
              <p className="text-xs text-slate-500 font-bold group-hover:text-white/60 transition-colors">Immediate support is one click away.</p>
              <Button 
                onClick={() => setSelectedTitle("Crisis Helplines")}
                className="mt-6 rounded-full bg-slate-900 group-hover:bg-white group-hover:text-primary transition-all shadow-xl font-black text-[10px] uppercase tracking-widest"
              >
                 View Helplines
              </Button>
           </motion.div>
        </div>

        {/* Resource Library Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-black flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Curated Guides
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 tracking-widest">
              <Sparkles className="h-3 w-3" />
              Interactive Workspace
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((r, i) => (
              <ResourceCard 
                 key={r.title} 
                 {...r} 
                 index={i} 
                 onClick={() => setSelectedTitle(r.title)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Interactive Interaction Drawer/Modal */}
      <AnimatePresence>
        {selectedTitle && selectedResource && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedTitle(null)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-slate-100"
              >
                  <div className="p-10 sm:p-14 overflow-y-auto">
                     <div className="flex items-start justify-between mb-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 shadow-inner">
                           <selectedResource.icon className="h-8 w-8 text-primary" />
                        </div>
                        <button 
                           onClick={() => setSelectedTitle(null)}
                           className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors"
                        >
                           <X className="h-7 w-7 text-slate-300 hover:text-slate-500" />
                        </button>
                     </div>

                     <h2 className="font-display text-4xl font-black text-slate-800 mb-2 leading-tight">{selectedTitle}</h2>
                     <div className="flex gap-2 mb-8">
                        {selectedResource.tags.map(t => (
                           <span key={t} className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">{t}</span>
                        ))}
                     </div>

                     <div className="space-y-12">
                        <div className="space-y-4">
                           <p className="text-slate-500 text-lg leading-relaxed font-semibold">{details?.content}</p>
                        </div>

                        {/* Category-Specific Interactive Content */}
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Interactive Tool</h4>
                           
                           {details?.tool === "grounding" && <GroundingJourney />}
                           {details?.tool === "breathing" && <BreathingVisualizer />}
                           {details?.tool === "halt" && <HALTDiagnostic />}
                           {details?.tool === "reflection" && <ReflectionPad />}
                           
                           {!["Understanding Anxiety", "Mindfulness & Breathing", "Recognizing Burnout", "Journaling for Wellness"].includes(selectedTitle) && (
                              <div className="space-y-4">
                                 {details?.steps.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                       <div className="h-6 w-6 shrink-0 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white">{i + 1}</div>
                                       <p className="text-sm text-slate-700 font-bold leading-relaxed">{step}</p>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SoulSync Ecosystem</span>
                     </div>
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verified 2026 Submission Hub</span>
                  </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
