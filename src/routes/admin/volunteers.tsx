import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ShieldCheck, ShieldAlert, FileText, User, 
  CheckCircle, XCircle, ExternalLink 
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/volunteers" as any)({
  component: AdminVolunteersPage,
});

function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load volunteers");
    } else {
      setVolunteers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleVerify = async (id: string, approve: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from("volunteers")
      .update({ 
        verification_status: approve ? "verified" : "rejected",
        is_verified: approve,
        is_active: approve // Automatically set to active if approved
      })
      .eq("id", id);

    if (error) {
      toast.error("Process failed: " + error.message);
    } else {
      toast.success(approve ? "Volunteer approved! They are now live." : "Volunteer application rejected.");
      fetchVolunteers();
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display">Volunteer <span className="text-gradient">Verification</span></h1>
              <p className="text-muted-foreground mt-1">Review applicant CVs and expertise before they go live.</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{volunteers.length} Pending</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : volunteers.length === 0 ? (
            <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
              <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold">All caught up!</h2>
              <p className="text-muted-foreground mt-2">There are no pending volunteer applications at the moment.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {volunteers.map((vol) => (
                <Card key={vol.id} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200 overflow-hidden">
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
                      {vol.cv_url ? (
                        <a 
                          href={vol.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                        >
                          <FileText className="h-4 w-4" /> View Credentials <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <div className="text-center py-3 text-[10px] text-amber-600 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center gap-2 font-black uppercase tracking-wider">
                          <ShieldAlert className="h-4 w-4" /> CV missing or private
                        </div>
                      )}
                      
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
