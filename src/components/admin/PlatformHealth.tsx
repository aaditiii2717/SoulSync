import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Shield } from "lucide-react";

interface PlatformHealthProps {
  healthData: { label: string; status: string; value: number }[];
}

export const PlatformHealth = memo(({ healthData }: PlatformHealthProps) => {
  return (
    <div id="health" className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8 scroll-mt-32">
      <Card className="lg:col-span-3 overflow-hidden rounded-[3rem] border-white bg-white p-10 shadow-md ring-1 ring-slate-200/50">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Server className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Infrastructure Integrity</h3>
              <p className="text-sm font-medium text-slate-500">Real-time status of global security protocols.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">All Systems Nominal</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {healthData.map((item, i) => (
            <div key={i} className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <span className="text-[10px] font-black text-emerald-600">{item.status}</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${item.value}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[3rem] bg-navy p-8 text-white shadow-xl shadow-primary/10 border border-white/10 relative">
        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 relative z-10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-black mb-2 relative z-10">Audit Readiness</h3>
        <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6 relative z-10">Your platform is currently 100% compliant with global privacy standards.</p>
        <Button variant="hero" className="w-full bg-white text-navy hover:bg-slate-100 border-none h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 relative z-10">
          Download Report
        </Button>
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      </Card>
    </div>
  );
});

PlatformHealth.displayName = "PlatformHealth";
