import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { MoodChart } from "@/components/MoodChart";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/mood-tracker")({
  component: MoodTrackerPage,
});

interface MoodEntry {
  date: string;
  mood: MoodType;
  note?: string;
}

const initialEntries: MoodEntry[] = [
  { date: "Mon", mood: "okay", note: "Had a regular day" },
  { date: "Tue", mood: "low", note: "Exam stress" },
  { date: "Wed", mood: "struggling", note: "Felt overwhelmed" },
  { date: "Thu", mood: "low", note: "Talked to a friend" },
  { date: "Fri", mood: "okay", note: "Better after exercise" },
  { date: "Sat", mood: "good", note: "Relaxed and read" },
  { date: "Sun", mood: "great", note: "Had a great time!" },
];

const moodEmojis: Record<MoodType, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  struggling: "😢",
};

function MoodTrackerPage() {
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [todayMood, setTodayMood] = useState<MoodType | undefined>();
  const [note, setNote] = useState("");
  const [showLog, setShowLog] = useState(false);

  const cleanupOldEntries = async () => {
    if (!aliasId) return;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("alias_id", aliasId)
      .lt("created_at", sevenDaysAgo.toISOString());

    if (error) console.error("Error cleaning up old entries:", error);
  };

  const fetchEntries = async () => {
    if (!aliasId) return;
    setLoadingEntries(true);
    
    // Auto-cleanup before fetch to keep prototype focused
    await cleanupOldEntries();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("alias_id", aliasId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching moods:", error);
    } else {
      const formattedEntries: MoodEntry[] = (data || []).map(d => ({
        // Use a unique string including time so Chart doesn't collapse labels
        date: format(new Date(d.created_at), "EEE, p"), 
        mood: d.mood as MoodType,
        note: d.note || ""
      }));
      setEntries(formattedEntries);
    }
    setLoadingEntries(false);
  };

  useEffect(() => {
    if (aliasId) {
      fetchEntries();
    }
  }, [aliasId]);

  const logMood = async () => {
    if (!todayMood || !aliasId) return;
    
    setLoadingEntries(true);
    const { error } = await supabase
      .from("mood_entries")
      .insert({
        alias_id: aliasId,
        mood: todayMood,
        note: note.trim() || null,
      });

    if (error) {
      toast.error("Failed to save mood. Please try again.");
      setLoadingEntries(false);
    } else {
      toast.success("Mood recorded successfully!");
      setShowLog(true);
      setNote("");
      setTodayMood(undefined);
      fetchEntries();
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Mood Journey
          </h1>
          <p className="mt-1 text-muted-foreground">Track your emotional trends over time</p>
        </motion.div>

        {/* Log Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border bg-card p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Log Today&apos;s Mood
          </h2>
          <MoodSelector selected={todayMood} onSelect={setTodayMood} />
          {todayMood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)..."
                className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
              />
              <Button variant="hero" onClick={logMood} className="rounded-xl">
                <Plus className="h-4 w-4 mr-1" /> Log Mood
              </Button>
              {showLog && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-safe font-medium">
                  ✓ Mood logged! Keep tracking to see patterns.
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Chart */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold">Weekly Trend</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Higher = Better Mood
               </div>
               <div className="flex items-center gap-1 ml-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Lower = Tough Days
               </div>
            </div>
          </div>
          <p className="mb-6 text-xs text-muted-foreground leading-relaxed">
            This graph tracks your <strong>Emotional Wave</strong>. The peaks show when you felt resilient, while the valleys mark times when you needed more support. 
            <span className="ml-1 text-primary italic font-medium">Data resets every 7 days to keep your focus on the present.</span>
          </p>
          <MoodChart data={entries} />
        </div>

        {/* History */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Entries</h2>
          {loadingEntries || identityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">No mood entries yet.</p>
              <p className="text-xs text-slate-400">Your journey starts with your first log today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...entries].reverse().map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-xl border p-3 bg-white/50"
                >
                  <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium capitalize">{entry.mood}</div>
                    {entry.note && <div className="text-xs text-muted-foreground">{entry.note}</div>}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{entry.date}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
