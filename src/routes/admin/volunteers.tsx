import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck, ShieldAlert, FileText, User,
  CheckCircle, XCircle, ExternalLink, Eye, EyeOff,
  Clock, BadgeCheck
} from "lucide-react";
import { useState, useEffect } from "react";
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
      .in("verification_status", ["pending", "verified"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load volunteers");
    } else {
      setVolunteers(data || []);
    }
    setLoading(false);
  };

  // Generate a short-lived signed URL for the CV and open it
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
  const displayed = activeTab === "pending" ? pendingList : approvedList;

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-display">Volunteer <span className="text-gradient">Verification</span></h1>
              <p className="text-muted-foreground mt-1">Review applicant CVs and expertise before they go live.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">{pendingList.length} Pending</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{approvedList.length} Approved</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-amber-700 shadow-sm border border-amber-100"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              Pending Requests
              {pendingList.length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "approved"
                  ? "bg-white text-green-700 shadow-sm border border-green-100"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BadgeCheck className="h-4 w-4" />
              Approved Requests
              {approvedList.length > 0 && (
                <span className="ml-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {approvedList.length}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayed.length === 0 ? (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "pending" ? (
                  <CheckCircle className="h-8 w-8 text-slate-400" />
                ) : (
                  <BadgeCheck className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold">
                {activeTab === "pending" ? "All caught up!" : "No approved volunteers yet"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {activeTab === "pending"
                  ? "There are no pending volunteer applications at the moment."
                  : "Approved volunteers will appear here once you verify them."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {displayed.map((vol) => (
                <Card key={vol.id} className={`p-6 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${activeTab === "approved" ? "border-green-100" : "border-slate-200"}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {vol.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{vol.name}</h3>
                          <p className="text-xs text-muted-foreground">{vol.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Expertise
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {vol.expertise.map((exp: string) => (
                              <span key={exp} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Motivation
                          </h4>
                          <p className="text-xs text-slate-600 italic line-clamp-2">"{vol.bio}"</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                      {hasVolunteerCv(vol) ? (
                        <button
                          onClick={() => handleViewCV(vol)}
                          disabled={cvLoading === vol.id}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {cvLoading === vol.id ? (
                            <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
                          ) : (
                            <><Eye className="h-4 w-4" /> View CV / Credentials <ExternalLink className="h-3 w-3" /></>
                          )}
                        </button>
                      ) : (
                        <div className="text-center py-3 text-[10px] text-amber-600 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center gap-2 font-black uppercase tracking-wider">
                          <ShieldAlert className="h-4 w-4" /> CV missing or private
                        </div>
                      )}

                      {activeTab === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10"
                            onClick={() => handleVerify(vol.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Reject
                          </Button>
                          <Button
                            variant="hero"
                            size="sm"
                            className="flex-1 rounded-xl h-10"
                            onClick={() => handleVerify(vol.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-3 text-[10px] text-green-700 bg-green-50 rounded-2xl border border-green-200 flex items-center justify-center gap-2 font-black uppercase tracking-wider">
                          <BadgeCheck className="h-4 w-4" /> Active &amp; Verified
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
