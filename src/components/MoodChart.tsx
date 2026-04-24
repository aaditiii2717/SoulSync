import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { MoodType } from "./MoodSelector";

export const moodValues: Record<MoodType, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

export const moodLabels: Record<number, string> = {
  5: "😄 Great",
  4: "🙂 Good",
  3: "😐 Okay",
  2: "😔 Low",
  1: "😢 Struggling",
};

export interface ChartDataPoint {
  date: string;
  value: number | null;
  moodLabel?: string;
  isAverage?: boolean;
}

export function MoodChart({ data = [] }: { data: ChartDataPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.08 145)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.55 0.08 145)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            className="text-[10px] font-bold text-slate-400"
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(v: number) => moodLabels[v]?.split(" ")[0] || ""}
            axisLine={false}
            tickLine={false}
            width={40}
            className="text-lg"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as ChartDataPoint;
                if (data.value === null) return null;
                
                const roundedValue = Math.round(data.value);
                const moodEmoji = moodLabels[roundedValue]?.split(" ")[0] || "";
                
                return (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{data.date}</div>
                    <div className="flex items-center gap-2">
                       <span className="text-xl">{moodEmoji}</span>
                       <span className="font-bold text-slate-800 capitalize">
                         {data.isAverage ? `Avg Score: ${data.value.toFixed(1)}` : data.moodLabel}
                       </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="oklch(0.55 0.08 145)"
            strokeWidth={4}
            fill="url(#moodGradient)"
            animationDuration={1500}
            connectNulls={true}
            dot={{ r: 4, fill: "white", strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
