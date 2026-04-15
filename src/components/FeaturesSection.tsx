import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  MessageCircleHeart,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const features = [
  {
    icon: MessageCircleHeart,
    title: "A calmer first reply",
    desc: "SoulSync responds like a supportive companion, helping users untangle what they feel before asking them to make decisions.",
    detail: "Warm language, reflective prompts, and low-pressure next steps.",
    color: "bg-primary/12 text-primary",
    glow: "oklch(0.61 0.17 33 / 0.15)",
    span: "lg:col-span-7",
  },
  {
    icon: Sparkles,
    title: "Gentle nudges, not pressure",
    desc: "Instead of overwhelming people with choices, the experience notices emotional strain and offers one grounded step at a time.",
    detail: "Micro-actions that feel doable even on heavy days.",
    color: "bg-calm/12 text-calm",
    glow: "oklch(0.65 0.12 195 / 0.15)",
    span: "lg:col-span-5",
  },
  {
    icon: TrendingUp,
    title: "Patterns that help you understand yourself",
    desc: "Mood-aware prompts and trend signals help users notice what keeps showing up, without turning emotions into cold data.",
    detail: "Reflection that feels personal, not clinical.",
    color: "bg-warm/12 text-warm",
    glow: "oklch(0.78 0.15 72 / 0.15)",
    span: "lg:col-span-4",
  },
  {
    icon: AlertTriangle,
    title: "Safety that stays close",
    desc: "When a conversation turns serious, SoulSync escalates with care, surfacing urgent resources and the safest next move.",
    detail: "Protection built into the emotional flow.",
    color: "bg-alert/12 text-alert",
    glow: "oklch(0.64 0.2 25 / 0.15)",
    span: "lg:col-span-4",
  },
  {
    icon: UserCheck,
    title: "Human support when you are ready",
    desc: "AI can open the door, but peer listeners bring the warmth of being heard by another person who shows up with empathy.",
    detail: "Thoughtful matching keeps the handoff feeling natural.",
    color: "bg-safe/12 text-safe",
    glow: "oklch(0.67 0.15 155 / 0.15)",
    span: "lg:col-span-4",
  },
  {
    icon: BookOpen,
    title: "Support that still helps between conversations",
    desc: "Grounding tools, journaling cues, and self-help resources extend care beyond the moment someone clicks away.",
    detail: "The app keeps supporting people after the chat ends.",
    color: "bg-primary/12 text-primary",
    glow: "oklch(0.61 0.17 33 / 0.12)",
    span: "lg:col-span-6",
  },
  {
    icon: Shield,
    title: "Private enough to be honest",
    desc: "Anonymous by default, so people can say the hard thing without fear of being exposed or judged.",
    detail: "Trust is treated like a feature, not a footer note.",
    color: "bg-calm/12 text-calm",
    glow: "oklch(0.65 0.12 195 / 0.12)",
    span: "lg:col-span-6",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      {/* Section ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.90 0.07 190 / 0.6), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 grid gap-8 lg:grid-cols-[0.95fr_0.65fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary/65">
              Built For Emotional Connection
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              More warmth in the way{" "}
              <span className="text-gradient">support is delivered.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              The experience is designed to feel reassuring at every step, from the first message to the moment a
              human steps in.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="story-card rounded-[2rem] p-7"
          >
            <p className="text-sm leading-7 text-muted-foreground">
              The goal is not to make mental health support look futuristic. It is to make it feel{" "}
              <span className="font-semibold text-foreground">softer, safer, and easier to trust</span> when
              someone is already carrying a lot.
            </p>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative premium-card rounded-[2rem] p-7 transition-all duration-350 hover:-translate-y-1.5 hover:shadow-[0_40px_90px_-52px_oklch(0.4_0.09_35_/_0.6)] ${feature.span}`}
              style={{ "--glow-color": feature.glow } as React.CSSProperties}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${feature.glow}, transparent 65%)` }}
              />

              <div className={`relative mb-5 flex h-13 w-13 items-center justify-center rounded-2xl ${feature.color} shadow-sm`}>
                <feature.icon className="h-5 w-5" />
              </div>

              <div className="relative flex h-full flex-col justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">{feature.desc}</p>
                </div>

                <div className="rounded-[1.3rem] border border-white/60 bg-white/70 px-4 py-3 text-sm leading-6 text-foreground/80 shadow-sm transition-colors duration-200 group-hover:bg-white/85">
                  {feature.detail}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
