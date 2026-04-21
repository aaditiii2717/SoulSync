import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ResourceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  index: number;
}

export function ResourceCard({ icon: Icon, title, description, tags, index }: ResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="group rounded-2xl border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
