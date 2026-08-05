import { cardClass, macroAccents } from "@/lib/ui";

const macroKeyFor = {
  Calories: "calories",
  Protein: "protein",
  Carbs: "carbs",
  Fat: "fat",
  Fiber: "fiber",
} as const;

export function StatCard({
  label,
  value,
  target,
  unit,
  stagger = 0,
}: {
  label: keyof typeof macroKeyFor;
  value: number;
  target: number;
  unit: string;
  stagger?: number;
}) {
  const remaining = target - value;
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const barPct = Math.min(100, pct); // bar fill can't exceed the card, but the badge shows the real number
  const isOver = pct > 100;
  const macro = macroKeyFor[label];
  const accent = macroAccents[macro].solid;

  return (
    <div
      className={`fade-in-up p-6 ${cardClass}`}
      style={{ "--stagger": stagger, borderTop: `2px solid ${accent}` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
        <span
          className={
            isOver
              ? "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide bg-[#fdebec] text-[#9f2f2d] dark:bg-[#3a1f1f] dark:text-[#f3a6a3]"
              : `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${macroAccents[macro].badge}`
          }
        >
          {pct}%
        </span>
      </div>
      <p className="mt-2 font-mono text-2xl tabular-nums text-[var(--foreground)]">
        {Math.round(value)}
        <span className="text-sm font-normal text-[var(--muted)]"> / {target} {unit}</span>
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--track)]">
        <div
          className="h-1.5 rounded-full transition-[width] duration-500"
          style={{ width: `${barPct}%`, backgroundColor: isOver ? "var(--fat-danger)" : accent }}
        />
      </div>
      <p className={`mt-2 text-xs ${isOver ? "text-[#9f2f2d] dark:text-[#f3a6a3]" : "text-[var(--muted)]"}`}>
        {remaining >= 0 ? `${Math.round(remaining)} ${unit} left` : `${Math.round(-remaining)} ${unit} over`}
      </p>
    </div>
  );
}
