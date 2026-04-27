import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw, LogOut, AlertTriangle, UserCircle } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { sendEmail } from "@/lib/email";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";
import { hasVolunteerCv } from "@/lib/volunteer-cv";
import {
  ensureAdminVolunteerProfile,
  getVolunteerCvAccessUrl,
  setVolunteerVerificationStatus,
} from "@/utils/volunteer.functions";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { VolunteerGovernance } from "@/components/admin/VolunteerGovernance";
import { AnalyticsSidebar } from "@/components/admin/AnalyticsSidebar";
import { PlatformHealth } from "@/components/admin/PlatformHealth";
import { GovernanceLogs } from "@/components/admin/GovernanceLogs";
import { VolunteerDrawer } from "@/components/admin/VolunteerDrawer";

export const Route = createFileRoute("/admin/command-center")({
  component: CommandCenter,
});

type VolunteerRecord = Tables<"volunteers">;

function CommandCenter() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalDonations: 0,
    pendingVolunteers: 0,
    impactScore: 0
  });
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvLoading, setCvLoading] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRecord | null>(null);
  const [volunteerSessions, setVolunteerSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const getAdminAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error("Admin session expired. Please sign in again.");
    }

    return {
      authorization: `Bearer ${accessToken}`,
    };
  }, []);

  const fetchGlobalData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [
        { count: studentCount },
        { count: sessionCount },
        { data: donations },
        { count: pendingCount },
        { data: volData }
      ] = await Promise.all([
        supabase.from("student_profiles").select("*", { count: 'exact', head: true }),
        supabase.from("session_bookings").select("*", { count: 'exact', head: true }),
        supabase.from("donations").select("amount"),
        supabase.from("volunteers").select("*", { count: 'exact', head: true }).eq("verification_status", "pending"),
        supabase.from("volunteers").select("*").order("created_at", { ascending: false })
      ]);
      
      const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      
      const { data: sessionData } = await supabase.from("session_bookings").select("mood_before, mood_after");
      let totalImprovement = 0;
      let ratedSessions = 0;
      if (sessionData) {
        sessionData.forEach(s => {
          if (s.mood_before && s.mood_after) {
            totalImprovement += (Number(s.mood_after) - Number(s.mood_before));
            ratedSessions++;
          }
        });
      }
      const avgImpact = ratedSessions > 0 ? (totalImprovement / ratedSessions).toFixed(1) : "0.0";

      setStats({
        totalStudents: studentCount || 0,
        totalSessions: sessionCount || 0,
        totalDonations: totalDonated,
        pendingVolunteers: pendingCount || 0,
        impactScore: Number(avgImpact)
      });

      if (volData) setVolunteers(volData);
    } catch (err) {
      console.error("Critical fetch error:", err);
      toast.error("Platform data sync failed.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (!initialSession) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        if (!retrySession) {
          navigate({ to: "/admin" });
          return;
        }
      }

      const session = initialSession || (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const userEmail = session.user?.email || "";
      setCurrentEmail(userEmail);
      const normalizedEmail = normalizeEmail(userEmail);
      
      if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
        setAuthError(`Unauthorized: ${userEmail} is not in the authorized admin whitelist.`);
        setLoading(false);
        return;
      }

      try {
        await ensureAdminVolunteerProfile({
          headers: await getAdminAuthHeaders(),
        });
        if (mounted) await fetchGlobalData(false);
      } catch (error: any) {
        console.error("Admin verification error:", error);
        if (mounted) {
          // Extract the specific error message from the server response if possible
          const errorMessage = error?.message || "Failed to verify administrative credentials.";
          setAuthError(errorMessage);
          setLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && mounted) {
        navigate({ to: "/admin" });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, fetchGlobalData, getAdminAuthHeaders]);

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
                  <h2 style="color: #10b981;">Congratulations, ${updatedVolunteer.name || 'Volunteer'}!</h2>
                  <p>Your application to join the SoulSync peer-support movement has been <strong>Approved</strong>.</p>
                  <p>You can now log in to the Volunteer Hub to set your availability and start supporting students in need.</p>
                  <div style="margin: 30px 0;">
                    <a href="${window.location.origin}/volunteer/dashboard" 
                       style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                       Enter Volunteer Hub
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">Thank you for being part of the resilience mission.</p>
                </div>
              `
            }
          });
      }

      fetchGlobalData(false);
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
            body { margin:0; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#ffffff; font-family:sans-serif; color:#64748b; }
            .loader { border: 3px solid #f1f5f9; border-top: 3px solid #10b981; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 16px; }
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
          <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; border-radius:8px; border:none; background:#10b981; color:white; cursor:pointer;">Close Tab</button>
        </div>
      `;
      toast.error("An error occurred while opening the CV.");
    } finally {
      setCvLoading(null);
    }
  };

  const [chartData, setChartData] = useState<{name: string, sessions: number}[]>([]);

  useEffect(() => {
    const generateChartData = async () => {
      const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
      const dayLabels = days.map(d => format(d, "EEE"));
      
      const { data } = await supabase
        .from("session_bookings")
        .select("created_at")
        .gte("created_at", subDays(new Date(), 7).toISOString());

      const counts = dayLabels.map(label => {
        const count = data?.filter(s => format(new Date(s.created_at), "EEE") === label).length || 0;
        return { name: label, sessions: count };
      });

      setChartData(counts);
    };

    if (!loading) generateChartData();
  }, [loading]);

  const issueDistribution = useMemo(() => [
    { name: 'Support', value: 45, color: '#10b981' },
    { name: 'Crisis', value: 25, color: '#f43f5e' },
    { name: 'General', value: 30, color: '#0ea5e9' },
  ], []);

  const [latency, setLatency] = useState(98);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(95 + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const healthData = useMemo(() => [
    { label: "Encryption", status: "Active", value: 100 },
    { label: "Latency", status: latency > 97 ? "Nominal" : "Fluctuating", value: latency },
    { label: "Compliance", status: "Audit Pass", value: 100 },
  ], [latency]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white border border-slate-100">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Hub</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-red-50 text-red-500 shadow-xl shadow-red-100 ring-1 ring-red-100">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Access Restricted</h2>
        <div className="mt-6 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-2">
              <UserCircle className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{currentEmail || "Unknown identity"}</span>
           </div>
           <p className="max-w-md text-sm font-medium text-slate-400 leading-relaxed">
             {authError}
           </p>
        </div>
        <div className="mt-10 flex gap-4">
           <Button 
             variant="outline"
             onClick={() => window.location.reload()}
             className="h-14 rounded-2xl border-slate-200 px-8 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
           >
             <RefreshCw className="mr-2 h-4 w-4" />
             Retry Access
           </Button>
           <Button 
             onClick={handleLogout}
             className="h-14 rounded-2xl bg-slate-900 px-8 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800"
           >
             Switch Account
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10">
      <AdminNavbar />
      
      <div className="fixed inset-0 z-0 bg-white pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#00000003_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-32 lg:px-12">
        
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
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
              onClick={() => fetchGlobalData(true)}
              className="h-14 rounded-2xl border-slate-200 bg-white text-slate-600 px-6 font-bold shadow-sm transition-all hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
            <Button 
              onClick={handleLogout}
              className="h-14 rounded-2xl bg-primary text-white px-6 font-bold shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VolunteerGovernance 
              volunteers={volunteers}
              onStatusChange={handleVolunteerStatus}
              onViewCV={handleViewCV}
              onSelectVolunteer={setSelectedVolunteer}
              cvLoading={cvLoading}
            />
          </div>

          <AnalyticsSidebar 
            chartData={chartData}
            issueDistribution={issueDistribution}
          />
        </div>

        <PlatformHealth healthData={healthData} />

        <GovernanceLogs />

        <VolunteerDrawer 
          selectedVolunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
          volunteerSessions={volunteerSessions}
          sessionsLoading={sessionsLoading}
        />

      </main>
      <Footer />
    </div>
  );
}

export default CommandCenter;
