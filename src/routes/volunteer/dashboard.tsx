import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  UserCheck, 
  LayoutDashboard, 
  AlarmClock, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  Info,
  ChevronRight,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/volunteer/dashboard")({
  component: VolunteerDashboard,
});

type Tab = "sessions" | "slots";

function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await verifyAndFetchData(session.user.email!);
    } else {
      setLoading(false);
    }
  };

  const verifyAndFetchData = async (userEmail: string) => {
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

    if (data.verification_status !== "verified" && !data.is_admin) {
      await supabase.auth.signOut();
      setError("Account pending admin verification. Access restricted.");
      setIsLoggedIn(false);
    } else {
      setVolunteer(data);
      setIsLoggedIn(true);
      fetchSessions(data.id);
    }
    setLoading(false);
  };

  const fetchSessions = async (volunteerId: string) => {
    const { data } = await supabase
      .from("session_bookings")
      .select("*, student_profiles(anonymous_alias), time_slots(*)")
      .eq("volunteer_id", volunteerId)
      .order("created_at", { ascending: false });
    
    if (data) setSessions(data);
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
    if (!s.time_slots) return false;
    return computeStatus(s.time_slots.slot_date, s.time_slots.start_time, s.time_slots.end_time) === "upcoming";
  });

  const completedSessions = sessions.filter(s => {
    if (!s.time_slots) return false;
    return computeStatus(s.time_slots.slot_date, s.time_slots.start_time, s.time_slots.end_time) === "completed";
  });

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-primary/10">
        <Navbar />
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-calm/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
          <div className="mb-8 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <UserCheck className="h-7 w-7 text-slate-900" />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Volunteer Access
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Restricted to verified peer supporters
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl ring-1 ring-slate-200/50">
               <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-700 ring-1 ring-amber-100"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <p className="text-xs font-bold leading-tight">{error}</p>
                    </motion.div>
                  )}
               </AnimatePresence>

               {loading ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                   <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Verifying Clearance</p>
                 </div>
               ) : (
                  <>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email address</label>
                        <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                          placeholder="authorized@soulsync.org"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Security Key</label>
                          <button type="button" className="text-xs font-bold text-primary hover:underline">Request Reset</button>
                        </div>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]" 
                      >
                        Authorize & Enter
                      </Button>
                    </form>

                    <div className="relative my-8 flex items-center">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="mx-4 text-xs font-medium text-slate-400">or</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="h-11 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </div>
                    </Button>
                  </>
               )}
            </Card>
          </motion.div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center">
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              <Shield className="h-4 w-4 mx-auto mb-2 text-amber-500" />
              Access is restricted to authorized peer supporters. If you wish to join, please contact your local coordinator.
            </p>
          </div>
          
          <footer className="mt-12 text-center">
             <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors">
              Return to platform
            </Link>
          </footer>
        </main>
      </div>
    );
  }

  const activeMinutes = sessions.filter(s => s.status === 'completed' || s.mood_after).reduce((acc, s) => acc + (s.time_slots ? sessionDurationMinutes(s.time_slots.start_time, s.time_slots.end_time) : 0), 0);

  return (
    <div className="min-h-screen pt-24 bg-slate-50 selection:bg-primary/10">
      <Navbar />
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-calm/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000005_1.5px,transparent_1.5px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-12">
        
        {/* Header Stats Console */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
              Welcome, {volunteer?.name.split(" ")[0]}
              {volunteer?.is_admin ? (
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">Super Admin</span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border border-emerald-100">Verified Peer</span>
              )}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-lg text-slate-500 font-medium">
                 {volunteer?.is_admin ? "Overseeing global operations and student safety protocols." : "Managing your anonymous student support journey."}
              </p>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
             <div className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-sm border border-white ring-1 ring-slate-200/50 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Hours</p>
               <p className="text-2xl font-black text-slate-900">{formatDuration(activeMinutes)}</p>
             </div>
             <div className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-sm border border-white ring-1 ring-slate-200/50 text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Sessions</p>
               <p className="text-2xl font-black text-slate-900">{sessions.length}</p>
             </div>
             <div className="bg-slate-900 px-8 py-4 rounded-3xl shadow-xl text-center min-w-[140px]">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Upcoming</p>
               <p className="text-2xl font-black text-white">{upcomingSessions.length}</p>
             </div>
          </div>
        </div>

        {/* Console Nav */}
        <div className="flex gap-2 mb-10 bg-white/70 backdrop-blur-xl border border-white ring-1 ring-slate-200/50 rounded-[2rem] p-2 w-fit shadow-sm">
          {[
            { key: "sessions" as Tab, label: "Response Queue", icon: <LayoutDashboard className="h-4 w-4" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Platform Availability", icon: <AlarmClock className="h-4 w-4" /> },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${
                activeTab === t.key 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
           {activeTab === "sessions" ? (
             <motion.div 
               key="sessions"
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: 10 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-8"
             >
               <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between mb-2">
                   <h2 className="text-xl font-black flex items-center gap-3 text-slate-900">
                     <MessageSquare className="h-5 w-5 text-primary" />
                     Incoming Student Sessions
                   </h2>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next 48 Hours</span>
                 </div>
                 
                 <div className="space-y-4">
                   {upcomingSessions.map(session => (
                     <Card key={session.id} className="p-6 rounded-[2.5rem] border-white bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group transition-all hover:shadow-md">
                       <div className="flex items-center gap-5">
                         <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                           <UserCheck className="h-7 w-7" />
                         </div>
                         <div>
                           <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-black text-slate-900">{session.student_profiles?.anonymous_alias}</h4>
                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                             <div className="flex items-center gap-1.5">
                               <Calendar className="h-3 w-3" />
                               {new Date(session.time_slots?.slot_date).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-1.5">
                               <Clock className="h-3 w-3" />
                               {session.time_slots?.start_time} - {session.time_slots?.end_time}
                             </div>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 w-full sm:w-auto">
                         <Button variant="outline" className="flex-1 sm:flex-none rounded-xl h-11 border-slate-200 text-xs font-bold px-6">View Briefing</Button>
                         <Button className="flex-1 sm:flex-none rounded-xl h-11 bg-slate-900 text-white text-xs font-bold px-6 shadow-lg shadow-slate-200">Start Meet</Button>
                       </div>
                     </Card>
                   ))}
                   {upcomingSessions.length === 0 && (
                     <div className="text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <MessageSquare className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Queue Clear</h3>
                        <p className="text-sm text-slate-400 font-medium">New session requests will appear here when students book slots.</p>
                     </div>
                   )}
                 </div>

                 {/* History Section */}
                 <div className="pt-8">
                   <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 mb-6">
                     <TrendingUp className="h-5 w-5 text-emerald-500" />
                     History & Feedback
                   </h2>
                   <div className="space-y-3">
                     {completedSessions.map(session => (
                       <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-slate-100 hover:bg-white/60 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                               <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{session.student_profiles?.anonymous_alias}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(session.time_slots?.slot_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-16 bg-emerald-500/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[100%]" />
                             </div>
                             <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Profile Sidebar */}
               <div className="space-y-6">
                  <Card className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-200/50">
                    <div className="text-center mb-8">
                       <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                          <UserCheck className="h-10 w-10 text-primary" />
                       </div>
                       <h3 className="font-black text-xl text-slate-900">{volunteer?.name}</h3>
                       <p className="text-xs font-bold text-slate-400 tracking-tight mt-1">{volunteer?.expertise?.join(" · ")}</p>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-xs font-bold text-slate-500">Global Rank</span>
                          <span className="text-xs font-black text-primary uppercase tracking-widest">Top 5% Peer</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-xs font-bold text-slate-500">Trust Score</span>
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">98.4%</span>
                       </div>
                    </div>
                  </Card>

                  <Card className="p-8 rounded-[3rem] border-white bg-slate-900 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                       <Shield className="h-5 w-5 text-primary" />
                       <h4 className="font-black text-white">Governance Note</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 mb-6">
                      All sessions are recorded for security. Ensure student anonymity at all times. Use the HALT protocol if you encounter high-risk signals.
                    </p>
                    <Button className="w-full rounded-xl h-11 bg-white text-slate-900 text-xs font-bold hover:bg-slate-100">
                      View Operational Manual
                    </Button>
                  </Card>
               </div>
             </motion.div>
           ) : (
             <motion.div 
               key="slots"
               initial={{ opacity: 0, x: 10 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -10 }}
             >
                <Card className="p-12 rounded-[4rem] border-white bg-white/70 backdrop-blur-2xl shadow-sm ring-1 ring-slate-200/50 text-center">
                   <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-primary/10">
                      <AlarmClock className="h-10 w-10 text-primary animate-pulse" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Availability Console</h2>
                   <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
                     The 2026 Scheduler is being synchronized with your local time zone. This console allows you to set the windows where students can book your support.
                   </p>
                   <div className="mt-12 flex justify-center">
                      <Button className="rounded-2xl h-14 px-12 bg-slate-900 text-white font-bold shadow-xl shadow-slate-200">
                         Configure Schedule
                      </Button>
                   </div>
                </Card>
             </motion.div>
           )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}
