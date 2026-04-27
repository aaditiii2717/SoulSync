import { memo, useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Globe, Users, UserCheck, CheckCircle, XCircle, Eye, RefreshCw 
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { hasVolunteerCv } from "@/lib/volunteer-cv";

type VolunteerRecord = Tables<"volunteers">;

interface VolunteerGovernanceProps {
  volunteers: VolunteerRecord[];
  onStatusChange: (id: string, status: 'verified' | 'rejected') => void;
  onViewCV: (vol: VolunteerRecord) => void;
  onSelectVolunteer: (vol: VolunteerRecord) => void;
  cvLoading: string | null;
}

export const VolunteerGovernance = memo(({ 
  volunteers, 
  onStatusChange, 
  onViewCV, 
  onSelectVolunteer,
  cvLoading
}: VolunteerGovernanceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      const matchesSearch = (v.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                           (v.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || v.verification_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredVolunteers.length / pageSize);
  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVolunteers.slice(start, start + pageSize);
  }, [filteredVolunteers, currentPage]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  return (
    <Card className="overflow-hidden rounded-[3rem] border-white bg-white shadow-md ring-1 ring-slate-200/50">
      <div className="flex flex-col gap-6 p-10">
        <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
          <Globe className="h-6 w-6 text-primary" />
          Volunteer Governance
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Identity..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
            {['all', 'pending', 'verified', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Profile</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Date</th>
              <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVolunteers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                      <UserCheck className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">No Match Found</h3>
                    <p className="text-sm font-bold text-slate-400">Adjust your search or filters to locate volunteers.</p>
                  </div>
                </td>
              </tr>
            ) : paginatedVolunteers.map((vol) => (
              <tr key={vol.id} className="group transition-colors hover:bg-slate-50/50">
                <td className="px-8 py-6 cursor-pointer" onClick={() => onSelectVolunteer(vol)}>
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
                      vol.verification_status === "verified" ? "bg-emerald-500" :
                      vol.verification_status === "rejected" ? "bg-red-500" :
                      "bg-amber-500"
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
                        onClick={() => onStatusChange(vol.id, "verified")}
                        className="h-9 w-9 rounded-xl bg-emerald-500 p-0 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {vol.verification_status !== "rejected" && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onStatusChange(vol.id, "rejected")}
                        className="h-9 w-9 rounded-xl bg-red-500 p-0 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-110 active:scale-95"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewCV(vol)}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-10 py-6 border-t border-slate-50">
          <p className="text-xs font-bold text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredVolunteers.length)} of {filteredVolunteers.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
});

VolunteerGovernance.displayName = "VolunteerGovernance";
