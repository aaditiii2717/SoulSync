import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { MoodChart } from "@/components/MoodChart";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
  const [entries] = useState<MoodEntry[]>(initialEntries);
  const [todayMood, setTodayMood] = useState<MoodType | undefined>();
  const [note, setNote] = useState("");
  const [showLog, setShowLog] = useState(false);

  const logMood = () => {
    if (!todayMood) return;
    setShowLog(true);
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
          <h2 className="font-display text-lg font-semibold mb-4">Weekly Trend</h2>
          <MoodChart data={entries} />
        </div>

        {/* History */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Entries</h2>
          <div className="space-y-3">
            {[...entries].reverse().map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl border p-3"
              >
                <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium capitalize">{entry.mood}</div>
                  {entry.note && <div className="text-xs text-muted-foreground">{entry.note}</div>}
                </div>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
