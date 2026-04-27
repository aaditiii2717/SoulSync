import { memo } from "react";
import { Zap, CheckCircle, TrendingUp, Heart, Award, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpactDashboardProps {
  activeMinutes: number;
  uniqueStudentsCount: number;
  formatDuration: (minutes: number) => string;
}

export const VolunteerImpactMetrics = memo(({ 
  activeMinutes, 
  uniqueStudentsCount, 
  formatDuration 
}: ImpactDashboardProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 p-10 rounded-[3rem] border-white/40 bg-navy text-white relative overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
               <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Your Impact Dashboard</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">My Listen-Time</p>
               <p className="text-5xl font-black text-white tabular-nums">{formatDuration(activeMinutes)}</p>
               <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <p className="text-xs text-primary/80 font-bold">Growing Impact</p>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Students Helped</p>
               <p className="text-5xl font-black text-white tabular-nums">{uniqueStudentsCount}</p>
               <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-rose-400" />
                  <p className="text-xs text-rose-400/80 font-bold">Empathetic Reach</p>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">My Rating</p>
               <p className="text-5xl font-black text-white tabular-nums">98.2%</p>
               <div className="flex items-center gap-2">
                  <Award className="h-3 w-3 text-primary" />
                  <p className="text-xs text-primary/80 font-bold">Trusted Peer</p>
               </div>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/[0.07] transition-all">
             <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                   <CheckCircle className="h-7 w-7" />
                </div>
                <div>
                   <p className="text-base font-black">Support Standards Met</p>
                   <p className="text-xs text-slate-400 font-medium">Your session reviews are consistently positive.</p>
                </div>
             </div>
             <Button className="rounded-xl bg-white text-navy hover:bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] px-8 h-12 transition-all active:scale-95">My History</Button>
          </div>
        </div>

        {/* Advanced Decorative Background */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="space-y-6">
        <div className="p-8 rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm border border-white ring-1 ring-slate-200/50">
          <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Community Praise
          </h4>
          <div className="space-y-6">
             <div className="relative">
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "Thank you for just listening without judging. I feel much lighter tonight."
                </p>
                <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest">— Anonymous Student</p>
             </div>
             <div className="h-px bg-slate-100" />
             <div className="relative">
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "The breathing technique you showed me actually helped during my exam today!"
                </p>
                <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest">— Anonymous Student</p>
             </div>
          </div>
        </div>

        <div className="p-8 rounded-[3rem] border-none bg-gradient-to-br from-navy to-slate-900 text-white shadow-xl group cursor-pointer overflow-hidden relative">
          <div className="relative z-10">
            <Medal className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform text-primary" />
            <h4 className="font-black text-lg">Next Milestone</h4>
            <p className="text-sm text-white/80 mt-1 mb-6">Support 5 more students to reach 'Mentor' status.</p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
               <div className="bg-primary h-full w-[60%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
        </div>
      </div>
    </div>
  );
});

VolunteerImpactMetrics.displayName = "VolunteerImpactMetrics";
