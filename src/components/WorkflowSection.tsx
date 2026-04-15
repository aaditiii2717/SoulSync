import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Arrive exactly as you are",
    desc: "No account walls, no pressure, and no demand to explain everything perfectly. A simple check-in is enough.",
    note: "Start with a mood signal or freeform message.",
    color: "from-primary/20 to-primary/5",
    iconColor: "gradient-wellness",
  },
  {
    step: "02",
    title: "Get a response that slows the moment down",
    desc: "The conversation reflects what you are feeling and gently helps you name what is heavy without making the experience feel clinical.",
    note: "Grounding prompts, reflection, and supportive language.",
    color: "from-calm/20 to-calm/5",
    iconColor: "bg-calm",
  },
  {
    step: "03",
    title: "Choose the kind of support that fits today",
    desc: "Some days a journal prompt is enough. Other days you want resources or a real person. The flow adapts to the emotional need.",
    note: "AI guidance, self-help tools, or peer support.",
    color: "from-warm/20 to-warm/5",
    iconColor: "bg-warm",
  },
  {
    step: "04",
    title: "Stay supported after the first conversation",
    desc: "Mood trends, follow-up care, and safety signals keep the platform useful after the immediate emotional moment has passed.",
    note: "Ongoing awareness without overwhelm.",
    color: "from-safe/20 to-safe/5",
    iconColor: "bg-safe",
  },
];

export function WorkflowSection() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      {/* Ambient blob */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 -z-10 h-[600px] w-[600px] -translate-y-1/2 rounded-full opacity-12"
        style={{ background: "radial-gradient(circle, oklch(0.93 0.08 55 / 0.5), transparent 70%)" }}
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
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary/65">A Gentle Journey</p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            From first breath to{" "}
            <span className="text-gradient">ongoing care</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Every step is meant to reduce emotional friction, so people can move forward without feeling rushed.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16 space-y-5">
          {/* Connector line */}
          <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px md:block">
            <div className="h-full w-full bg-gradient-to-b from-primary/30 via-calm/20 to-transparent" />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="group story-card relative rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_80px_-48px_oklch(0.4_0.09_35_/_0.5)]">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`} />

                <div className="relative grid gap-6 md:grid-cols-[5.5rem_1fr_18rem] md:items-center">
                  {/* Step indicator */}
                  <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconColor} text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      {step.step}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary/60">
                      Step {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-display text-2xl font-semibold leading-tight sm:text-[2rem]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{step.desc}</p>
                  </div>

                  {/* Note pill */}
                  <div className="flex items-start gap-2 rounded-[1.5rem] border border-white/60 bg-white/70 px-5 py-4 text-sm leading-7 text-foreground/80 shadow-sm transition-all duration-200 group-hover:bg-white/85">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary/50" />
                    {step.note}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
