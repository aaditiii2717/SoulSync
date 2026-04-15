import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const ordinaryExperience = [
  "Feels like a generic chatbot instead of a caring conversation.",
  "Pushes choices before helping users name what they feel.",
  "Treats privacy and emotional safety like secondary features.",
  "Offers static help instead of adapting to distress levels.",
];

const soulSyncExperience = [
  "Begins with empathy, reflection, and emotionally aware language.",
  "Moves from check-in to resources or human support with less pressure.",
  "Builds anonymity and safety cues directly into the journey.",
  "Combines AI warmth, peer listening, and smart escalation when needed.",
];

export function ComparisonSection() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      {/* Ambient blob */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 -z-10 h-[500px] w-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, oklch(0.90 0.07 190 / 0.5), transparent 70%)" }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary/65">Why It Feels Different</p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Support that feels{" "}
            <span className="text-gradient">emotionally closer</span> than a normal app.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Most support tools are functional. SoulSync is designed to feel reassuring in the middle of a
            vulnerable moment.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Typical apps */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card rounded-[2.2rem] p-8"
          >
            <div className="inline-flex items-center rounded-full border border-border/60 bg-white/65 px-4 py-2 text-sm font-medium text-muted-foreground">
              Typical support apps
            </div>
            <h3 className="mt-6 font-display text-3xl font-semibold leading-tight">
              Functional, but emotionally distant.
            </h3>

            <div className="mt-8 space-y-3">
              {ordinaryExperience.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 rounded-[1.4rem] border border-white/50 bg-white/65 px-4 py-4 shadow-sm"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SoulSync */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gradient-hero rounded-[2.2rem] p-[1.5px] shadow-[0_36px_100px_-55px_oklch(0.45_0.13_35_/_0.75)]">
              <div className="h-full rounded-[2.1rem] bg-background/92 p-8 backdrop-blur-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary [animation:pulse-glow_2.8s_ease-in-out_infinite]" />
                  SoulSync
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold leading-tight">
                  A warmer path from first check-in to real support.
                </h3>

                <div className="mt-8 space-y-3">
                  {soulSyncExperience.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 rounded-[1.4rem] border border-white/65 bg-white/75 px-4 py-4 shadow-sm transition-colors duration-200 hover:bg-white/90"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-safe/15">
                        <Check className="h-4 w-4 text-safe" />
                      </div>
                      <p className="text-sm leading-7 text-foreground/85">{item}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="soft-divider mt-8 h-px" />

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Emotion-aware", "Human handoff", "Safety-led"].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="rounded-[1.2rem] border border-white/65 bg-white/65 px-4 py-3 text-center text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white hover:scale-105 hover:shadow-sm cursor-default"
                    >
                      {label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
