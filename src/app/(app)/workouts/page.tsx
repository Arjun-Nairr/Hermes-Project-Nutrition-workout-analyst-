import { getRecentWorkouts } from "@/lib/queries";
import { addWorkoutEntry } from "@/lib/actions";
import { inputClass, buttonClass, cardClass, headingClass, badgeClass } from "@/lib/ui";
import { APP_TIMEZONE } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const workouts = await getRecentWorkouts(20);

  return (
    <div className="space-y-12">
      <section>
        <h1 className={`mb-4 ${headingClass}`}>Log workout</h1>
        <form action={addWorkoutEntry} className={`grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 ${cardClass}`}>
          <input name="exercise" placeholder="Exercise" required className={`col-span-2 ${inputClass}`} />
          <input name="weight" type="number" step="0.5" placeholder="Weight" className={inputClass} />
          <input name="reps" type="number" step="1" placeholder="Reps" className={inputClass} />
          <input name="notes" placeholder="Notes (optional)" className={`col-span-2 sm:col-span-4 ${inputClass}`} />
          <button type="submit" className={`col-span-2 sm:col-span-4 ${buttonClass}`}>
            Add entry
          </button>
        </form>
      </section>

      <section>
        <h2 className={`mb-4 ${headingClass}`}>Recent workouts</h2>
        <div className={`divide-y divide-[var(--border)] ${cardClass}`}>
          {workouts.length === 0 && (
            <p className="p-6 text-sm text-[var(--muted)]">No entries yet.</p>
          )}
          {workouts.map((w, i) => (
            <div
              key={w.id}
              className="fade-in-up px-6 py-3 text-sm"
              style={{ "--stagger": Math.min(i, 8) } as React.CSSProperties}
            >
              <p className="text-[var(--foreground)]">{w.exercise}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(w.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIMEZONE })}
                {w.notes && ` · ${w.notes}`}
              </p>
              {(w.weight != null || w.reps != null) && (
                <div className="mt-1.5 flex gap-1.5">
                  {w.weight != null && <span className={badgeClass("protein")}>{w.weight}kg</span>}
                  {w.reps != null && <span className={badgeClass("calories")}>{w.reps} reps</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
