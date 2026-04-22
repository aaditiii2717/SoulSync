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
  History, Loader2, Sparkles, HeartPulse, Save
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes, parseISO, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

// ─── types ───────────────────────────────────────────────────────────────────

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

// ─── helpers ─────────────────────────────────────────────────────────────────

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

function computeStatus(
  slotDate: string,
  startTime: string,
  endTime: string
): SessionStatus {
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

function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getMoodMeta(rawMood: string | null | undefined) {
  if (!rawMood) return null;

  const mood = rawMood.toLowerCase();
  const moodMap: Record<string, { label: string; badgeClassName: string; hint: string }> = {
    great: { label: "Great", badgeClassName: "border-safe/20 bg-safe/10 text-safe", hint: "Feeling steady and uplifted" },
    good: { label: "Good", badgeClassName: "border-primary/20 bg-primary/10 text-primary", hint: "Coping well overall" },
    okay: { label: "Okay", badgeClassName: "border-calm/20 bg-calm/10 text-calm", hint: "Holding steady for now" },
    low: { label: "Low", badgeClassName: "border-amber-200 bg-amber-50 text-amber-700", hint: "Energy or mood feels reduced" },
    struggling: { label: "Struggling", badgeClassName: "border-red-200 bg-red-50 text-red-600", hint: "Needs extra support" },
    "1": { label: "1 / 5", badgeClassName: "border-red-200 bg-red-50 text-red-600", hint: "Very low after session" },
    "2": { label: "2 / 5", badgeClassName: "border-orange-200 bg-orange-50 text-orange-700", hint: "Still feeling low" },
    "3": { label: "3 / 5", badgeClassName: "border-slate-200 bg-slate-100 text-slate-600", hint: "Neutral after session" },
    "4": { label: "4 / 5", badgeClassName: "border-primary/20 bg-primary/10 text-primary", hint: "Feeling better" },
    "5": { label: "5 / 5", badgeClassName: "border-safe/20 bg-safe/10 text-safe", hint: "Feeling much better" },
  };

  return (
    moodMap[mood] ?? {
      label: capitalizeWords(rawMood),
      badgeClassName: "border-slate-200 bg-slate-100 text-slate-600",
      hint: "Recorded mood",
    }
  );
}

function MoodBadge({ value }: { value: string | null | undefined }) {
  const meta = getMoodMeta(value);
  if (!meta) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">
        Not recorded
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${meta.badgeClassName}`}>
      {meta.label}
    </span>
  );
}

function formatSessionStamp(session: { created_at: string; time_slots: { slot_date: string; start_time: string } | null }) {
  if (session.time_slots) {
    return format(toSessionDateTime(session.time_slots.slot_date, session.time_slots.start_time), "MMM d, yyyy • h:mm a");
  }
  return format(parseISO(session.created_at), "MMM d, yyyy • h:mm a");
}

const TODAY = new Date().toISOString().split("T")[0];

// ─── Sub-Components ──────────────────────────────────────────────────────────

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

function SessionCard({ session, onOpenDetails }: { session: SessionWithSlot; onOpenDetails: (session: SessionWithSlot) => void }) {
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

  const statusBadge = {
    upcoming: <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">Upcoming</span>,
    live: <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1"><Radio className="h-3 w-3 animate-pulse" /> Live</span>,
    completed: <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>,
  }[status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}>
      <Card className={`p-6 border-none rounded-3xl transition-all ${isCompleted ? "bg-slate-50 shadow-none" : isLive ? "bg-white shadow-lg ring-2 ring-red-300" : "bg-white shadow-sm hover:shadow-md"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{session.issue_type}</span>
              {statusBadge}
              {session.volunteer_notes?.trim() && <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">Notes Saved</span>}
            </div>
            <h3 className={`font-display font-bold text-xl ${isCompleted ? "text-slate-400" : "text-slate-800"}`}>{session.anonymous_name || "Anonymous"}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(sessionStart, "MMM d, yyyy")}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</span>
              <span className="text-xs font-semibold text-slate-400">⏱ {formatDuration(duration)}</span>
            </div>
            {session.notes && !isCompleted && <p className="mt-2 text-xs text-slate-400 italic line-clamp-2">"{session.notes}"</p>}
            {!isCompleted && <CountdownBanner slotDate={slot.slot_date} startTime={slot.start_time} sessionId={session.id} />}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {isLive && roomUrl && (
              <Button variant="hero" className="rounded-xl px-4 py-2 text-sm shadow-md" onClick={() => window.open(roomUrl, "_blank")}>
                <Video className="h-4 w-4 mr-1.5" /> Join Now
              </Button>
            )}
            {!isLive && !isCompleted && roomUrl && (
              <Button variant="outline" className="rounded-xl px-4 py-2 text-sm border-slate-200" onClick={() => window.open(roomUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-1.5" /> Open Room
              </Button>
            )}
            <Button variant={isCompleted ? "outline" : "heroOutline"} className="rounded-xl px-4 py-2 text-sm" onClick={() => onOpenDetails(session)}>
              <Brain className="h-4 w-4 mr-1.5" /> {isCompleted ? "Review Context" : "Prep & Notes"}
            </Button>
            {isCompleted && <span className="text-xs font-semibold italic text-slate-400">Session ended</span>}
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
    const { data, error } = await supabase.from("time_slots").select("*").eq("volunteer_id", volunteerId).order("slot_date", { ascending: true }).order("start_time", { ascending: true });
    if (!error && data) setSlots(data as TimeSlot[]);
    setSlotsLoading(false);
  }, [volunteerId]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!slotDate || !startTime || !endTime) { setFormError("All fields required"); return; }
    const start = parseISO(`${slotDate}T${startTime}`);
    const end = parseISO(`${slotDate}T${endTime}`);
    if (end <= start) { setFormError("End must be after start"); return; }
    if (isPast(start)) { setFormError("Can't add slots in the past"); return; }
    const overlaps = slots.filter(s => s.slot_date === slotDate).some(s => {
      const sS = parseISO(`${s.slot_date}T${s.start_time}`);
      const sE = parseISO(`${s.slot_date}T${s.end_time}`);
      return start < sE && end > sS;
    });
    if (overlaps) { setFormError("Overlaps with existing slot"); return; }
    setSaving(true);
    const { error } = await supabase.from("time_slots").insert({ volunteer_id: volunteerId, slot_date: slotDate, start_time: startTime + ":00", end_time: endTime + ":00", is_booked: false });
    if (!error) { toast.success("Added!"); setSlotDate(""); setStartTime(""); setEndTime(""); setShowForm(false); fetchSlots(); }
    else { setFormError("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (slot: TimeSlot) => {
    if (slot.is_booked) { toast.error("Booked slots can't be deleted"); return; }
    setDeleting(slot.id);
    const { error } = await supabase.from("time_slots").delete().eq("id", slot.id);
    if (!error) { toast.success("Removed"); setSlots(prev => prev.filter(s => s.id !== slot.id)); }
    setDeleting(null);
  };

  const futureSlots = slots.filter(s => isFuture(parseISO(`${s.slot_date}T${s.end_time}`)));
  const pastSlots = slots.filter(s => !isFuture(parseISO(`${s.slot_date}T${s.end_time}`)));

  const renderSlotRow = (slot: TimeSlot) => {
    const isInPast = !isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`));
    return (
      <motion.div key={slot.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: isInPast ? 0.6 : 1, x: 0 }} className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border ${isInPast ? "bg-slate-50 border-slate-100" : slot.is_booked ? "bg-primary/5 border-primary/20" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isInPast ? "bg-slate-200" : slot.is_booked ? "bg-primary/10" : "bg-safe/10"}`}>
            {isInPast ? <CheckCircle2 className="h-5 w-5 text-slate-400" /> : slot.is_booked ? <Lock className="h-5 w-5 text-primary" /> : <AlarmClock className="h-5 w-5 text-safe" />}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">{format(parseISO(slot.slot_date + "T00:00:00"), "EEE, MMM d, yyyy")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full">{slot.is_booked ? "Booked" : isInPast ? "Past" : "Available"}</span>
          {!slot.is_booked && !isInPast && <button onClick={() => handleDelete(slot)} disabled={!!deleting} className="h-8 w-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-all"><Trash2 className="h-4 w-4 mx-auto" /></button>}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-black flex items-center gap-2"><AlarmClock className="h-5 w-5 text-primary" /> Availability</h2><p className="text-sm text-slate-500">Manage your session calendar</p></div>
        <Button variant={showForm ? "outline" : "hero"} className="rounded-2xl shadow-md" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Slot"}</Button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
             <Card className="p-6 border-2 border-primary/20 rounded-3xl bg-primary/5 shadow-none">
                <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="text-[10px] font-black uppercase block mb-2 text-slate-400">Date</label><input type="date" min={TODAY} value={slotDate} onChange={e => setSlotDate(e.target.value)} className="w-full rounded-xl border-2 px-4 py-2 text-sm" required /></div>
                  <div><label className="text-[10px] font-black uppercase block mb-2 text-slate-400">Start</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full rounded-xl border-2 px-4 py-2 text-sm" required /></div>
                  <div><label className="text-[10px] font-black uppercase block mb-2 text-slate-400">End</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full rounded-xl border-2 px-4 py-2 text-sm" required /></div>
                  <Button type="submit" variant="hero" className="sm:col-span-3 rounded-xl" disabled={saving}>{saving ? "Saving..." : "Confirm Slot"}</Button>
                  {formError && <p className="text-xs text-red-500 font-bold sm:col-span-3">{formError}</p>}
                </form>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {futureSlots.length === 0 ? <p className="text-sm text-slate-400 italic">No future slots available.</p> : futureSlots.map(renderSlotRow)}
        {pastSlots.length > 0 && (
          <div className="pt-4">
            <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors mb-2">
              {showPast ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Past Slots ({pastSlots.length})
            </button>
            <AnimatePresence>{showPast && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-2 overflow-hidden">{pastSlots.map(renderSlotRow)}</motion.div>}</AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function VolunteerDashboard() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useState<SessionWithSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [volunteer, setVolunteer] = useState<VolunteerRecord | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionWithSlot | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [studentMoodEntries, setStudentMoodEntries] = useState<MoodEntry[]>([]);
  const [studentSessionHistory, setStudentSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const fetchSessions = useCallback(async (volId: string) => {
    setSessionsLoading(true);
    const { data: slotRows } = await supabase.from("time_slots").select("id").eq("volunteer_id", volId);
    const slotIds = slotRows?.map(s => s.id) || [];
    if (slotIds.length === 0) { setSessions([]); setSessionsLoading(false); return; }

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: vol, error: volError } = await supabase.from("volunteers").select("*").eq("email", email.trim().toLowerCase()).single();
      if (volError || !vol) { setError("Account not found"); return; }
      if (vol.verification_status !== "verified") { setError("Under review by admin"); return; }
      setVolunteer(vol as VolunteerRecord);
      fetchSessions(vol.id);
      setIsLoggedIn(true);
    } catch { setError("An error occurred"); }
    setLoading(false);
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
      <div className="min-h-screen pt-24 bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
            <Card className="p-10 border-none shadow-2xl rounded-[2.5rem]">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><UserCheck className="h-8 w-8 text-primary" /></div>
                <h1 className="text-2xl font-display font-black">Volunteer Hub</h1>
                <p className="text-sm text-slate-500 mt-2">Verified access required</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full px-5 py-4 rounded-2xl border-2 focus:border-primary/40 outline-none" required />
                {error && <p className="text-xs text-red-500 font-bold px-2">{error}</p>}
                <Button variant="hero" className="w-full h-14 rounded-2xl shadow-xl" disabled={loading}>{loading ? "Verifying..." : "Enter Hub"}</Button>
              </form>
            </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-display font-black flex items-center gap-3">Howdy, {volunteer?.name} <span className="text-[10px] bg-safe/10 text-safe px-3 py-1 rounded-full">{volunteer?.is_admin ? "Admin" : "Verified Peer"}</span></h1>
            <p className="text-slate-500 mt-1">Manage your sessions and platform availability</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-center"><p className="text-[10px] font-black uppercase text-slate-400">Total Sessions</p><p className="text-xl font-black">{sessions.length}</p></div>
             <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-center"><p className="text-[10px] font-black uppercase text-slate-400">Upcoming</p><p className="text-xl font-black text-primary">{upcomingSessions.length}</p></div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: "sessions" as Tab, label: "Sessions", icon: <LayoutDashboard className="h-4 w-4" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Manage Availability", icon: <AlarmClock className="h-4 w-4" /> },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.key ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              {t.icon}{t.label}{t.badge ? <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "sessions" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h2 className="text-lg font-black flex items-center gap-2 mb-4"><Calendar className="h-5 w-5 text-primary" /> Active & Upcoming</h2>
                  {sessionsLoading ? <div className="h-32 bg-white rounded-3xl animate-pulse" /> : upcomingSessions.length === 0 ? <Card className="p-10 text-center text-slate-400 rounded-3xl bg-white">No bookings yet.</Card> : <div className="space-y-4">{upcomingSessions.map(s => <SessionCard key={s.id} session={s} onOpenDetails={openSessionDetails} />)}</div>}
                </section>
                {completedSessions.length > 0 && (
                  <section>
                    <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-400"><CheckCircle2 className="h-5 w-5" /> Completed Sessions</h2>
                    <div className="space-y-4">{completedSessions.map(s => <SessionCard key={s.id} session={s} onOpenDetails={openSessionDetails} />)}</div>
                  </section>
                )}
              </div>
              <div className="space-y-6">
                <Card className="p-6 bg-slate-100 rounded-[2rem] border-none"><h3 className="font-bold flex items-center gap-2 mb-4 text-slate-800"><Shield className="h-5 w-5 text-safe" /> Peer Guidelines</h3><ul className="space-y-3 text-sm text-slate-600">{["Maintain zero-trace confidentiality.", "Never ask for offline contacts.", "Report urgent safety concerns.", "Review briefings before start."].map(tip => <li key={tip} className="flex gap-3"><div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5" />{tip}</li>)}</ul></Card>
                <Card className="p-6 bg-white rounded-[2rem] border border-slate-100"><h3 className="font-bold flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 text-primary" /> Intelligent Briefing</h3><p className="text-xs text-slate-500 leading-relaxed">Our AI companion analyzes student check-ins to provide you with a context briefing 5 minutes before the call. This ensures students don't have to repeat their trauma.</p></Card>
              </div>
            </motion.div>
          )}
          {activeTab === "slots" && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ManageSlots volunteerId={volunteer!.id} /></motion.div>}
        </AnimatePresence>
      </main>

      {/* Context Review Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center"><Brain className="h-6 w-6 text-primary" /></div><h3 className="text-2xl font-display font-black">Student Context & Notes</h3></div>
                <Button variant="ghost" className="rounded-full h-12 w-12" onClick={() => setSelectedSession(null)}><XIcon className="h-6 w-6" /></Button>
              </div>
              <div className="overflow-y-auto p-10 space-y-10 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10">
                   <div className="space-y-8">
                      <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Handoff Summary</p>
                        <p className="text-slate-700 leading-relaxed font-medium text-lg">{selectedSession.handoff_briefing || "The AI is synthesizing student's recent journey... briefing will appear here soon."}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Booking Note</p>
                          <p className="text-sm font-medium text-slate-700 italic">"{selectedSession.notes || "No specific note left during booking."}"</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Issue / Focus</p>
                          <p className="font-black text-slate-800">{selectedSession.issue_type}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between"><h4 className="font-display font-black text-xl flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Private Volunteer Notes</h4><Button variant="hero" size="sm" onClick={handleSaveNotes} disabled={noteSaving} className="rounded-xl shadow-md">{noteSaving ? "Saving..." : "Save Continuity Note"}</Button></div>
                        <Textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="What should the next peer know? Record grounding tools used or specific student needs..." className="min-h-[200px] rounded-[1.5rem] bg-slate-50 border-none px-6 py-4 text-base focus-visible:ring-primary/20" />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <Card className="p-8 bg-slate-100 rounded-[2.5rem] border-none">
                        <h4 className="font-black text-lg mb-6 flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary" /> Mood Timeline</h4>
                        {contextLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : studentMoodEntries.length === 0 ? <p className="text-sm text-slate-400">No recent journal entries.</p> : (
                          <div className="space-y-4">
                            {studentMoodEntries.map(e => <div key={e.id} className="bg-white p-4 rounded-2xl border border-slate-200">{getMoodMeta(e.mood) && <MoodBadge value={e.mood} />}<p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{format(parseISO(e.created_at), "MMM d, h:mm a")}</p>{e.note && <p className="text-xs text-slate-600 mt-2 line-clamp-3">"{e.note}"</p>}</div>)}
                          </div>
                        )}
                      </Card>
                      <Card className="p-8 bg-white border border-slate-100 rounded-[2.5rem]">
                        <h4 className="font-black text-lg mb-6 flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Prior Sessions</h4>
                        {contextLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : studentSessionHistory.length === 0 ? <p className="text-sm text-slate-400">First time visitor.</p> : (
                          <div className="space-y-3">
                            {studentSessionHistory.map(h => <div key={h.id} className="bg-slate-50 p-4 rounded-2xl"><div className="flex justify-between items-start"><p className="text-xs font-bold text-slate-800">{h.issue_type}</p><MoodBadge value={h.mood_after} /></div><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{formatSessionStamp(h)}</p></div>)}
                          </div>
                        )}
                      </Card>
                   </div>
                </div>
              </div>
              <div className="p-8 border-t bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">Strictly for Peer Support Continuity. Confidentaility is Core.</p>
                <Button variant="hero" className="rounded-2xl px-10 h-14 text-lg shadow-xl" onClick={() => setSelectedSession(null)}>Finished Review</Button>
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
