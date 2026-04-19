import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UserCheck, Shield, Heart, Clock, MessageCircle,
  CheckCircle, BookOpen, Trash2, AlertTriangle, Upload, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/volunteer/")({
  component: VolunteerPage,
});

interface SlotEntry {
  date: string;
  startTime: string;
  endTime: string;
}

function formatVolunteerErrorMessage(message: string) {
  if (message.includes("volunteers_email_key")) {
    return "This email is already registered as a volunteer.";
  }

  if (message.includes("row-level security policy")) {
    return "The volunteer profile could not be saved because the database rejected the request. Run the latest Supabase migration and try again.";
  }

  return message;
}

function VolunteerPage() {
  const [formState, setFormState] = useState<"register" | "slots" | "submitted">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotEntry[]>([{ date: "", startTime: "10:00", endTime: "10:30" }]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  const expertiseOptions = [
    "Anxiety & Stress",
    "Loneliness & Isolation",
    "Academic Pressure",
    "Relationship Issues",
    "Identity & Self-Worth",
    "General Support",
  ];

  const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Other"];

  const toggleExpertise = (opt: string) => {
    setExpertise((prev) => (prev.includes(opt) ? prev.filter((e) => e !== opt) : [...prev, opt]));
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || expertise.length === 0) return;
    setLoading(true);
    setErrorMessage("");

    const newVolunteerId = crypto.randomUUID();
    const normalizedEmail = email.trim().toLowerCase();
    const selectedLanguages = languages.length > 0 ? languages : ["English"];

    let uploadedCvUrl = null;
    if (cvFile) {
      setCvUploading(true);
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${newVolunteerId}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('volunteers-cvs')
        .upload(fileName, cvFile);

      if (uploadError) {
        setErrorMessage("CV upload failed: " + uploadError.message);
        setCvUploading(false);
        setLoading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('volunteers-cvs')
        .getPublicUrl(fileName);
      uploadedCvUrl = publicUrl;
      setCvUploading(false);
    }

    const { error } = await supabase
      .from("volunteers")
      .insert({
        id: newVolunteerId,
        name: name.trim(),
        email: normalizedEmail,
        expertise,
        languages: selectedLanguages,
        bio: reason.trim() || null,
        cv_url: uploadedCvUrl,
      });

    setLoading(false);
    if (error) {
      setErrorMessage(formatVolunteerErrorMessage(error.message));
      return;
    }

    setVolunteerId(newVolunteerId);
    setFormState("slots");
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { date: "", startTime: "10:00", endTime: "10:30" }]);
  };

  const removeSlot = (idx: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, field: keyof SlotEntry, value: string) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleSubmitSlots = async () => {
    if (!volunteerId) return;
    const validSlots = slots.filter((s) => s.date && s.startTime && s.endTime);
    if (validSlots.length === 0) return;
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.from("time_slots").insert(
      validSlots.map((s) => ({
        volunteer_id: volunteerId,
        slot_date: s.date,
        start_time: s.startTime,
        end_time: s.endTime,
      }))
    );

    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setFormState("submitted");
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-safe/10 px-4 py-1.5 text-sm font-medium text-safe mb-4">
            <UserCheck className="h-4 w-4" />
            Become a Volunteer
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Make a <span className="text-gradient">Real Difference</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Trained peer supporters help fellow students navigate tough times. Register, add your availability, and start helping.
          </p>
        </motion.div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Supabase request failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: BookOpen, title: "Set Up Profile", desc: "Share what topics you can support and how you want to help" },
            { icon: Shield, title: "Go Live", desc: "Your volunteer profile becomes available as soon as you save it" },
            { icon: MessageCircle, title: "Start Helping", desc: "Students can book your open slots anonymously" },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Registration Form */}
        {formState === "register" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border bg-card p-8">
          <h2 className="font-display text-xl font-semibold mb-2 text-center">Volunteer Registration</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">
            Already a volunteer?{" "}
            <a href="/volunteer/dashboard" className="text-primary font-bold hover:underline">
              Login to your Dashboard here
            </a>
          </p>
            <form onSubmit={handleRegister} className="space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Areas You Can Support</label>
                <div className="flex flex-wrap gap-2">
                  {expertiseOptions.map((opt) => (
                    <button
                      key={opt} type="button" onClick={() => toggleExpertise(opt)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        expertise.includes(opt) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        languages.includes(lang) ? "bg-calm text-calm-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  Upload CV / Certificate <span className="text-muted-foreground font-normal">(PDF preferred)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border bg-background px-4 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  required
                />
              </div>
              <Button variant="hero" type="submit" className="w-full rounded-xl" disabled={loading || cvUploading}>
                {loading || cvUploading ? "Processing..." : "Register & Add Availability"}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Add Time Slots */}
        {formState === "slots" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-8">
            <h2 className="font-display text-xl font-semibold mb-2 text-center">Add Your Available Time Slots</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Students will be able to anonymously book these slots for a support session with you.
            </p>
            <div className="space-y-3 max-w-lg mx-auto">
              {slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="date" value={slot.date}
                      onChange={(e) => updateSlot(idx, "date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      type="time" value={slot.startTime}
                      onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      type="time" value={slot.endTime}
                      onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  {slots.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeSlot(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl" onClick={addSlot}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Another Slot
              </Button>
            </div>
            <div className="mt-6 max-w-lg mx-auto">
              <Button variant="hero" className="w-full rounded-xl" onClick={handleSubmitSlots} disabled={loading}>
                {loading ? "Saving..." : "Save Availability & Submit"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {formState === "submitted" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border bg-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-safe/10 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-safe" />
            </div>
            <h2 className="font-display text-xl font-semibold text-safe">Application Pending Review</h2>
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
              Thank you for volunteering! Your CV is now being reviewed by our <strong>3 Super-Admins</strong>. 
            </p>
            <p className="mt-4 text-xs text-slate-400 max-w-sm mx-auto">
              We verify every peer listener to ensure SoulSync remains the safest place for student healing. You will receive an email once your profile is verified.
            </p>
          </motion.div>
        )}

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Profile Live" },
            { icon: Heart, label: "Empathy Trained" },
            { icon: Clock, label: "Flexible Schedule" },
            { icon: CheckCircle, label: "Certificate Provided" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 rounded-xl border p-3 text-center justify-center">
              <badge.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
