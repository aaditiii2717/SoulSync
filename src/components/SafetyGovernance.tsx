import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, UserCheck, Search, MessageCircle } from "lucide-react";

export function SafetyGovernance() {
  const steps = [
    {
      icon: EyeOff,
      title: "Absolute Anonymity",
      desc: "No email or login required. Your UUID alias is stored locally on your device.",
    },
    {
      icon: UserCheck,
      title: "Manual Verification",
      desc: "Every peer supporter's credentials and identity are manually verified by our team.",
    },
    {
      icon: Search,
      title: "AI Safety Filter",
      desc: "Real-time moderation via Google Perspective API to ensure a toxic-free ecosystem.",
    },
    {
      icon: Heart,
      title: "Impact First",
      desc: "Supporting SDG 3 (Mental Wellness) through data-driven session outcomes.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Governance</h2>
          <h1 className="text-4xl font-display font-black">Safety Is Our <span className="text-gradient">Top Priority</span></h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-display font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Heart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
