import { memo } from "react";
import { motion } from "framer-motion";
import { Award, Heart, Moon, Star, ShieldCheck, Lock } from "lucide-react";

interface BadgeRibbonProps {
  completedSessionsCount: number;
  hasNightSession: boolean;
  hasCrisisSession: boolean;
}

export const BadgeRibbon = memo(({ 
  completedSessionsCount, 
  hasNightSession, 
  hasCrisisSession 
}: BadgeRibbonProps) => {
  const badges = [
    { id: 'listener', name: 'Empathetic Listener', desc: 'Completed 5 sessions', icon: <Heart className="h-6 w-6" />, color: 'from-rose-400 to-rose-600', earned: completedSessionsCount >= 5 },
    { id: 'night', name: 'Night Owl', desc: 'Late night support', icon: <Moon className="h-6 w-6" />, color: 'from-indigo-400 to-indigo-600', earned: hasNightSession },
    { id: 'veteran', name: '10-Session Hero', desc: 'Reached 10 sessions', icon: <Star className="h-6 w-6" />, color: 'from-amber-400 to-amber-600', earned: completedSessionsCount >= 10 },
    { id: 'savior', name: 'Crisis Guard', desc: 'Handled high-risk', icon: <ShieldCheck className="h-6 w-6" />, color: 'from-emerald-400 to-emerald-600', earned: hasCrisisSession },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white ring-1 ring-slate-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            Your Achievement Badges
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Milestones earned through your support journey.</p>
        </div>
        <div className="flex -space-x-2">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">?</div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map(badge => (
          <motion.div 
            key={badge.id} 
            whileHover={badge.earned ? { y: -5, scale: 1.02 } : {}}
            className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${badge.earned ? 'bg-white/80 border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50'}`}
          >
             <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-5 transition-all ${badge.earned ? `bg-gradient-to-br ${badge.color} text-white shadow-xl shadow-slate-200` : 'bg-slate-200 text-slate-400'}`}>
               {badge.earned ? badge.icon : <Lock className="h-6 w-6" />}
             </div>
             <h4 className={`font-black text-sm tracking-tight ${badge.earned ? 'text-slate-900' : 'text-slate-400'}`}>{badge.name}</h4>
             <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${badge.earned ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{badge.desc}</p>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

BadgeRibbon.displayName = "BadgeRibbon";
