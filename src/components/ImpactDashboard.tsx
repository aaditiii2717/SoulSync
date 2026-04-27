import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Heart, TrendingDown, Activity, Sparkles } from "lucide-react";

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
    <section className="py-32 bg-navy relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          <div className="flex-1 space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 border border-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Evidence of Impact
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black leading-tight text-white tracking-tight">
                Emotions aren't permanent. <br />
                <span className="text-primary italic">We prove it with data.</span>
              </h1>
              <p className="mt-8 text-lg text-slate-400 leading-relaxed font-medium max-w-xl">
                Our "Healing Curve" solves the <strong>Affective Forecasting Error</strong>. When you're in distress, it feels endless. Our data shows that 30 minutes of SoulSync reduces acute stress by an average of 72%.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="h-12 w-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingDown className="h-6 w-6 text-rose-500" />
                </div>
                <p className="text-3xl font-black text-white">-72%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Avg. Stress Reduction</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-black text-white">30+</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Successful Pilot Sessions</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-navy p-10 rounded-[3.5rem] shadow-2xl border border-white/10 overflow-hidden ring-1 ring-white/5">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="font-display font-black text-xl text-white">The Pilot Healing Curve</h3>
                  <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2 text-rose-500"><div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Stress</span>
                    <span className="flex items-center gap-2 text-primary"><div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> Resilience</span>
                  </div>
               </div>
               
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healingData}>
                      <defs>
                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}}
                        dy={15}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                        itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                        labelStyle={{ fontWeight: 'black', color: '#94a3b8', marginBottom: '8px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#f43f5e" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorStress)" 
                        animationDuration={2000}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calm" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCalm)" 
                        animationDuration={2500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
                  <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                     <Heart className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">
                    Data validated from our initial 30-session pilot phase. Peer support is a scientifically verified pillar of emotional recovery.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
