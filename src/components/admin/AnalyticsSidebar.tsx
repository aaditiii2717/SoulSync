import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, PieChart, TrendingUp, Info 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area,
  PieChart as RePieChart, Pie, Legend
} from 'recharts';

interface AnalyticsSidebarProps {
  chartData: any[];
  issueDistribution: any[];
}

export const AnalyticsSidebar = memo(({ chartData, issueDistribution }: AnalyticsSidebarProps) => {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-[3rem] border-white bg-white p-8 shadow-md ring-1 ring-slate-200/50">
        <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
          <BarChart3 className="h-6 w-6 text-primary" />
          Impact Velocity
        </h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                dy={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', color: '#000', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Index</p>
            <p className="text-xl font-black text-emerald-600">+24.5%</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[3rem] border-white bg-white p-8 shadow-md ring-1 ring-slate-200/50">
        <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
          <PieChart className="h-6 w-6 text-emerald-500" />
          Issue Distribution
        </h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={issueDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {issueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                content={(props) => (
                  <div className="flex justify-center gap-4 mt-4">
                    {props.payload?.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[3rem] border-none bg-navy p-8 shadow-xl ring-1 ring-white/10 text-white relative">
        <h2 className="mb-6 flex items-center gap-3 text-xl font-black tracking-tight relative z-10">
          <Info className="h-6 w-6 text-primary" />
          System Intelligence
        </h2>
        <div className="space-y-6 relative z-10">
          {[
            { name: "Global Sync", status: "Operational", color: "bg-emerald-500" },
            { name: "AI Protocol", status: "Active", color: "bg-primary" },
            { name: "Support API", status: "Stable", color: "bg-blue-500" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <p className="text-xs font-bold text-slate-400">{s.name}</p>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${s.color} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      </Card>
    </div>
  );
});

AnalyticsSidebar.displayName = "AnalyticsSidebar";
