import { getPreferences, getTodayTotals, getMacroTrend, getRecentFoodEntries } from "@/lib/queries";
import { addFoodEntry, deleteFoodEntry } from "@/lib/actions";
import { StatCard } from "@/components/StatCard";
import { MacroTrendChart } from "@/components/MacroTrendChart";
import { inputClass, buttonClass, cardClass, headingClass, badgeClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [prefs, totals, trend, recent] = await Promise.all([
    getPreferences(),
    getTodayTotals(),
    getMacroTrend(14),
    getRecentFoodEntries(30),
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
