// SoulSync Mood Journal - Detailed Tracking & Insights
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodChart, moodValues, type ChartDataPoint, type MoodType } from "@/components/MoodChart";
import { MoodSelector } from "@/components/MoodSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  Filter, 
  Clock, 
  ChevronRight,
  Loader2,
  Trash2,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/mood-tracker")({
  component: MoodTrackerPage,
});

function MoodTrackerPage() {
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [entries, setEntries] = useState<Tables<"mood_entries">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New entry state
  const [newMood, setNewMood] = useState<MoodType | undefined>();
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!aliasId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("alias_id", aliasId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  }, [aliasId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = async () => {
    if (!newMood || !aliasId) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("mood_entries")
      .insert({
        alias_id: aliasId,
        mood: newMood,
        note: newNote.trim() || null
      });

    if (error) {
      toast.error("Failed to save entry.");
    } else {
      toast.success("Mood entry saved! ✨");
      setNewMood(undefined);
      setNewNote("");
      setIsAdding(false);
      fetchEntries();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete entry.");
    } else {
      toast.success("Entry deleted.");
      fetchEntries();
    }
  };

  const chartData = useMemo((): ChartDataPoint[] => {
    return [...entries]
      .reverse()
      .slice(-14) // Show last 14 entries
      .map(entry => ({
        date: format(new Date(entry.created_at), "MMM d"),
        value: moodValues[entry.mood as MoodType],
        moodLabel: entry.mood as MoodType,
        isAverage: false
      }));
  }, [entries]);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = { great: 0, good: 0, okay: 0, low: 0, struggling: 0 };
    entries.forEach(e => {
      if (counts[e.mood] !== undefined) counts[e.mood]++;
    });
    return counts;
  }, [entries]);

  const averageMoodValue = useMemo(() => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + moodValues[curr.mood as MoodType], 0);
    return sum / entries.length;
  }, [entries]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'text-emerald-500 bg-emerald-50';
      case 'good': return 'text-primary bg-primary/10';
      case 'okay': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-rose-400 bg-rose-50';
      case 'struggling': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-slate-50/50">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Mood <span className="text-gradient">Journal</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium max-w-md">
              Reflect on your emotional patterns and discover the factors that influence your wellbeing.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="rounded-full h-14 px-8 font-black gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isAdding ? <Plus className="h-5 w-5 rotate-45 transition-transform" /> : <Plus className="h-5 w-5" />}
              {isAdding ? "Cancel Entry" : "Add New Entry"}
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <Card className="p-8 rounded-[3rem] border-white bg-white shadow-2xl shadow-primary/5 ring-1 ring-slate-200/50">
                <h3 className="text-xl font-black text-slate-800 mb-8 text-center">How are you feeling right now?</h3>
                
                <div className="max-w-2xl mx-auto space-y-10">
                  <MoodSelector selected={newMood} onSelect={setNewMood} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                      <MessageSquare className="h-4 w-4" />
                      Add a Reflection (Optional)
                    </div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="What's contributing to your mood today? Any specific events or thoughts?"
                      className="w-full rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 p-6 text-sm font-medium focus:outline-none focus:border-primary/30 min-h-[120px] resize-none transition-all"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleAddEntry}
                      disabled={!newMood || isSubmitting}
                      className="h-14 rounded-full px-12 font-black gap-3 text-lg"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                      Save to Journal
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats & Trends Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-6 rounded-[2.5rem] border-white bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Insights
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average Mood</p>
                    <p className="text-xl font-black text-slate-800">
                      {averageMoodValue >= 80 ? "Radiant" : averageMoodValue >= 60 ? "Steady" : averageMoodValue >= 40 ? "Balanced" : "Challenging"}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black ${averageMoodValue >= 60 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {Math.round(averageMoodValue)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distribution</p>
                  {Object.entries(moodCounts).map(([mood, count]) => (
                    <div key={mood} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-slate-500">{mood}</span>
                        <span className="text-slate-900">{count} entries</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: entries.length > 0 ? `${(count / entries.length) * 100}%` : 0 }}
                          className={`h-full ${getMoodColor(mood).split(' ')[0].replace('text', 'bg')}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-[2.5rem] border-white bg-slate-900 shadow-xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-32 w-32 text-white" />
               </div>
               <div className="relative z-10">
                 <h3 className="font-black text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trend Analysis
                 </h3>
                 <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    We've noticed you tend to feel more "Struggling" on Mondays. Consider scheduling a peer session on Sunday evenings.
                 </p>
                 <Button variant="outline" className="w-full rounded-xl border-slate-700 text-white hover:bg-slate-800 h-10 text-xs font-bold">
                    View Full Analysis
                 </Button>
               </div>
            </Card>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 rounded-[3rem] border-white bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Journey
                </h3>
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Filter className="h-4 w-4 text-slate-400" /></Button>
                </div>
              </div>

              <div className="h-[250px] w-full mb-12">
                 {isLoading || identityLoading ? (
                   <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
                 ) : entries.length > 0 ? (
                   <MoodChart data={chartData} />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-bold">No data points yet</p>
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">History</h4>
                 {isLoading || identityLoading ? (
                   <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-20 w-full bg-slate-50 animate-pulse rounded-2xl" />)}
                   </div>
                 ) : entries.length > 0 ? (
                    <div className="space-y-3">
                       {entries.map((entry) => (
                         <motion.div 
                           key={entry.id}
                           layout
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="group relative flex items-start gap-4 p-5 rounded-3xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                         >
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getMoodColor(entry.mood)}`}>
                               <span className="text-xl">
                                  {entry.mood === 'great' ? '🌟' : entry.mood === 'good' ? '😊' : entry.mood === 'okay' ? '😐' : entry.mood === 'low' ? '😔' : '😫'}
                               </span>
                            </div>
                            <div className="flex-1 pt-1">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-black text-slate-800 capitalize">{entry.mood}</span>
                                  <div className="flex items-center gap-3">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(entry.created_at), "MMM d, p")}
                                     </span>
                                     <button 
                                       onClick={() => handleDeleteEntry(entry.id)}
                                       className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                     >
                                        <Trash2 className="h-4 w-4" />
                                     </button>
                                  </div>
                               </div>
                               {entry.note && (
                                 <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2 bg-white/50 p-3 rounded-xl border border-slate-50 italic">
                                   "{entry.note}"
                                 </p>
                               )}
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 ) : (
                   <div className="text-center py-12 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <p className="text-sm font-bold text-slate-400 italic">Your emotional map will appear here.</p>
                   </div>
                 )}
              </div>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MoodTrackerPage;
