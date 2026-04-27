import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, LayoutDashboard, Clock, Calendar, 
  ChevronRight, FileText, UserCheck, AlertTriangle,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionQueueProps {
  sessions: any[];
  onSelectSession: (session: any) => void;
  computeStatus: (date: string, start: string, end: string) => string;
}

export const SessionQueue = memo(({ 
  sessions, 
  onSelectSession, 
  computeStatus 
}: SessionQueueProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          Active Response Queue
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <Card className="col-span-full p-12 text-center bg-white/50 border-dashed border-slate-200 rounded-[3rem]">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-400">No active or upcoming sessions at the moment.</p>
          </Card>
        ) : sessions.map(session => {
          const status = computeStatus(
            session.time_slots?.slot_date, 
            session.time_slots?.start_time, 
            session.time_slots?.end_time
          );
          
          return (
            <Card 
              key={session.id} 
              className="group relative overflow-hidden rounded-[2.5rem] border-white bg-white p-8 shadow-sm ring-1 ring-slate-200/50 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 font-black text-slate-400 text-sm">
                       {session.student_profiles?.anonymous_username?.charAt(0)}
                    </div>
                    <div>
                       <p className="font-black text-slate-900 group-hover:text-primary transition-colors">{session.student_profiles?.anonymous_username}</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                       }`}>
                         {status === 'active' && '● '} {status}
                       </span>
                    </div>
                 </div>
                 <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ID: {session.id.slice(0, 8)}
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(session.time_slots?.slot_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {session.time_slots?.start_time} - {session.time_slots?.end_time}
                 </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Handoff Briefing</p>
                 <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {session.handoff_briefing || "No pre-session context available."}
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                 <Button 
                   onClick={() => onSelectSession(session)}
                   className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold text-xs"
                 >
                    Enter Workspace
                 </Button>
                 {status === 'active' && (
                   <Button 
                     asChild
                     className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20"
                   >
                     <a 
                       href={`https://meet.jit.si/SoulSync-Session-${session.id}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2"
                     >
                       <Video className="h-4 w-4" />
                       Join Meeting
                     </a>
                   </Button>
                 )}
                 {session.issue_type === 'Crisis' && (
                   <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-500 shadow-lg shadow-red-500/10">
                      <AlertTriangle className="h-5 w-5" />
                   </div>
                 )}
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
});

SessionQueue.displayName = "SessionQueue";
