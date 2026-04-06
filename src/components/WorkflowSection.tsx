import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Arrive exactly as you are",
    desc: "No account walls, no pressure, and no demand to explain everything perfectly. A simple check-in is enough.",
    note: "Start with a mood signal or freeform message.",
  },
  {
    step: "02",
    title: "Get a response that slows the moment down",
    desc: "The conversation reflects what you are feeling and gently helps you name what is heavy without making the experience feel clinical.",
    note: "Grounding prompts, reflection, and supportive language.",
  },
  {
    step: "03",
    title: "Choose the kind of support that fits today",
    desc: "Some days a journal prompt is enough. Other days you want resources or a real person. The flow adapts to the emotional need.",
    note: "AI guidance, self-help tools, or peer support.",
  },
  {
    step: "04",
    title: "Stay supported after the first conversation",
    desc: "Mood trends, follow-up care, and safety signals keep the platform useful after the immediate emotional moment has passed.",
    note: "Ongoing awareness without overwhelm.",
  },
];

export function WorkflowSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
            A Gentle Journey
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            From first breath to ongoing care
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Every step is meant to reduce emotional friction, so people can move forward without feeling rushed.
          </p>
        </div>

        <div className="relative mt-16 space-y-6">
          <div className="absolute left-6 top-6 hidden h-[calc(100%-3rem)] w-px soft-divider md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="story-card relative rounded-[2rem] p-6 sm:p-7"
            >
              <div className="grid gap-6 md:grid-cols-[5rem_1fr_17rem] md:items-center">
                <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-wellness text-sm font-semibold text-primary-foreground shadow-sm">
                    {step.step}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Step {index + 1}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight sm:text-[2rem]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{step.desc}</p>
                </div>

                <div className="rounded-[1.5rem] bg-white/65 px-4 py-4 text-sm leading-7 text-foreground/85 shadow-sm">
                  {step.note}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
