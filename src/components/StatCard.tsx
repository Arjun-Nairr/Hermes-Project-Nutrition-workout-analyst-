import { cardClass, badgeClass, macroAccents } from "@/lib/ui";

const macroKeyFor = {
  Calories: "calories",
  Protein: "protein",
  Carbs: "carbs",
  Fat: "fat",
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
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const macro = macroKeyFor[label];
  const accent = macroAccents[macro].solid;

  return (
    <div
      className={`fade-in-up p-6 ${cardClass}`}
      style={{ "--stagger": stagger, borderTop: `2px solid ${accent}` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
        <span className={badgeClass(macro)}>{pct}%</span>
      </div>
      <p className="mt-2 font-mono text-2xl tabular-nums text-[var(--foreground)]">
        {Math.round(value)}
        <span className="text-sm font-normal text-[var(--muted)]"> / {target} {unit}</span>
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--track)]">
        <div
          className="h-1.5 rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {remaining >= 0 ? `${Math.round(remaining)} ${unit} left` : `${Math.round(-remaining)} ${unit} over`}
      </p>
    </div>
  );
}
