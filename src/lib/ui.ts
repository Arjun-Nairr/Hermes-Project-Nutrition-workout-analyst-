// Shared class strings for the plain form inputs/buttons/cards repeated across
// the dashboard, workouts, preferences, and login forms — DRY, not a component
// system (still plain <input>/<button> tags, just no copy-pasted class strings).
// Colors are CSS variables (see globals.css) so light/dark both work from one class.
// text-base (16px), not text-sm — anything smaller triggers iOS Safari's
// auto-zoom-on-focus, which is exactly the annoying thing on a form you fill
// out from your phone multiple times a day.
export const inputClass =
  "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]";

export const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[var(--muted)]";

export const buttonClass =
  "rounded-md bg-[var(--primary)] py-2 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] active:scale-[0.98]";

export const cardClass =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]";

export const headingClass = "font-serif text-2xl tracking-tight text-[var(--foreground)]";

// Per-macro accent identity, used consistently across badges, progress bars, and
// the trend chart. Each has a light/dark badge pair plus a solid accent color
// for progress fills and the chart lines.
export const macroAccents = {
  calories: { solid: "var(--primary)", badge: "bg-[var(--track)] text-[var(--muted)]" },
  protein: { solid: "#2f8fc7", badge: "bg-[#e1f3fe] text-[#1f6c9f] dark:bg-[#132a36] dark:text-[#8fcbef]" },
  carbs: { solid: "#c99a1f", badge: "bg-[#fbf3db] text-[#956400] dark:bg-[#332707] dark:text-[#e8c567]" },
  fat: { solid: "#c4514f", badge: "bg-[#fdebec] text-[#9f2f2d] dark:bg-[#3a1f1f] dark:text-[#f3a6a3]" },
  fiber: { solid: "#7c6fc4", badge: "bg-[#efedfb] text-[#5b4fa3] dark:bg-[#241f38] dark:text-[#bcb2e8]" },
} as const;

export function badgeClass(macro: keyof typeof macroAccents) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${macroAccents[macro].badge}`;
}

// Shared "over target" styling — used by StatCard, CalorieRing, and This
// week's mini-bars whenever a value has crossed its target.
export const dangerBadgeClass =
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide bg-[#fdebec] text-[#9f2f2d] dark:bg-[#3a1f1f] dark:text-[#f3a6a3]";
export const dangerTextClass = "text-[#9f2f2d] dark:text-[#f3a6a3]";
