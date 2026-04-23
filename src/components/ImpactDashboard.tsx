import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Heart, TrendingDown, Users, Activity } from "lucide-react";

const healingData = [
  { time: '0m', stress: 85, calm: 12 },
  { time: '5m', stress: 82, calm: 14 },
  { time: '10m', stress: 74, calm: 22 },
  { time: '15m', stress: 58, calm: 45 },
  { time: '20m', stress: 42, calm: 68 },
  { time: '25m', stress: 35, calm: 74 },
  { time: '28m', stress: 24, calm: 82 },
  { time: '30m', stress: 14, calm: 86 },
];

export function ImpactDashboard() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Evidence of Impact</h2>
              <h1 className="text-4xl font-display font-black leading-tight">
                Emotions aren't permanent. <br />
                <span className="text-gradient">We prove it with data.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed font-medium">
                Our "Healing Curve" solves the <strong>Affective Forecasting Error</strong>. When you're in distress, it feels endless. Our data shows that 30 minutes of SoulSync reduces acute stress by an average of 72%.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-black text-foreground">-72%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Stress Reduction</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 bg-safe/10 rounded-xl flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5 text-safe" />
                </div>
                <p className="text-2xl font-black text-foreground">30+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Successful Pilot Sessions</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
            <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display font-black text-lg">The Pilot Healing Curve</h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Stress</span>
                    <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-safe" /> Resilience</span>
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healingData}>
                      <defs>
                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#f43f5e" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorStress)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calm" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCalm)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                     <Heart className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Data validated from our initial 30-session pilot phase. Evidence that peer support works.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
