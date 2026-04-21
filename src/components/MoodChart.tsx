import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { MoodType } from "./MoodSelector";

const moodValues: Record<MoodType, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

const moodLabels: Record<number, string> = {
  5: "😄 Great",
  4: "🙂 Good",
  3: "😐 Okay",
  2: "😔 Low",
  1: "😢 Struggling",
};

interface MoodEntry {
  date: string;
  mood: MoodType;
}

// Demo data
const demoData: MoodEntry[] = [
  { date: "Mon", mood: "okay" },
  { date: "Tue", mood: "low" },
  { date: "Wed", mood: "struggling" },
  { date: "Thu", mood: "low" },
  { date: "Fri", mood: "okay" },
  { date: "Sat", mood: "good" },
  { date: "Sun", mood: "great" },
];

export function MoodChart({ data = demoData }: { data?: MoodEntry[] }) {
  const chartData = data.map((d) => ({
    date: d.date,
    value: moodValues[d.mood],
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.08 145)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.55 0.08 145)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v: number) => moodLabels[v] || ""}
            axisLine={false}
            tickLine={false}
            width={100}
            className="text-xs"
          />
          <Tooltip
            formatter={(value: number) => [moodLabels[value], "Mood"]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid oklch(0.91 0.02 145)",
              background: "white",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="oklch(0.55 0.08 145)"
            strokeWidth={3}
            fill="url(#moodGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
