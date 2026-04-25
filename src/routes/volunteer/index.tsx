import { createFileRoute, Link } from "@tanstack/react-router";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { normalizeEmail } from "@/lib/admin-governance";
import { submitVolunteerApplication } from "@/utils/volunteer.functions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  expertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
  otherLanguage: z.string().optional(),
});
type VolunteerFormValues = z.infer<typeof formSchema>;

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

  if (message.includes("Bucket not found")) {
    return "CV Upload failed: The storage bucket 'volunteers-cvs' was not found. Please follow the setup instructions in volunteer_storage_setup.md.";
  }

  return message;
}

function VolunteerPage() {
  const [formState, setFormState] = useState<"register" | "slots" | "submitted">("register");
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [slots, setSlots] = useState<SlotEntry[]>([{ date: "", startTime: "10:00", endTime: "10:30" }]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [cvUploading, setCvUploading] = useState(false);

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      expertise: [],
      languages: ["English"],
      otherLanguage: "",
    },
  });

  const expertiseOptions = [
    "Anxiety & Stress",
    "Loneliness & Isolation",
    "Academic Pressure",
    "Relationship Issues",
    "Identity & Self-Worth",
    "General Support",
  ];

  const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Other"];

  const onSubmit = async (values: VolunteerFormValues) => {
    if (!cvFile) {
      setCvError("Please upload your CV or Certificate");
      return;
    }
    setCvError("");
    setLoading(true);
    setErrorMessage("");

    try {
      const normalizedEmail = normalizeEmail(values.email);
      const finalLanguages = values.languages.filter(l => l !== "Other");
      if (values.languages.includes("Other") && values.otherLanguage) {
        finalLanguages.push(`Other: ${values.otherLanguage}`);
      }

      setCvUploading(true);
      const formData = new FormData();
      formData.set("name", values.name.trim());
      formData.set("email", normalizedEmail);
      formData.set("expertise", JSON.stringify(values.expertise));
      formData.set("languages", JSON.stringify(finalLanguages));
      formData.set("cv", cvFile);

      const result = await submitVolunteerApplication({ data: formData });
      setCvUploading(false);
      setVolunteerId(result.volunteerId);
      setSubmittedEmail(result.email);
      setFormState("slots");
    } catch (err) {
      console.error("Registration error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(formatVolunteerErrorMessage(message));
    } finally {
      setLoading(false);
      setCvUploading(false);
    }
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
            { icon: Shield, title: "Upload Credentials", desc: "Submit your CV or training certificate with your application" },
            { icon: MessageCircle, title: "Await Review", desc: "Our admins verify your profile before students can book your slots" },
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} className="rounded-xl px-4 py-6 bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} className="rounded-xl px-4 py-6 bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expertise"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Areas You Can Support</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {expertiseOptions.map((opt) => {
                          const isSelected = form.watch("expertise").includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const current = form.getValues("expertise");
                                const next = isSelected ? current.filter(e => e !== opt) : [...current, opt];
                                form.setValue("expertise", next, { shouldValidate: true });
                              }}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                isSelected ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Languages</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {languageOptions.map((lang) => {
                          const isSelected = form.watch("languages").includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                const current = form.getValues("languages");
                                const next = isSelected ? current.filter(l => l !== lang) : [...current, lang];
                                form.setValue("languages", next, { shouldValidate: true });
                              }}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                isSelected ? "bg-calm text-calm-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("languages").includes("Other") && (
                  <FormField
                    control={form.control}
                    name="otherLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                          <FormControl>
                            <Input placeholder="Specify other languages..." {...field} className="rounded-xl mt-2 bg-background" />
                          </FormControl>
                        </motion.div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    Upload CV / Certificate <span className="text-muted-foreground font-normal">(PDF preferred)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      setCvFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) setCvError("");
                    }}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {cvError && <p className="text-sm font-medium text-destructive">{cvError}</p>}
                </div>

                <Button variant="hero" type="submit" className="w-full rounded-xl mt-4" disabled={loading || cvUploading}>
                  {loading || cvUploading ? "Processing..." : "Register & Add Availability"}
                </Button>
              </form>
            </Form>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2.5rem] border-none shadow-2xl bg-white p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-safe/10 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-safe" />
            </div>
            <h2 className="font-display text-2xl font-black text-safe uppercase tracking-tight">Application Submitted!</h2>
            <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 max-w-sm mx-auto">
              <p className="text-sm text-slate-600 font-medium italic">
                "Your journey as a peer listener begins here. Every student's heart you touch matters."
              </p>
            </div>
            
            <p className="mt-8 text-muted-foreground max-w-sm mx-auto text-sm">
              Your profile and CV are now pending review by our **SoulSync Team**. 
            </p>
            <p className="mt-4 text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              We verify all responders manually to keep SoulSync a safe sanctuary. You'll be notified at <strong>{submittedEmail}</strong> once verified.
            </p>
            
            <Link to="/">
              <Button variant="outline" className="mt-8 rounded-xl px-8">Return Home</Button>
            </Link>
          </motion.div>
        )}

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Manual Review" },
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
