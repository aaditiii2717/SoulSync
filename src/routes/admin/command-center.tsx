import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, Activity, HeartHandshake, ShieldCheck, 
  ChevronRight, FileText, CheckCircle, XCircle,
  TrendingUp, ArrowLeft, MoreVertical, Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { sendEmail } from "@/lib/email";

export const Route = createFileRoute("/admin/command-center")({
  component: CommandCenter,
});

function CommandCenter() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalDonations: 0,
    pendingVolunteers: 0
  });
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    
    // Fetch Global Stats
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

    // Fetch Volunteers for Review
    const { data: volData } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (volData) setVolunteers(volData);

    // Fetch Recent Global Sessions
    const { data: sessionData } = await supabase
      .from("session_bookings")
      .select("*, volunteers(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (sessionData) setSessions(sessionData);

    setLoading(false);
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
      
      if (status === 'verified') {
        const vol = volunteers.find(v => v.id === id);
        if (vol && vol.email) {
          sendEmail({
            data: {
              to: vol.email,
              subject: "Your volunteer application has been approved! 🎉",
              html: `<h3>Hello ${vol.name || 'Volunteer'}!</h3>
               <p>Congratulations, your application to volunteer at SoulSync has been approved! 🎉</p>
               <p>You can now log in, set your availability, and start accepting peer support sessions.</p>
               <p><a href="${window.location.origin}/volunteer/dashboard">Click here to access your Volunteer Dashboard</a></p>
               <br/>
               <p>Thank you for supporting our community!</p>`
            }
          });
        }
      }

      fetchGlobalData();
    }
  };

  const chartData = [
    { name: 'Sessions', value: stats.totalSessions, color: '#f43f5e' },
    { name: 'Donations (k)', value: stats.totalDonations / 1000, color: '#10b981' },
    { name: 'Students', value: stats.totalStudents, color: '#6366f1' },
    { name: 'Trust Score', value: 98, color: '#f59e0b' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading HQ Hub...</div>;

  return (
    <div className="min-h-screen pt-24 bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Command Center</span>
            </div>
            <h1 className="text-4xl font-display font-black text-[#0f172a]">Master Control 🦅</h1>
            <p className="text-slate-500 mt-2 font-medium">Supervisor-level oversight of all SoulSync operations and personnel.</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/volunteer/dashboard' })} className="rounded-2xl border-slate-200">
             <ArrowLeft className="h-4 w-4 mr-2" /> Exit to Volunteer View
          </Button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-none shadow-sm rounded-3xl bg-white">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
               <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-black">{stats.totalStudents}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Anonymous Students</p>
          </Card>
          
          <Card className="p-6 border-none shadow-sm rounded-3xl bg-white">
            <div className="h-10 w-10 bg-safe/10 rounded-xl flex items-center justify-center mb-4">
               <Activity className="h-5 w-5 text-safe" />
            </div>
            <p className="text-3xl font-black">{stats.totalSessions}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Healing Sessions</p>
          </Card>

          <Card className="p-6 border-none shadow-sm rounded-3xl bg-white">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
               <HeartHandshake className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black">₹{stats.totalDonations}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">NGO Impact Contributions</p>
          </Card>

          <Card className="p-6 border-none shadow-sm rounded-3xl bg-[#0f172a] text-white">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
               <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-black">{stats.pendingVolunteers}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending CV Approvals</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Volunteer Review Hub */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2">
                   <ShieldCheck className="h-5 w-5 text-primary" />
                   Personnel Supervision
                </h2>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">View All Queue</Button>
              </div>

              <div className="space-y-4">
                {volunteers.filter(v => v.verification_status === 'pending').map(vol => (
                  <Card key={vol.id} className="p-5 border-none shadow-sm bg-white rounded-3xl flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                           {vol.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="font-bold">{vol.name}</h4>
                           <p className="text-xs text-slate-400">{vol.expertise.join(", ")}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <a href={vol.cv_url} target="_blank" className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50">
                           <FileText className="h-4 w-4 text-slate-500" />
                        </a>
                        <Button size="sm" onClick={() => handleVolunteerStatus(vol.id, 'verified')} className="rounded-xl h-10 px-4 bg-safe hover:bg-safe/90">Approve</Button>
                        <Button size="sm" onClick={() => handleVolunteerStatus(vol.id, 'rejected')} variant="ghost" className="rounded-xl h-10 px-4 text-red-500 hover:bg-red-50">Reject</Button>
                     </div>
                  </Card>
                ))}
                {volunteers.filter(v => v.verification_status === 'pending').length === 0 && (
                   <p className="text-sm text-slate-400 italic py-8 text-center bg-slate-100 rounded-3xl">No pending CVs at the moment. Good job!</p>
                )}
              </div>

              {/* Impact Charts */}
              <div className="pt-8">
                 <h2 className="text-xl font-black flex items-center gap-2 mb-6">
                   <TrendingUp className="h-5 w-5 text-safe" />
                   Ecosystem Performance
                </h2>
                <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 'bold'}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                           {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </Card>
              </div>
           </div>

           {/* Global Activity Feed */}
           <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                 <Eye className="h-5 w-5 text-safe" />
                 Live Session Surveillance
              </h2>
              <div className="space-y-4">
                 {sessions.map(session => (
                    <Card key={session.id} className="p-4 border-none shadow-sm bg-white rounded-2xl relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.issue_type}
                       </p>
                       <p className="text-sm font-bold text-slate-900">{session.user_name} ↔ {session?.volunteers?.name || 'Pending'}</p>
                       <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-black uppercase text-primary bg-primary/5 rounded-lg">Audit Briefing</Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 rounded-lg">Status: {session.status}</Button>
                       </div>
                    </Card>
                 ))}
              </div>
           </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
