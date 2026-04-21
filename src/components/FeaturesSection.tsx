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
    color: "bg-primary/10 text-primary",
    span: "lg:col-span-7",
  },
  {
    icon: Sparkles,
    title: "Gentle nudges, not pressure",
    desc: "Instead of overwhelming people with choices, the experience notices emotional strain and offers one grounded step at a time.",
    detail: "Micro-actions that feel doable even on heavy days.",
    color: "bg-calm/10 text-calm",
    span: "lg:col-span-5",
  },
  {
    icon: TrendingUp,
    title: "Patterns that help you understand yourself",
    desc: "Mood-aware prompts and trend signals help users notice what keeps showing up, without turning emotions into cold data.",
    detail: "Reflection that feels personal, not clinical.",
    color: "bg-warm/10 text-warm",
    span: "lg:col-span-4",
  },
  {
    icon: AlertTriangle,
    title: "Safety that stays close",
    desc: "When a conversation turns serious, SoulSync escalates with care, surfacing urgent resources and the safest next move.",
    detail: "Protection built into the emotional flow.",
    color: "bg-alert/10 text-alert",
    span: "lg:col-span-4",
  },
  {
    icon: UserCheck,
    title: "Human support when you are ready",
    desc: "AI can open the door, but peer listeners bring the warmth of being heard by another person who shows up with empathy.",
    detail: "Thoughtful matching keeps the handoff feeling natural.",
    color: "bg-safe/10 text-safe",
    span: "lg:col-span-4",
  },
  {
    icon: BookOpen,
    title: "Support that still helps between conversations",
    desc: "Grounding tools, journaling cues, and self-help resources extend care beyond the moment someone clicks away.",
    detail: "The app keeps supporting people after the chat ends.",
    color: "bg-primary/10 text-primary",
    span: "lg:col-span-6",
  },
  {
    icon: Shield,
    title: "Private enough to be honest",
    desc: "Anonymous by default, so people can say the hard thing without fear of being exposed or judged.",
    detail: "Trust is treated like a feature, not a footer note.",
    color: "bg-calm/10 text-calm",
    span: "lg:col-span-6",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid gap-8 lg:grid-cols-[0.9fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
              Built For Emotional Connection
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              More warmth in the way support is delivered.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              The experience is designed to feel reassuring at every step, from the first message to the moment a human
              steps in.
            </p>
          </div>

          <div className="story-card rounded-[2rem] p-6">
            <p className="text-sm leading-7 text-muted-foreground">
              The goal is not to make mental health support look futuristic. It is to make it feel softer, safer, and
              easier to trust when someone is already carrying a lot.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className={`group surface-card rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_80px_-50px_oklch(0.4_0.08_145_/_0.55)] ${feature.span}`}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>

              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{feature.desc}</p>
                </div>

                <div className="rounded-[1.3rem] bg-white/65 px-4 py-3 text-sm leading-6 text-foreground/85 shadow-sm">
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
