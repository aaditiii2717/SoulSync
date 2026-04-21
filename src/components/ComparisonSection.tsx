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
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
            Why It Feels Different
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Support that feels emotionally closer than a normal app.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Most support tools are functional. SoulSync is designed to feel reassuring in the middle of a vulnerable
            moment.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="surface-card rounded-[2rem] p-8"
          >
            <div className="inline-flex items-center rounded-full border border-border/70 bg-white/65 px-4 py-2 text-sm font-medium text-muted-foreground">
              Typical support apps
            </div>
            <h3 className="mt-6 font-display text-3xl font-semibold leading-tight">
              Functional, but emotionally distant.
            </h3>

            <div className="mt-8 space-y-4">
              {ordinaryExperience.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.4rem] bg-white/65 px-4 py-4 shadow-sm">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="gradient-hero rounded-[2rem] p-[1px] shadow-[0_32px_90px_-52px_oklch(0.45_0.12_145_/_0.75)]"
          >
            <div className="h-full rounded-[1.95rem] bg-background/90 p-8 backdrop-blur-xl">
              <div className="inline-flex items-center rounded-full bg-primary/12 px-4 py-2 text-sm font-medium text-primary">
                SoulSync
              </div>
              <h3 className="mt-6 font-display text-3xl font-semibold leading-tight">
                A warmer path from first check-in to real support.
              </h3>

              <div className="mt-8 space-y-4">
                {soulSyncExperience.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.4rem] bg-white/70 px-4 py-4 shadow-sm">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-safe/15">
                      <Check className="h-4 w-4 text-safe" />
                    </div>
                    <p className="text-sm leading-7 text-foreground/85">{item}</p>
                  </div>
                ))}
              </div>

              <div className="soft-divider mt-8 h-px" />

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Emotion-aware", "Human handoff", "Safety-led"].map((label) => (
                  <div
                    key={label}
                    className="rounded-[1.2rem] border border-white/60 bg-white/60 px-4 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
