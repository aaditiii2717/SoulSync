import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { MoodChart } from "@/components/MoodChart";
import { Button } from "@/components/ui/button";
import { MessageCircleHeart, BookOpen, TrendingUp, Users, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/check-in")({
  component: CheckInPage,
});

const quickActions = [
  {
    icon: MessageCircleHeart,
    label: "Talk to Someone",
    desc: "Start a safe conversation",
    to: "/chat" as const,
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    label: "Self-Help Library",
    desc: "Coping tools & guides",
    to: "/resources" as const,
    color: "bg-calm/10 text-calm",
  },
  {
    icon: TrendingUp,
    label: "Mood Journal",
    desc: "Track your journey",
    to: "/mood-tracker" as const,
    color: "bg-warm/10 text-warm",
  },
];

const stats = [
  {
    icon: MessageCircleHeart,
    label: "Conversations",
    value: "12",
    color: "bg-primary/10 text-primary",
    glowColor: "oklch(0.61 0.17 33 / 0.15)",
  },
  {
    icon: Users,
    label: "Peer Sessions",
    value: "3",
    color: "bg-calm/10 text-calm",
    glowColor: "oklch(0.65 0.12 195 / 0.15)",
  },
  {
    icon: Shield,
    label: "Safety Score",
    value: "98%",
    color: "bg-safe/10 text-safe",
    glowColor: "oklch(0.67 0.15 155 / 0.15)",
  },
  {
    icon: Sparkles,
    label: "Check-In Streak",
    value: "5 days",
    color: "bg-warm/10 text-warm",
    glowColor: "oklch(0.78 0.15 72 / 0.15)",
  },
];

function CheckInPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();

  return (
    <div className="min-h-screen pt-20">
      <Navbar />

      {/* Page ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.93 0.08 55 / 0.5), transparent 70%)" }}
        />
        <div
          className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full opacity-12"
          style={{ background: "radial-gradient(circle, oklch(0.90 0.07 190 / 0.5), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your Safe Space
          </div>
          <h1 className="font-display text-4xl font-bold">
            Welcome back 👋
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            This is your safe space. How are you feeling today?
          </p>
        </motion.div>

        {/* Mood Check-In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="premium-card rounded-[2rem] p-7"
        >
          <h2 className="font-display text-xl font-semibold mb-6 text-center">Quick Check-In</h2>
          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
          <AnimatedMoodResponse mood={selectedMood} />
        </motion.div>

        {/* Quick Actions + Chart */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1 space-y-3"
          >
            <h2 className="font-display text-lg font-semibold mb-1">What would you like to do?</h2>
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <Link to={action.to}>
                  <div className="group flex items-center gap-4 premium-card rounded-[1.6rem] px-5 py-4 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_oklch(0.4_0.09_35_/_0.4)] transition-all duration-250 cursor-pointer">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${action.color} transition-transform duration-200 group-hover:scale-110`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{action.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="lg:col-span-2 premium-card rounded-[2rem] p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold">Your Mood Journey</h2>
              <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                Last 7 days
              </span>
            </div>
            <MoodChart />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="group premium-card rounded-[1.75rem] p-5 text-center hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_oklch(0.4_0.09_35_/_0.45)] transition-all duration-250"
            >
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} mb-3 transition-transform duration-200 group-hover:scale-110`}
                style={{ boxShadow: `0 8px 24px -8px ${stat.glowColor}` }}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl font-bold text-gradient">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

function AnimatedMoodResponse({ mood }: { mood: MoodType | undefined }) {
  if (!mood) return null;

  const isPositive = mood === "great" || mood === "good";
  const isNeutral = mood === "okay";
  const needsSupport = mood === "low" || mood === "struggling";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-5 text-center"
    >
      <div className="inline-block rounded-[1.4rem] border border-white/60 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-sm">
        <p className="text-sm text-muted-foreground leading-7">
          {isPositive
            ? "That's wonderful! Keep nurturing that positive energy 🌟"
            : isNeutral
            ? "That's completely okay. Would you like to explore what's on your mind?"
            : "We hear you. You don't have to go through this alone. 💛"}
        </p>
        {needsSupport && (
          <Link to="/chat">
            <Button variant="hero" className="mt-4 rounded-full px-6 transition-all duration-200 hover:scale-105 active:scale-95">
              Talk to Someone
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
