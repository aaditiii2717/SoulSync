import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ResourceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  index: number;
  onClick?: () => void;
}

export function ResourceCard({ icon: Icon, title, description, tags, index, onClick }: ResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className="group rounded-[2rem] border bg-card p-8 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Icon className="h-20 w-24" />
      </div>
      
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
