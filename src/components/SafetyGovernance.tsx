import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, UserCheck, Search, MessageCircle, Heart, Sparkles } from "lucide-react";

export function SafetyGovernance() {
  const steps = [
    {
      icon: EyeOff,
      title: "Absolute Anonymity",
      desc: "No email or login required for students. Your UUID alias is stored strictly on your device.",
    },
    {
      icon: UserCheck,
      title: "Manual Verification",
      desc: "Every peer supporter's credentials and identity are manually vetted by our governance team.",
    },
    {
      icon: Search,
      title: "AI Safety Filter",
      desc: "Real-time content moderation via Google's AI models to ensure a toxicity-free ecosystem.",
    },
    {
      icon: Heart,
      title: "Impact First",
      desc: "Supporting SDG 3 (Mental Wellness) through data-driven session outcomes and recovery tracking.",
    },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 border border-slate-100">
            <Shield className="h-3.5 w-3.5" />
            Governance Standard
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900">
            Safety Is Our <span className="text-gradient">Top Priority</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Our multi-layered security architecture ensures that SoulSync remains a safe, anonymous, and trusted space for every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 ring-1 ring-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <step.icon className="h-8 w-8 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-display font-black text-slate-900 mb-4 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-bold">
                {step.desc}
              </p>
              
              <div className="absolute top-6 right-8 text-[10px] font-black uppercase text-slate-200 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                #0{i+1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Governance Badge */}
        <div className="mt-24 flex flex-col items-center">
           <div className="px-8 py-4 rounded-3xl bg-slate-900 text-white flex items-center gap-6 shadow-2xl">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-primary/20 flex items-center justify-center overflow-hidden">
                       <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                 ))}
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">Compliance Status</p>
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">ISO/IEC 27001 Resilience Standard</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-safe/20 flex items-center justify-center">
                 <Sparkles className="h-4 w-4 text-safe" />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
