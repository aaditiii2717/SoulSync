import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { MoodChart } from "@/components/MoodChart";
import { Button } from "@/components/ui/button";
import { MessageCircleHeart, BookOpen, TrendingUp, Users, Shield, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/check-in")({
  component: CheckInPage,
});

const quickActions = [
  { icon: MessageCircleHeart, label: "Talk to Someone", desc: "Start a safe conversation", to: "/chat" as const },
  { icon: BookOpen, label: "Self-Help Library", desc: "Coping tools & guides", to: "/resources" as const },
  { icon: TrendingUp, label: "Mood Journal", desc: "Track your journey", to: "/mood-tracker" as const },
];

function CheckInPage() {
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const fetchMoodHistory = async () => {
    if (!aliasId) return;
    setLoadingChart(true);
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("alias_id", aliasId)
      .order("created_at", { ascending: false }) // Get newest first
      .limit(7);
    
    if (data) {
      // Reverse to show chronological order on chart
      const formatted = data.reverse().map(d => {
        const dateObj = new Date(d.created_at);
        return {
          // If we have multiple entries on same day, show time
          date: format(dateObj, "EEE p"), 
          mood: d.mood as MoodType
        };
      });
      setMoodEntries(formatted);
    }
    setLoadingChart(false);
  };

  useEffect(() => {
    if (aliasId) {
      fetchMoodHistory();
    }
  }, [aliasId]);

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    if (!aliasId) return;

    const { error } = await supabase
      .from("mood_entries")
      .insert({
        alias_id: aliasId,
        mood: mood,
        note: "Quick check-in from dashboard"
      });

    if (!error) {
      toast.success("Mood recorded! ✨");
      fetchMoodHistory();
    }
  };

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
          <MoodSelector selected={selectedMood} onSelect={handleMoodSelect} />
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
            {loadingChart || identityLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : (
              <MoodChart data={moodEntries.length > 0 ? moodEntries : undefined} />
            )}
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
