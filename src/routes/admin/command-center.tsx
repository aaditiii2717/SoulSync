import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, Activity, HeartHandshake, ShieldCheck, 
  ChevronRight, FileText, CheckCircle, XCircle,
  TrendingUp, ArrowLeft, MoreVertical, Eye,
  Lock, Zap, Globe, Shield, RefreshCw, LogOut,
  BarChart3, PieChart, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

export const Route = createFileRoute("/admin/command-center")({
  component: CommandCenter,
});

const ALLOWED_ADMINS = [
  "varadprabhu2442@gmail.com",
  "aniket.aniket07sah@gmail.com",
  "aaditishrivastava17@gmail.com"
];

function CommandCenter() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalDonations: 0,
    pendingVolunteers: 0
  });
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user?.email || !ALLOWED_ADMINS.includes(session.user.email)) {
        toast.error("Unauthorized access. Admin privileges required.");
        navigate({ to: "/admin" });
        return;
      }
      
      const { data: vol } = await supabase
        .from("volunteers")
        .select("is_admin")
        .eq("email", session.user.email)
        .single();
        
      if (!vol?.is_admin) {
        toast.error("Governance clearance required.");
        navigate({ to: "/" });
        return;
      }

      fetchGlobalData();
    };
    
    checkAdmin();
  }, [navigate]);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const { count: studentCount } = await supabase.from("student_profiles").select("*", { count: 'exact', head: true });
      const { count: sessionCount } = await supabase.from("session_bookings").select("*", { count: 'exact', head: true });
      const { data: donations } = await supabase.from("donations").select("amount");
      const { count: pendingCount } = await supabase.from("volunteers").select("*", { count: 'exact', head: true }).eq("verification_status", "pending");
      
      const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      setStats({
        totalStudents: studentCount || 0,
        totalSessions: sessionCount || 0,
        totalDonations: totalDonated,
        pendingVolunteers: pendingCount || 0
      });

      const { data: volData } = await supabase
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (volData) setVolunteers(volData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerStatus = async (id: string, status: 'verified' | 'rejected') => {
    const { error } = await supabase
      .from("volunteers")
      .update({ verification_status: status })
      .eq("id", id);
    
    if (error) {
      toast.error("Governance action failed.");
    } else {
      toast.success(`Volunteer ${status === 'verified' ? 'Approved' : 'Rejected'}`);
      fetchGlobalData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  const chartData = [
    { name: 'Mon', sessions: 12 },
    { name: 'Tue', sessions: 19 },
    { name: 'Wed', sessions: 15 },
    { name: 'Thu', sessions: 22 },
    { name: 'Fri', sessions: 30 },
    { name: 'Sat', sessions: 25 },
    { name: 'Sun', sessions: 18 },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white border border-slate-200">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/10">
      <Navbar />
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-calm/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000005_1.5px,transparent_1.5px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-32 lg:px-12">
        
        {/* Superior Header */}
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Governance Level Access</span>
            </div>
            <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
              Command Center
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-500 max-w-2xl">
              Managing the SoulSync global resilience network and peer-support infrastructure.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={fetchGlobalData}
              className="h-14 rounded-2xl border-slate-200 bg-white px-6 font-bold shadow-sm transition-all hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
            <Button 
              onClick={handleLogout}
              className="h-14 rounded-2xl bg-slate-900 text-white px-6 font-bold shadow-xl transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Impact Console */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Sessions Held", value: stats.totalSessions, icon: Activity, color: "text-primary", bg: "bg-primary/5" },
            { label: "Community Support", value: `₹${stats.totalDonations}`, icon: HeartHandshake, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Pending Review", value: stats.pendingVolunteers, icon: Shield, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden rounded-[2.5rem] border-white bg-white/70 p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50 transition-all hover:shadow-xl hover:bg-white/90">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} border border-slate-100 transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight text-slate-900">{item.value}</h3>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Volunteer Governance */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-[3rem] border-white bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50">
              <div className="flex items-center justify-between border-b border-slate-100 p-8">
                <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                  <Globe className="h-6 w-6 text-primary" />
                  Volunteer Review Hub
                </h2>
                <div className="flex gap-2">
                  <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">Live Connection</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Registered</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {volunteers.map((vol) => (
                      <tr key={vol.id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                              {vol.name?.charAt(0) || "V"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{vol.name || "Anonymous Volunteer"}</p>
                              <p className="text-xs text-slate-500">{vol.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            vol.verification_status === "verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            vol.verification_status === "rejected" ? "bg-red-50 text-red-600 border border-red-100" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              vol.verification_status === "verified" ? "bg-emerald-500 animate-pulse" :
                              vol.verification_status === "rejected" ? "bg-red-500" :
                              "bg-amber-500 animate-pulse"
                            }`} />
                            {vol.verification_status || "pending"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs font-medium text-slate-400">
                          {new Date(vol.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {vol.verification_status !== "verified" && (
                              <Button 
                                size="sm" 
                                onClick={() => handleVolunteerStatus(vol.id, "verified")}
                                className="h-9 w-9 rounded-xl bg-emerald-500 p-0 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {vol.verification_status !== "rejected" && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleVolunteerStatus(vol.id, "rejected")}
                                className="h-9 w-9 rounded-xl bg-red-500 p-0 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-110 active:scale-95"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Analytics Column */}
          <div className="space-y-8">
            <Card className="overflow-hidden rounded-[3rem] border-white bg-white/70 p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50">
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                <BarChart3 className="h-6 w-6 text-primary" />
                Impact Velocity
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', color: '#000', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#8b5cf6' }}
                    />
                    <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Index</p>
                  <p className="text-xl font-black text-emerald-600">+24.5%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-[3rem] border-white bg-white/70 p-8 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                <Info className="h-6 w-6 text-blue-500" />
                System Intelligence
              </h2>
              <div className="space-y-6">
                {[
                  { name: "Global Sync", status: "Operational", color: "bg-emerald-500" },
                  { name: "AI Protocol", status: "Active", color: "bg-emerald-500" },
                  { name: "Support API", status: "Balanced", color: "bg-blue-500" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">{s.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${s.color} animate-pulse`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
