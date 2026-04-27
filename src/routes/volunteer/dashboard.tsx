// SoulSync Volunteer Dashboard - White Theme Optimized
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { VolunteerNavbar } from "@/components/volunteer/VolunteerNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSessionReport } from "@/utils/chat.functions";
import { Tables } from "@/integrations/supabase/types";
import { VolunteerStats } from "@/components/volunteer/VolunteerStats";
import { BadgeRibbon } from "@/components/volunteer/BadgeRibbon";
import { VolunteerImpactMetrics } from "@/components/volunteer/VolunteerImpactMetrics";
import { SessionQueue } from "@/components/volunteer/SessionQueue";
import { AvailabilityManager } from "@/components/volunteer/AvailabilityManager";
import { SessionWorkspace } from "@/components/volunteer/SessionWorkspace";
import { Trophy, LayoutDashboard, AlarmClock, ShieldCheck } from "lucide-react";
import { z } from "zod";

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

const dashboardSearchSchema = z.object({
  tab: z.enum(["overview", "sessions", "slots"]).optional().default("overview"),
});

export const Route = createFileRoute("/volunteer/dashboard")({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: VolunteerDashboard,
});

type Tab = "overview" | "sessions" | "slots";

function VolunteerDashboard() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  
  const activeTab = tab;
  const setActiveTab = (newTab: Tab) => {
    navigate({
      search: (prev) => ({ ...prev, tab: newTab }),
    });
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");

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
      
      query = query.eq("volunteer_id", volunteerId);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
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
  }, []);

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

    if (data.verification_status !== "verified") {
      await supabase.auth.signOut();
      setError("Account pending verification. Access restricted to verified volunteers.");
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
        setNewNote(data.volunteer_notes);
      } else {
        setCrmNotes([]);
        setNewNote("");
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
    } finally {
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
    } finally {
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
      <div className="relative min-h-screen overflow-hidden bg-white selection:bg-primary/10">
        <VolunteerNavbar />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
          <div className="mb-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
               <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Volunteer Access</h1>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Verified Supporters Only</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-100">
               {error && <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
               {loading ? (
                 <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-slate-400">Verifying Identity...</div>
               ) : (
                  <>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@college.edu" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary transition-colors" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary transition-colors" required />
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/10">Authorize & Enter</Button>
                    </form>
                    <div className="my-8 border-t border-slate-100 relative text-center">
                      <span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 absolute -top-2 left-1/2 -translate-x-1/2">secure gate</span>
                    </div>
                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-xl border-slate-200 font-bold hover:bg-slate-50">Continue with Google</Button>
                  </>
               )}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const activeMinutes = sessions.filter(s => s.status === 'completed' || s.mood_after).reduce((acc, s) => acc + (s.time_slots ? sessionDurationMinutes(s.time_slots.start_time, s.time_slots.end_time) : 0), 0);

  return (
    <div className="min-h-screen pt-24 bg-white selection:bg-primary/10">
      <VolunteerNavbar />
      
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-12">
        <VolunteerStats 
          volunteerName={volunteer?.name || ""}
          activeMinutes={activeMinutes}
          totalSessions={sessions.length}
          upcomingSessionsCount={upcomingSessions.length}
          onLogout={handleLogout}
          formatDuration={formatDuration}
        />

        <div className="flex gap-2 mb-12 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: "overview" as Tab, label: "My Impact", icon: <Trophy className="h-4 w-4" /> },
            { key: "sessions" as Tab, label: "Response Queue", icon: <LayoutDashboard className="h-4 w-4" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Availability", icon: <AlarmClock className="h-4 w-4" /> },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === t.key 
                ? "bg-primary text-white shadow-lg" 
                : "text-slate-500 hover:bg-white"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge ? <span className="ml-2 bg-white text-primary text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === "overview" ? (
             <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
               <BadgeRibbon 
                 completedSessionsCount={completedSessions.length}
                 hasNightSession={sessions.some(s => s.time_slots && parseInt(s.time_slots.start_time.split(":")[0]) >= 20)}
                 hasCrisisSession={sessions.some(s => s.issue_type === 'Crisis' || s.issue_type === 'Emergency')}
               />
               <VolunteerImpactMetrics 
                 activeMinutes={activeMinutes}
                 uniqueStudentsCount={new Set(completedSessions.map(s => s.student_alias_id)).size}
                 formatDuration={formatDuration}
               />
             </motion.div>
           ) : activeTab === "sessions" ? (
             <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <SessionQueue 
                 sessions={upcomingSessions}
                 onSelectSession={setSelectedSession}
                 computeStatus={computeStatus}
               />
             </motion.div>
           ) : (
             <motion.div key="slots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <AvailabilityManager 
                 timeSlots={timeSlots}
                 slotDate={slotDate}
                 setSlotDate={setSlotDate}
                 startTime={startTime}
                 setStartTime={setStartTime}
                 endTime={endTime}
                 setEndTime={setEndTime}
                 slotsLoading={slotsLoading}
                 onAddSlot={handleAddSlot}
                 onDeleteSlot={handleDeleteSlot}
               />
             </motion.div>
           )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSession && (
            <SessionWorkspace 
              selectedSession={selectedSession}
              onClose={() => setSelectedSession(null)}
              crmNotes={crmNotes}
              newNote={newNote}
              setNewNote={setNewNote}
              notesLoading={notesLoading}
              onSaveNote={handleSaveNote}
              onAIGenerate={handleAIGenerate}
              moodHistory={moodHistory}
            />
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default VolunteerDashboard;
