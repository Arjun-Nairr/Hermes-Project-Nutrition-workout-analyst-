import Link from "next/link";
import { getPreferences, getTodayTotals, getMacroTrend, getRecentFoodEntries, getWeeklyStats, getInsightCount } from "@/lib/queries";
import { addFoodEntry, deleteFoodEntry } from "@/lib/actions";
import { StatCard } from "@/components/StatCard";
import { MacroTrendChart } from "@/components/MacroTrendChart";
import { inputClass, buttonClass, cardClass, headingClass, badgeClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [prefs, totals, trend, recent, weekly, insightCount] = await Promise.all([
    getPreferences(),
    getTodayTotals(),
    getMacroTrend(14),
    getRecentFoodEntries(30),
    getWeeklyStats(),
    getInsightCount(),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className={`mb-4 ${headingClass}`}>Today</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Calories" value={totals.calories} target={prefs.calorieTarget} unit="kcal" stagger={0} />
          <StatCard label="Protein" value={totals.protein} target={prefs.proteinTarget} unit="g" stagger={1} />
          <StatCard label="Carbs" value={totals.carbs} target={prefs.carbsTarget} unit="g" stagger={2} />
          <StatCard label="Fat" value={totals.fat} target={prefs.fatTarget} unit="g" stagger={3} />
          <StatCard label="Fiber" value={totals.fiber} target={prefs.fiberTarget} unit="g" stagger={4} />
        </div>
        {insightCount > 0 && (
          <Link href="/insights" className="mt-3 inline-block text-sm text-[#5b4fa3] hover:underline dark:text-[#bcb2e8]">
            {insightCount} insight{insightCount === 1 ? "" : "s"} from Hermes →
          </Link>
        )}
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>Log food</h2>
        <form action={addFoodEntry} className={`grid grid-cols-2 gap-3 p-6 sm:grid-cols-6 ${cardClass}`}>
          <input name="description" placeholder="What did you eat" required
            className={`col-span-2 sm:col-span-2 ${inputClass}`} />
          <input name="calories" type="number" step="1" placeholder="kcal" required className={inputClass} />
          <input name="protein" type="number" step="0.1" placeholder="protein g" required className={inputClass} />
          <input name="carbs" type="number" step="0.1" placeholder="carbs g" required className={inputClass} />
          <input name="fat" type="number" step="0.1" placeholder="fat g" required className={inputClass} />
          <input name="fiber" type="number" step="0.1" placeholder="fiber g" defaultValue={0} className={inputClass} />
          <button type="submit" className={`col-span-2 sm:col-span-6 ${buttonClass}`}>
            Add entry
          </button>
        </form>
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>This week</h2>
        <div className={`space-y-2 p-6 text-sm ${cardClass}`}>
          {weekly.daysLogged === 0 ? (
            <p className="text-[var(--muted)]">No entries logged yet this week.</p>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Days logged</span>
                <span>{weekly.daysLogged} / 7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Avg calories</span>
                <span>{Math.round(weekly.avgCalories)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Avg protein</span>
                <span>{Math.round(weekly.avgProtein)} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Protein under target</span>
                <span>{weekly.proteinUnderTargetDays} of {weekly.daysLogged} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Fiber under target</span>
                <span className={weekly.fiberUnderTargetDays > 0 ? "text-[#956400] dark:text-[#e8c567]" : ""}>
                  {weekly.fiberUnderTargetDays} of {weekly.daysLogged} days
                </span>
              </div>
              <div className="flex justify-between">
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
        <h2 className={`mb-4 ${headingClass}`}>History</h2>
        <div className={`divide-y divide-[var(--border)] ${cardClass}`}>
          {recent.length === 0 && (
            <p className="p-6 text-sm text-[var(--muted)]">No entries yet.</p>
          )}
          {recent.map((e, i) => (
            <div
              key={e.id}
              className="fade-in-up flex items-center justify-between gap-4 px-6 py-3 text-sm"
              style={{ "--stagger": Math.min(i, 8) } as React.CSSProperties}
            >
              <div>
                <p className="text-[var(--foreground)]">{e.description}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {new Date(e.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
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
