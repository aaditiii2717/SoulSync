import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const ordinaryExperience = [
  "Feels like a generic chatbot instead of a caring conversation.",
  "Pushes choices before helping users name what they feel.",
  "Requires complex logins that discourage people in distress.",
  "No easy transition to human peer support when needed.",
];

const soulsyncExperience = [
  "A softer entry point that prioritizes emotional rhythm first.",
  "Guides people to name their experience at their own pace.",
  "Zero Trace: Absolute anonymity and no login required.",
  "Seamless handoff to verified peer supporters and resources.",
];

export function ComparisonSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
            The Difference
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            A softer place for hard moments.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[3rem] border border-slate-100 bg-slate-50/50 p-10 sm:p-14"
          >
            <h3 className="font-display text-2xl font-semibold text-slate-500">
              The Ordinary Experience
            </h3>
            <ul className="mt-8 space-y-6">
              {ordinaryExperience.map((item) => (
                <li key={item} className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/50 text-slate-400">
                    <X className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-slate-500 font-medium">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative perspective-deep"
          >
            <div
              className="glass-card rounded-[3rem] p-10 sm:p-14 border-primary/20 shadow-2xl shadow-primary/10"
              style={{ transform: "rotateY(-4deg)" }}
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-32 w-32 bg-primary/10 blur-3xl" />
              
              <h3 className="font-display text-2xl font-semibold text-primary">
                The SoulSync Rhythm
              </h3>
              <ul className="mt-8 space-y-6">
                {soulsyncExperience.map((item) => (
                  <li key={item} className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-7 text-foreground font-semibold">{item}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex items-center gap-4 rounded-3xl bg-primary/5 p-6 border border-primary/10">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                  Focus on emotional friction reduction
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
