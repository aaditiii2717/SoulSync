import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Activity, HeartHandshake, Sparkles } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalStudents: number;
    totalSessions: number;
    totalDonations: number;
    pendingVolunteers: number;
    impactScore: number;
  };
}

export const StatsGrid = memo(({ stats }: StatsGridProps) => {
  const items = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-primary", bg: "bg-primary/5" },
    { label: "Sessions Held", value: stats.totalSessions, icon: Activity, color: "text-white", bg: "bg-navy" },
    { label: "Community Support", value: `₹${stats.totalDonations}`, icon: HeartHandshake, color: "text-primary", bg: "bg-primary/5" },
    { label: "Impact Rating", value: `+${stats.impactScore}`, icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="block"
        >
          <Card className={`group relative overflow-hidden rounded-[2.5rem] border-white p-8 shadow-md ring-1 ring-slate-200/50 transition-all hover:shadow-xl h-full flex flex-col justify-between ${item.bg === 'bg-navy' ? 'bg-navy text-white' : 'bg-white'}`}>
            <div>
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} border border-slate-100/10 transition-transform group-hover:scale-110`}>
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            </div>
            <div className="mt-4 min-h-[48px] flex items-end">
              <h3 className={`text-4xl font-black tracking-tight tabular-nums ${item.bg === 'bg-navy' ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </h3>
            </div>
            
            {item.bg === 'bg-navy' && (
               <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            )}
            
            {item.label === "Impact Rating" && (
               <div className="absolute -right-2 -bottom-2 opacity-5">
                  <Sparkles className="h-24 w-24 text-emerald-500" />
               </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";
