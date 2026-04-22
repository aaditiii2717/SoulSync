import { motion } from "framer-motion";

import { INDIAN_NGO_PARTNERS } from "@/constants/partners";

export function NGOImpactSection() {
  const partners = INDIAN_NGO_PARTNERS;

  const stats = [
    { label: "Students Supported", value: "500+" },
    { label: "Active Peer Supporters", value: "40+" },
    { label: "NGO Partners", value: "4" },
    { label: "SDG Impact Goals", value: "3 & 17" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Social Impact</h2>
          <h1 className="text-4xl font-display font-black">Trusted by Leading <span className="text-gradient">Impact Partners</span></h1>
        </div>

        {/* Logo Marquee */}
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-20 px-8">
           {partners.map((p) => (
             <span key={p.name} className="text-xl font-display font-bold text-slate-400">{p.name}</span>
           ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
           {stats.map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center"
             >
                <p className="text-3xl font-display font-black text-primary mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
