// SoulSync Volunteer Dashboard - Updated AI Features
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  UserCheck, 
  LayoutDashboard, 
  AlarmClock, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  Info,
  ChevronRight,
  FileText,
  Heart,
  Moon,
  Star,
  ShieldCheck,
  Trophy,
  Award,
  Zap,
  Medal,
  Users
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSessionReport } from "@/utils/chat.functions";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Tables } from "@/integrations/supabase/types";

type Volunteer = Tables<"volunteers">;
type Session = Tables<"session_bookings"> & {
  student_profiles: {
    anonymous_username: string;
    memory_context: string | null;
  } | null;
  time_slots: Tables<"time_slots"> | null;
};

interface CRMNote {
  id: string;
  content: string;
  created_at: string;
}

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

type Tab = "overview" | "sessions" | "slots" | "insight";

function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [timeSlots, setTimeSlots] = useState<Tables<"time_slots">[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [crmNotes, setCrmNotes] = useState<CRMNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Tables<"mood_entries">[]>([]);
  const [globalMoods, setGlobalMoods] = useState<Tables<"mood_entries">[]>([]);



  const fetchTimeSlots = useCallback(async (volunteerId: string) => {
    setSlotsLoading(true);
    try {
      const todayDateString = new Date().toISOString().split("T")[0];
      await supabase
        .from("time_slots")
        .delete()
        .eq("volunteer_id", volunteerId)
        .lt("slot_date", todayDateString);
      
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
        
      if (error) throw error;
      if (data) setTimeSlots(data);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      toast.error("Failed to load availability schedule.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async (volunteerId: string) => {
    try {
      let query = supabase
        .from("session_bookings")
        .select(`*, student_profiles(anonymous_username, memory_context), time_slots(*)`)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });
      
      // If NOT an admin, only see assigned sessions. 
      // Super Admins see the whole global queue.
      if (!volunteer?.is_admin) {
        query = query.eq("volunteer_id", volunteerId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase Error fetching sessions:", error);
        throw error;
      }
      
      if (data) {
        const enrichedData = await Promise.all(data.map(async (session) => {
          const slotId = session.time_slot_id;
          if (!session.time_slots && slotId) {
             const { data: slotData } = await supabase.from("time_slots").select("*").eq("id", slotId).single();
             return { ...session, time_slots: slotData } as Session;
          }
          return session as Session;
        }));
        setSessions(enrichedData);
      }
    } catch (err) {
      console.error("Error in fetchSessions:", err);
    }
  }, [volunteer?.is_admin]);

  const verifyAndFetchData = useCallback(async (userEmail: string) => {
    const { data, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (volError || !data) {
      await supabase.auth.signOut();
      setError("No volunteer profile found for this account.");
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    if (data.verification_status !== "verified" && !data.is_admin) {
      await supabase.auth.signOut();
      setError("Account pending admin verification. Access restricted.");
      setIsLoggedIn(false);
    } else {
      setVolunteer(data);
      setIsLoggedIn(true);
      fetchSessions(data.id);
      fetchTimeSlots(data.id);
    }
    setLoading(false);
  }, [fetchSessions, fetchTimeSlots]);

  const checkUser = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await verifyAndFetchData(session.user.email!);
    } else {
      setLoading(false);
    }
  }, [verifyAndFetchData]);



  const fetchNotes = useCallback(async (sessionId: string) => {
    try {
      setNotesLoading(true);
      const { data, error } = await supabase
        .from("session_bookings")
        .select("volunteer_notes")
        .eq("id", sessionId)
        .single();
      
      if (error) throw error;
      if (data && data.volunteer_notes) {
        setCrmNotes([{ id: "1", content: data.volunteer_notes, created_at: new Date().toISOString() }]);
      } else {
        setCrmNotes([]);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedSession || !volunteer) return;
    try {
      setNotesLoading(true);
      const { error } = await supabase
        .from("session_bookings")
        .update({ volunteer_notes: newNote })
        .eq("id", selectedSession.id);
        
      if (error) throw error;
      
      setNewNote("");
      await fetchNotes(selectedSession.id);
      toast.success("Note saved successfully.");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note.");
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchStudentMoodHistory = useCallback(async (aliasId: string) => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("alias_id", aliasId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      if (data) setMoodHistory(data);
    } catch (err) {
      console.error("Error fetching mood history:", err);
    }
  }, []);

  const fetchGlobalMoods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      if (data) setGlobalMoods(data);
    } catch (err) {
      console.error("Error fetching global moods:", err);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (volunteer && activeTab === "slots") {
      fetchTimeSlots(volunteer.id);
    }
  }, [activeTab, volunteer, fetchTimeSlots]);

  useEffect(() => {
    if (selectedSession) {
      fetchNotes(selectedSession.id);
      if (selectedSession.student_alias_id) {
        fetchStudentMoodHistory(selectedSession.student_alias_id);
      }
    }
  }, [selectedSession, fetchNotes, fetchStudentMoodHistory]);

  useEffect(() => {
    if (volunteer?.is_admin && activeTab === "insight") {
      fetchGlobalMoods();
    }
  }, [activeTab, volunteer, fetchGlobalMoods]);

  const handleAIGenerate = async () => {
    if (!selectedSession) return;
    setNotesLoading(true);
    try {
      const { report } = await generateSessionReport({
        data: {
          handoff: selectedSession.handoff_briefing,
          studentNote: selectedSession.notes,
          issueType: selectedSession.issue_type,
          volunteerDraft: newNote,
        }
      });
      setNewNote(report || newNote);
      toast.success("AI notes generated! Please review before saving.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteer) return;
    try {
      setSlotsLoading(true);
      const { error } = await supabase
        .from("time_slots")
        .insert({
          volunteer_id: volunteer.id,
          slot_date: slotDate,
          start_time: startTime,
          end_time: endTime,
        });
      if (error) throw error;
      toast.success("Time slot added!");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      await fetchTimeSlots(volunteer.id);
    } catch (err) {
      console.error("Error adding slot:", err);
      toast.error("Failed to add time slot.");
      setSlotsLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!volunteer) return;
    try {
      setSlotsLoading(true);
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .eq("id", slotId);
      if (error) throw error;
      toast.success("Time slot deleted!");
      await fetchTimeSlots(volunteer.id);
    } catch (err) {
      console.error("Error deleting slot:", err);
      toast.error("Failed to delete time slot.");
      setSlotsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/volunteer/dashboard'
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      if (user) await verifyAndFetchData(user.email!);
      
    } catch (err: any) {
      setError(err.message || "Invalid credentials or unverified account.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setVolunteer(null);
    setError("");
  };

  const sessionDurationMinutes = (start: string, end: string) => {
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    return (e.getTime() - s.getTime()) / 60000;
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const computeStatus = (date: string, start: string, end: string) => {
    const now = new Date();
    const sessionStart = new Date(`${date}T${start}`);
    const sessionEnd = new Date(`${date}T${end}`);
    
    if (now < sessionStart) return "upcoming";
    if (now > sessionEnd) return "completed";
    return "active";
  };

  const upcomingSessions = sessions.filter(s => {
    if (!s.time_slots?.slot_date || !s.time_slots?.start_time || !s.time_slots?.end_time) 
      return false;
    const status = computeStatus(
      s.time_slots.slot_date, 
      s.time_slots.start_time, 
      s.time_slots.end_time
    );
    return status === "upcoming" || status === "active";
  });

  const completedSessions = sessions.filter(s => {
    if (s.status === "completed") return true;
    if (!s.time_slots?.slot_date || !s.time_slots?.start_time || !s.time_slots?.end_time) return false;
    return computeStatus(
      s.time_slots.slot_date,
      s.time_slots.start_time,
      s.time_slots.end_time
    ) === "completed";
  });

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-primary/10">
        <Navbar />
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-calm/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
          <div className="mb-8 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <UserCheck className="h-7 w-7 text-slate-900" />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Volunteer Access
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Restricted to verified peer supporters
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl ring-1 ring-slate-200/50">
               <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-700 ring-1 ring-amber-100"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <p className="text-xs font-bold leading-tight">{error}</p>
                    </motion.div>
                  )}
               </AnimatePresence>

               {loading ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                   <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Verifying Clearance</p>
                 </div>
               ) : (
                  <>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email address</label>
                        <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                          placeholder="authorized@soulsync.org"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Security Key</label>
                          <button type="button" className="text-xs font-bold text-primary hover:underline">Request Reset</button>
                        </div>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]" 
                      >
                        Authorize & Enter
                      </Button>
                    </form>

                    <div className="relative my-8 flex items-center">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="mx-4 text-xs font-medium text-slate-400">or</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="h-11 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </div>
                    </Button>
                  </>
               )}
            </Card>
          </motion.div>

          <div className="mt-8 rounded-2xl border-amber-200 bg-amber-50/50 p-6 text-center">
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              <Shield className="h-4 w-4 mx-auto mb-2 text-amber-500" />
              Access is restricted to authorized peer supporters. If you wish to join, please contact your local coordinator.
            </p>
          </div>
          
          <footer className="mt-12 text-center">
             <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors">
              Return to platform
            </Link>
          </footer>
        </main>
      </div>
    );
  }

  const activeMinutes = sessions.filter(s => s.status === 'completed' || s.mood_after).reduce((acc, s) => acc + (s.time_slots ? sessionDurationMinutes(s.time_slots.start_time, s.time_slots.end_time) : 0), 0);

  return (
    <div className="min-h-screen pt-24 bg-slate-50 selection:bg-primary/10">
      <Navbar />
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-calm/20 blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-12">
        
        {/* Header Stats Console */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
              Welcome, {volunteer?.name.split(" ")[0]}
              {volunteer?.is_admin ? (
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">Super Admin</span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border border-emerald-100">Verified Peer</span>
              )}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-lg text-slate-500 font-medium">
                 {volunteer?.is_admin ? "Overseeing global operations and student safety protocols." : "Managing your anonymous student support journey."}
              </p>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
             <div className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-sm border border-white ring-1 ring-slate-200/50 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Hours</p>
               <p className="text-2xl font-black text-slate-900">{formatDuration(activeMinutes)}</p>
             </div>
             <div className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-sm border border-white ring-1 ring-slate-200/50 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Sessions</p>
               <p className="text-2xl font-black text-slate-900">{sessions.length}</p>
             </div>
             <div className="bg-slate-900 px-8 py-4 rounded-3xl shadow-xl text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Upcoming</p>
               <p className="text-2xl font-black text-white">{upcomingSessions.length}</p>
             </div>
          </div>
        </div>

        {/* Console Nav */}
        <div className="flex gap-2 mb-10 bg-white/40 backdrop-blur-3xl border border-white/40 ring-1 ring-white/20 rounded-[2.5rem] p-2 w-fit shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          {[
            { key: "overview" as Tab, label: "My Impact", icon: <Trophy className="h-4 w-4" /> },
            { key: "sessions" as Tab, label: "Response Queue", icon: <LayoutDashboard className="h-4 w-4" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Availability", icon: <AlarmClock className="h-4 w-4" /> },
            ...(volunteer?.is_admin ? [{ key: "insight" as Tab, label: "Global Insight", icon: <TrendingUp className="h-4 w-4" /> }] : []),
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[2rem] text-sm font-black transition-all duration-500 ${
                activeTab === t.key 
                ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-105" 
                : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
              }`}
            >
              {t.icon}
              <span className="tracking-tight">{t.label}</span>
              {t.badge ? (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white animate-pulse">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
           {activeTab === "overview" ? (
             <motion.div
               key="overview"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-10"
             >
               {/* Badge Ribbon */}
               <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white ring-1 ring-slate-200/50 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                       <Award className="h-6 w-6 text-primary" />
                       Your Achievement Badges
                     </h2>
                     <p className="text-sm font-medium text-slate-500 mt-1">Milestones earned through your support journey.</p>
                   </div>
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">?</div>
                      ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { id: 'listener', name: 'Empathetic Listener', desc: 'Completed 5 sessions', icon: <Heart className="h-6 w-6" />, color: 'from-rose-400 to-rose-600', earned: completedSessions.length >= 5 },
                     { id: 'night', name: 'Night Owl', desc: 'Late night support', icon: <Moon className="h-6 w-6" />, color: 'from-indigo-400 to-indigo-600', earned: sessions.some(s => s.time_slots && parseInt(s.time_slots.start_time.split(":")[0]) >= 20) },
                     { id: 'veteran', name: '10-Session Hero', desc: 'Reached 10 sessions', icon: <Star className="h-6 w-6" />, color: 'from-amber-400 to-amber-600', earned: completedSessions.length >= 10 },
                     { id: 'savior', name: 'Crisis Guard', desc: 'Handled high-risk', icon: <ShieldCheck className="h-6 w-6" />, color: 'from-emerald-400 to-emerald-600', earned: sessions.some(s => s.issue_type === 'Crisis' || s.issue_type === 'Emergency') },
                   ].map(badge => (
                     <motion.div 
                       key={badge.id} 
                       whileHover={badge.earned ? { y: -5, scale: 1.02 } : {}}
                       className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${badge.earned ? 'bg-white/80 border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50'}`}
                     >
                        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-5 transition-all ${badge.earned ? `bg-gradient-to-br ${badge.color} text-white shadow-xl shadow-slate-200` : 'bg-slate-200 text-slate-400'}`}>
                          {badge.earned ? badge.icon : <Lock className="h-6 w-6" />}
                        </div>
                        <h4 className={`font-black text-sm tracking-tight ${badge.earned ? 'text-slate-900' : 'text-slate-400'}`}>{badge.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           <div className={`h-1.5 w-1.5 rounded-full ${badge.earned ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{badge.desc}</p>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               </div>

               {/* Impact Analytics */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 p-10 rounded-[3rem] border-white/40 bg-slate-950 text-white relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                           <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">SoulSync Global Impact</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Listen-Time</p>
                           <p className="text-5xl font-black text-white tabular-nums">{formatDuration(activeMinutes)}</p>
                           <div className="flex items-center gap-2">
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                              <p className="text-xs text-emerald-400/80 font-bold">+12.4% Momentum</p>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Lives Touched</p>
                           <p className="text-5xl font-black text-white tabular-nums">{new Set(completedSessions.map(s => s.student_alias_id)).size}</p>
                           <div className="flex items-center gap-2">
                              <Heart className="h-3 w-3 text-rose-400" />
                              <p className="text-xs text-rose-400/80 font-bold">Spiritual Growth</p>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Reliability</p>
                           <p className="text-5xl font-black text-white tabular-nums">99.2%</p>
                           <div className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-primary" />
                              <p className="text-xs text-primary/80 font-bold">Top Tier Peer</p>
                           </div>
                        </div>
                      </div>

                      <div className="mt-16 p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/[0.07] transition-all">
                         <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                               <CheckCircle className="h-7 w-7" />
                            </div>
                            <div>
                               <p className="text-base font-black">Clinical Integrity Standard</p>
                               <p className="text-xs text-slate-400 font-medium">Your session reports exceed the platform's empathy threshold.</p>
                            </div>
                         </div>
                         <Button className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] px-8 h-12">View Metrics</Button>
                      </div>
                    </div>

                    {/* Advanced Decorative Background */}
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
                  </Card>

                  <div className="space-y-6">
                    <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm border border-white ring-1 ring-slate-200/50">
                      <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Community Praise
                      </h4>
                      <div className="space-y-6">
                         <div className="relative">
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                              "Thank you for just listening without judging. I feel much lighter tonight."
                            </p>
                            <p className="text-[10px] font-black text-indigo-500 mt-3 uppercase tracking-widest">— Anonymous Student</p>
                         </div>
                         <div className="h-px bg-slate-100" />
                         <div className="relative">
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                              "The breathing technique you showed me actually helped during my exam today!"
                            </p>
                            <p className="text-[10px] font-black text-indigo-500 mt-3 uppercase tracking-widest">— Anonymous Student</p>
                         </div>
                      </div>
                    </Card>

                    <Card className="p-8 rounded-[3rem] border-none bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl group cursor-pointer overflow-hidden relative">
                      <div className="relative z-10">
                        <Medal className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-black text-lg">Next Milestone</h4>
                        <p className="text-sm text-white/80 mt-1 mb-6">Support 5 more students to reach 'Mentor' status.</p>
                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                           <div className="bg-white h-full w-[60%]" />
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                    </Card>
                  </div>
               </div>
             </motion.div>
           ) : activeTab === "sessions" ? (
             <motion.div 
               key="sessions"
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: 10 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-8"
             >
               <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between mb-2">
                   <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
                     <MessageSquare className="h-5 w-5 text-primary" />
                     Incoming Student Sessions
                   </h2>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next 48 Hours</span>
                 </div>
                 
                 <div className="space-y-4">
                   {upcomingSessions.map(session => (
                     <Card 
                       key={session.id} 
                       onClick={() => setSelectedSession(session)}
                       className="p-6 rounded-[2.5rem] border-white bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group transition-all hover:shadow-md cursor-pointer"
                     >
                       <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                           <UserCheck className="h-7 w-7" />
                         </div>
                         <div>
                           <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-black text-slate-900">{session.student_profiles?.anonymous_username}</h4>
                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                             <div className="flex items-center gap-1.5">
                               <Calendar className="h-3 w-3" />
                                {session.time_slots?.slot_date && new Date(session.time_slots.slot_date).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-1.5">
                               <Clock className="h-3 w-3" />
                               {session.time_slots?.start_time} - {session.time_slots?.end_time}
                             </div>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Button variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }} className="flex-1 sm:flex-none rounded-xl h-11 border-slate-200 text-xs font-bold px-6">View Briefing</Button>
                          <Button onClick={(e) => { e.stopPropagation(); window.open(`https://meet.jit.si/SoulSync-Session-${session.id}`, "_blank"); }} className="flex-1 sm:flex-none rounded-xl h-11 bg-slate-900 text-white text-xs font-bold px-6 shadow-lg shadow-slate-200">Start Meet</Button>
                       </div>
                     </Card>
                   ))}
                   {upcomingSessions.length === 0 && (
                     <div className="text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <MessageSquare className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Queue Clear</h3>
                        <p className="text-sm text-slate-400 font-medium">New session requests will appear here when students book slots.</p>
                     </div>
                   )}
                 </div>

                 {/* History Section */}
                 <div className="pt-8">
                   <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 mb-6">
                     <TrendingUp className="h-5 w-5 text-emerald-500" />
                     History & Feedback
                   </h2>
                   <div className="space-y-3">
                     {completedSessions.map(session => (
                       <div 
                         key={session.id} 
                         onClick={() => setSelectedSession(session)}
                         className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-slate-100 hover:bg-white/60 transition-all cursor-pointer"
                       >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                               <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{session.student_profiles?.anonymous_username}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{session.time_slots?.slot_date && new Date(session.time_slots.slot_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-16 bg-emerald-500/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[100%]" />
                             </div>
                             <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Profile Sidebar */}
               <div className="space-y-6">
                  <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-200/50">
                    <div className="text-center mb-8">
                       <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                          <UserCheck className="h-10 w-10 text-primary" />
                       </div>
                       <h3 className="font-black text-xl text-slate-900">{volunteer?.name}</h3>
                       <p className="text-xs font-bold text-slate-400 tracking-tight mt-1">{volunteer?.expertise?.join(" · ")}</p>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-xs font-bold text-slate-500">Global Rank</span>
                          <span className="text-xs font-black text-primary uppercase tracking-widest">Top 5% Peer</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-xs font-bold text-slate-500">Trust Score</span>
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">98.4%</span>
                       </div>
                    </div>
                  </Card>

                  <Card className="p-8 rounded-[3rem] border-white bg-slate-900 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                       <Shield className="h-5 w-5 text-primary" />
                       <h4 className="font-black text-white">Governance Note</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 mb-6">
                      All sessions are recorded for security. Ensure student anonymity at all times. Use the HALT protocol if you encounter high-risk signals.
                    </p>
                    <Button className="w-full rounded-xl h-11 bg-white text-slate-900 text-xs font-bold hover:bg-slate-100">
                      View Operational Manual
                    </Button>
                  </Card>
               </div>
             </motion.div>
           ) : activeTab === "slots" ? (
             <motion.div 
               key="slots"
               initial={{ opacity: 0, x: 10 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -10 }}
             >
                <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-2xl shadow-sm ring-1 ring-slate-200/50">
                   <div className="flex items-center gap-4 mb-8">
                     <div className="h-14 w-14 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-primary/10">
                        <AlarmClock className="h-7 w-7 text-primary" />
                     </div>
                     <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Availability Console</h2>
                       <p className="text-sm font-medium text-slate-500">Manage your support hours</p>
                     </div>
                   </div>
                   
                   <form onSubmit={handleAddSlot} className="flex flex-col sm:flex-row gap-4 mb-8">
                      <input type="date" required value={slotDate} onChange={e=>setSlotDate(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      <input type="time" required value={startTime} onChange={e=>setStartTime(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      <input type="time" required value={endTime} onChange={e=>setEndTime(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      <Button type="submit" disabled={slotsLoading} className="rounded-xl h-11 bg-slate-900 text-white font-bold px-8">
                         {slotsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Slot"}
                      </Button>
                   </form>

                   {slotsLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>
                   ) : (
                      <div className="space-y-6">
                          {Object.entries(timeSlots.reduce((acc: Record<string, Tables<"time_slots">[]>, slot: Tables<"time_slots">) => {
                            if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
                            acc[slot.slot_date].push(slot);
                            return acc;
                          }, {})).map(([date, slots]: [string, Tables<"time_slots">[]]) => (
                           <div key={date}>
                              <h3 className="font-bold text-slate-900 mb-3">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                 {slots.map((slot: Tables<"time_slots">) => (
                                   <div key={slot.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                      <div className="flex items-center gap-2">
                                         <Clock className="h-4 w-4 text-slate-400" />
                                         <span className="text-sm font-bold text-slate-700">{slot.start_time} - {slot.end_time}</span>
                                      </div>
                                      <button onClick={() => handleDeleteSlot(slot.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                         <XCircle className="h-5 w-5" />
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ))}
                         {timeSlots.length === 0 && (
                           <p className="text-center text-sm text-slate-500 py-8">No availability slots configured.</p>
                         )}
                      </div>
                   )}
                </Card>
             </motion.div>
           ) : (
             <motion.div 
               key="insight"
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.98 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-8"
             >
                <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-2xl shadow-sm ring-1 ring-slate-200/50">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Global Mood Velocity
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={globalMoods.map((m) => ({ 
                        name: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                        value: ['struggling', 'low', 'okay', 'good', 'great'].indexOf(m.mood) + 1 
                      })).reverse()}>
                        <defs>
                          <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 6]} />
                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#colorGlobal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-2xl shadow-sm ring-1 ring-slate-200/50">
                   <h3 className="text-xl font-black mb-6">Recent Mood Pulse</h3>
                   <div className="space-y-4">
                      {globalMoods.slice(0, 6).map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${m.mood === 'distressed' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                              <span className="text-sm font-bold capitalize">{m.mood}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(m.created_at).toLocaleTimeString()}</span>
                        </div>
                      ))}
                   </div>
                </Card>
             </motion.div>
           )}
        </AnimatePresence>

      </main>

      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
               <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-xl text-slate-900">{selectedSession.student_profiles?.anonymous_username || "Student"}</h3>
                    <p className="text-sm font-bold text-slate-500">
                      {selectedSession.time_slots?.slot_date && new Date(selectedSession.time_slots.slot_date).toLocaleDateString()} • {selectedSession.time_slots?.start_time} - {selectedSession.time_slots?.end_time}
                    </p>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                     <XCircle className="h-6 w-6" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50">
                 {selectedSession.student_profiles?.memory_context && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
                      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Patient Historical Context</h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{selectedSession.student_profiles.memory_context}</p>
                      
                      {/* Mood Swing Chart */}
                      {moodHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-100">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">Mood Swing Analysis</h5>
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={moodHistory.map(m => ({ date: m.created_at, val: ['struggling', 'low', 'okay', 'good', 'great'].indexOf(m.mood) + 1 }))}>
                                <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                 {selectedSession.handoff_briefing && (
                   <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-sm">
                     <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> AI Handoff Briefing (Current Session)</h4>
                     <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedSession.handoff_briefing}</p>
                   </div>
                 )}
                 
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Volunteer Notes / CRM</h4>
                   <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-4 pr-2">
                     {notesLoading && crmNotes.length === 0 ? (
                       <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                     ) : crmNotes.length === 0 ? (
                       <p className="text-sm text-slate-400 italic">No notes for this session yet.</p>
                     ) : (
                       crmNotes.map(note => (
                         <div key={note.id} className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(note.created_at).toLocaleString()}</p>
                         </div>
                       ))
                     )}
                   </div>
                   
                   <div className="space-y-3 border-t border-slate-100 pt-4">
                     <textarea 
                       value={newNote}
                       onChange={e => setNewNote(e.target.value)}
                       placeholder="Add a private note about this session..."
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none"
                     />
                     <div className="flex gap-3">
                       <Button 
                         variant="outline"
                         onClick={handleAIGenerate}
                         disabled={notesLoading}
                         className="flex-1 rounded-xl border-primary/30 text-primary font-bold h-11"
                       >
                         {notesLoading ? (
                           <span className="flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin" />
                             Thinking...
                           </span>
                         ) : "✨ AI Suggest Notes"}
                       </Button>
                       <Button 
                         onClick={handleSaveNote}
                         disabled={notesLoading || !newNote.trim()}
                         className="flex-1 rounded-xl bg-slate-900 text-white font-bold h-11"
                       >
                         {notesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
