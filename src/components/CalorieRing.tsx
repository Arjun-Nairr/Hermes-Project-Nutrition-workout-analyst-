import { cardClass, dangerTextClass } from "@/lib/ui";

export function CalorieRing({ value, target }: { value: number; target: number }) {
  const remaining = target - value;
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const ringPct = Math.min(100, pct); // ring visually caps full, text shows the real number
  const isOver = pct > 100;
  const color = isOver ? "var(--fat-danger)" : "var(--primary)";

  return (
    <div className={`fade-in-up flex items-center gap-6 p-6 ${cardClass}`}>
      <div className="relative h-24 w-24 shrink-0">
        <div
          className="h-24 w-24 rounded-full transition-[background] duration-500"
          style={{ background: `conic-gradient(${color} ${ringPct * 3.6}deg, var(--track) 0deg)` }}
        />
        <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-[var(--surface)]">
          <span className="font-mono text-lg tabular-nums text-[var(--foreground)]">{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Calories</p>
        <p className="mt-1 font-mono text-2xl tabular-nums text-[var(--foreground)]">
          {Math.round(value)}
          <span className="text-sm font-normal text-[var(--muted)]"> / {target} kcal</span>
        </p>
        <p className={`mt-1 text-xs ${isOver ? dangerTextClass : "text-[var(--muted)]"}`}>
          {remaining >= 0 ? `${Math.round(remaining)} kcal left` : `${Math.round(-remaining)} kcal over`}
        </p>
      </div>
    </div>
  );
}
