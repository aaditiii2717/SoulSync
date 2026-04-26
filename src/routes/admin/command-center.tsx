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
  BarChart3, PieChart, Info, Clock, BadgeCheck, UserCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { sendEmail } from "@/lib/email";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";
import { hasVolunteerCv } from "@/lib/volunteer-cv";
import {
  ensureAdminVolunteerProfile,
  getVolunteerCvAccessUrl,
  setVolunteerVerificationStatus,
} from "@/utils/volunteer.functions";

export const Route = createFileRoute("/admin/command-center")({
  component: CommandCenter,
});

type VolunteerRecord = Tables<"volunteers">;

function CommandCenter() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalDonations: 0,
    pendingVolunteers: 0
  });
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [cvLoading, setCvLoading] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRecord | null>(null);
  const [volunteerSessions, setVolunteerSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const navigate = useNavigate();

  const getAdminAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error("Admin session expired. Please sign in again.");
    }

    return {
      authorization: `Bearer ${accessToken}`,
    };
  };

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to access the Command Center.");
        navigate({ to: "/admin" });
        return;
      }

      const normalizedEmail = normalizeEmail(session.user?.email || "");
      
      if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
        toast.error("Unauthorized access. Admin privileges required.");
        navigate({ to: "/admin" });
        return;
      }

      try {
        await ensureAdminVolunteerProfile({
          headers: await getAdminAuthHeaders(),
        });
        await fetchGlobalData();
      } catch (error: any) {
        console.error("Admin verification error:", error);
        
        // If it's a network timeout or fetch error, don't kick them out.
        // Just let them try to 'Sync Data' manually later.
        const errorMsg = error?.message?.toLowerCase() || "";
        const isNetworkError = errorMsg.includes("fetch") || errorMsg.includes("timeout") || errorMsg.includes("network");

        if (isNetworkError) {
          toast.error("Network is slow. Please try clicking 'Sync Data' in a moment.");
          setLoading(false); // Stop the spinner so they can at least see the hub
        } else {
          toast.error("Unauthorized access or profile error.");
          navigate({ to: "/admin" });
        }
        return;
      }
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
      const { data: volData } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
      
      const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      setStats({
        totalStudents: studentCount || 0,
        totalSessions: sessionCount || 0,
        totalDonations: totalDonated,
        pendingVolunteers: pendingCount || 0
      });

      if (volData) setVolunteers(volData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerSessions = async (volunteerId: string) => {
    setSessionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select(`*, student_profiles(anonymous_username)`)
        .eq("volunteer_id", volunteerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (data) setVolunteerSessions(data);
    } catch (err) {
      console.error("Error fetching volunteer sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVolunteer) {
      fetchVolunteerSessions(selectedVolunteer.id);
    }
  }, [selectedVolunteer]);

  const handleVolunteerStatus = async (id: string, status: 'verified' | 'rejected') => {
    try {
      const updatedVolunteer = await setVolunteerVerificationStatus({
        data: {
          volunteerId: id,
          status,
        },
        headers: await getAdminAuthHeaders(),
      });

      toast.success(`Volunteer ${status === 'verified' ? 'Approved' : 'Rejected'}`);

      if (status === 'verified' && updatedVolunteer?.email) {
          sendEmail({
            data: {
              to: updatedVolunteer.email,
              subject: "Welcome to SoulSync! Your application is approved 🎉",
              html: `
                <div style="font-family: sans-serif; color: #1e293b; max-width: 600px;">
                  <h2 style="color: #8b5cf6;">Congratulations, ${updatedVolunteer.name || 'Volunteer'}!</h2>
                  <p>Your application to join the SoulSync peer-support movement has been <strong>Approved</strong>.</p>
                  <p>You can now log in to the Volunteer Hub to set your availability and start supporting students in need.</p>
                  <div style="margin: 30px 0;">
                    <a href="${window.location.origin}/volunteer/dashboard" 
                       style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                       Enter Volunteer Hub
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">Thank you for being part of the resilience mission.</p>
                </div>
              `
            }
          });
      }

      fetchGlobalData();
    } catch (error) {
      console.error("Volunteer governance error:", error);
      toast.error("Governance action failed.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  const handleViewCV = async (vol: VolunteerRecord) => {
    if (!hasVolunteerCv(vol)) {
      toast.error("This volunteer hasn't uploaded a CV yet.");
      return;
    }

    const cvWindow = window.open("", "_blank");
    
    if (!cvWindow || cvWindow.closed || typeof cvWindow.closed === "undefined") {
      toast.error("Popup blocked! Please allow popups for this site to view CVs.");
      return;
    }

    cvWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SoulSync | Loading CV...</title>
          <style>
            body { margin:0; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#f8fafc; font-family:sans-serif; color:#64748b; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #8b5cf6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Loading CV securely...</p>
        </body>
      </html>
    `);

    setCvLoading(vol.id);
    try {
      const { url } = await getVolunteerCvAccessUrl({
        data: { volunteerId: vol.id },
        headers: await getAdminAuthHeaders(),
      });

      const lowerUrl = url.toLowerCase();
      const isWordDoc = lowerUrl.includes('.doc') || lowerUrl.includes('.docx');
      
      const finalUrl = isWordDoc 
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` 
        : url;

      cvWindow.location.replace(finalUrl);
    } catch (err) {
      console.error(err);
      cvWindow.document.body.innerHTML = `
        <div style="text-align:center; padding: 40px;">
          <h2 style="color:#ef4444;">Error Loading CV</h2>
          <p>We couldn't retrieve the document securely.</p>
          <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; border-radius:8px; border:none; background:#8b5cf6; color:white; cursor:pointer;">Close Tab</button>
        </div>
      `;
      toast.error("An error occurred while opening the CV.");
    } finally {
      setCvLoading(null);
    }
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

  const pendingList = volunteers.filter(v => v.verification_status === "pending");
  const approvedList = volunteers.filter(v => v.verification_status === "verified");
  const displayedVolunteers = activeTab === "pending" ? pendingList : approvedList;

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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 p-8 gap-4">
                <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                  <Globe className="h-6 w-6 text-primary" />
                  Volunteer Review Hub
                </h2>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeTab === "pending"
                        ? "bg-white text-amber-700 shadow-sm border border-amber-100"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    Pending
                    {pendingList.length > 0 && (
                      <span className="ml-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        {pendingList.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("approved")}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeTab === "approved"
                        ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    Approved
                    {approvedList.length > 0 && (
                      <span className="ml-1 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        {approvedList.length}
                      </span>
                    )}
                  </button>
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
                    {displayedVolunteers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                              {activeTab === "pending" ? <CheckCircle className="h-6 w-6 text-slate-400" /> : <ShieldCheck className="h-6 w-6 text-slate-400" />}
                            </div>
                            <p className="text-sm font-bold text-slate-500">
                              {activeTab === "pending" ? "All caught up! No pending volunteers." : "No approved volunteers yet."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : displayedVolunteers.map((vol) => (
                      <tr key={vol.id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-8 py-6 cursor-pointer" onClick={() => setSelectedVolunteer(vol)}>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                              {vol.name?.charAt(0) || "V"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{vol.name || "Anonymous Volunteer"}</p>
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewCV(vol)}
                              disabled={cvLoading === vol.id}
                              title={hasVolunteerCv(vol) ? "View CV" : "No CV uploaded"}
                              className={`h-9 w-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 ${!hasVolunteerCv(vol) ? "opacity-50" : ""}`}
                            >
                              {cvLoading === vol.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-slate-600" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
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

       {/* Volunteer Performance Drawer */}
       <AnimatePresence>
         {selectedVolunteer && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm"
             onClick={() => setSelectedVolunteer(null)}
           >
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
               onClick={e => e.stopPropagation()}
             >
                <div className="flex items-center justify-between p-8 border-b border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 text-primary font-black text-xl">
                         {selectedVolunteer.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-slate-900">{selectedVolunteer.name}</h3>
                        <p className="text-sm font-bold text-slate-500">{selectedVolunteer.email}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedVolunteer(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                      <XCircle className="h-7 w-7" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 space-y-8">
                   {/* Performance Summary */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-white shadow-sm ring-1 ring-slate-200/50">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Impact</p>
                         <p className="text-2xl font-black text-slate-900">{volunteerSessions.length} Sessions</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-white shadow-sm ring-1 ring-slate-200/50">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                         <p className="text-2xl font-black text-emerald-600 capitalize">{selectedVolunteer.verification_status}</p>
                      </div>
                   </div>

                   {/* Session Timeline */}
                   <div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Session Oversight
                      </h4>
                      <div className="space-y-4">
                         {sessionsLoading ? (
                           <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-primary/30" /></div>
                         ) : volunteerSessions.length === 0 ? (
                           <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
                              <p className="text-sm font-bold text-slate-400">No sessions recorded yet.</p>
                           </div>
                         ) : volunteerSessions.map(session => (
                           <div key={session.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm ring-1 ring-slate-200/50">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                       <UserCheck className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-slate-900">{session.student_profiles?.anonymous_username}</span>
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {new Date(session.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Volunteer Insight</p>
                                 <p className="text-xs text-slate-600 leading-relaxed italic">
                                    {session.volunteer_notes || "No notes saved for this session."}
                                 </p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-white">
                   <Button 
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl"
                    onClick={() => {
                      toast.info(`Generating deep performance report for ${selectedVolunteer.name}...`);
                    }}
                   >
                      Generate Quality Review (AI)
                   </Button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}
