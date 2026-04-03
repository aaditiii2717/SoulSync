import { motion } from "framer-motion";

export type MoodType = "great" | "good" | "okay" | "low" | "struggling";

interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
  color: string;
}

const moods: MoodOption[] = [
  { value: "great", emoji: "😄", label: "Great", color: "hover:border-safe/60 hover:bg-safe/5" },
  { value: "good", emoji: "🙂", label: "Good", color: "hover:border-primary/60 hover:bg-primary/5" },
  { value: "okay", emoji: "😐", label: "Okay", color: "hover:border-calm/60 hover:bg-calm/5" },
  { value: "low", emoji: "😔", label: "Low", color: "hover:border-warm/60 hover:bg-warm/5" },
  { value: "struggling", emoji: "😢", label: "Struggling", color: "hover:border-alert/60 hover:bg-alert/5" },
];

interface MoodSelectorProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {moods.map((mood, i) => (
        <motion.button
          key={mood.value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onSelect(mood.value)}
          className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 w-24 transition-all duration-200 ${mood.color} ${
            selected === mood.value
              ? "border-primary bg-primary/10 shadow-md scale-105"
              : "border-border bg-card"
          }`}
        >
          <span className="text-3xl">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
