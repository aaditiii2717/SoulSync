import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck, ShieldAlert, FileText, User,
  CheckCircle, XCircle, ExternalLink, Eye, EyeOff,
  Clock, BadgeCheck, ArrowLeft, MoreHorizontal,
  Search, Filter, Star, Zap, Globe
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";
import { hasVolunteerCv } from "@/lib/volunteer-cv";
import {
  ensureAdminVolunteerProfile,
  getVolunteerCvAccessUrl,
  setVolunteerVerificationStatus,
} from "@/utils/volunteer.functions";

export const Route = createFileRoute("/admin/volunteers")({
  component: AdminVolunteersPage,
});

type Tab = "pending" | "approved";
type VolunteerRecord = Tables<"volunteers">;

function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [cvLoading, setCvLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load volunteers");
    } else {
      setVolunteers(data || []);
    }
    setLoading(false);
  };

  const handleViewCV = async (vol: VolunteerRecord) => {
    if (!hasVolunteerCv(vol)) return;

    const cvWindow = window.open("", "_blank", "noopener,noreferrer");
    setCvLoading(vol.id);
    try {
      const { url } = await getVolunteerCvAccessUrl({
        data: { volunteerId: vol.id },
        headers: await getAdminAuthHeaders(),
      });

      if (cvWindow) {
        cvWindow.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch (error) {
      console.error(error);
      cvWindow?.close();
      toast.error("Could not open CV. It may be private or missing.");
    } finally {
      setCvLoading(null);
    }
  };

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const normalizedAdminEmail = normalizeEmail(session?.user?.email || "");

      if (!session || !session.user?.email || !ALLOWED_ADMIN_EMAILS.includes(normalizedAdminEmail)) {
        toast.error("Unauthorized access. Admin privileges required.");
        navigate({ to: "/admin" });
        return;
      }

      try {
        await ensureAdminVolunteerProfile({
          headers: await getAdminAuthHeaders(),
        });
        fetchVolunteers();
      } catch (error) {
        console.error("Admin provisioning failed:", error);
        toast.error("We could not verify your admin profile.");
        navigate({ to: "/admin" });
      }
    };

    checkAdminAndLoad();
  }, [navigate]);

  const handleVerify = async (id: string, approve: boolean) => {
    setLoading(true);
    try {
      await setVolunteerVerificationStatus({
        data: {
          volunteerId: id,
          status: approve ? "verified" : "rejected",
        },
        headers: await getAdminAuthHeaders(),
      });

      toast.success(approve ? "Volunteer approved! They are now live." : "Volunteer application rejected.");
      fetchVolunteers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Process failed: " + message);
    } finally {
      setLoading(false);
    }
  };

  const pendingList = volunteers.filter(v => v.verification_status === "pending");
  const approvedList = volunteers.filter(v => v.verification_status === "verified");
  
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      const matchesTab = v.verification_status === activeTab;
      const matchesSearch = (v.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                           (v.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [volunteers, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/10">
      <Navbar />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-12">
        
        {/* Superior Header */}
        <div className="mb-16">
          <Link to="/admin/command-center" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Command Center
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Vetting Infrastructure</span>
              </div>
              <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
                Volunteer <span className="text-gradient">Verification</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-2xl">
                Rigorous review of peer support candidates to ensure student safety and platform quality.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/90 shadow-sm ring-1 ring-slate-200/50 flex items-center gap-4 transition-all">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Queue</span>
                   <span className="text-xl font-black text-slate-900">{pendingList.length}</span>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified</span>
                   <span className="text-xl font-black text-emerald-600">{approvedList.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
           <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "pending"
                    ? "bg-white text-slate-900 shadow-lg border border-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Pending Review
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "approved"
                    ? "bg-white text-emerald-600 shadow-lg border border-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Approved Network
              </button>
           </div>
           
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter applicants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all outline-none"
              />
           </div>
        </div>

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex justify-center py-32"
              >
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </motion.div>
            ) : filteredVolunteers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200"
              >
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === "pending" ? <CheckCircle className="h-10 w-10 text-slate-300" /> : <Globe className="h-10 w-10 text-slate-300" />}
                </div>
                <h3 className="text-xl font-black text-slate-800">No applicants found</h3>
                <p className="text-sm text-slate-400 font-medium">The verification queue is currently empty.</p>
              </motion.div>
            ) : filteredVolunteers.map((vol, i) => (
              <motion.div
                key={vol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-200/50 transition-all hover:bg-white transition-all duration-500">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-2xl border border-primary/10 group-hover:scale-110 transition-transform">
                            {vol.name?.charAt(0) || "V"}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{vol.name || "Anonymous Volunteer"}</h3>
                            <p className="text-sm font-bold text-slate-400 mt-2">{vol.email}</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                           <Zap className="h-3 w-3 text-amber-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Vetting Score: 92%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                             <ShieldCheck className="h-3 w-3 text-primary" />
                             Expertise Domain
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {vol.expertise?.map((exp: string) => (
                                <span key={exp} className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                                  {exp}
                                </span>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                             <FileText className="h-3 w-3 text-indigo-500" />
                             Motivation Brief
                           </h4>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium italic line-clamp-3">
                             "{vol.bio || "No motivation brief provided."}"
                           </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-72 bg-slate-50/50 p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center gap-4">
                       {hasVolunteerCv(vol) ? (
                         <Button
                           onClick={() => handleViewCV(vol)}
                           disabled={cvLoading === vol.id}
                           className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98]"
                         >
                           {cvLoading === vol.id ? (
                             <RefreshCw className="h-4 w-4 animate-spin" />
                           ) : (
                             <><Eye className="h-4 w-4 mr-3" /> Audit Credentials</>
                           )}
                         </Button>
                       ) : (
                         <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center gap-2 text-center">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Missing Evidence</p>
                         </div>
                       )}

                       {activeTab === "pending" ? (
                         <div className="flex gap-3">
                           <Button
                             variant="outline"
                             className="flex-1 h-12 rounded-xl border-slate-200 bg-white text-red-600 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 hover:border-red-100"
                             onClick={() => handleVerify(vol.id, false)}
                           >
                             Reject
                           </Button>
                           <Button
                             className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                             onClick={() => handleVerify(vol.id, true)}
                           >
                             Approve
                           </Button>
                         </div>
                       ) : (
                         <div className="h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Verified Peer</span>
                         </div>
                       )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </main>
      <Footer />
    </div>
  );
}

// Add RefreshCw for the loading state icon
const RefreshCw = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

