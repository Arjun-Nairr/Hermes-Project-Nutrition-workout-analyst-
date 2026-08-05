import Link from "next/link";
import { getPreferences, getTodayTotals, getMacroTrend, getTodayFoodEntries, getWeeklyStats, getInsightCount } from "@/lib/queries";
import { addFoodEntry, deleteFoodEntry } from "@/lib/actions";
import { StatCard } from "@/components/StatCard";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroTrendChart } from "@/components/MacroTrendChart";
import { inputClass, buttonClass, cardClass, headingClass, badgeClass, dangerTextClass } from "@/lib/ui";
import { APP_TIMEZONE } from "@/lib/dates";

export const dynamic = "force-dynamic";

// Small proportion bar for "This week" — same visual language as the stat
// card bars, so the numbers are scannable instead of read line by line.
function MiniBar({ label, right, pct, danger }: { label: string; right: string; pct: number; danger?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted)]">{label}</span>
        <span className={danger ? dangerTextClass : ""}>{right}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-[var(--track)]">
        <div
          className="h-1 rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: danger ? "var(--fat-danger)" : "var(--primary)" }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [prefs, totals, trend, today, weekly, insightCount] = await Promise.all([
    getPreferences(),
    getTodayTotals(),
    getMacroTrend(14),
    getTodayFoodEntries(),
    getWeeklyStats(),
    getInsightCount(),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className={`mb-4 ${headingClass}`}>Today</h1>
        <div className="space-y-4">
          <CalorieRing value={totals.calories} target={prefs.calorieTarget} />
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Protein" value={totals.protein} target={prefs.proteinTarget} unit="g" stagger={1} />
            <StatCard label="Carbs" value={totals.carbs} target={prefs.carbsTarget} unit="g" stagger={2} />
            <StatCard label="Fat" value={totals.fat} target={prefs.fatTarget} unit="g" stagger={3} />
            <StatCard label="Fiber" value={totals.fiber} target={prefs.fiberTarget} unit="g" stagger={4} />
          </div>
        </div>
        {insightCount > 0 && (
          <Link href="/insights" className="mt-3 inline-block text-sm text-[#5b4fa3] hover:underline dark:text-[#bcb2e8]">
            {insightCount} insight{insightCount === 1 ? "" : "s"} from Hermes →
          </Link>
        )}
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>Log food</h2>
        <form action={addFoodEntry} className={`grid grid-cols-2 gap-3 p-6 ${cardClass}`}>
          <input name="description" placeholder="What did you eat" required className={`col-span-2 ${inputClass}`} />
          <input name="calories" type="number" step="1" placeholder="kcal" required className={`col-span-2 ${inputClass}`} />
          <input name="protein" type="number" step="0.1" placeholder="protein g" required className={inputClass} />
          <input name="carbs" type="number" step="0.1" placeholder="carbs g" required className={inputClass} />
          <input name="fat" type="number" step="0.1" placeholder="fat g" required className={inputClass} />
          <input name="fiber" type="number" step="0.1" placeholder="fiber g" defaultValue={0} className={inputClass} />
          <button type="submit" className={`col-span-2 ${buttonClass}`}>
            Add entry
          </button>
        </form>
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>This week</h2>
        <div className={`space-y-4 p-6 ${cardClass}`}>
          {weekly.daysLogged === 0 ? (
            <p className="text-sm text-[var(--muted)]">No entries logged yet this week.</p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Days logged</span>
                <span>{weekly.daysLogged} / 7</span>
              </div>
              <MiniBar
                label="Avg calories"
                right={`${Math.round(weekly.avgCalories)} / ${prefs.calorieTarget} kcal`}
                pct={(weekly.avgCalories / prefs.calorieTarget) * 100}
                danger={weekly.avgCalories > prefs.calorieTarget}
              />
              <MiniBar
                label="Avg protein"
                right={`${Math.round(weekly.avgProtein)} / ${prefs.proteinTarget} g`}
                pct={(weekly.avgProtein / prefs.proteinTarget) * 100}
              />
              <MiniBar
                label="Protein under target"
                right={`${weekly.proteinUnderTargetDays} of ${weekly.daysLogged} days`}
                pct={(weekly.proteinUnderTargetDays / weekly.daysLogged) * 100}
                danger={weekly.proteinUnderTargetDays > 0}
              />
              <MiniBar
                label="Fiber under target"
                right={`${weekly.fiberUnderTargetDays} of ${weekly.daysLogged} days`}
                pct={(weekly.fiberUnderTargetDays / weekly.daysLogged) * 100}
                danger={weekly.fiberUnderTargetDays > 0}
              />
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Workouts</span>
                <span>
                  {weekly.workoutsThisWeek} this week <span className="text-[var(--muted)]">(vs {weekly.workoutsLastWeek} last)</span>
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>Macro trend</h2>
        <div className={`p-6 ${cardClass}`}>
          <MacroTrendChart data={trend} calorieTarget={prefs.calorieTarget} />
        </div>
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>Today&apos;s log</h2>
        <div className={`divide-y divide-[var(--border)] ${cardClass}`}>
          {today.length === 0 && (
            <p className="p-6 text-sm text-[var(--muted)]">Nothing logged today yet.</p>
          )}
          {today.map((e, i) => (
            <div
              key={e.id}
              className="fade-in-up flex items-center justify-between gap-4 px-6 py-3 text-sm"
              style={{ "--stagger": Math.min(i, 8) } as React.CSSProperties}
            >
              <div>
                <p className="text-[var(--foreground)]">{e.description}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {new Date(e.timestamp).toLocaleString("en-IN", { timeStyle: "short", timeZone: APP_TIMEZONE })}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  <span className={badgeClass("calories")}>{e.calories} kcal</span>
                  <span className={badgeClass("protein")}>P{e.protein}</span>
                  <span className={badgeClass("carbs")}>C{e.carbs}</span>
                  <span className={badgeClass("fat")}>F{e.fat}</span>
                  <span className={badgeClass("fiber")}>Fi{e.fiber}</span>
                </div>
              </div>
              <form action={deleteFoodEntry.bind(null, e.id)}>
                <button className="text-xs text-[var(--muted)] hover:text-[var(--fat-danger)]">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
