import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { BookOpen, Heart, Brain, Shield, Sun, Users, Phone, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

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

function ResourcesPage() {
  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Resource Library
          </h1>
          <p className="mt-1 text-muted-foreground">Self-help guides and mental health resources for your journey</p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-muted-foreground"
        >
          <strong className="text-foreground">Disclaimer:</strong> These resources are for educational purposes.
          They do not replace professional therapy. If you&apos;re in crisis, please contact a helpline immediately.
        </motion.div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r, i) => (
            <ResourceCard key={r.title} {...r} index={i} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
