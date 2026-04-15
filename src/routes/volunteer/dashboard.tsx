import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, Calendar, Clock, MessageSquare, 
  ExternalLink, UserCheck, Shield, Brain
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

function VolunteerDashboard() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [volunteer, setVolunteer] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: vol, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (vol.verification_status !== "verified") {
      setError("Your application is still under review. Please wait for an Admin to verify your CV.");
      setLoading(false);
      return;
    }

    setVolunteer(vol);
    fetchSessions(vol.id);
    setIsLoggedIn(true);
    setLoading(false);
  };

  const fetchSessions = async (volId: string) => {
    const { data, error } = await supabase
      .from("session_bookings")
      .select("*, time_slots(*)")
      .eq("volunteer_id", volId)
      .order("created_at", { ascending: false });

    if (data) setSessions(data);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 border-none shadow-2xl rounded-[2rem]">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-black">Volunteer Hub</h1>
                <p className="text-sm text-slate-500 mt-2">Enter your verified email to access your dashboard</p>
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
                {error && <p className="text-xs text-red-500 font-medium px-2">{error}</p>}
                <Button className="w-full rounded-xl h-12 shadow-lg" variant="hero" disabled={loading}>
                  {loading ? "Verifying..." : "Access Dashboard"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
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
                : "Manage your sessions and review student handoffs."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
             {volunteer.is_admin && (
               <Link to="/admin/command-center">
                 <Button variant="hero" className="rounded-2xl h-12 shadow-md flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enter Command Center 🦅
                 </Button>
               </Link>
             )}
             <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</p>
                <p className="text-xl font-black">{sessions.length}</p>
             </div>
             <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</p>
                <p className="text-xl font-black text-primary">{sessions.length * 50}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
               <Calendar className="h-5 w-5 text-primary" />
               Your Recent Sessions
            </h2>
            
            {sessions.map((session) => (
              <Card key={session.id} className="p-6 border-none shadow-sm hover:shadow-md transition-all rounded-3xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">
                          {session.issue_type}
                       </span>
                       {session.status === 'booked' && (
                         <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Upcoming
                         </span>
                       )}
                    </div>
                    <h3 className="font-display font-bold text-xl">{session.user_name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                         <Calendar className="h-4 w-4" />
                         {format(new Date(session.time_slots.slot_date + "T00:00:00"), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                         <Clock className="h-4 w-4" />
                         {session.time_slots.start_time.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSession(session)} 
                      className="rounded-xl border-slate-200"
                    >
                      Read Briefing
                    </Button>
                    <Button 
                      variant="hero" 
                      className="rounded-xl shadow-md"
                      onClick={() => window.open(`https://meet.jit.si/SoulSync-Session-${session.meeting_token}`, '_blank')}
                    >
                      Join Call
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Guidelines / Tips */}
          <div className="space-y-4 text-sm">
             <Card className="p-6 border-none shadow-sm rounded-3xl bg-slate-100">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                   <Shield className="h-5 w-5 text-safe" />
                   Volunteer Guidelines
                </h3>
                <ul className="space-y-3 text-slate-600">
                   <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
                      Keep conversations confidential.
                   </li>
                   <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
                      Do not ask for real identity.
                   </li>
                   <li className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-safe mt-1.5 shrink-0" />
                      Refer critical cases to professional help.
                   </li>
                </ul>
             </Card>
          </div>
        </div>
      </main>

      {/* Briefing Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
               className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                     <Brain className="h-6 w-6 text-primary" />
                     <h3 className="font-display font-black text-xl">Intelligent Handoff Briefing</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)}>
                     <X className="h-5 w-5" />
                  </Button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">AI Consultation Summary</p>
                    <div className="text-slate-700 leading-relaxed font-medium">
                      {selectedSession.handoff_briefing || "Generating intelligent summary... try refreshing in a moment."}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue</p>
                       <p className="font-bold">{selectedSession.issue_type}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preferred approach</p>
                       <p className="font-bold">Wait for briefing...</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t">
                     <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider italic">
                        This information is shared only with you. Maintain absolute secrecy.
                     </p>
                     <Button variant="hero" className="w-full rounded-2xl h-14" onClick={() => setSelectedSession(null)}>
                        I Understand - Start Session
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

function X(props: any) {
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
