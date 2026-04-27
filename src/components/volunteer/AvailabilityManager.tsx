import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  AlarmClock, Clock, Calendar, 
  ChevronRight, Trash2, Plus, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailabilityManagerProps {
  timeSlots: any[];
  slotDate: string;
  setSlotDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  slotsLoading: boolean;
  onAddSlot: (e: React.FormEvent) => void;
  onDeleteSlot: (id: string) => void;
}

export const AvailabilityManager = memo(({ 
  timeSlots, 
  slotDate, 
  setSlotDate, 
  startTime, 
  setStartTime, 
  endTime, 
  setEndTime, 
  slotsLoading,
  onAddSlot,
  onDeleteSlot
}: AvailabilityManagerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-10"
    >
      <Card className="p-8 rounded-[3rem] border-white bg-white shadow-sm ring-1 ring-slate-200/50 flex flex-col">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          Add Availability
        </h2>
        <form onSubmit={onAddSlot} className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Select Date</label>
            <input 
              type="date" 
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">End Time</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={slotsLoading}
            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl mt-4"
          >
            {slotsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Publish Slot"}
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-2 p-10 rounded-[3rem] border-white bg-white/70 backdrop-blur-xl shadow-sm border border-white ring-1 ring-slate-200/50">
        <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
          <Calendar className="h-6 w-6 text-indigo-500" />
          Scheduled Availability
        </h2>
        
        {timeSlots.length === 0 ? (
          <div className="py-20 text-center">
             <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-slate-200" />
             </div>
             <p className="text-sm font-bold text-slate-400">No active time slots found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timeSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                <div>
                   <p className="text-xs font-black text-slate-900">
                      {new Date(slot.slot_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </p>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {slot.start_time} - {slot.end_time}
                   </p>
                </div>
                <button 
                  onClick={() => onDeleteSlot(slot.id)}
                  className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                   <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
});

AvailabilityManager.displayName = "AvailabilityManager";
