import { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const GovernanceLogs = memo(() => {
  const [logs, setLogs] = useState([
    { event: "VO_INIT_AUTH", identity: "192.168.1.104", time: "01:24:09", type: "system", detail: "Handshake successful." },
    { event: "USER_CRISIS_SIG", identity: "AES_ENC_#442", time: "01:23:44", type: "urgent", detail: "Grounding protocol initiated." },
    { event: "VOL_APP_RECV", identity: "RAHUL_S_PRO", time: "01:22:15", type: "success", detail: "Vetting queue updated." },
    { event: "DB_SYNC_COMPL", identity: "GLOBAL_NODE_1", time: "01:20:00", type: "info", detail: "Delta sync: 44.2ms" }
  ]);

  useEffect(() => {
    const events = [
      { event: "HEARTBEAT_ACK", identity: "SYS_CORE", type: "system", detail: "Global nodes responsive." },
      { event: "RLS_AUDIT_PASS", identity: "SUPA_GUARD", type: "success", detail: "Row level security verified." },
      { event: "TRAFFIC_SPIKE", identity: "EDGE_NODE_4", type: "info", detail: "Load balancer redistributing." }
    ];

    const timer = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const newLog = {
        ...randomEvent,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-12">
      <Card className="overflow-hidden rounded-[3rem] border-white/10 bg-navy p-10 shadow-2xl ring-1 ring-white/10 relative">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white">Neural Governance Stream</h3>
              <p className="text-sm font-medium text-slate-400">Encrypted audit of platform intelligence.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Trace</span>
            </div>
            <Button variant="ghost" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              Export Logs
            </Button>
          </div>
        </div>
        <div className="space-y-2 font-mono relative z-10">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div 
                key={log.time + log.event}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-slate-500">{log.time}</span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    log.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {log.event}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{log.detail}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-700 hidden sm:block">CID: {log.identity}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      </Card>
    </div>
  );
});

GovernanceLogs.displayName = "GovernanceLogs";
