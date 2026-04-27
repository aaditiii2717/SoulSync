import { memo } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface VolunteerStatsProps {
  volunteerName: string;
  activeMinutes: number;
  totalSessions: number;
  upcomingSessionsCount: number;
  onLogout: () => void;
  formatDuration: (minutes: number) => string;
}

export const VolunteerStats = memo(({ 
  volunteerName, 
  activeMinutes, 
  totalSessions, 
  upcomingSessionsCount, 
  onLogout,
  formatDuration
}: VolunteerStatsProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
      <div>
        <h1 className="text-4xl font-display font-black flex items-center gap-4 text-slate-900 tracking-tight">
          Welcome, {volunteerName.split(" ")[0]}
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border border-emerald-100">Verified Peer Supporter</span>
        </h1>
        <div className="flex items-center gap-4 mt-2">
            Managing your anonymous student support journey.
          <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="h-3 w-3" />
            Sign Out
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
         <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100 text-center min-w-[140px]">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Hours</p>
           <p className="text-2xl font-black text-slate-900">{formatDuration(activeMinutes)}</p>
         </div>
         <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-slate-100 text-center min-w-[140px]">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Sessions</p>
           <p className="text-2xl font-black text-slate-900">{totalSessions}</p>
         </div>
         <div className="bg-navy px-8 py-4 rounded-3xl shadow-xl text-center min-w-[140px] border border-white/10">
           <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Upcoming</p>
           <p className="text-2xl font-black text-white">{upcomingSessionsCount}</p>
         </div>
      </div>
    </div>
  );
});

VolunteerStats.displayName = "VolunteerStats";
