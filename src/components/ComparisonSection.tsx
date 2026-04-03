import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const rows = [
  { feature: "Approach", normal: "Reactive", ours: "Proactive" },
  { feature: "Chat Intelligence", normal: "Generic chat", ours: "Emotion-aware AI" },
  { feature: "Safety Layer", normal: "None", ours: "Crisis escalation" },
  { feature: "Analytics", normal: "No tracking", ours: "Mood analytics" },
  { feature: "Matching", normal: "Random", ours: "Smart matching" },
];

export function ComparisonSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Why <span className="text-gradient">We&apos;re Different</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-card overflow-hidden"
        >
          <div className="grid grid-cols-3 text-sm font-semibold border-b">
            <div className="p-4 text-muted-foreground">Feature</div>
            <div className="p-4 text-center text-muted-foreground">Normal Apps</div>
            <div className="p-4 text-center gradient-wellness text-primary-foreground"><div className="p-4 text-center gradient-wellness text-primary-foreground">SoulSync</div></div>
          </div>
          {rows.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 text-sm border-b last:border-0">
              <div className="p-4 font-medium">{row.feature}</div>
              <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <X className="h-4 w-4 text-destructive" />
                {row.normal}
              </div>
              <div className="p-4 text-center flex items-center justify-center gap-1.5 bg-primary/5 font-medium text-primary">
                <Check className="h-4 w-4" />
                {row.ours}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
