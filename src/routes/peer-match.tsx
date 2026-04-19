import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users, MessageCircle, Shield, Globe, Clock, Heart,
  Calendar, Phone, AlertTriangle, CheckCircle, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

import { sendChatMessage, updateChatMemory, generateVolunteerBriefing, updatePostSessionMemory } from "@/utils/chat.functions";

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

function PeerMatchPage() {
  const [step, setStep] = useState<BookingStep>("issue");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [anonName, setAnonName] = useState("");
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

  useEffect(() => {
    const fetchHistory = async () => {
      const aliasId = localStorage.getItem("soulSync_alias_id");
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
  }, []);

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
      setSlots((data as TimeSlot[]) || []);
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
      q: "Preferred language for chat?", 
      options: ["English", "Hindi", "Tamil/Telugu", "Mixed"] 
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
          data: { chatReport, surveyAnswers: { ...surveyAnswers, [questionId]: option } } 
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

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setLoading(true);

    // Mark slot as booked
    await supabase
      .from("time_slots")
      .update({ is_booked: true })
      .eq("id", selectedSlot.id);

    const newToken = crypto.randomUUID().slice(0, 8);
    const aliasId = localStorage.getItem("soulSync_alias_id");

    // Create booking
    await supabase.from("session_bookings").insert({
      time_slot_id: selectedSlot.id,
      anonymous_name: anonName.trim() || "Anonymous",
      student_alias_id: aliasId,
      issue_type: selectedIssue,
      notes: notes.trim() || null,
      meeting_token: newToken,
      handoff_briefing: sessionStorage.getItem("soulSync_handoffBriefing"),
    });

    setMeetingToken(newToken);
    setLoading(false);
    setStep("booked");
  };

  const handleFeedback = async () => {
    if (moodRating === null) return;
    setLoading(true);

    // Update booking with feedback
    await supabase
      .from("session_bookings")
      .update({
        mood_after: moodRating.toString(),
        notes: feedbackNotes.trim() ? notes + "\n\nUser Feedback: " + feedbackNotes : notes
      })
      .eq("meeting_token", meetingToken);

    // AI POST-SESSION PERSISTENCE
    const briefing = sessionStorage.getItem("soulSync_handoffBriefing") || "";
    const aliasId = localStorage.getItem("soulSync_alias_id");
    
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
    setStep("booked"); // Return to confirmation screen or dashboard
    toast.success("Thank you for your feedback! Your journey is being safely recorded.");
    setTimeout(() => {
        window.location.href = "/";
    }, 2000);
  };

  const resetFlow = () => {
    setStep("issue");
    setSelectedIssue("");
    setSelectedVolunteer(null);
    setSelectedSlot(null);
    setAnonName("");
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
          
          // Try to map top emotion to issue type
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
              Connect with an available peer supporter. Choose your issue, pick a supporter, and book a time, all anonymously.
            </p>
          </div>

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
                    <p className="mt-2 text-sm text-muted-foreground">
                      You are not alone. Reach out now — trained professionals are available 24/7.
                    </p>
                    <div className="mt-6 space-y-3">
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
            {/* Step 1: Select Issue */}
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

            {/* Step 2: Matching Survey */}
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
                ) : sortedVolunteers.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No supporters available for this topic right now.</p>
                    <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setStep("issue")}>
                      Try Another Topic
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {sortedVolunteers.map((vol, index) => (
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
                                <span key={exp} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  {exp}
                                </span>
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

            {/* Step 3: Time Slot Selection */}
            {step === "slots" && (
              <motion.div key="slots" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">
                    Available Slots — {selectedVolunteer?.name}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setStep("volunteers")}>
                    ← Back
                  </Button>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading time slots...</div>
                ) : slots.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No available slots for this supporter right now.</p>
                    <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setStep("volunteers")}>
                      Choose Another Supporter
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {/* Group by date */}
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
                )}
              </motion.div>
            )}

            {/* Step 4: Confirm Booking */}
            {step === "confirm" && selectedSlot && selectedVolunteer && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-lg font-semibold">Confirm Your Booking</h2>
                    <Button variant="ghost" size="sm" onClick={() => setStep("slots")}>
                      ← Back
                    </Button>
                  </div>

                  {/* Summary */}
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
                      <span className="font-medium">
                        {format(new Date(selectedSlot.slot_date + "T00:00:00"), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">
                        {selectedSlot.start_time.slice(0, 5)} – {selectedSlot.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Anonymous name & notes */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Display Name <span className="text-muted-foreground font-normal">(anonymous is fine)</span>
                      </label>
                      <input
                        value={anonName}
                        onChange={(e) => setAnonName(e.target.value)}
                        placeholder="Anonymous"
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Anything you&apos;d like the supporter to know? <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="E.g., I've been feeling overwhelmed with exams..."
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-safe/5 rounded-lg p-3">
                    <Shield className="h-4 w-4 text-safe shrink-0" />
                    Your identity is fully protected. The volunteer only sees your display name.
                  </div>

                  <Button
                    variant="hero"
                    className="w-full mt-6 rounded-xl"
                    onClick={handleBooking}
                    disabled={loading}
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Booked Success */}
            {step === "booked" && (
              <motion.div key="booked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-safe/10 mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-safe" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">Session Booked! 🎉</h2>
                  <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                    Your anonymous support session with <strong>{selectedVolunteer?.name}</strong> has been confirmed.
                  </p>
                  <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm max-w-xs mx-auto space-y-1">
                    <p>
                      📅 {selectedSlot && format(new Date(selectedSlot.slot_date + "T00:00:00"), "MMMM d, yyyy")}
                    </p>
                    <p>
                      🕐 {selectedSlot?.start_time.slice(0, 5)} – {selectedSlot?.end_time.slice(0, 5)}
                    </p>
                  </div>
                  
                  {/* Call Preference */}
                  <div className="mt-6 p-4 border rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Call Preference</p>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setCallType("voice")}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${callType === 'voice' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                       >
                         Audio Only
                       </button>
                       <button 
                        onClick={() => setCallType("video")}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${callType === 'video' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                       >
                         Video Call
                       </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Your room is ready. Everything is private and anonymous.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 justify-center">
                    {!hasJoined ? (
                      <Button 
                        variant="hero" 
                        className="rounded-xl h-14 text-lg shadow-xl" 
                        onClick={() => {
                          setHasJoined(true);
                          window.open(`https://meet.jit.si/SoulSync-Session-${meetingToken}#config.startWithVideoMuted=${callType === 'voice'}&config.startWithAudioMuted=false`, '_blank');
                        }}
                      >
                        <Phone className="h-5 w-5 mr-2" /> Start Anonymous Call
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="hero" 
                          className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 h-14 text-lg" 
                          onClick={() => setStep("feedback")}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" /> I've Finished my Session
                        </Button>
                        <p className="text-[10px] text-muted-foreground italic">
                          Session in progress in a separate tab. Click above when done.
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="rounded-xl" onClick={resetFlow}>
                      Book Another
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 6: Feedback */}
            {step === "feedback" && (
              <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 text-center bg-white shadow-xl rounded-[2.5rem]">
                   <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2">How do you feel now?</h2>
                  <p className="text-sm text-slate-500 mb-8">Your feedback helps us measure the impact of our peer supporters.</p>
                  
                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMoodRating(num)}
                        className={`h-12 w-12 rounded-xl border-2 transition-all font-bold flex items-center justify-center ${
                          moodRating === num 
                            ? "border-primary bg-primary text-white shadow-lg scale-110" 
                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {num === 1 ? "😞" : num === 2 ? "😕" : num === 3 ? "😐" : num === 4 ? "🙂" : "😊"}
                      </button>
                    ))}
                  </div>

                  <div className="text-left mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Additional Notes</label>
                    <textarea 
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      placeholder="Optional: How was your experience?"
                      className="w-full mt-2 rounded-2xl border-2 border-slate-100 p-4 text-sm focus:border-primary/50 outline-none resize-none h-24"
                    />
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

          {/* How it works */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Anonymous", desc: "Your identity stays protected throughout" },
              { icon: Users, title: "Peer Supporters", desc: "Connect with active volunteers who are available to help" },
              { icon: Clock, title: "30-Min Sessions", desc: "Focused, structured support conversations" },
              { icon: Heart, title: "You're Not Alone", desc: "1000s of students have found support here" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
