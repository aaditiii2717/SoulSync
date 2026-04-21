import { motion } from "framer-motion";
import { MapPin, Phone, Shield, ExternalLink, Navigation } from "lucide-react";

export function CrisisMap() {
  const centers = [
    {
      name: "The Banyan Wellness Center",
      location: "Chennai, India",
      type: "NGO Support Center",
      phone: "+91 44 2835 1234",
      distance: "2.4 km away",
    },
    {
      name: "NIMHANS Support Hub",
      location: "Bangalore, India",
      type: "Authorized Help Center",
      phone: "080-26995000",
      distance: "5.1 km away",
    },
    {
      name: "Snehi Community Space",
      location: "New Delhi, India",
      type: "Youth Safe Space",
      phone: "+91 11 2651 8606",
      distance: "3.8 km away",
    }
  ];

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden">
      <div className="bg-red-50 p-6 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-500 rounded-2xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-black text-red-900">Safety Priority Actions</h3>
            <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Nearby Official Support</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        {/* Mock Map Visual */}
        <div className="relative h-48 w-full bg-slate-100 rounded-[2rem] overflow-hidden mb-2">
           <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=4&size=600x400&key=MOCK')] bg-cover bg-center grayscale opacity-40" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 text-xs font-bold text-slate-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Live Google Maps Integration
              </div>
           </div>
           
           {/* Animated Pulse Pins */}
           <div className="absolute top-1/4 left-1/3 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
           <div className="absolute top-1/2 left-2/3 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </div>

        <div className="p-4 space-y-3">
          {centers.map((center, i) => (
            <motion.div 
              key={center.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{center.type}</p>
                   <h4 className="font-bold text-slate-900">{center.name}</h4>
                   <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                      <MapPin className="h-3 w-3" /> {center.location} • {center.distance}
                   </div>
                </div>
                <button className="h-10 w-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200">
         <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest mb-4">Urgent Assistance</p>
         <div className="grid grid-cols-2 gap-3">
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all">
               <Phone className="h-4 w-4" /> Call Help
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold text-white hover:bg-black transition-all">
               <ExternalLink className="h-4 w-4" /> Visit Site
            </button>
         </div>
      </div>
    </div>
  );
}
