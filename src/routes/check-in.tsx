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
  { icon: MessageCircleHeart, label: "Talk to Someone", desc: "Start a safe conversation", to: "/chat" as const },
  { icon: BookOpen, label: "Self-Help Library", desc: "Coping tools & guides", to: "/resources" as const },
  { icon: TrendingUp, label: "Mood Journal", desc: "Track your journey", to: "/mood-tracker" as const },
];

function CheckInPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Welcome 👋</h1>
          <p className="mt-1 text-muted-foreground">This is your safe space. How are you feeling today?</p>
        </motion.div>

        {/* Mood Check-In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border bg-card p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-4 text-center">Quick Check-In</h2>
          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
          {selectedMood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {selectedMood === "great" || selectedMood === "good"
                  ? "That's wonderful! Keep nurturing that positive energy 🌟"
                  : selectedMood === "okay"
                  ? "That's completely okay. Would you like to explore what's on your mind?"
                  : "We hear you. You don't have to go through this alone. 💛"}
              </p>
              {(selectedMood === "low" || selectedMood === "struggling") && (
                <Link to="/chat">
                  <Button variant="hero" className="mt-3 rounded-xl">Talk to Someone</Button>
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Quick Actions & Chart */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-display text-lg font-semibold">What would you like to do?</h2>
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to}>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{action.label}</h3>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Your Mood Journey</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <MoodChart />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageCircleHeart, label: "Conversations", value: "12", color: "bg-primary/10 text-primary" },
            { icon: Users, label: "Peer Sessions", value: "3", color: "bg-calm/10 text-calm" },
            { icon: Shield, label: "Safety Score", value: "98%", color: "bg-safe/10 text-safe" },
            { icon: Sparkles, label: "Check-In Streak", value: "5 days", color: "bg-warm/10 text-warm" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mb-2`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
