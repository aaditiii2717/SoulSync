import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar, Clock, Shield, Brain, UserCheck,
  ExternalLink, Radio, CheckCircle2, Video,
  Plus, Trash2, LayoutDashboard, AlarmClock,
  ChevronDown, ChevronUp, Lock,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes, parseISO, isPast, isFuture } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

// ─── types ───────────────────────────────────────────────────────────────────

type Tab = "sessions" | "slots";
type SessionStatus = "upcoming" | "live" | "completed";

interface TimeSlot {
  id: string;
  volunteer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

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

// Today's date as YYYY-MM-DD (used as min for date inputs)
const TODAY = new Date().toISOString().split("T")[0];

// ─── CountdownBanner ─────────────────────────────────────────────────────────

function CountdownBanner({
  slotDate,
  startTime,
  sessionId,
}: {
  slotDate: string;
  startTime: string;
  sessionId: string;
}) {
  const [minsLeft, setMinsLeft] = useState(() =>
    minutesUntilStart(slotDate, startTime)
  );

  useEffect(() => {
    const tick = () => setMinsLeft(minutesUntilStart(slotDate, startTime));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [slotDate, startTime]);

  if (minsLeft > 5 || minsLeft < 0) return null;

  const roomId = sessionId ? `SoulSync-Session-${sessionId}` : "Awaiting Room ID";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 flex flex-col gap-1"
    >
      <p className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        Your session starts in{" "}
        {minsLeft <= 1 ? "less than 1 minute" : `${minsLeft} minutes`}
      </p>
      <p className="text-sm font-bold text-amber-900">
        Room ID:{" "}
        <span className="font-mono tracking-wide">{roomId}</span>
      </p>
      {sessionId && (
        <a
          href={`https://meet.jit.si/${roomId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline text-amber-700 font-semibold"
        >
          Open room link →
        </a>
      )}
    </motion.div>
  );
}

// ─── SessionCard ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: any }) {
  const slot = session.time_slots;
  if (!slot) return null;

  const [status, setStatus] = useState<SessionStatus>(() =>
    computeStatus(slot.slot_date, slot.start_time, slot.end_time)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setStatus(computeStatus(slot.slot_date, slot.start_time, slot.end_time));
    }, 30_000);
    return () => clearInterval(id);
  }, [slot.slot_date, slot.start_time, slot.end_time]);

  const duration = sessionDurationMinutes(slot.start_time, slot.end_time);
  const sessionStart = toSessionDateTime(slot.slot_date, slot.start_time);
  const roomUrl = session.id
    ? `https://meet.jit.si/SoulSync-Session-${session.id}`
    : null;

  const isCompleted = status === "completed";
  const isLive = status === "live";

  const statusBadge = {
    upcoming: (
      <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
        Upcoming
      </span>
    ),
    live: (
      <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1">
        <Radio className="h-3 w-3 animate-pulse" /> Live
      </span>
    ),
    completed: (
      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-full flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    ),
  }[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`p-6 border-none rounded-3xl transition-all ${
          isCompleted
            ? "shadow-none bg-slate-50"
            : isLive
            ? "shadow-lg ring-2 ring-red-300 bg-white"
            : "shadow-sm hover:shadow-md bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                {session.issue_type}
              </span>
              {statusBadge}
            </div>
            <h3
              className={`font-display font-bold text-xl leading-tight ${
                isCompleted ? "text-slate-400" : "text-slate-800"
              }`}
            >
              {session.anonymous_name || "Anonymous"}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                {format(sessionStart, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
                {slot.start_time.slice(0, 5)} → {slot.end_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                ⏱ {formatDuration(duration)}
              </span>
            </div>
            {session.notes && !isCompleted && (
              <p className="mt-2 text-xs text-slate-400 italic line-clamp-2">
                "{session.notes}"
              </p>
            )}
            {!isCompleted && (
              <CountdownBanner
                slotDate={slot.slot_date}
                startTime={slot.start_time}
                sessionId={session.id}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {isLive && roomUrl && (
              <Button
                variant="hero"
                className="rounded-xl shadow-md text-sm px-4 py-2 animate-pulse"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <Video className="h-4 w-4 mr-1.5" />
                Join Now
              </Button>
            )}
            {!isLive && !isCompleted && roomUrl && (
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-sm px-4 py-2"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Open Room
              </Button>
            )}
            {isCompleted && (
              <span className="text-xs text-slate-400 font-semibold italic">
                Session ended
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── ManageSlots panel ───────────────────────────────────────────────────────

function ManageSlots({ volunteerId }: { volunteerId: string }) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  // Form state
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Group toggle for past slots
  const [showPast, setShowPast] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // ── add slot ───────────────────────────────────────────────────────────────
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!slotDate || !startTime || !endTime) {
      setFormError("Please fill in all fields.");
      return;
    }

    const start = parseISO(`${slotDate}T${startTime}`);
    const end = parseISO(`${slotDate}T${endTime}`);

    if (end <= start) {
      setFormError("End time must be after start time.");
      return;
    }
    if (isPast(start)) {
      setFormError("You can't add a slot in the past.");
      return;
    }

    // Check overlap with existing slots on the same date
    const sameDay = slots.filter((s) => s.slot_date === slotDate);
    const hasOverlap = sameDay.some((s) => {
      const sStart = parseISO(`${s.slot_date}T${s.start_time}`);
      const sEnd = parseISO(`${s.slot_date}T${s.end_time}`);
      return start < sEnd && end > sStart;
    });
    if (hasOverlap) {
      setFormError("This slot overlaps with an existing one on the same date.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("time_slots").insert({
      volunteer_id: volunteerId,
      slot_date: slotDate,
      start_time: startTime + ":00",
      end_time: endTime + ":00",
      is_booked: false,
    });

    if (error) {
      setFormError("Failed to save slot. Please try again.");
      console.error(error);
    } else {
      toast.success("Time slot added!");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      setShowForm(false);
      fetchSlots();
    }
    setSaving(false);
  };

  // ── delete slot ────────────────────────────────────────────────────────────
  const handleDelete = async (slot: TimeSlot) => {
    if (slot.is_booked) {
      toast.error("Can't delete a slot that's already booked by a student.");
      return;
    }
    setDeleting(slot.id);
    const { error } = await supabase
      .from("time_slots")
      .delete()
      .eq("id", slot.id);

    if (error) {
      toast.error("Failed to delete slot.");
      console.error(error);
    } else {
      toast.success("Slot removed.");
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    }
    setDeleting(null);
  };

  // ── derived lists ──────────────────────────────────────────────────────────
  const futureSlots = slots.filter((s) =>
    isFuture(parseISO(`${s.slot_date}T${s.end_time}`))
  );
  const pastSlots = slots.filter(
    (s) => !isFuture(parseISO(`${s.slot_date}T${s.end_time}`))
  );

  const renderSlotRow = (slot: TimeSlot) => {
    const isInPast = !isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`));
    const duration = sessionDurationMinutes(slot.start_time, slot.end_time);

    return (
      <motion.div
        key={slot.id}
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: isInPast ? 0.6 : 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all ${
          isInPast
            ? "bg-slate-50 border-slate-100"
            : slot.is_booked
            ? "bg-primary/5 border-primary/20"
            : "bg-white border-slate-200 hover:border-primary/30 hover:shadow-sm"
        }`}
      >
        {/* Date + time */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              isInPast
                ? "bg-slate-200"
                : slot.is_booked
                ? "bg-primary/10"
                : "bg-safe/10"
            }`}
          >
            {isInPast ? (
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
            ) : slot.is_booked ? (
              <Lock className="h-5 w-5 text-primary" />
            ) : (
              <AlarmClock className="h-5 w-5 text-safe" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">
              {format(parseISO(slot.slot_date + "T00:00:00"), "EEE, MMM d, yyyy")}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              <span className="ml-1 text-slate-400">
                ({formatDuration(duration)})
              </span>
            </p>
          </div>
        </div>

        {/* Status badge + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isInPast ? (
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-full">
              Past
            </span>
          ) : slot.is_booked ? (
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
              Booked
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest bg-safe/10 text-safe px-2 py-1 rounded-full">
              Available
            </span>
          )}

          {!slot.is_booked && (
            <button
              onClick={() => handleDelete(slot)}
              disabled={deleting === slot.id}
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all disabled:opacity-40"
              title="Delete slot"
            >
              {deleting === slot.id ? (
                <span className="h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Header + Add button ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-primary" />
            My Availability Slots
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Add dates &amp; times when you're free to take sessions.
          </p>
        </div>
        <Button
          variant={showForm ? "outline" : "hero"}
          className="rounded-2xl shadow-md gap-1.5"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
        >
          {showForm ? (
            <>
              <XIcon className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Slot
            </>
          )}
        </Button>
      </div>

      {/* ── Add slot form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 border-2 border-primary/20 rounded-3xl bg-primary/5 shadow-none">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                New Availability Slot
              </p>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Date
                    </label>
                    <input
                      type="date"
                      min={TODAY}
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
                      required
                    />
                  </div>

                  {/* Start time */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
                      required
                    />
                  </div>

                  {/* End time */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Duration preview */}
                {startTime && endTime && (
                  <p className="text-xs text-slate-500 font-semibold">
                    ⏱ Session duration:{" "}
                    <span className="text-primary">
                      {(() => {
                        const d = sessionDurationMinutes(
                          startTime + ":00",
                          endTime + ":00"
                        );
                        return d > 0 ? formatDuration(d) : "—";
                      })()}
                    </span>
                  </p>
                )}

                {formError && (
                  <p className="text-xs text-red-500 font-semibold px-1">
                    ⚠ {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  className="rounded-xl w-full sm:w-auto px-8 shadow-md"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" /> Save Slot
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slot list ── */}
      {slotsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <Card className="p-10 border-none shadow-sm rounded-3xl bg-white text-center text-slate-400">
          <AlarmClock className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold">No slots yet</p>
          <p className="text-sm mt-1">
            Click <strong>Add Slot</strong> to open your availability for
            students to book.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Upcoming / available + booked slots */}
          <AnimatePresence>
            {futureSlots.length === 0 ? (
              <p className="text-sm text-slate-400 italic px-2">
                No future slots — add one above!
              </p>
            ) : (
              futureSlots.map(renderSlotRow)
            )}
          </AnimatePresence>

          {/* Past slots — collapsible */}
          {pastSlots.length > 0 && (
            <div className="pt-4">
              <button
                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide hover:text-slate-600 transition-colors mb-3"
                onClick={() => setShowPast((v) => !v)}
              >
                {showPast ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Past Slots ({pastSlots.length})
              </button>
              <AnimatePresence>
                {showPast && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    {pastSlots.map(renderSlotRow)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Summary row */}
      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            {
              label: "Total",
              value: slots.length,
              color: "text-slate-800",
            },
            {
              label: "Booked",
              value: slots.filter((s) => s.is_booked).length,
              color: "text-primary",
            },
            {
              label: "Available",
              value: futureSlots.filter((s) => !s.is_booked).length,
              color: "text-safe",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-3 border border-slate-100 text-center shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

function VolunteerDashboard() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [volunteer, setVolunteer] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sessions");

  // ── fetch sessions ─────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async (volId: string) => {
    setSessionsLoading(true);

    const { data: slotsRes } = await supabase.from("time_slots").select("id").eq("volunteer_id", volId);
    const slotIds = slotsRes?.map(s => s.id) || [];
    
    let query = supabase.from("session_bookings").select("*, time_slots(*)");
    
    if (slotIds.length > 0) {
      query = query.in("time_slot_id", slotIds);
    } else {
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

    const { data: fetchedSessions, error } = await query;
    if (error) {
      console.error("fetchSessions error:", error);
    }

    const sorted = (fetchedSessions || []).sort((a: any, b: any) => {
      const dtA = a.time_slots
        ? `${a.time_slots.slot_date}T${a.time_slots.start_time}`
        : a.created_at;
      const dtB = b.time_slots
        ? `${b.time_slots.slot_date}T${b.time_slots.start_time}`
        : b.created_at;
      return dtA.localeCompare(dtB);
    });

    setSessions(sorted);
    setSessionsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: vol, error: volError } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (volError || !vol) {
        setError(
          "We couldn't find a volunteer account with that email. Please check your spelling or register first."
        );
        return;
      }
      if (vol.verification_status !== "verified") {
        setError(
          "Your application is still under review. Please wait for an Admin to verify your CV."
        );
        return;
      }
      setVolunteer(vol);
      fetchSessions(vol.id);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh sessions every 60 s
  const fetchRef = useRef(fetchSessions);
  fetchRef.current = fetchSessions;
  useEffect(() => {
    if (!volunteer) return;
    const id = setInterval(() => fetchRef.current(volunteer.id), 60_000);
    return () => clearInterval(id);
  }, [volunteer]);

  const upcomingSessions = sessions.filter((s) => {
    if (!s.time_slots) return false;
    const st = computeStatus(
      s.time_slots.slot_date,
      s.time_slots.start_time,
      s.time_slots.end_time
    );
    return st === "upcoming" || st === "live";
  });

  const completedSessions = sessions.filter((s) => {
    if (!s.time_slots) return false;
    return (
      computeStatus(
        s.time_slots.slot_date,
        s.time_slots.start_time,
        s.time_slots.end_time
      ) === "completed"
    );
  });

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 border-none shadow-2xl rounded-[2rem]">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-black">
                  Volunteer Hub
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Enter your verified email to access your dashboard
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="volunteer@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-primary/40 focus:outline-none transition-all"
                  required
                />
                {error && (
                  <p className="text-xs text-red-500 font-medium px-2">
                    {error}
                  </p>
                )}
                <Button
                  className="w-full rounded-xl h-12 shadow-lg"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Access Dashboard"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-display font-black flex items-center gap-3">
              Welcome, {volunteer.name}
              {volunteer.is_admin ? (
                <span className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-2 py-1 rounded-full">
                  Super Admin
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest bg-safe/10 text-safe px-2 py-1 rounded-full">
                  Verified Peer
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-2">
              {volunteer.is_admin
                ? "Platform-wide oversight and volunteer governance."
                : "Manage your sessions and availability."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Sessions
              </p>
              <p className="text-xl font-black">{sessions.length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Live / Upcoming
              </p>
              <p className="text-xl font-black text-primary">
                {upcomingSessions.length}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Points
              </p>
              <p className="text-xl font-black text-primary">
                {completedSessions.length * 50}
              </p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {(
            [
              {
                key: "sessions" as Tab,
                label: "Sessions",
                icon: <LayoutDashboard className="h-4 w-4" />,
                badge: upcomingSessions.length || undefined,
              },
              {
                key: "slots" as Tab,
                label: "Manage Slots",
                icon: <AlarmClock className="h-4 w-4" />,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {"badge" in tab && tab.badge ? (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── SESSIONS TAB ── */}
          {activeTab === "sessions" && (
            <motion.div
              key="sessions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                  {/* Upcoming / Live */}
                  <section>
                    <h2 className="text-lg font-black flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Sessions
                      {upcomingSessions.length > 0 && (
                        <span className="ml-1 text-xs font-black bg-primary text-white px-2 py-0.5 rounded-full">
                          {upcomingSessions.length}
                        </span>
                      )}
                    </h2>
                    {sessionsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-32 bg-slate-100 rounded-3xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : upcomingSessions.length === 0 ? (
                      <Card className="p-8 border-none shadow-sm rounded-3xl bg-white text-center text-slate-400">
                        <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                        <p className="font-semibold">No upcoming sessions</p>
                        <p className="text-sm mt-1">
                          Students will appear here once they book a slot with
                          you.
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Completed */}
                  {completedSessions.length > 0 && (
                    <section>
                      <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Past Sessions
                        <span className="ml-1 text-xs font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                          {completedSessions.length}
                        </span>
                      </h2>
                      <div className="space-y-4">
                        {completedSessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4 text-sm">
                  <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-100">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-safe" />
                      Volunteer Guidelines
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "Keep conversations confidential.",
                        "Do not ask for real identity.",
                        "Refer critical cases to professional help.",
                        "Join the room on time — students may be anxious.",
                        "Use the room ID sent in the 5-min alert banner.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="p-6 border-none shadow-sm rounded-3xl bg-white">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-primary" />
                      How room access works
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Exactly <strong>5 minutes before</strong> your session
                      starts, an alert banner will appear on the session card
                      with the Room ID. Click the link to open your Jitsi room
                      directly. For live sessions, use the{" "}
                      <strong>"Join Now"</strong> button.
                    </p>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SLOTS TAB ── */}
          {activeTab === "slots" && (
            <motion.div
              key="slots-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ManageSlots volunteerId={volunteer.id} />
                </div>
                <div className="space-y-4 text-sm">
                  <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-100">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-safe" />
                      Slot Tips
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "Add slots at least 24 hours in advance.",
                        "You can't delete a booked slot — contact admin if needed.",
                        "Past slots are greyed out automatically.",
                        "Students can only book unbooked future slots.",
                        "Overlapping slots on the same day are prevented.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Briefing Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <h3 className="font-display font-black text-xl">
                    Intelligent Handoff Briefing
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSession(null)}
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                    AI Consultation Summary
                  </p>
                  <div className="text-slate-700 leading-relaxed font-medium">
                    {selectedSession.handoff_briefing ||
                      "Generating intelligent summary... try refreshing in a moment."}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Issue
                    </p>
                    <p className="font-bold">{selectedSession.issue_type}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Student name
                    </p>
                    <p className="font-bold">
                      {selectedSession.anonymous_name || "Anonymous"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider italic">
                    This information is shared only with you. Maintain absolute
                    secrecy.
                  </p>
                  <Button
                    variant="hero"
                    className="w-full rounded-2xl h-14"
                    onClick={() => setSelectedSession(null)}
                  >
                    I Understand — Start Session
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

// ─── inline X icon ────────────────────────────────────────────────────────────
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
