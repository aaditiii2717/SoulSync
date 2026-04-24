import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar, Clock, Shield, Brain, UserCheck,
  ExternalLink, Radio, CheckCircle2, Video,
  Plus, Trash2, LayoutDashboard, AlarmClock,
  ChevronDown, ChevronUp, Lock, FileText,
  History, Loader2, Sparkles, HeartPulse, Save,
  Star, MapPin, LogOut, SearchX, XCircle
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes, parseISO, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { generateSessionReport } from "@/utils/chat.functions";

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

// --- Types ---
type Tab = "sessions" | "slots";
type SessionStatus = "upcoming" | "live" | "completed";

type TimeSlot = Tables<"time_slots">;
type SessionRecord = Tables<"session_bookings">;
type VolunteerRecord = Tables<"volunteers">;
type MoodEntry = Tables<"mood_entries">;

type SessionWithSlot = SessionRecord & {
  time_slots: TimeSlot | null;
};

type SessionHistoryItem = Pick<
  SessionRecord,
  "id" | "created_at" | "issue_type" | "mood_before" | "mood_after" | "notes" | "status" | "volunteer_notes"
> & {
  time_slots: Pick<TimeSlot, "slot_date" | "start_time" | "end_time"> | null;
};

// --- Helpers ---
function toSessionDateTime(slotDate: string, startTime: string): Date {
  return parseISO(`${slotDate}T${startTime}`);
}

function sessionDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function computeStatus(slotDate: string, startTime: string, endTime: string): SessionStatus {
  const now = new Date();
  const start = toSessionDateTime(slotDate, startTime);
  const end = toSessionDateTime(slotDate, endTime);
  if (now >= end) return "completed";
  if (now >= start) return "live";
  return "upcoming";
}

function minutesUntilStart(slotDate: string, startTime: string): number {
  return differenceInMinutes(toSessionDateTime(slotDate, startTime), new Date());
}

function getMoodMeta(rawMood: string | null | undefined) {
  if (!rawMood) return null;
  const mood = rawMood.toLowerCase();
  const moodMap: Record<string, { label: string; color: string; emoji: string; hint: string; badgeClassName: string }> = {
    great: { label: "Great", color: "bg-safe/10 text-safe ring-safe/20", emoji: "✨", hint: "Vibrant and steady", badgeClassName: "border-safe/20 bg-safe/10 text-safe" },
    good: { label: "Good", color: "bg-primary/10 text-primary ring-primary/20", emoji: "😊", hint: "Coping well", badgeClassName: "border-primary/20 bg-primary/10 text-primary" },
    okay: { label: "Okay", color: "bg-calm/10 text-calm ring-calm/20", emoji: "😐", hint: "Stable for now", badgeClassName: "border-calm/20 bg-calm/10 text-calm" },
    low: { label: "Low", color: "bg-amber-50 text-amber-600 ring-amber-100", emoji: "😔", hint: "Reduced energy", badgeClassName: "border-amber-200 bg-amber-50 text-amber-700" },
    struggling: { label: "Struggling", color: "bg-red-50 text-red-600 ring-red-100", emoji: "🆘", hint: "Needs grounding", badgeClassName: "border-red-200 bg-red-50 text-red-600" },
    "1": { label: "1/5", color: "bg-red-50 text-red-600 ring-red-100", emoji: "🔴", hint: "Very intense", badgeClassName: "border-red-200 bg-red-50 text-red-600" },
    "5": { label: "5/5", color: "bg-safe/10 text-safe ring-safe/20", emoji: "🟢", hint: "Better now", badgeClassName: "border-safe/20 bg-safe/10 text-safe" },
  };
  return moodMap[mood] || { label: rawMood, color: "bg-slate-50 text-slate-500 ring-slate-100", emoji: "📝", hint: "Mood recorded", badgeClassName: "border-slate-200 bg-slate-100 text-slate-600" };
}

function MoodBadge({ value }: { value?: string | null }) {
  const meta = getMoodMeta(value);
  if (!meta) return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">
      Not recorded
    </span>
  );
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${meta.badgeClassName}`}>
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </div>
  );
}

function formatSessionStamp(session: { created_at: string; time_slots: { slot_date: string; start_time: string } | null }) {
  if (session.time_slots) {
    return format(toSessionDateTime(session.time_slots.slot_date, session.time_slots.start_time), "MMM d, yyyy • h:mm a");
  }
  return format(parseISO(session.created_at), "MMM d, yyyy • h:mm a");
}

const TODAY = new Date().toISOString().split("T")[0];

// --- Sub-Components ---
function CountdownBanner({ slotDate, startTime, sessionId }: { slotDate: string; startTime: string; sessionId: string }) {
  const [minsLeft, setMinsLeft] = useState(() => minutesUntilStart(slotDate, startTime));
  useEffect(() => {
    const tick = () => setMinsLeft(minutesUntilStart(slotDate, startTime));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [slotDate, startTime]);

  if (minsLeft > 5 || minsLeft < 0) return null;
  const roomId = sessionId ? `SoulSync-Session-${sessionId}` : "Awaiting Room ID";

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-amber-50 border-2 border-amber-300 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        Starts in {minsLeft <= 1 ? "less than 1 min" : `${minsLeft} mins`}
      </p>
      <p className="mt-1 text-sm font-bold text-amber-900">Room ID: <span className="font-mono">{roomId}</span></p>
      <a href={`https://meet.jit.si/${roomId}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-amber-700 underline">Open room link →</a>
    </motion.div>
  );
}

function SessionCard({ session, onOpenDetails, onCalendar }: { session: SessionWithSlot; onOpenDetails: (session: SessionWithSlot) => void; onCalendar: (session: SessionWithSlot) => void }) {
  const slot = session.time_slots;
  if (!slot) return null;

  const [status, setStatus] = useState(() => computeStatus(slot.slot_date, slot.start_time, slot.end_time));
  useEffect(() => {
    const id = setInterval(() => setStatus(computeStatus(slot.slot_date, slot.start_time, slot.end_time)), 30_000);
    return () => clearInterval(id);
  }, [slot]);

  const duration = sessionDurationMinutes(slot.start_time, slot.end_time);
  const sessionStart = toSessionDateTime(slot.slot_date, slot.start_time);
  const roomUrl = session.id ? `https://meet.jit.si/SoulSync-Session-${session.id}` : null;
  const isCompleted = status === "completed";
  const isLive = status === "live";

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}>
      <Card 
        onClick={() => onOpenDetails(session)}
        className={`group cursor-pointer p-6 border-none rounded-[2.5rem] transition-all ${isCompleted ? "bg-slate-50 shadow-none hover:shadow-md" : isLive ? "bg-white shadow-lg ring-2 ring-red-300" : "bg-white shadow-sm hover:shadow-xl hover:ring-2 hover:ring-primary/10"}`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 transition-colors ${isLive ? 'bg-red-50' : 'group-hover:bg-primary/10'}`}>
              <UserCheck className={`h-8 w-8 ${isLive ? 'text-red-500' : 'text-slate-300 group-hover:text-primary'} transition-colors`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-display text-xl font-black ${isCompleted ? "text-slate-400" : "text-slate-800"}`}>{session.anonymous_name || "Anonymous Member"}</h3>
                <div className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-red-500 text-white animate-pulse' : isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                  {status}
                </div>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                 {session.issue_type} • {format(sessionStart, "EEE, MMM d")} • {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              </p>
              {!isCompleted && <CountdownBanner slotDate={slot.slot_date} startTime={slot.start_time} sessionId={session.id} />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:shrink-0">
            {!isCompleted && (
              <Button 
                 variant="outline" 
                 size="sm" 
                 className="rounded-xl h-10 border-primary/20 text-primary hover:bg-primary/5 px-4"
                 onClick={(e) => { e.stopPropagation(); onCalendar(session); }}
              >
                 <Calendar className="mr-2 h-4 w-4" /> Calendar
              </Button>
            )}
            <Button 
              variant={isCompleted ? "outline" : "hero"} 
              className="rounded-xl h-10 shadow-lg px-6"
            >
              {isLive ? (
                <>
                  <Video className="mr-2 h-4 w-4" /> Join Now
                </>
              ) : isCompleted ? (
                <>
                  <Brain className="mr-2 h-4 w-4" /> Review Context
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" /> Prep & Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ManageSlots({ volunteerId }: { volunteerId: string }) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showPast, setShowPast] = useState(false);

  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("volunteer_id", volunteerId)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (!error && data) setSlots(data as TimeSlot[]);
    setSlotsLoading(false);
  }, [volunteerId]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!slotDate || !startTime || !endTime) return setFormError("All fields required.");
    
    const start = parseISO(`${slotDate}T${startTime}`);
    const end = parseISO(`${slotDate}T${endTime}`);
    if (end <= start) return setFormError("End must be after start.");
    if (isPast(start)) return setFormError("Can't add slots in the past.");
    
    setSaving(true);
    const { error } = await supabase.from("time_slots").insert({
      volunteer_id: volunteerId,
      slot_date: slotDate,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      is_booked: false,
    });

    if (error) {
      setFormError("Failed to save. Check for overlaps.");
    } else {
      toast.success("Slot added.");
      setSlotDate(""); setStartTime(""); setEndTime("");
      setShowForm(false);
      fetchSlots();
    }
    setSaving(false);
  };

  const handleDelete = async (slot: TimeSlot) => {
    if (slot.is_booked) return toast.error("Booked slots cannot be deleted.");
    setDeleting(slot.id);
    const { error } = await supabase.from("time_slots").delete().eq("id", slot.id);
    if (!error) {
      toast.success("Slot removed.");
      setSlots(s => s.filter(x => x.id !== slot.id));
    }
    setDeleting(null);
  };

  const futureSlots = slots.filter(s => isFuture(parseISO(`${s.slot_date}T${s.end_time}`)));
  const pastSlots = slots.filter(s => !isFuture(parseISO(`${s.slot_date}T${s.end_time}`)));

  const renderSlotRow = (slot: TimeSlot) => {
    const isInPast = !isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`));
    return (
      <motion.div key={slot.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: isInPast ? 0.6 : 1, x: 0 }} className={`flex items-center justify-between gap-3 px-6 py-5 rounded-[1.5rem] border ${isInPast ? "bg-slate-50 border-slate-100" : slot.is_booked ? "bg-primary/5 border-primary/20" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isInPast ? "bg-slate-200" : slot.is_booked ? "bg-primary/10" : "bg-safe/10"}`}>
            {isInPast ? <CheckCircle2 className="h-5 w-5 text-slate-400" /> : slot.is_booked ? <Lock className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-safe" />}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">{format(parseISO(slot.slot_date + "T00:00:00"), "EEE, MMM d, yyyy")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${slot.is_booked ? 'bg-primary/10 text-primary' : isInPast ? 'bg-slate-100 text-slate-400' : 'bg-safe/10 text-safe'}`}>
            {slot.is_booked ? 'Booked' : isInPast ? 'Past' : 'Available'}
          </span>
          {!slot.is_booked && !isInPast && (
            <Button variant="ghost" size="icon" onClick={() => handleDelete(slot)} disabled={!!deleting} className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black">
            <AlarmClock className="h-6 w-6 text-primary" /> Availability
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage your student support session calendar</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "hero"} className="rounded-2xl shadow-md">
          {showForm ? "Cancel" : "Add New Slot"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
             <Card className="p-8 rounded-[2.5rem] bg-primary/5 border-none shadow-inner">
                <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Date</label>
                     <input type="date" min={TODAY} value={slotDate} onChange={e=>setSlotDate(e.target.value)} className="w-full rounded-xl border-2 border-white/20 bg-white px-5 py-4 focus:border-primary/40 focus:outline-none transition-all shadow-sm" required />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Start Time</label>
                     <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full rounded-xl border-2 border-white/20 bg-white px-5 py-4 focus:border-primary/40 focus:outline-none transition-all shadow-sm" required />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">End Time</label>
                     <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full rounded-xl border-2 border-white/20 bg-white px-5 py-4 focus:border-primary/40 focus:outline-none transition-all shadow-sm" required />
                   </div>
                   {formError && <p className="text-xs text-red-500 font-bold md:col-span-3 px-2">{formError}</p>}
                   <Button type="submit" disabled={saving} className="md:col-span-3 rounded-2xl h-14 shadow-xl text-lg font-black" variant="hero">
                     Confirm Availability Slot
                   </Button>
                </form>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {futureSlots.length === 0 ? (
          <Card className="p-10 text-center text-slate-400 italic rounded-[2rem] bg-white shadow-sm border border-slate-100">No upcoming slots found. Add your availability to begin matches.</Card>
        ) : futureSlots.map(renderSlotRow)}
        
        {pastSlots.length > 0 && (
          <div className="pt-6">
            <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors mb-4 px-2 tracking-widest">
              {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Past Slots History ({pastSlots.length})
            </button>
            <AnimatePresence>
              {showPast && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-3 overflow-hidden">
                  {pastSlots.map(renderSlotRow)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
function VolunteerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [volunteer, setVolunteer] = useState<VolunteerRecord | null>(null);
  const [sessions, setSessions] = useState<SessionWithSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRejected, setIsRejected] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [selectedSession, setSelectedSession] = useState<SessionWithSlot | null>(null);
  const [studentMoodEntries, setStudentMoodEntries] = useState<MoodEntry[]>([]);
  const [studentSessionHistory, setStudentSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchSessions = useCallback(async (vId: string) => {
    setSessionsLoading(true);
    const { data: slotRows } = await supabase.from("time_slots").select("id").eq("volunteer_id", vId);
    const slotIds = slotRows?.map(s => s.id) || [];
    if (!slotIds.length) { setSessions([]); setSessionsLoading(false); return; }
    const { data, error: qError } = await supabase.from("session_bookings").select("*, time_slots(*)").in("time_slot_id", slotIds);
    if (!qError && data) {
      const sorted = (data as SessionWithSlot[]).sort((a, b) => {
        const dA = a.time_slots ? `${a.time_slots.slot_date}T${a.time_slots.start_time}` : a.created_at;
        const dB = b.time_slots ? `${b.time_slots.slot_date}T${b.time_slots.start_time}` : b.created_at;
        return dA.localeCompare(dB);
      });
      setSessions(sorted);
    }
    setSessionsLoading(false);
  }, []);

  const openSessionDetails = useCallback(async (session: SessionWithSlot) => {
    setSelectedSession(session);
    setNoteDraft(session.volunteer_notes ?? "");
    setStudentMoodEntries([]);
    setStudentSessionHistory([]);
    setContextError("");
    if (!session.student_alias_id) return;

    setContextLoading(true);
    const [moodRes, histRes] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("alias_id", session.student_alias_id).order("created_at", { ascending: false }).limit(5),
      supabase.from("session_bookings").select("id, created_at, issue_type, mood_before, mood_after, notes, status, volunteer_notes, time_slots(slot_date, start_time, end_time)").eq("student_alias_id", session.student_alias_id).neq("id", session.id).order("created_at", { ascending: false }).limit(6)
    ]);
    if (moodRes.data) setStudentMoodEntries(moodRes.data as MoodEntry[]);
    if (histRes.data) setStudentSessionHistory(histRes.data as SessionHistoryItem[]);
    if (moodRes.error || histRes.error) setContextError("Partial context loaded.");
    setContextLoading(false);
  }, []);

  const handleSaveNotes = async () => {
    if (!selectedSession) return;
    setNoteSaving(true);
    const text = noteDraft.trim() || null;
    const { error } = await supabase.from("session_bookings").update({ volunteer_notes: text }).eq("id", selectedSession.id);
    if (!error) {
      toast.success("Notes saved");
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, volunteer_notes: text } : s));
      setSelectedSession(prev => prev ? { ...prev, volunteer_notes: text } : null);
    } else { toast.error("Failed to save"); }
    setNoteSaving(false);
  };

  const handleGenAIReport = async () => {
    if (!selectedSession) return;
    setIsGeneratingReport(true);
    try {
      const { report } = await generateSessionReport({
        data: {
          handoff: selectedSession.handoff_briefing,
          studentNote: selectedSession.notes,
          issueType: selectedSession.issue_type,
          volunteerDraft: noteDraft
        }
      });
      if (report) setNoteDraft(report);
    } catch (e) {
      toast.error("Failed to generate AI report");
    }
    setIsGeneratingReport(false);
  };

  useEffect(() => {
    let mounted = true;
    
    async function checkUser(userEmail: string) {
      if (!mounted) return;
      
      const { data: vol, error: volErr } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", userEmail)
        .single();
        
      if (!vol) {
        // Not found, redirect to registration
        await supabase.auth.signOut();
        window.location.href = "/volunteer/?error=not_found";
        return;
      }
      
      if (vol.verification_status === "rejected") {
        setIsRejected(true);
        setLoading(false);
        return;
      }
      
      setVolunteer(vol);
      setIsLoggedIn(true);
      fetchSessions(vol.id);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        checkUser(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        checkUser(session.user.email);
      } else {
        setIsLoggedIn(false);
        setVolunteer(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSessions]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getCalendarUrl = (session: SessionWithSlot) => {
    const slot = session.time_slots;
    if (!slot) return "#";
    const start = slot.slot_date.replace(/-/g, "") + "T" + slot.start_time.replace(/:/g, "");
    const end = slot.slot_date.replace(/-/g, "") + "T" + slot.end_time.replace(/:/g, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `SoulSync Support: ${session.anonymous_name || 'Student'}`,
      dates: `${start}/${end}`,
      details: `Join Link: https://meet.jit.si/SoulSync-Session-${session.id}\n\nIssue: ${session.issue_type}\nStudent Note: ${session.notes || 'No note'}`,
      location: "SoulSync Peer Cloud",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const upcomingSessions = sessions.filter(s => {
    if (!s.time_slots) return false;
    const st = computeStatus(s.time_slots.slot_date, s.time_slots.start_time, s.time_slots.end_time);
    return st === "upcoming" || st === "live";
  });

  const completedSessions = sessions.filter(s => {
    if (!s.time_slots) return false;
    return computeStatus(s.time_slots.slot_date, s.time_slots.start_time, s.time_slots.end_time) === "completed";
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <Navbar />
        <main className="mx-auto max-w-lg px-4">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <Card className="rounded-[3.5rem] border-none p-12 shadow-2xl bg-white ring-1 ring-slate-100 flex flex-col justify-center min-h-[400px]">
               <div className="mb-10 text-center">
                 <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary shadow-inner">
                    <UserCheck className="h-12 w-12" />
                 </div>
                 <h1 className="font-display text-4xl font-black text-slate-800">Volunteer Hub</h1>
                 <p className="mt-4 text-slate-500 font-medium italic">Authenticate securely with Google to access the SoulSync peer operations dashboard.</p>
               </div>
               
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-8">
                   <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Checking secure session...</p>
                 </div>
               ) : isRejected ? (
                 <div className="flex flex-col items-center justify-center py-4 space-y-4">
                   <XCircle className="h-12 w-12 text-red-500 mb-2" />
                   <h2 className="text-xl font-bold text-slate-800">Application Rejected</h2>
                   <p className="text-sm text-slate-500 text-center">We're sorry, but your application to join the SoulSync volunteer hub was not approved by our governance team at this time.</p>
                   <Button variant="outline" className="w-full h-12 rounded-2xl shadow-sm mt-4" onClick={handleLogout}>
                     Return to Home
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {error && <p className="text-xs font-black text-red-500 px-4 mt-2 text-center">Error: {error}</p>}
                   <Button 
                     onClick={handleGoogleLogin}
                     className="w-full h-16 rounded-2xl shadow-xl mt-2 text-lg font-black bg-white text-slate-800 border-2 border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-3" 
                   >
                     <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                     </svg>
                     Continue with Google
                   </Button>
                 </div>
               )}
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  if (volunteer?.verification_status !== "verified" && !volunteer?.is_admin) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <Navbar />
        <main className="mx-auto max-w-xl px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-[3rem] p-12 text-center shadow-2xl bg-white ring-1 ring-slate-100">
              <div className="flex h-24 w-24 mx-auto justify-center items-center bg-amber-50 rounded-[2.5rem] mb-8 shadow-inner">
                 <Shield className="h-12 w-12 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-display font-black text-slate-800">Verification Pending</h2>
              <p className="mt-6 text-slate-500 leading-relaxed font-medium">
                Thank you, <span className="font-black text-slate-800">{volunteer?.name}</span>. Our Governance team is currently verifying your CV and credentials for the 2026 Google Response hub. You will gain full access shortly.
              </p>
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-400">
                SoulSync ensures 100% student safety via mandatory volunteer vetting.
              </div>
              <Button variant="outline" className="mt-8 rounded-xl px-8" onClick={handleLogout}>
                 Sign Out
              </Button>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const activeMinutes = sessions.filter(s => s.status === 'completed' || s.mood_after).reduce((acc, s) => acc + (s.time_slots ? sessionDurationMinutes(s.time_slots.start_time, s.time_slots.end_time) : 0), 0);

  return (
    <div className="min-h-screen pt-24 bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-12">
        
        {/* Header Stats Console */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black flex items-center gap-4 text-slate-800">
              Welcome, {volunteer?.name.split(" ")[0]}
              {volunteer?.is_admin ? (
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">Super Admin</span>
              ) : (
                <span className="rounded-full bg-safe/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-safe border border-safe/20">Verified Peer</span>
              )}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-lg text-slate-500 font-medium">
                 {volunteer?.is_admin ? "Overseeing global operations and student safety protocols." : "Managing your anonymous student support journey."}
              </p>
              <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-lg h-8 px-3 text-xs flex items-center gap-2 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
             <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Hours</p>
               <p className="text-2xl font-black text-slate-800">{formatDuration(activeMinutes)}</p>
             </div>
             <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Sessions</p>
               <p className="text-2xl font-black text-slate-800">{sessions.length}</p>
             </div>
             <div className="bg-slate-900 px-8 py-4 rounded-3xl shadow-xl text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Upcoming</p>
               <p className="text-2xl font-black text-white">{upcomingSessions.length}</p>
             </div>
          </div>
        </div>

        {/* Console Nav */}
        <div className="flex gap-2 mb-10 bg-white border border-slate-100 rounded-[2rem] p-2 w-fit shadow-lg ring-1 ring-slate-100/10">
          {[
            { key: "sessions" as Tab, label: "Response Queue", icon: <LayoutDashboard className="h-4 w-4" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Platform Availability", icon: <AlarmClock className="h-4 w-4" /> },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)} 
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${activeTab === t.key ? "bg-slate-900 text-white shadow-2xl" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
            >
              {t.icon}{t.label}
              {t.badge ? <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>{t.badge}</span> : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "sessions" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
              <div className="space-y-12">
                <section>
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-display font-black flex items-center gap-3 text-slate-800">
                      <Calendar className="h-6 w-6 text-primary" /> Active Response Hub
                    </h2>
                  </div>
                  {sessionsLoading ? (
                    <div className="grid gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm" />
                      ))}
                    </div>
                  ) : upcomingSessions.length === 0 ? (
                    <Card className="p-16 text-center text-slate-400 font-medium italic rounded-[3rem] bg-white shadow-inner border border-dashed border-slate-200">
                      Response queue is healthy and empty. Matches will appear here.
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.map(s => (
                        <SessionCard 
                          key={s.id} 
                          session={s} 
                          onOpenDetails={openSessionDetails} 
                          onCalendar={(s) => window.open(getCalendarUrl(s), "_blank")} 
                        />
                      ))}
                    </div>
                  )}
                </section>

                {completedSessions.length > 0 && (
                  <section>
                    <h2 className="text-xl font-display font-black flex items-center gap-3 mb-6 px-2 text-slate-400">
                      <CheckCircle2 className="h-6 w-6" /> Completed History
                    </h2>
                    <div className="space-y-4">
                      {completedSessions.map(s => (
                        <SessionCard 
                          key={s.id} 
                          session={s} 
                          onOpenDetails={openSessionDetails} 
                          onCalendar={() => {}} 
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="space-y-8">
                <Card className="p-10 bg-slate-900 rounded-[3rem] border-none shadow-2xl text-white overflow-hidden relative">
                  <div className="relative z-10">
                    <h3 className="font-display text-2xl font-black flex items-center gap-3 mb-6">
                      <Shield className="h-6 w-6 text-primary" /> Peer Protocol
                    </h3>
                    <ul className="space-y-5 text-sm text-white/70 font-medium">
                      {[
                        "Maintain zero-trace student identity.",
                        "Absolute anonymity is the soul of SoulSync.",
                        "Escalate urgent safety triggers to admin.",
                        "Review AI briefings before start.",
                        "Empower through shared experience."
                      ].map((tip, idx) => (
                        <li key={idx} className="flex gap-4">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Sparkles className="absolute -right-10 -bottom-10 h-64 w-64 text-white/[0.03]" />
                </Card>

                <Card className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl group hover:shadow-2xl transition-all">
                  <h3 className="font-display text-2xl font-black flex items-center gap-3 mb-5 text-slate-800 transition-colors">
                    <Brain className="h-6 w-6 text-primary" /> Intelligent Hub
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    SoulSync AI (Gemini) monitors student check-ins to synthesize an <strong>Intelligent Briefing</strong> 5 minutes before your call. This ensures students don't repeat trauma and you walk in informed.
                  </p>
                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                       <MapPin className="h-3 w-3" /> Digital Response: India
                    </div>
                  </div>
                </Card>
              </aside>
            </motion.div>
          )}
          {activeTab === "slots" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ManageSlots volunteerId={volunteer!.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Context Review & AI Reporter Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }} 
              className="w-full max-w-6xl bg-white rounded-[4rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
            >
              <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-black text-slate-800">Student Response Context</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Match: {selectedSession.anonymous_name || 'Anonymous'}</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-full h-14 w-14 hover:bg-slate-100 transition-colors" onClick={() => setSelectedSession(null)}>
                  <XIcon className="h-7 w-7 text-slate-300" />
                </Button>
              </div>

              <div className="overflow-y-auto p-12 space-y-12 flex-1 scroll-smooth">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
                   <div className="space-y-10">
                      {/* AI Briefing Segment */}
                      <div className="p-10 bg-slate-900 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                           <Sparkles className="h-4 w-4" /> AI Handoff Synthesis
                        </p>
                        <p className="text-white/90 leading-relaxed font-semibold text-xl">
                          {selectedSession.handoff_briefing || "Our AI is currently synthesizing the student's emotional journey... Your briefing will appear here as soon as matched."}
                        </p>
                        <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 text-white/[0.03]" />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Booking Request Note</p>
                          <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{selectedSession.notes || "Member chose not to leave a specific note."}"</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Major Issue Profile</p>
                          <p className="text-2xl font-black text-slate-800">{selectedSession.issue_type}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <h4 className="font-display font-black text-2xl flex items-center gap-3 text-slate-800">
                            <FileText className="h-6 w-6 text-primary" /> Response Continuity
                          </h4>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={handleGenAIReport} 
                              disabled={isGeneratingReport || !noteDraft}
                              className="rounded-xl h-10 border-slate-100 shadow-sm"
                            >
                              {isGeneratingReport ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Refine with AI
                            </Button>
                            <Button variant="hero" onClick={handleSaveNotes} disabled={noteSaving} className="rounded-xl h-10 shadow-lg px-6">
                              {noteSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                              Save Notes
                            </Button>
                          </div>
                        </div>
                        <Textarea 
                          value={noteDraft} 
                          onChange={e => setNoteDraft(e.target.value)} 
                          placeholder="What should the next peer know? Describe triggers, effective grounding techniques, or student preferences..." 
                          className="min-h-[250px] rounded-[2rem] bg-white border-2 border-slate-100 px-8 py-6 text-lg focus:border-primary/30 outline-none transition-all shadow-inner resize-none font-medium text-slate-600"
                        />
                      </div>
                   </div>

                   <aside className="space-y-10">
                      <Card className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] shadow-sm">
                        <h4 className="font-black text-xl mb-8 flex items-center gap-3 text-slate-800">
                          <HeartPulse className="h-6 w-6 text-primary" /> Mood Diagnostic
                        </h4>
                        {contextLoading ? (
                          <div className="flex items-center gap-4 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-bold text-xs uppercase tracking-widest">Accessing student timeline...</span>
                          </div>
                        ) : studentMoodEntries.length === 0 ? (
                          <div className="text-center py-10 opacity-40">
                             <Activity className="h-12 w-12 mx-auto mb-4" />
                             <p className="text-xs font-bold uppercase tracking-widest">No entries found.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {studentMoodEntries.map(e => (
                              <div key={e.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-3">
                                  <MoodBadge value={e.mood} />
                                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{format(parseISO(e.created_at), "MMM d, h:mm a")}</p>
                                </div>
                                {e.note && <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{e.note}"</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      <Card className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl">
                        <h4 className="font-black text-xl mb-8 flex items-center gap-3 text-slate-800">
                          <History className="h-6 w-6 text-primary" /> Experience History
                        </h4>
                        {contextLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : studentSessionHistory.length === 0 ? (
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">First-time hub visitor.</p>
                        ) : (
                          <div className="space-y-4">
                            {studentSessionHistory.map(h => (
                              <div key={h.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-50 group hover:bg-slate-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{h.issue_type}</p>
                                  <MoodBadge value={h.mood_after} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formatSessionStamp(h)}</p>
                                {h.volunteer_notes && <p className="mt-3 text-[10px] font-bold text-slate-400 italic line-clamp-2">"Prior Peer: {h.volunteer_notes}"</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                   </aside>
                </div>
              </div>

              <div className="p-10 border-t bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-safe/10 rounded-full">
                      <Star className="h-4 w-4 text-safe" />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Maintain Zero-Trace Privacy. Professional Response Standard.</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" className="rounded-2xl px-8 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setSelectedSession(null)}>
                    Exit Command
                  </Button>
                  <Button variant="hero" className="rounded-2xl px-12 h-14 text-lg shadow-2xl font-black" onClick={() => setSelectedSession(null)}>
                    Finished Prep
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}
