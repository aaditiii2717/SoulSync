import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users, MessageCircle, Shield, Globe, Clock, Heart,
  Calendar, Phone, AlertTriangle, CheckCircle, ChevronRight, Navigation
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { sendChatMessage, updateChatMemory, generateVolunteerBriefing, updatePostSessionMemory } from "@/utils/chat.functions";
import { sendEmail } from "@/lib/email";
import { CrisisMap } from "@/components/CrisisMap";

export const Route = createFileRoute("/peer-match")({
  component: PeerMatchPage,
});

const issueTypes = [
  { id: "anxiety", label: "Anxiety & Stress", icon: "😰" },
  { id: "loneliness", label: "Loneliness & Isolation", icon: "😔" },
  { id: "academic", label: "Academic Pressure", icon: "📚" },
  { id: "relationships", label: "Relationship Issues", icon: "💔" },
  { id: "identity", label: "Identity & Self-Worth", icon: "🪞" },
  { id: "general", label: "Just Need to Talk", icon: "💬" },
];

type BookingStep = "issue" | "survey" | "volunteers" | "slots" | "confirm" | "booked" | "feedback";

interface Volunteer {
  id: string;
  name: string;
  expertise: string[];
  bio: string | null;
  languages: string[];
}

interface TimeSlot {
  id: string;
  volunteer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface Booking {
  id: string;
  student_alias_id?: string | null;
  meeting_token: string | null;
  anonymous_name: string;
  issue_type: string;
  status: string;
  notes: string | null;
  time_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
    volunteers: {
      id: string;
      name: string;
    } | null;
  } | null;
}

type VolunteerBriefingAnswers = Record<string, string> & {
  intensity: string;
  need: string;
  style: string;
  priority: string;
};


// ─── MyBookingCard ────────────────────────────────────────────────────────────
// Reads room credentials from the DB and displays them persistently.

function MyBookingCard({ booking }: { booking: Booking }) {
  const slot = booking.time_slots;
  const volunteer = slot?.volunteers;

  if (!slot) return null;

  const startDt = parseISO(`${slot.slot_date}T${slot.start_time}`);
  const endDt   = parseISO(`${slot.slot_date}T${slot.end_time}`);
  const now = new Date();
  const isLive = now >= startDt && now < endDt;
  const isUpcoming = now < startDt;

  const roomId = booking.id
    ? `SoulSync-Session-${booking.id}`
    : null;

  const joinUrl = roomId ? `https://meet.jit.si/${roomId}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 rounded-2xl border-2 p-5 ${
        isLive
          ? "bg-red-50 border-red-300 shadow-md"
          : "bg-primary/5 border-primary/30"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              isLive ? "bg-red-100" : "bg-primary/10"
            }`}
          >
            {isLive ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            ) : (
              <Calendar className="h-5 w-5 text-primary" />
            )}
          </div>

          <div>
            <p
              className={`text-xs font-black uppercase tracking-widest mb-0.5 ${
                isLive ? "text-red-600" : "text-primary"
              }`}
            >
              {isLive ? "🔴 Session Live Now" : "Your Booked Session"}
            </p>
            <p className="text-sm font-bold text-slate-800">
              {volunteer?.name
                ? `Peer: ${volunteer.name}`
                : "Peer Support Session"}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
            isLive
              ? "bg-red-100 text-red-600"
              : isUpcoming
              ? "bg-primary/10 text-primary"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {isLive ? "Live" : isUpcoming ? "Upcoming" : "Active"}
        </span>
      </div>

      {/* Date / time row */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {format(startDt, "EEE, MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
        </span>
        {booking.issue_type && (
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-slate-400" />
            {booking.issue_type}
          </span>
        )}
      </div>

      {/* Room credentials — always visible, read from DB */}
      {roomId ? (
        <div
          className={`mt-4 rounded-xl p-4 ${
            isLive ? "bg-red-100/60" : "bg-white/70"
          } border ${isLive ? "border-red-200" : "border-primary/10"}`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Room Credentials
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-500">Room ID</p>
              <p className="font-mono font-bold text-sm text-slate-800 break-all">
                {roomId}
              </p>
            </div>
            {joinUrl && (
              <Button
                variant={isLive ? "hero" : "outline"}
                size="sm"
                className={`rounded-xl shrink-0 ${isLive ? "animate-pulse shadow-md" : "border-primary/30"}`}
                onClick={() => window.open(joinUrl, "_blank")}
              >
                {isLive ? (
                  <>
                    <MessageCircle className="h-4 w-4 mr-1.5" /> Join Now
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-1.5" /> Open Room
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400 italic">
          Room ID not yet assigned — check back closer to your session time.
        </p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PeerMatchPage() {
  const [step, setStep] = useState<BookingStep>("issue");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [anonName, setAnonName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [meetingToken, setMeetingToken] = useState("");
  const [callType, setCallType] = useState<"video" | "voice">("voice");
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});
  const [currentSurveyIdx, setCurrentSurveyIdx] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [primaryVolunteerId, setPrimaryVolunteerId] = useState<string | null>(null);

  // ── Guaranteed identity
  const { aliasId, profileExists, isLoading: identityLoading } = useAnonymousIdentity();

  // ── persistent booking state (reads from DB, survives navigation) ──────────
  const [myBooking, setMyBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  const fetchMyBooking = useCallback(async (currentAliasId?: string | null) => {
    setBookingLoading(true);

    const storedBookingId = localStorage.getItem("soulSync_last_booking_id");
    
    if (!storedBookingId) {
      setBookingLoading(false);
      return;
    }

    const SELECT_FIELDS = `
      id,
      student_alias_id,
      meeting_token,
      anonymous_name,
      issue_type,
      status,
      notes,
      time_slots (
        slot_date,
        start_time,
        end_time,
        volunteers (
          id,
          name
        )
      )
    `;

    const { data: booking, error } = await supabase
      .from("session_bookings")
      .select(SELECT_FIELDS)
      .eq("id", storedBookingId)
      .single();

    if (error) {
      console.error("fetchMyBooking:", error);
      setBookingLoading(false);
      return;
    }

    // Backfill student_alias_id if it was missing 
    const effectiveAlias = currentAliasId ?? localStorage.getItem("soulSync_alias_id");
    if (booking && !(booking as any).student_alias_id && effectiveAlias) {
      console.log("[fetchMyBooking] Backfilling student_alias_id for booking", storedBookingId);
      const { error: backfillError } = await supabase
        .from("session_bookings")
        .update({ student_alias_id: effectiveAlias })
        .eq("id", storedBookingId);

      if (backfillError) {
        console.error("[fetchMyBooking] Backfill failed:", backfillError);
      } else {
        (booking as any).student_alias_id = effectiveAlias;
      }
    }

    const now = new Date();
    const slot = booking?.time_slots;
    if (slot && parseISO(`${slot.slot_date}T${slot.end_time}`) > now) {
      setMyBooking(booking);
    } else {
      setMyBooking(null);
    }
    
    setBookingLoading(false);
  }, []);

  useEffect(() => {
    fetchMyBooking();
  }, [fetchMyBooking]);

  useEffect(() => {
    if (aliasId) {
      fetchMyBooking(aliasId);
    }
  }, [aliasId, fetchMyBooking]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!aliasId) return;

      const { data } = await supabase
        .from("session_bookings")
        .select("volunteer_id")
        .eq("student_alias_id", aliasId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data[0]) {
        setPrimaryVolunteerId(data[0].volunteer_id);
      }
    };
    fetchHistory();
  }, [aliasId]);

  // Fetch volunteers matching the issue
  const fetchVolunteers = async (issueLabel: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("volunteers")
        .select("id, name, expertise, bio, languages")
        .eq("is_active", true)
        .contains("expertise", [issueLabel]);
      
      if (error) throw error;
      setVolunteers((data as Volunteer[]) || []);
    } catch (err) {
      console.error("Fetch volunteers error:", err);
      toast.error("Could not find matching peers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available slots for a volunteer
  const fetchSlots = async (volunteerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .eq("is_booked", false)
        .gte("slot_date", new Date().toISOString().split("T")[0])
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (error) throw error;

      let fetchedSlots = (data as TimeSlot[]) || [];

      // Google Solution Challenge - Demo Slot Fallback
      if (fetchedSlots.length === 0) {
         const tomorrow = new Date();
         tomorrow.setDate(tomorrow.getDate() + 1);
         const demoSlotDate = tomorrow.toISOString().split("T")[0];
         
         const { data: insertedSlot, error: insertError } = await supabase
           .from("time_slots")
           .insert({
             volunteer_id: volunteerId,
             slot_date: demoSlotDate,
             start_time: "10:00:00",
             end_time: "11:00:00",
             is_booked: false
           })
           .select()
           .single();
           
         if (!insertError && insertedSlot) {
            fetchedSlots = [insertedSlot];
         }
      }
      
      setSlots(fetchedSlots);
    } catch (err) {
      console.error("Fetch slots error:", err);
      toast.error("Could not retrieve availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSelect = (issueId: string) => {
    setSelectedIssue(issueId);
    const issue = issueTypes.find((i) => i.id === issueId);
    if (issue) fetchVolunteers(issue.label);
    setStep("survey");
  };

  const surveyQuestions = [
    { 
      id: "intensity", 
      q: "How heavy is your heart today?", 
      options: ["1 - Very Light", "3 - Slightly Heavy", "5 - Very Heavy", "7 - Overwhelmed"] 
    },
    { 
      id: "need", 
      q: "What do you need most right now?", 
      options: ["A good listener", "Practical advice", "Just a distraction", "Connection"] 
    },
    { 
      id: "style", 
      q: "What's your preferred approach?", 
      options: ["Empathetic & Soft", "Direct & Practical", "Casual & Friendly"] 
    },
    { 
      id: "peer_type", 
      q: "Do you prefer a peer who is a...", 
      options: ["Fellow Student", "Working Professional", "Senior Student", "No preference"] 
    },
    { 
      id: "language", 
      q: "In which language are you most comfortable expressing your feelings?", 
      options: ["English", "Hindi", "Tamil", "Telugu", "Mixed / Hinglish"] 
    },
    { 
      id: "depth", 
      q: "Today, do you want to...", 
      options: ["Keep it light", "Deep dive into feelings", "Solve a problem"] 
    },
    { 
      id: "panic", 
      q: "Are you feeling overwhelmed to a point of panic?", 
      options: ["Not at all", "A little bit", "Yes, significantly"] 
    },
    { 
      id: "priority", 
      q: "What's most important in your match?", 
      options: ["Shared Experience", "Expertise Level", "Immediate Availability"] 
    }
  ];

  const handleSurveyOption = (option: string) => {
    const questionId = surveyQuestions[currentSurveyIdx].id;
    setSurveyAnswers(prev => ({ ...prev, [questionId]: option }));
    
    if (currentSurveyIdx < surveyQuestions.length - 1) {
      setCurrentSurveyIdx(prev => prev + 1);
    } else {
      setStep("volunteers");
      // Background generate the briefing
      const chatReportStr = sessionStorage.getItem("soulSync_chatReport");
      if (chatReportStr) {
        const chatReport = JSON.parse(chatReportStr);
        generateVolunteerBriefing({ 
          data: { chatReport, surveyAnswers: { ...surveyAnswers, [questionId]: option } as VolunteerBriefingAnswers } 
        }).then(({ briefing }) => {
          sessionStorage.setItem("soulSync_handoffBriefing", briefing);
        });
      }
    }
  };

  // Improved volunteer matching logic
  const sortedVolunteers = [...volunteers].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Priority sorting: Primary Volunteer first, then Match Score
    if (a.id === primaryVolunteerId) scoreA += 100;
    if (b.id === primaryVolunteerId) scoreB += 100;
    
    // Simple matching heuristic
    if (surveyAnswers.style?.includes("Direct") && a.bio?.toLowerCase().includes("practical")) scoreA += 2;
    if (surveyAnswers.style?.includes("Empathetic") && a.bio?.toLowerCase().includes("empathy")) scoreA += 2;
    
    return scoreB - scoreA;
  });

  const handleVolunteerSelect = (vol: Volunteer) => {
    setSelectedVolunteer(vol);
    fetchSlots(vol.id);
    setStep("slots");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("confirm");
  };

  const handleBookingSafe = async () => {
    if (!selectedSlot || !selectedVolunteer || loading) return;

    if (!aliasId) {
      console.warn("[handleBookingSafe] aliasId is null — booking will proceed without alias link.");
    }

    setLoading(true);

    try {
      // 1. Transaction-like slot reservation
      const { data: reservedSlot, error: reserveError } = await supabase
        .from("time_slots")
        .update({ is_booked: true })
        .eq("id", selectedSlot.id)
        .eq("is_booked", false)
        .select("id")
        .maybeSingle();

      if (reserveError) throw reserveError;

      if (!reservedSlot) {
        toast.error("That slot was just taken. Please choose another one.");
        await fetchSlots(selectedVolunteer.id);
        setStep("slots");
        return;
      }

      const newToken = crypto.randomUUID().slice(0, 8);
      const selectedLanguage = surveyAnswers.language?.replace("Mixed / ", "") || "English";

      const bookingPayload = {
        time_slot_id: selectedSlot.id,
        volunteer_id: selectedVolunteer.id,
        anonymous_name: anonName.trim() || "Anonymous",
        issue_type: selectedIssue,
        language_preference: selectedLanguage,
        notes: notes.trim() || null,
        meeting_token: newToken,
        handoff_briefing: sessionStorage.getItem("soulSync_handoffBriefing"),
        student_alias_id: profileExists ? aliasId : null,
      };

      const { data: newBooking, error: insertError } = await supabase
        .from("session_bookings")
        .insert(bookingPayload)
        .select()
        .single();

      if (insertError) {
        // Roll back the slot reservation
        await supabase
          .from("time_slots")
          .update({ is_booked: false })
          .eq("id", selectedSlot.id);
        throw insertError;
      }

      setMeetingToken(newToken);

      if (newBooking) {
        localStorage.setItem("soulSync_last_booking_id", newBooking.id);
      }

      setMyBooking({
        id: newBooking ? newBooking.id : "pending",
        meeting_token: newToken,
        anonymous_name: anonName.trim() || "Anonymous",
        issue_type: selectedIssue,
        status: "pending",
        notes: notes.trim() || null,
        time_slots: {
          slot_date: selectedSlot.slot_date,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          volunteers: { id: selectedVolunteer.id, name: selectedVolunteer.name },
        },
      });

      setStep("booked");
      toast.success("Session booked successfully.");

      const roomId = newBooking ? newBooking.id : newToken;

      if (userEmail.trim()) {
        void sendEmail({
          data: {
            to: userEmail.trim(),
            subject: "Your peer support session is confirmed",
            html: `<h3>Session Confirmed</h3>
            <p>Your session with <strong>${selectedVolunteer.name}</strong> is scheduled for <strong>${selectedSlot.slot_date}</strong> at <strong>${selectedSlot.start_time.slice(0, 5)}</strong>.</p>
            <p>Room ID: <strong>SoulSync-Session-${roomId}</strong></p>
            <p><a href="https://meet.jit.si/SoulSync-Session-${roomId}">Click to join the meeting at the scheduled time</a></p>`
          }
        }).catch(console.error);
      }

      const { data: volunteerEmailRow } = await supabase
        .from("volunteers")
        .select("email")
        .eq("id", selectedVolunteer.id)
        .single();

      if (volunteerEmailRow?.email) {
        void sendEmail({
          data: {
            to: volunteerEmailRow.email,
            subject: "You have a new session booking",
            html: `<h3>New Session Booking</h3>
            <p><strong>${anonName.trim() || "Anonymous"}</strong> has booked a session with you on <strong>${selectedSlot.slot_date}</strong> at <strong>${selectedSlot.start_time.slice(0, 5)}</strong>.</p>
            <p><a href="${window.location.origin}/volunteer/dashboard">Click here to log into your dashboard and view details</a></p>`
          }
        }).catch(console.error);
      }
    } catch (bookingError: any) {
      console.error("Booking error:", bookingError);
      toast.error(bookingError?.message || "Failed to confirm the booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (moodRating === null) return;
    setLoading(true);

    await supabase
      .from("session_bookings")
      .update({
        mood_after: moodRating.toString(),
        notes: feedbackNotes.trim() ? notes + "\n\nUser Feedback: " + feedbackNotes : notes
      })
      .eq("meeting_token", meetingToken);

    const briefing = sessionStorage.getItem("soulSync_handoffBriefing") || "";

    if (aliasId) {
      updatePostSessionMemory({ 
        data: { 
          aliasId, 
          briefing, 
          feedback: feedbackNotes || "Session completed successfully." 
        } 
      }).catch(console.error);
    }

    setLoading(false);
    setStep("booked");
    toast.success("Thank you for your feedback! Your journey is being safely recorded.");
    setTimeout(() => {
        window.location.href = "/";
    }, 2000);
  };

  const getGoogleCalendarUrl = () => {
    if (!selectedSlot || !selectedVolunteer) return "";

    const dateStr = selectedSlot.slot_date.replace(/-/g, "");
    const startTimeStr = selectedSlot.start_time.replace(/:/g, "");
    const endTimeStr = selectedSlot.end_time.replace(/:/g, "");

    const start = `${dateStr}T${startTimeStr}`;
    const end = `${dateStr}T${endTimeStr}`;
    
    const roomId = myBooking?.id && myBooking.id !== "pending" ? myBooking.id : meetingToken;
    const meetUrl = `https://meet.jit.si/SoulSync-Session-${roomId}`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "SoulSync Peer Support Session 🌿",
      dates: `${start}/${end}`,
      details: `Your anonymous peer support session with ${selectedVolunteer.name}.\n\nJoin Link: ${meetUrl}\n\nSession ID: ${roomId}`,
      location: meetUrl,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const resetFlow = () => {
    setStep("issue");
    setSelectedIssue("");
    setSelectedVolunteer(null);
    setSelectedSlot(null);
    setAnonName("");
    setUserEmail("");
    setNotes("");
    setHasJoined(false);
    setMoodRating(null);
    setFeedbackNotes("");
    sessionStorage.removeItem("soulSync_chatReport");
  };

  // Load chat report from session storage on mount
  useEffect(() => {
    const savedReport = sessionStorage.getItem("soulSync_chatReport");
    if (savedReport) {
      try {
        const report = JSON.parse(savedReport);
        if (report.summary) {
          setNotes(`--- AI Supported Chat Report ---\n${report.summary}\n\nChat Preview:\n${report.chatPreview}\n-----------------------------`);
          
          const topEmotion = report.emotions?.[0]?.toLowerCase();
          if (topEmotion === "nervousness" || topEmotion === "fear" || topEmotion === "anxiety") {
            setSelectedIssue("anxiety");
          } else if (topEmotion === "loneliness" || topEmotion === "sadness") {
            setSelectedIssue("loneliness");
          }
        }
      } catch (err) {
        console.error("Failed to parse chat report", err);
      }
    }
  }, []);

  const currentIssue = issueTypes.find((i) => i.id === selectedIssue);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Users className="h-4 w-4" />
              Anonymous Peer Support
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              Book a <span className="text-gradient">Support Session</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Connect with an available peer supporter. Your safety is ensured by the **SoulSync Team** review process.
            </p>
          </div>

          {/* ── My Booked Session card (reads from DB, persistent) ── */}
          {bookingLoading || identityLoading ? (
            <div className="mb-8 h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ) : myBooking ? (
            <MyBookingCard booking={myBooking} />
          ) : (
            <div className="mb-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">No upcoming session</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Book a session below — your room ID will appear here automatically.
                </p>
              </div>
            </div>
          )}

          {/* Crisis Escalation Banner */}
          <div className="mb-8 rounded-xl border-2 border-alert/30 bg-alert/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-alert shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">In immediate danger or crisis?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                If you&apos;re experiencing a mental health emergency, please reach out to a professional immediately.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 rounded-xl"
              onClick={() => setShowCrisis(true)}
            >
              <Phone className="h-3.5 w-3.5 mr-1" />
              Get Help Now
            </Button>
          </div>

          {/* Crisis Modal */}
          <AnimatePresence>
            {showCrisis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setShowCrisis(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-card rounded-2xl p-8 max-w-md w-full shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-alert/10 mx-auto mb-4">
                      <Phone className="h-8 w-8 text-alert" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Crisis Helplines</h2>
                    <p className="mt-2 text-sm text-muted-foreground mb-6">
                      You are not alone. Reach out now — trained professionals are available 24/7.
                    </p>

                    <div className="mb-8">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                        <Navigation className="h-3.5 w-3.5" />
                        Nearby Safety Support
                      </p>
                      <CrisisMap />
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: "iCall (India)", number: "9152987821" },
                        { name: "Vandrevala Foundation", number: "1860-2662-345" },
                        { name: "AASRA", number: "9820466726" },
                        { name: "Crisis Text Line", number: "Text HOME to 741741" },
                      ].map((line) => (
                        <a
                          key={line.name}
                          href={`tel:${line.number.replace(/\D/g, "")}`}
                          className="flex items-center justify-between rounded-xl border p-3 hover:bg-accent transition-colors"
                        >
                          <span className="text-sm font-medium">{line.name}</span>
                          <span className="text-sm text-primary font-mono">{line.number}</span>
                        </a>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-6 rounded-xl w-full"
                      onClick={() => setShowCrisis(false)}
                    >
                      Close
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8 text-xs">
            {[
              { key: "issue", label: "Issue" },
              { key: "volunteers", label: "Supporter" },
              { key: "slots", label: "Time Slot" },
              { key: "confirm", label: "Confirm" },
            ].map((s, i) => {
              const steps: BookingStep[] = ["issue", "volunteers", "slots", "confirm", "booked", "feedback"];
              const currentIdx = steps.indexOf(step);
              const stepIdx = steps.indexOf(s.key as BookingStep);
              const isActive = stepIdx <= currentIdx;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  <span
                    className={`rounded-full px-3 py-1 font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Flow Steps */}
          <AnimatePresence mode="wait">
            {step === "issue" && (
              <motion.div key="issue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="font-display text-lg font-semibold mb-4 text-center">
                  What would you like support with?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issueTypes.map((issue) => (
                    <Card
                      key={issue.id}
                      className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all text-center"
                      onClick={() => handleIssueSelect(issue.id)}
                    >
                      <span className="text-3xl">{issue.icon}</span>
                      <p className="mt-2 text-sm font-medium">{issue.label}</p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "survey" && (
              <motion.div key="survey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="p-8 bg-white shadow-xl rounded-[2.5rem] border-none">
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Matching Survey
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {currentSurveyIdx + 1} / {surveyQuestions.length}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSurveyIdx + 1) / surveyQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-display font-black mb-8 leading-tight">
                    {surveyQuestions[currentSurveyIdx].q}
                  </h2>

                  <div className="grid gap-3">
                    {surveyQuestions[currentSurveyIdx].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSurveyOption(opt)}
                        className="w-full p-5 rounded-2xl border-2 border-slate-100 text-left font-bold transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                    <Button 
                      variant="ghost" 
                      className="text-xs text-slate-400 font-bold hover:bg-transparent"
                      onClick={() => currentSurveyIdx > 0 && setCurrentSurveyIdx(prev => prev - 1)}
                    >
                      Back to previous
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === "volunteers" && (
              <motion.div key="volunteers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">
                    Available Supporters for {currentIssue?.label}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setStep("issue")}>
                    ← Back
                  </Button>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading supporters...</div>
                ) : (
                  <div className="space-y-3">
                    {sortedVolunteers.map((vol) => (
                      <Card
                        key={vol.id}
                        className="p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                        onClick={() => handleVolunteerSelect(vol)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-wellness text-primary-foreground font-display font-bold text-lg shrink-0">
                            {vol.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-semibold">{vol.name}</h3>
                              <span className="inline-flex items-center gap-1 rounded-full bg-safe/10 px-2 py-0.5 text-xs text-safe">
                                <Shield className="h-3 w-3" /> Available
                              </span>
                            </div>
                            {vol.bio && (
                              <p className="text-sm text-muted-foreground mt-1">{vol.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {vol.expertise.map((exp) => (
                                <span key={exp} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{exp}</span>
                              ))}
                              {vol.languages.map((lang) => (
                                <span key={lang} className="rounded-full bg-calm/10 px-2 py-0.5 text-xs text-calm">
                                  <Globe className="inline h-3 w-3 mr-0.5" />{lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === "slots" && (
              <motion.div key="slots" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">Available Slots — {selectedVolunteer?.name}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setStep("volunteers")}>← Back</Button>
                </div>
                <div className="space-y-3">
                  {Object.entries(
                    slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
                      const date = slot.slot_date;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(slot);
                      return acc;
                    }, {})
                  ).map(([date, dateSlots]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dateSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <Clock className="h-4 w-4 mr-1.5" />
                            {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "confirm" && selectedSlot && selectedVolunteer && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-lg font-semibold">Confirm Your Booking</h2>
                    <Button variant="ghost" size="sm" onClick={() => setStep("slots")}>← Back</Button>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Supporter</span>
                      <span className="font-medium">{selectedVolunteer.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Topic</span>
                      <span className="font-medium">{currentIssue?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{format(new Date(selectedSlot.slot_date + "T00:00:00"), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{selectedSlot.start_time.slice(0, 5)} – {selectedSlot.end_time.slice(0, 5)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Display Name</label>
                      <input
                        value={anonName}
                        onChange={(e) => setAnonName(e.target.value)}
                        placeholder="Anonymous"
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email (optional)</label>
                      <input
                        value={userEmail}
                        type="email"
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="I've been feeling overwhelmed with exams..."
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none h-20"
                      />
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full mt-6 rounded-xl"
                    onClick={handleBookingSafe}
                    disabled={loading}
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </Card>
              </motion.div>
            )}

            {step === "booked" && (
              <motion.div key="booked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-safe/10 mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-safe" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">Session Booked! 🎉</h2>
                  <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                    Your session with <strong>{selectedVolunteer?.name}</strong> has been confirmed.
                  </p>
                  
                  <div className="mt-6 flex flex-col gap-3 justify-center">
                    {!hasJoined ? (
                      <Button 
                        variant="hero" 
                        className="rounded-xl h-14 text-lg shadow-xl" 
                        onClick={() => {
                          setHasJoined(true);
                          const roomIdToJoin = myBooking?.id && myBooking.id !== "pending" ? myBooking.id : meetingToken;
                          window.open(`https://meet.jit.si/SoulSync-Session-${roomIdToJoin}`, '_blank');
                        }}
                      >
                        <Phone className="h-5 w-5 mr-2" /> Start Anonymous Call
                      </Button>
                    ) : (
                      <Button 
                        variant="hero" 
                        className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 h-14 text-lg" 
                        onClick={() => setStep("feedback")}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" /> I've Finished my Session
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-primary/30 text-primary hover:bg-primary/5" 
                      onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Add to Google Calendar
                    </Button>
                    <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-slate-600" onClick={resetFlow}>
                      Return to Start
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === "feedback" && (
              <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 text-center bg-white shadow-xl rounded-[2.5rem]">
                   <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2">How do you feel now?</h2>
                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMoodRating(num)}
                        className={`h-12 w-12 rounded-xl border-2 transition-all font-bold flex items-center justify-center ${
                          moodRating === num ? "border-primary bg-primary text-white" : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        {num === 1 ? "😞" : num === 2 ? "😕" : num === 3 ? "😐" : num === 4 ? "🙂" : "😊"}
                      </button>
                    ))}
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl"
                    disabled={moodRating === null || loading}
                    onClick={handleFeedback}
                  >
                    {loading ? "Saving..." : "Submit Feedback"}
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
