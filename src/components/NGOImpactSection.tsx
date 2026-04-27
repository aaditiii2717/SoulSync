import { motion } from "framer-motion";
import { INDIAN_NGO_PARTNERS } from "@/constants/partners";

export function NGOImpactSection() {
  const partners = INDIAN_NGO_PARTNERS;

  const stats = [
    { label: "Students Supported", value: "100+" },
    { label: "Active Peer Supporters", value: "40+" },
    { label: "NGO Partners", value: "4" },
    { label: "SDG Impact Goals", value: "3 & 17" },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Social Impact Architecture</h2>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900">
            Trusted by Leading <span className="text-gradient">Impact Partners</span>
          </h1>
        </div>

        {/* Logo Marquee - Glass Style */}
        <div className="flex flex-wrap justify-center items-center gap-16 mb-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          {partners.map((p) => (
            <div key={p.name} className="group cursor-default">
              <span className="text-2xl font-display font-black text-slate-300 group-hover:text-primary transition-colors">
                {p.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats Grid - Premium Navy Aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative p-10 rounded-[3rem] bg-navy border border-white/5 shadow-2xl overflow-hidden transition-all hover:-translate-y-2"
            >
              <div className="relative z-10">
                <p className="text-4xl font-display font-black text-white mb-2 group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
              
              {/* Animated Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
