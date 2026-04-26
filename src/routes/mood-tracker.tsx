import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodSelector, type MoodType } from "@/components/MoodSelector";
import { MoodChart, type ChartDataPoint, moodValues } from "@/components/MoodChart";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Loader2, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/mood-tracker")({
  component: MoodTrackerPage,
});

interface RawMoodEntry {
  created_at: string;
  mood: MoodType;
  note?: string;
}

const moodEmojis: Record<MoodType, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  struggling: "😢",
};

function MoodTrackerPage() {
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [entries, setEntries] = useState<RawMoodEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [todayMood, setTodayMood] = useState<MoodType | undefined>();
  const [note, setNote] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

  const cleanupOldEntries = async () => {
    if (!aliasId) return;
    
    // Keep 60 days of history for the monthly view to work reliably
    const sixtyDaysAgo = subDays(new Date(), 60);
    
    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("alias_id", aliasId)
      .lt("created_at", sixtyDaysAgo.toISOString());

    if (error) console.error("Error cleaning up old entries:", error);
  };

  const fetchEntries = async () => {
    if (!aliasId) return;
    setLoadingEntries(true);
    
    await cleanupOldEntries();

    const startOfCurrentMonth = startOfMonth(new Date());
    const thirtyOneDaysAgo = subDays(new Date(), 31);
    const fetchStart = thirtyOneDaysAgo < startOfCurrentMonth ? thirtyOneDaysAgo : startOfCurrentMonth;

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("alias_id", aliasId)
      .gte("created_at", fetchStart.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching moods:", error);
    } else {
      setEntries((data as unknown as RawMoodEntry[]) || []);
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

  const today = new Date();

  // Derived state: Today's entries
  const todayEntries = useMemo(() => {
    return entries.filter((e) => isSameDay(new Date(e.created_at), today));
  }, [entries, today]);

  // Derived state: Daily Chart Data
  const dailyChartData: ChartDataPoint[] = useMemo(() => {
    return todayEntries.map(e => ({
      date: format(new Date(e.created_at), "h:mm a"),
      value: moodValues[e.mood],
      moodLabel: e.mood,
      isAverage: false
    }));
  }, [todayEntries]);

  // Helper to calculate averages for a given array of dates
  const calculateAveragesForInterval = (intervalDays: Date[]): ChartDataPoint[] => {
    return intervalDays.map(day => {
      const dayLogs = entries.filter(e => isSameDay(new Date(e.created_at), day));
      if (dayLogs.length === 0) {
        return {
          date: format(day, "MMM d"),
          value: null,
          isAverage: true
        };
      }
      const sum = dayLogs.reduce((acc, curr) => acc + moodValues[curr.mood], 0);
      return {
        date: format(day, "MMM d"),
        value: sum / dayLogs.length,
        isAverage: true
      };
    });
  };

  // Derived state: Weekly Chart Data
  const weeklyChartData: ChartDataPoint[] = useMemo(() => {
    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    return calculateAveragesForInterval(last7Days);
  }, [entries, today]);

  // Derived state: Monthly Chart Data
  const monthlyChartData: ChartDataPoint[] = useMemo(() => {
    const allDays = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
    return calculateAveragesForInterval(allDays);
  }, [entries, today]);

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/50">
            <TrendingUp className="h-8 w-8 text-primary" />
            Mood Journal
          </h1>
          <p className="mt-1 text-muted-foreground">Track your emotional trends throughout the day and month.</p>
        </motion.div>

        {/* Log Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 p-6 relative overflow-hidden"
        >
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Log Your Mood
          </h2>
          <MoodSelector selected={todayMood} onSelect={setTodayMood} />
          {todayMood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)..."
                className="w-full rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none h-20"
              />
              <Button variant="hero" onClick={logMood} className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
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

        <div className="mt-6 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Daily View
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Today&apos;s Logs
               </div>
            </div>
          </div>
          <p className="mb-6 text-xs text-muted-foreground leading-relaxed">
            This graph tracks your exact emotional state throughout today. 
          </p>
          {dailyChartData.length > 0 ? (
            <MoodChart data={dailyChartData} />
          ) : (
             <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-xl">
               No logs for today yet. Add a log above to see your daily trend!
             </div>
          )}
          </div>
        </div>

        {/* Weekly / Monthly Chart */}
        <div className="mt-6 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Historical Trends
            </h2>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setChartView("weekly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${chartView === "weekly" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setChartView("monthly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${chartView === "monthly" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
              >
                Monthly
              </button>
            </div>
          </div>
          <p className="mb-6 text-xs text-muted-foreground leading-relaxed">
            These graphs show your <strong>average mood score</strong> per day. Unlogged days are gracefully connected.
          </p>
          <MoodChart data={chartView === "weekly" ? weeklyChartData : monthlyChartData} />
          </div>
        </div>

        {/* History */}
        <div className="mt-6 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 p-6 relative">
          <h2 className="font-display text-lg font-semibold mb-4">Today&apos;s Recent Entries</h2>
          {loadingEntries || identityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
          ) : todayEntries.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">No mood entries for today.</p>
              <p className="text-xs text-slate-400">Your journey starts with your first log today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...todayEntries].reverse().map((entry, i) => (
                <motion.div
                  key={entry.created_at}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 p-3 bg-white/50 hover:bg-white/80 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{moodEmojis[entry.mood]}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium capitalize">{entry.mood}</div>
                    {entry.note && <div className="text-xs text-muted-foreground">{entry.note}</div>}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{format(new Date(entry.created_at), "h:mm a")}</span>
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

