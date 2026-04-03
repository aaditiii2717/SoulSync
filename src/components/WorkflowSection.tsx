import { motion } from "framer-motion";

const steps = [
  { emoji: "🏠", label: "Enter", desc: "User opens the platform" },
  { emoji: "🎭", label: "Select Mood", desc: "Choose how you're feeling" },
  { emoji: "🤖", label: "AI Chat", desc: "Empathetic AI conversation" },
  { emoji: "💡", label: "Get Options", desc: "AI suggests support paths" },
  { emoji: "🤝", label: "Peer Match", desc: "Connect with the right peer" },
  { emoji: "💬", label: "Chat Session", desc: "Safe, anonymous conversation" },
  { emoji: "🛡️", label: "AI Monitors", desc: "Real-time safety monitoring" },
  { emoji: "🌱", label: "Follow-up", desc: "Continued support & tracking" },
];

export function WorkflowSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-calm">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Complete workflow from entry to follow-up support</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative flex flex-col items-center text-center bg-card rounded-2xl p-5 border hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">{step.emoji}</div>
              <div className="text-xs font-bold text-primary mb-1">Step {i + 1}</div>
              <h3 className="font-display text-sm font-semibold">{step.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
