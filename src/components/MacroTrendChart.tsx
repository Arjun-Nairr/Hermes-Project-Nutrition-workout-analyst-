"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useIsDark } from "@/lib/use-theme";
import { macroAccents } from "@/lib/ui";

type Point = { date: string; calories: number; protein: number; carbs: number; fat: number; fiber: number };

export function MacroTrendChart({ data }: { data: Point[] }) {
  const isDark = useIsDark();
  const grid = isDark ? "#2c2c2c" : "#eaeaea";
  const muted = isDark ? "#9a9994" : "#787774";
  const surface = isDark ? "#1a1a1a" : "#ffffff";
  const foreground = isDark ? "#f2f1ee" : "#111111";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fontSize: 12, fill: muted }}
          axisLine={{ stroke: grid }}
          tickLine={false}
        />
        {/* Calories (hundreds-thousands) and grams (tens-hundreds) can't share
            one scale — a shared axis makes the gram lines look flat near zero
            once calories climb toward a real daily total. Two axes fixes it. */}
        <YAxis
          yAxisId="kcal"
          tick={{ fontSize: 12, fill: muted }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <YAxis
          yAxisId="grams"
          orientation="right"
          tick={{ fontSize: 12, fill: muted }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{ border: `1px solid ${grid}`, borderRadius: 8, fontSize: 12, background: surface }}
          labelStyle={{ color: foreground }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: muted }} />
        <Line yAxisId="kcal" type="monotone" dataKey="calories" stroke={foreground} strokeWidth={2} dot={false} name="Calories" />
        <Line yAxisId="grams" type="monotone" dataKey="protein" stroke={macroAccents.protein.solid} strokeWidth={1.5} dot={false} name="Protein (g)" />
        <Line yAxisId="grams" type="monotone" dataKey="carbs" stroke={macroAccents.carbs.solid} strokeWidth={1.5} dot={false} name="Carbs (g)" />
        <Line yAxisId="grams" type="monotone" dataKey="fat" stroke={macroAccents.fat.solid} strokeWidth={1.5} dot={false} name="Fat (g)" />
        <Line yAxisId="grams" type="monotone" dataKey="fiber" stroke={macroAccents.fiber.solid} strokeWidth={1.5} dot={false} name="Fiber (g)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
