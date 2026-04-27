import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XCircle, Activity, RefreshCw, UserCheck 
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type VolunteerRecord = Tables<"volunteers">;

interface VolunteerDrawerProps {
  selectedVolunteer: VolunteerRecord | null;
  onClose: () => void;
  volunteerSessions: any[];
  sessionsLoading: boolean;
}

export const VolunteerDrawer = memo(({ 
  selectedVolunteer, 
  onClose, 
  volunteerSessions, 
  sessionsLoading 
}: VolunteerDrawerProps) => {
  return (
    <AnimatePresence>
      {selectedVolunteer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 text-primary font-black text-xl">
                      {selectedVolunteer.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-900">{selectedVolunteer.name}</h3>
                    <p className="text-sm font-bold text-slate-500">{selectedVolunteer.email}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <XCircle className="h-7 w-7" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 space-y-8">
                {/* Performance Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-white shadow-sm ring-1 ring-slate-200/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Impact</p>
                      <p className="text-2xl font-black text-slate-900">{volunteerSessions.length} Sessions</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-white shadow-sm ring-1 ring-slate-200/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                      <p className="text-2xl font-black text-emerald-600 capitalize">{selectedVolunteer.verification_status}</p>
                  </div>
                </div>

                {/* Session Timeline */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Session Oversight
                  </h4>
                  <div className="space-y-4">
                      {sessionsLoading ? (
                        <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-primary/30" /></div>
                      ) : volunteerSessions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200">
                          <p className="text-sm font-bold text-slate-400">No sessions recorded yet.</p>
                        </div>
                      ) : volunteerSessions.map(session => (
                        <div key={session.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm ring-1 ring-slate-200/50">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <UserCheck className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-900">{session.student_profiles?.anonymous_username}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Volunteer Insight</p>
                             <p className="text-xs text-slate-600 leading-relaxed italic">
                                {session.volunteer_notes || "No notes saved for this session."}
                             </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white">
               <button 
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl"
                onClick={() => {
                  import("sonner").then(({ toast }) => {
                    toast.info(`Generating deep performance report for ${selectedVolunteer.name}...`);
                  });
                }}
               >
                  Generate Quality Review (AI)
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

VolunteerDrawer.displayName = "VolunteerDrawer";
