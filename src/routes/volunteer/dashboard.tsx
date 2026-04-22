import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
<<<<<<< HEAD
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
=======
import { Textarea } from "@/components/ui/textarea";
import {
  AlarmClock,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  Loader2,
  Lock,
  Plus,
  Radio,
  Save,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, differenceInMinutes, isFuture, isPast, parseISO } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

<<<<<<< HEAD
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
=======
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
  time_slots:
  | Pick<TimeSlot, "slot_date" | "start_time" | "end_time">
  | null;
};
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)

function toSessionDateTime(slotDate: string, startTime: string): Date {
  return parseISO(`${slotDate}T${startTime}`);
}

function sessionDurationMinutes(start: string, end: string): number {
<<<<<<< HEAD
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
=======
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
<<<<<<< HEAD
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
=======
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
}

function computeStatus(
  slotDate: string,
  startTime: string,
  endTime: string
): SessionStatus {
  const now = new Date();
  const start = toSessionDateTime(slotDate, startTime);
  const end = toSessionDateTime(slotDate, endTime);
<<<<<<< HEAD
=======

>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
  if (now >= end) return "completed";
  if (now >= start) return "live";
  return "upcoming";
}

function minutesUntilStart(slotDate: string, startTime: string): number {
  return differenceInMinutes(toSessionDateTime(slotDate, startTime), new Date());
}

<<<<<<< HEAD
// Today's date as YYYY-MM-DD (used as min for date inputs)
const TODAY = new Date().toISOString().split("T")[0];

// ─── CountdownBanner ─────────────────────────────────────────────────────────
=======
function capitalizeWords(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getMoodMeta(rawMood: string | null | undefined) {
  if (!rawMood) return null;

  const mood = rawMood.toLowerCase();
  const moodMap: Record<
    string,
    {
      label: string;
      badgeClassName: string;
      hint: string;
    }
  > = {
    great: {
      label: "Great",
      badgeClassName: "border-safe/20 bg-safe/10 text-safe",
      hint: "Feeling steady and uplifted",
    },
    good: {
      label: "Good",
      badgeClassName: "border-primary/20 bg-primary/10 text-primary",
      hint: "Coping well overall",
    },
    okay: {
      label: "Okay",
      badgeClassName: "border-calm/20 bg-calm/10 text-calm",
      hint: "Holding steady for now",
    },
    low: {
      label: "Low",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      hint: "Energy or mood feels reduced",
    },
    struggling: {
      label: "Struggling",
      badgeClassName: "border-red-200 bg-red-50 text-red-600",
      hint: "Needs extra support and grounding",
    },
    "1": {
      label: "1 / 5",
      badgeClassName: "border-red-200 bg-red-50 text-red-600",
      hint: "Very low after the session",
    },
    "2": {
      label: "2 / 5",
      badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
      hint: "Still feeling low",
    },
    "3": {
      label: "3 / 5",
      badgeClassName: "border-slate-200 bg-slate-100 text-slate-600",
      hint: "Neutral after the session",
    },
    "4": {
      label: "4 / 5",
      badgeClassName: "border-primary/20 bg-primary/10 text-primary",
      hint: "Feeling better",
    },
    "5": {
      label: "5 / 5",
      badgeClassName: "border-safe/20 bg-safe/10 text-safe",
      hint: "Feeling much better",
    },
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
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${meta.badgeClassName}`}
    >
      {meta.label}
    </span>
  );
}

function formatSessionStamp(session: {
  created_at: string;
  time_slots: { slot_date: string; start_time: string } | null;
}) {
  if (session.time_slots) {
    return format(
      toSessionDateTime(session.time_slots.slot_date, session.time_slots.start_time),
      "MMM d, yyyy • h:mm a"
    );
  }

  return format(parseISO(session.created_at), "MMM d, yyyy • h:mm a");
}

const TODAY = new Date().toISOString().split("T")[0];
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)

function CountdownBanner({
  slotDate,
  startTime,
  sessionId,
}: {
  slotDate: string;
  startTime: string;
  sessionId: string;
}) {
<<<<<<< HEAD
  const [minsLeft, setMinsLeft] = useState(() =>
=======
  const [minutesLeft, setMinutesLeft] = useState(() =>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
    minutesUntilStart(slotDate, startTime)
  );

  useEffect(() => {
<<<<<<< HEAD
    const tick = () => setMinsLeft(minutesUntilStart(slotDate, startTime));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [slotDate, startTime]);

  if (minsLeft > 5 || minsLeft < 0) return null;
=======
    const tick = () => setMinutesLeft(minutesUntilStart(slotDate, startTime));
    tick();
    const intervalId = setInterval(tick, 30_000);
    return () => clearInterval(intervalId);
  }, [slotDate, startTime]);

  if (minutesLeft > 5 || minutesLeft < 0) return null;
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)

  const roomId = sessionId ? `SoulSync-Session-${sessionId}` : "Awaiting Room ID";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
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
=======
      className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
    >
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Session starts in{" "}
        {minutesLeft <= 1 ? "less than 1 minute" : `${minutesLeft} minutes`}
      </p>
      <p className="mt-1 text-sm font-bold text-amber-900">
        Room ID: <span className="font-mono tracking-wide">{roomId}</span>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      </p>
      {sessionId && (
        <a
          href={`https://meet.jit.si/${roomId}`}
          target="_blank"
          rel="noopener noreferrer"
<<<<<<< HEAD
          className="text-xs underline text-amber-700 font-semibold"
        >
          Open room link →
=======
          className="mt-1 inline-block text-xs font-semibold text-amber-700 underline"
        >
          Open room link
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
        </a>
      )}
    </motion.div>
  );
}

<<<<<<< HEAD
// ─── SessionCard ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: any }) {
=======
function SessionCard({
  session,
  onOpenDetails,
}: {
  session: SessionWithSlot;
  onOpenDetails: (session: SessionWithSlot) => void;
}) {
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
  const slot = session.time_slots;
  if (!slot) return null;

  const [status, setStatus] = useState<SessionStatus>(() =>
    computeStatus(slot.slot_date, slot.start_time, slot.end_time)
  );

  useEffect(() => {
<<<<<<< HEAD
    const id = setInterval(() => {
      setStatus(computeStatus(slot.slot_date, slot.start_time, slot.end_time));
    }, 30_000);
    return () => clearInterval(id);
=======
    const intervalId = setInterval(() => {
      setStatus(computeStatus(slot.slot_date, slot.start_time, slot.end_time));
    }, 30_000);
    return () => clearInterval(intervalId);
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
  }, [slot.slot_date, slot.start_time, slot.end_time]);

  const duration = sessionDurationMinutes(slot.start_time, slot.end_time);
  const sessionStart = toSessionDateTime(slot.slot_date, slot.start_time);
  const roomUrl = session.id
    ? `https://meet.jit.si/SoulSync-Session-${session.id}`
    : null;
<<<<<<< HEAD

  const isCompleted = status === "completed";
  const isLive = status === "live";

  const statusBadge = {
    upcoming: (
      <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
=======
  const isCompleted = status === "completed";
  const isLive = status === "live";
  const hasVolunteerNotes = Boolean(session.volunteer_notes?.trim());
  const hasLinkedHistory = Boolean(session.student_alias_id);

  const statusBadge = {
    upcoming: (
      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
        Upcoming
      </span>
    ),
    live: (
<<<<<<< HEAD
      <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1">
        <Radio className="h-3 w-3 animate-pulse" /> Live
      </span>
    ),
    completed: (
      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-full flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Completed
=======
      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
        <Radio className="h-3 w-3 animate-pulse" />
        Live
      </span>
    ),
    completed: (
      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <CheckCircle2 className="h-3 w-3" />
        Completed
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
<<<<<<< HEAD
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
=======
        className={`rounded-3xl border-none p-6 transition-all ${isCompleted
            ? "bg-slate-50 shadow-none"
            : isLive
              ? "bg-white shadow-lg ring-2 ring-red-300"
              : "bg-white shadow-sm hover:shadow-md"
          }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {session.issue_type}
              </span>
              {statusBadge}
              {hasVolunteerNotes && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  Notes Saved
                </span>
              )}
            </div>
            <h3
              className={`font-display text-xl font-bold leading-tight ${isCompleted ? "text-slate-400" : "text-slate-800"
                }`}
            >
              {session.anonymous_name || "Anonymous"}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                {format(sessionStart, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
<<<<<<< HEAD
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
=======
                {slot.start_time.slice(0, 5)} to {slot.end_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                {formatDuration(duration)}
              </span>
            </div>
            {session.notes && !isCompleted && (
              <p className="mt-2 line-clamp-2 text-xs italic text-slate-400">
                "{session.notes}"
              </p>
            )}
            {!hasLinkedHistory && (
              <p className="mt-3 text-xs font-semibold text-amber-700">
                Mood history is unavailable until this booking is linked to the student's alias.
              </p>
            )}
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            {!isCompleted && (
              <CountdownBanner
                slotDate={slot.slot_date}
                startTime={slot.start_time}
                sessionId={session.id}
              />
            )}
          </div>
<<<<<<< HEAD
          <div className="flex flex-col gap-2 shrink-0">
            {isLive && roomUrl && (
              <Button
                variant="hero"
                className="rounded-xl shadow-md text-sm px-4 py-2 animate-pulse"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <Video className="h-4 w-4 mr-1.5" />
=======

          <div className="flex shrink-0 flex-col gap-2">
            {isLive && roomUrl && (
              <Button
                variant="hero"
                className="rounded-xl px-4 py-2 text-sm shadow-md"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <Video className="mr-1.5 h-4 w-4" />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                Join Now
              </Button>
            )}
            {!isLive && !isCompleted && roomUrl && (
              <Button
                variant="outline"
<<<<<<< HEAD
                className="rounded-xl border-slate-200 text-sm px-4 py-2"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Open Room
              </Button>
            )}
            {isCompleted && (
              <span className="text-xs text-slate-400 font-semibold italic">
=======
                className="rounded-xl border-slate-200 px-4 py-2 text-sm"
                onClick={() => window.open(roomUrl, "_blank")}
              >
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Open Room
              </Button>
            )}
            <Button
              variant={isCompleted ? "outline" : "heroOutline"}
              className="rounded-xl px-4 py-2 text-sm"
              onClick={() => onOpenDetails(session)}
            >
              <Brain className="mr-1.5 h-4 w-4" />
              {isCompleted ? "Review Context" : "Prep & Notes"}
            </Button>
            {isCompleted && (
              <span className="text-xs font-semibold italic text-slate-400">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                Session ended
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

<<<<<<< HEAD
// ─── ManageSlots panel ───────────────────────────────────────────────────────

=======
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
function ManageSlots({ volunteerId }: { volunteerId: string }) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
<<<<<<< HEAD

  // Form state
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Group toggle for past slots
  const [showPast, setShowPast] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
=======
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showPast, setShowPast] = useState(false);

  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);

>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("volunteer_id", volunteerId)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

<<<<<<< HEAD
    if (!error && data) setSlots(data as TimeSlot[]);
=======
    if (!error && data) {
      setSlots(data as TimeSlot[]);
    }

>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
    setSlotsLoading(false);
  }, [volunteerId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

<<<<<<< HEAD
  // ── add slot ───────────────────────────────────────────────────────────────
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
=======
  const handleAddSlot = async (event: React.FormEvent) => {
    event.preventDefault();
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
<<<<<<< HEAD
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
=======

    if (isPast(start)) {
      setFormError("You cannot add a slot in the past.");
      return;
    }

    const sameDay = slots.filter((slot) => slot.slot_date === slotDate);
    const hasOverlap = sameDay.some((slot) => {
      const existingStart = parseISO(`${slot.slot_date}T${slot.start_time}`);
      const existingEnd = parseISO(`${slot.slot_date}T${slot.end_time}`);
      return start < existingEnd && end > existingStart;
    });

    if (hasOverlap) {
      setFormError("This slot overlaps with another slot on the same day.");
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      return;
    }

    setSaving(true);
<<<<<<< HEAD
    const { error } = await supabase.from("time_slots").insert({
      volunteer_id: volunteerId,
      slot_date: slotDate,
      start_time: startTime + ":00",
      end_time: endTime + ":00",
=======

    const { error } = await supabase.from("time_slots").insert({
      volunteer_id: volunteerId,
      slot_date: slotDate,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      is_booked: false,
    });

    if (error) {
<<<<<<< HEAD
      setFormError("Failed to save slot. Please try again.");
      console.error(error);
    } else {
      toast.success("Time slot added!");
=======
      console.error("Add slot error:", error);
      setFormError("Failed to save slot. Please try again.");
    } else {
      toast.success("Time slot added.");
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      setShowForm(false);
      fetchSlots();
    }
<<<<<<< HEAD
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
=======

    setSaving(false);
  };

  const handleDelete = async (slot: TimeSlot) => {
    if (slot.is_booked) {
      toast.error("Booked slots cannot be deleted.");
      return;
    }

    setDeleting(slot.id);

    const { error } = await supabase.from("time_slots").delete().eq("id", slot.id);

    if (error) {
      console.error("Delete slot error:", error);
      toast.error("Failed to delete slot.");
    } else {
      toast.success("Slot removed.");
      setSlots((currentSlots) => currentSlots.filter((current) => current.id !== slot.id));
    }

    setDeleting(null);
  };

  const futureSlots = slots.filter((slot) =>
    isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`))
  );
  const pastSlots = slots.filter(
    (slot) => !isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`))
  );

  const renderSlotRow = (slot: TimeSlot) => {
    const slotIsPast = !isFuture(parseISO(`${slot.slot_date}T${slot.end_time}`));
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
    const duration = sessionDurationMinutes(slot.start_time, slot.end_time);

    return (
      <motion.div
        key={slot.id}
        layout
        initial={{ opacity: 0, x: -8 }}
<<<<<<< HEAD
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
=======
        animate={{ opacity: slotIsPast ? 0.6 : 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition-all ${slotIsPast
            ? "border-slate-100 bg-slate-50"
            : slot.is_booked
              ? "border-primary/20 bg-primary/5"
              : "border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm"
          }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${slotIsPast
                ? "bg-slate-200"
                : slot.is_booked
                  ? "bg-primary/10"
                  : "bg-safe/10"
              }`}
          >
            {slotIsPast ? (
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
            ) : slot.is_booked ? (
              <Lock className="h-5 w-5 text-primary" />
            ) : (
              <AlarmClock className="h-5 w-5 text-safe" />
            )}
          </div>
          <div>
<<<<<<< HEAD
            <p className="font-bold text-sm text-slate-800">
              {format(parseISO(slot.slot_date + "T00:00:00"), "EEE, MMM d, yyyy")}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              <span className="ml-1 text-slate-400">
                ({formatDuration(duration)})
              </span>
=======
            <p className="text-sm font-bold text-slate-800">
              {format(parseISO(`${slot.slot_date}T00:00:00`), "EEE, MMM d, yyyy")}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              <span className="ml-1 text-slate-400">({formatDuration(duration)})</span>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            </p>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        <div className="flex shrink-0 items-center gap-2">
          {slotIsPast ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Past
            </span>
          ) : slot.is_booked ? (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              Booked
            </span>
          ) : (
            <span className="rounded-full bg-safe/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              Available
            </span>
          )}

          {!slot.is_booked && (
            <button
              onClick={() => handleDelete(slot)}
              disabled={deleting === slot.id}
<<<<<<< HEAD
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all disabled:opacity-40"
              title="Delete slot"
            >
              {deleting === slot.id ? (
                <span className="h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
=======
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-all hover:bg-red-100 hover:text-red-600 disabled:opacity-40"
              title="Delete slot"
            >
              {deleting === slot.id ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
<<<<<<< HEAD

      {/* ── Header + Add button ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-primary" />
            My Availability Slots
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Add dates &amp; times when you're free to take sessions.
=======
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black">
            <AlarmClock className="h-5 w-5 text-primary" />
            My Availability Slots
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Add dates and times when you are free to take sessions.
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
          </p>
        </div>
        <Button
          variant={showForm ? "outline" : "hero"}
<<<<<<< HEAD
          className="rounded-2xl shadow-md gap-1.5"
          onClick={() => {
            setShowForm((v) => !v);
=======
          className="gap-1.5 rounded-2xl shadow-md"
          onClick={() => {
            setShowForm((currentValue) => !currentValue);
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            setFormError("");
          }}
        >
          {showForm ? (
            <>
<<<<<<< HEAD
              <XIcon className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Slot
=======
              <XIcon className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Slot
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            </>
          )}
        </Button>
      </div>

<<<<<<< HEAD
      {/* ── Add slot form ── */}
=======
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
<<<<<<< HEAD
            <Card className="p-6 border-2 border-primary/20 rounded-3xl bg-primary/5 shadow-none">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                New Availability Slot
              </p>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
=======
            <Card className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-6 shadow-none">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-primary">
                New Availability Slot
              </p>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      Date
                    </label>
                    <input
                      type="date"
                      min={TODAY}
                      value={slotDate}
<<<<<<< HEAD
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
=======
                      onChange={(event) => setSlotDate(event.target.value)}
                      className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-primary/40 focus:outline-none"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      required
                    />
                  </div>

<<<<<<< HEAD
                  {/* Start time */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
=======
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
<<<<<<< HEAD
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
=======
                      onChange={(event) => setStartTime(event.target.value)}
                      className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-primary/40 focus:outline-none"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      required
                    />
                  </div>

<<<<<<< HEAD
                  {/* End time */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
=======
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
<<<<<<< HEAD
                      onChange={(e) => setEndTime(e.target.value)}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/40 focus:outline-none text-sm font-medium transition-all"
=======
                      onChange={(event) => setEndTime(event.target.value)}
                      className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-primary/40 focus:outline-none"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      required
                    />
                  </div>
                </div>

<<<<<<< HEAD
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
=======
                {startTime && endTime && (
                  <p className="text-xs font-semibold text-slate-500">
                    Session duration:{" "}
                    <span className="text-primary">
                      {(() => {
                        const duration = sessionDurationMinutes(
                          `${startTime}:00`,
                          `${endTime}:00`
                        );
                        return duration > 0 ? formatDuration(duration) : "-";
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      })()}
                    </span>
                  </p>
                )}

                {formError && (
<<<<<<< HEAD
                  <p className="text-xs text-red-500 font-semibold px-1">
                    ⚠ {formError}
=======
                  <p className="px-1 text-xs font-semibold text-red-500">
                    {formError}
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                  </p>
                )}

                <Button
                  type="submit"
                  variant="hero"
<<<<<<< HEAD
                  className="rounded-xl w-full sm:w-auto px-8 shadow-md"
=======
                  className="w-full rounded-xl px-8 shadow-md sm:w-auto"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                  disabled={saving}
                >
                  {saving ? (
                    <>
<<<<<<< HEAD
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" /> Save Slot
=======
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Save Slot
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

<<<<<<< HEAD
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
=======
      {slotsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <Card className="rounded-3xl border-none bg-white p-10 text-center text-slate-400 shadow-sm">
          <AlarmClock className="mx-auto mb-3 h-10 w-10 text-slate-200" />
          <p className="font-semibold">No slots yet</p>
          <p className="mt-1 text-sm">
            Click <strong>Add Slot</strong> to open your availability for students.
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
<<<<<<< HEAD
          {/* Upcoming / available + booked slots */}
          <AnimatePresence>
            {futureSlots.length === 0 ? (
              <p className="text-sm text-slate-400 italic px-2">
                No future slots — add one above!
=======
          <AnimatePresence>
            {futureSlots.length === 0 ? (
              <p className="px-2 text-sm italic text-slate-400">
                No future slots. Add one above.
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              </p>
            ) : (
              futureSlots.map(renderSlotRow)
            )}
          </AnimatePresence>

<<<<<<< HEAD
          {/* Past slots — collapsible */}
          {pastSlots.length > 0 && (
            <div className="pt-4">
              <button
                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide hover:text-slate-600 transition-colors mb-3"
                onClick={() => setShowPast((v) => !v)}
=======
          {pastSlots.length > 0 && (
            <div className="pt-4">
              <button
                className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-600"
                onClick={() => setShowPast((currentValue) => !currentValue)}
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
<<<<<<< HEAD
                    className="overflow-hidden space-y-2"
=======
                    className="space-y-2 overflow-hidden"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                  >
                    {pastSlots.map(renderSlotRow)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

<<<<<<< HEAD
      {/* Summary row */}
=======
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
<<<<<<< HEAD
              value: slots.filter((s) => s.is_booked).length,
=======
              value: slots.filter((slot) => slot.is_booked).length,
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              color: "text-primary",
            },
            {
              label: "Available",
<<<<<<< HEAD
              value: futureSlots.filter((s) => !s.is_booked).length,
=======
              value: futureSlots.filter((slot) => !slot.is_booked).length,
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              color: "text-safe",
            },
          ].map((stat) => (
            <div
              key={stat.label}
<<<<<<< HEAD
              className="bg-white rounded-2xl p-3 border border-slate-100 text-center shadow-sm"
=======
              className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
<<<<<<< HEAD
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
=======
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
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
=======
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

  const fetchSessions = useCallback(async (volunteerId: string) => {
    setSessionsLoading(true);

    const { data: slotRows } = await supabase
      .from("time_slots")
      .select("id")
      .eq("volunteer_id", volunteerId);

    const slotIds = slotRows?.map((slot) => slot.id) || [];

    if (slotIds.length === 0) {
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

<<<<<<< HEAD
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
=======
    const { data, error: queryError } = await supabase
      .from("session_bookings")
      .select("*, time_slots(*)")
      .in("time_slot_id", slotIds);

    if (queryError) {
      console.error("Fetch sessions error:", queryError);
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

    const sortedSessions = ((data || []) as SessionWithSlot[]).sort((a, b) => {
      const firstDate = a.time_slots
        ? `${a.time_slots.slot_date}T${a.time_slots.start_time}`
        : a.created_at;
      const secondDate = b.time_slots
        ? `${b.time_slots.slot_date}T${b.time_slots.start_time}`
        : b.created_at;
      return firstDate.localeCompare(secondDate);
    });

    setSessions(sortedSessions);
    setSessionsLoading(false);
  }, []);

  const openSessionDetails = useCallback(async (session: SessionWithSlot) => {
    setSelectedSession(session);
    setNoteDraft(session.volunteer_notes ?? "");
    setStudentMoodEntries([]);
    setStudentSessionHistory([]);
    setContextError("");

    if (!session.student_alias_id) {
      setContextLoading(false);
      return;
    }

    setContextLoading(true);

    const [moodResult, historyResult] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("*")
        .eq("alias_id", session.student_alias_id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("session_bookings")
        .select("id, created_at, issue_type, mood_before, mood_after, notes, status, volunteer_notes, time_slots(slot_date, start_time, end_time)")
        .eq("student_alias_id", session.student_alias_id)
        .neq("id", session.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (moodResult.error) {
      console.error("Mood history fetch error:", moodResult.error);
    }

    if (historyResult.error) {
      console.error("Session history fetch error:", historyResult.error);
    }

    if (moodResult.error || historyResult.error) {
      setContextError(
        "Some context could not be loaded right now. You can still review the booking and save your note."
      );
    }

    setStudentMoodEntries((moodResult.data || []) as MoodEntry[]);
    setStudentSessionHistory((historyResult.data || []) as SessionHistoryItem[]);
    setContextLoading(false);
  }, []);

  const closeSessionDetails = useCallback(() => {
    setSelectedSession(null);
    setStudentMoodEntries([]);
    setStudentSessionHistory([]);
    setContextError("");
    setNoteDraft("");
    setContextLoading(false);
    setNoteSaving(false);
  }, []);

  const handleSaveNotes = useCallback(async () => {
    if (!selectedSession) return;

    setNoteSaving(true);
    const nextNote = noteDraft.trim() || null;

    console.log("[SaveNotes] Saving note for session:", selectedSession.id);

    const { error: saveError } = await supabase
      .from("session_bookings")
      .update({ volunteer_notes: nextNote })
      .eq("id", selectedSession.id);

    if (saveError) {
      console.error("[SaveNotes] Error:", saveError.code, saveError.message, saveError.details);
      const message =
        saveError.code === "42501"
          ? "Permission denied — add an UPDATE policy for anon on session_bookings in Supabase."
          : `Save failed: ${saveError.message}`;
      toast.error(message, { duration: 8000 });
      setNoteSaving(false);
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === selectedSession.id
          ? { ...session, volunteer_notes: nextNote }
          : session
      )
    );
    setSelectedSession((currentSession) =>
      currentSession ? { ...currentSession, volunteer_notes: nextNote } : currentSession
    );
    toast.success(nextNote ? "Volunteer notes saved." : "Volunteer notes cleared.");
    setNoteSaving(false);
  }, [noteDraft, selectedSession]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: volunteerRow, error: volunteerError } = await supabase
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
        .from("volunteers")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

<<<<<<< HEAD
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
=======
      if (volunteerError || !volunteerRow) {
        setError(
          "We could not find a volunteer account with that email. Please check it or register first."
        );
        return;
      }

      if (volunteerRow.verification_status !== "verified") {
        setError(
          "Your application is still under review. Please wait for an admin to verify your CV."
        );
        return;
      }

      setVolunteer(volunteerRow as VolunteerRecord);
      void fetchSessions(volunteerRow.id);
      setIsLoggedIn(true);
    } catch (loginError) {
      console.error("Volunteer login error:", loginError);
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const fetchRef = useRef(fetchSessions);
  fetchRef.current = fetchSessions;

  useEffect(() => {
    if (!volunteer) return;

    const intervalId = setInterval(() => {
      void fetchRef.current(volunteer.id);
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [volunteer]);

  const upcomingSessions = sessions.filter((session) => {
    if (!session.time_slots) return false;
    const status = computeStatus(
      session.time_slots.slot_date,
      session.time_slots.start_time,
      session.time_slots.end_time
    );
    return status === "upcoming" || status === "live";
  });

  const completedSessions = sessions.filter((session) => {
    if (!session.time_slots) return false;
    return (
      computeStatus(
        session.time_slots.slot_date,
        session.time_slots.start_time,
        session.time_slots.end_time
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
      ) === "completed"
    );
  });

<<<<<<< HEAD
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
=======
  const notesSavedCount = sessions.filter((session) => session.volunteer_notes?.trim()).length;
  const latestMood = studentMoodEntries[0] ?? null;
  const noteIsDirty =
    noteDraft.trim() !== (selectedSession?.volunteer_notes?.trim() ?? "");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-[2rem] border-none p-8 shadow-2xl">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-black">Volunteer Hub</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Enter your verified email to access your dashboard.
                </p>
              </div>

>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={email}
<<<<<<< HEAD
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
=======
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="volunteer@example.com"
                  className="w-full rounded-xl border-2 border-slate-100 px-4 py-3.5 transition-all focus:border-primary/40 focus:outline-none"
                  required
                />
                {error && <p className="px-2 text-xs font-medium text-red-500">{error}</p>}
                <Button
                  className="h-12 w-full rounded-xl shadow-lg"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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

<<<<<<< HEAD
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
=======
  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 font-display text-3xl font-black">
              Welcome, {volunteer?.name}
              {volunteer?.is_admin ? (
                <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  Super Admin
                </span>
              ) : (
                <span className="rounded-full bg-safe/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                  Verified Peer
                </span>
              )}
            </h1>
<<<<<<< HEAD
            <p className="text-slate-500 mt-2">
              {volunteer.is_admin
=======
            <p className="mt-2 text-slate-500">
              {volunteer?.is_admin
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                ? "Platform-wide oversight and volunteer governance."
                : "Manage your sessions and availability."}
            </p>
          </div>
<<<<<<< HEAD
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
=======

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                Total Sessions
              </p>
              <p className="text-xl font-black">{sessions.length}</p>
            </div>
<<<<<<< HEAD
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
=======
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live / Upcoming
              </p>
              <p className="text-xl font-black text-primary">{upcomingSessions.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Notes Saved
              </p>
              <p className="text-xl font-black text-primary">{notesSavedCount}</p>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        <div className="mb-8 flex w-fit gap-2 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
          {[
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
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab.key
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            >
              {tab.icon}
              {tab.label}
              {"badge" in tab && tab.badge ? (
                <span
<<<<<<< HEAD
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
=======
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                    }`}
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
<<<<<<< HEAD
          {/* ── SESSIONS TAB ── */}
=======
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
          {activeTab === "sessions" && (
            <motion.div
              key="sessions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
<<<<<<< HEAD
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                  {/* Upcoming / Live */}
                  <section>
                    <h2 className="text-lg font-black flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Sessions
                      {upcomingSessions.length > 0 && (
                        <span className="ml-1 text-xs font-black bg-primary text-white px-2 py-0.5 rounded-full">
=======
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Sessions
                      {upcomingSessions.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                          {upcomingSessions.length}
                        </span>
                      )}
                    </h2>
<<<<<<< HEAD
                    {sessionsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-32 bg-slate-100 rounded-3xl animate-pulse"
=======

                    {sessionsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="h-32 animate-pulse rounded-3xl bg-slate-100"
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                          />
                        ))}
                      </div>
                    ) : upcomingSessions.length === 0 ? (
<<<<<<< HEAD
                      <Card className="p-8 border-none shadow-sm rounded-3xl bg-white text-center text-slate-400">
                        <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                        <p className="font-semibold">No upcoming sessions</p>
                        <p className="text-sm mt-1">
                          Students will appear here once they book a slot with
                          you.
=======
                      <Card className="rounded-3xl border-none bg-white p-8 text-center text-slate-400 shadow-sm">
                        <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                        <p className="font-semibold">No upcoming sessions</p>
                        <p className="mt-1 text-sm">
                          Students will appear here once they book a slot with you.
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
<<<<<<< HEAD
                          <SessionCard key={session.id} session={session} />
=======
                          <SessionCard
                            key={session.id}
                            session={session}
                            onOpenDetails={openSessionDetails}
                          />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                        ))}
                      </div>
                    )}
                  </section>

<<<<<<< HEAD
                  {/* Completed */}
                  {completedSessions.length > 0 && (
                    <section>
                      <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Past Sessions
                        <span className="ml-1 text-xs font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
=======
                  {completedSessions.length > 0 && (
                    <section>
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Past Sessions
                        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-500">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                          {completedSessions.length}
                        </span>
                      </h2>
                      <div className="space-y-4">
                        {completedSessions.map((session) => (
<<<<<<< HEAD
                          <SessionCard key={session.id} session={session} />
=======
                          <SessionCard
                            key={session.id}
                            session={session}
                            onOpenDetails={openSessionDetails}
                          />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                        ))}
                      </div>
                    </section>
                  )}
                </div>

<<<<<<< HEAD
                {/* Sidebar */}
                <div className="space-y-4 text-sm">
                  <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-100">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
=======
                <div className="space-y-4 text-sm">
                  <Card className="rounded-3xl border-none bg-slate-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      <Shield className="h-5 w-5 text-safe" />
                      Volunteer Guidelines
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "Keep conversations confidential.",
                        "Do not ask for real identity.",
                        "Refer critical cases to professional help.",
<<<<<<< HEAD
                        "Join the room on time — students may be anxious.",
                        "Use the room ID sent in the 5-min alert banner.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
=======
                        "Join the room on time because students may be anxious.",
                        "Check the prep view before each session so the student does not need to repeat themselves.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-safe" />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
<<<<<<< HEAD
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
=======

                  <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 font-bold">
                      <Brain className="h-5 w-5 text-primary" />
                      Room Access
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Five minutes before a session begins, a banner appears on the
                      session card with the room ID. Use <strong>Join Now</strong> for live
                      sessions or <strong>Open Room</strong> shortly before the start time.
                    </p>
                  </Card>

                  <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 font-bold">
                      <FileText className="h-5 w-5 text-primary" />
                      CRM Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Notes Saved
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-800">
                          {notesSavedCount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Linked Histories
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-800">
                          {sessions.filter((session) => session.student_alias_id).length}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-slate-500">
                      Open any session to see the student's mood timeline, previous
                      sessions, and the volunteer note for that booking.
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                    </p>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

<<<<<<< HEAD
          {/* ── SLOTS TAB ── */}
          {activeTab === "slots" && (
=======
          {activeTab === "slots" && volunteer && (
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            <motion.div
              key="slots-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
<<<<<<< HEAD
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
=======
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                <div className="lg:col-span-2">
                  <ManageSlots volunteerId={volunteer.id} />
                </div>
                <div className="space-y-4 text-sm">
<<<<<<< HEAD
                  <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-100">
                    <h3 className="font-bold flex items-center gap-2 mb-4">
=======
                  <Card className="rounded-3xl border-none bg-slate-100 p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
                      <Shield className="h-5 w-5 text-safe" />
                      Slot Tips
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "Add slots at least 24 hours in advance.",
<<<<<<< HEAD
                        "You can't delete a booked slot — contact admin if needed.",
                        "Past slots are greyed out automatically.",
                        "Students can only book unbooked future slots.",
                        "Overlapping slots on the same day are prevented.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
=======
                        "Booked slots cannot be deleted from the dashboard.",
                        "Past slots are dimmed automatically.",
                        "Students can book only future slots that are still open.",
                        "Overlapping slots on the same day are prevented.",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-safe" />
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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

<<<<<<< HEAD
      {/* Briefing Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
=======
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
<<<<<<< HEAD
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
=======
              className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-xl font-black">
                    Session Briefing and Notes
                  </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={closeSessionDetails}>
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="max-h-[85vh] space-y-6 overflow-y-auto p-8">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-primary/10 bg-primary/5 p-6">
                      <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Consultation Summary
                      </p>
                      <div className="font-medium leading-relaxed text-slate-700">
                        {selectedSession.handoff_briefing ||
                          "The AI handoff briefing is still under development and will be avaliable soon . You can still review the student's note and save your volunteer note here."}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Student
                        </p>
                        <p className="font-bold">
                          {selectedSession.anonymous_name || "Anonymous"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Anonymous identity is preserved for safety.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Session
                        </p>
                        <p className="font-bold">{selectedSession.issue_type}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatSessionStamp(selectedSession)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Latest Feedback
                        </p>
                        <MoodBadge value={selectedSession.mood_after} />
                        <p className="mt-2 text-xs text-slate-500">
                          {getMoodMeta(selectedSession.mood_after)?.hint ||
                            "Post-session feedback has not been submitted yet."}
                        </p>
                      </div>
                    </div>

                    <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                      <h4 className="mb-3 flex items-center gap-2 font-bold">
                        <FileText className="h-5 w-5 text-primary" />
                        Student Context Note
                      </h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                        {selectedSession.notes ||
                          "The student did not leave an extra booking note."}
                      </p>
                    </Card>

                    <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="flex items-center gap-2 font-bold">
                            <FileText className="h-5 w-5 text-primary" />
                            Volunteer Notes
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Private continuity notes for this session.
                          </p>
                        </div>
                        <Button
                          variant="hero"
                          className="rounded-xl"
                          onClick={handleSaveNotes}
                          disabled={noteSaving}
                        >
                          {noteSaving ? (
                            <>
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              Saving
                            </>
                          ) : noteIsDirty ? (
                            <>
                              <Save className="mr-1.5 h-4 w-4" />
                              Save Notes
                            </>
                          ) : (
                            <>
                              <Save className="mr-1.5 h-4 w-4" />
                              Saved
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        placeholder="Capture themes, grounding techniques that helped, follow-up ideas, or context the next volunteer should remember."
                        className="min-h-[180px] rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-none focus-visible:ring-primary"
                      />
                      <p className="mt-3 text-xs text-slate-500">
                        These notes stay inside the volunteer dashboard for this booking.
                      </p>
                    </Card>

                    <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                      <h4 className="mb-4 flex items-center gap-2 font-bold">
                        <History className="h-5 w-5 text-primary" />
                        Previous Sessions and Notes
                      </h4>

                      {contextLoading ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading previous sessions...
                        </div>
                      ) : !selectedSession.student_alias_id ? (
                        <p className="text-sm text-slate-500">
                          This booking is not linked to a student alias yet, so prior history
                          cannot be shown.
                        </p>
                      ) : studentSessionHistory.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No earlier sessions were found for this student.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {studentSessionHistory.map((historySession) => (
                            <div
                              key={historySession.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {historySession.issue_type}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatSessionStamp(historySession)}
                                  </p>
                                </div>
                                <MoodBadge value={historySession.mood_after} />
                              </div>

                              {historySession.notes && (
                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                                  <span className="font-semibold text-slate-700">Student note:</span>{" "}
                                  {historySession.notes}
                                </p>
                              )}

                              {historySession.volunteer_notes ? (
                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                  <span className="font-semibold text-slate-700">
                                    Volunteer note:
                                  </span>{" "}
                                  {historySession.volunteer_notes}
                                </p>
                              ) : (
                                <p className="mt-2 text-xs italic text-slate-400">
                                  No volunteer note was saved for that session.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="rounded-3xl border-none bg-slate-100 p-6 shadow-sm">
                      <h4 className="mb-4 flex items-center gap-2 font-bold">
                        <HeartPulse className="h-5 w-5 text-primary" />
                        Patient Mood
                      </h4>

                      {contextLoading ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading mood history...
                        </div>
                      ) : !selectedSession.student_alias_id ? (
                        <p className="text-sm text-slate-500">
                          No linked alias was found for this booking, so mood history is unavailable.
                        </p>
                      ) : latestMood ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Latest Journal Entry
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <MoodBadge value={latestMood.mood} />
                              <span className="text-xs font-semibold text-slate-400">
                                {format(parseISO(latestMood.created_at), "MMM d • h:mm a")}
                              </span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                              {latestMood.note || "No note was added with this mood check-in."}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {studentMoodEntries.slice(1).map((entry) => (
                              <div
                                key={entry.id}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <MoodBadge value={entry.mood} />
                                  <span className="text-xs text-slate-400">
                                    {format(parseISO(entry.created_at), "MMM d • h:mm a")}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                    {entry.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No mood journal entries have been recorded for this student yet.
                        </p>
                      )}
                    </Card>

                    <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
                      <h4 className="mb-4 flex items-center gap-2 font-bold">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Quick Preparation
                      </h4>
                      <ul className="space-y-3 text-sm text-slate-600">
                        {[
                          "Start with the issue theme and any note the student already left.",
                          "Check the latest mood journal entry before the conversation starts.",
                          "Use previous volunteer notes so the student does not need to repeat their story.",
                        ].map((tip) => (
                          <li key={tip} className="flex gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {contextError && (
                      <Card className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-none">
                        <p className="text-sm font-semibold text-amber-800">{contextError}</p>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider italic text-slate-400">
                    This context is visible only in the volunteer dashboard. Maintain strict confidentiality.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={closeSessionDetails}
                    >
                      Close
                    </Button>
                    <Button
                      variant="hero"
                      className="rounded-2xl"
                      onClick={closeSessionDetails}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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

<<<<<<< HEAD
// ─── inline X icon ────────────────────────────────────────────────────────────
=======
>>>>>>> 6904773 (feat: SoulSync full codebase - volunteer dashboard, peer match, identity, email, mood tracker, admin panel)
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
