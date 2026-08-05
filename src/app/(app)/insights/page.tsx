import { getRecentInsights } from "@/lib/queries";
import { dismissInsight } from "@/lib/actions";
import { cardClass, headingClass } from "@/lib/ui";
import { APP_TIMEZONE } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const items = await getRecentInsights(20);

  return (
    <div>
      <h1 className={`mb-1 ${headingClass}`}>From Hermes</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Patterns Hermes has noticed in your logged data. Dismiss once read.
      </p>
      <div className={`divide-y divide-[var(--border)] ${cardClass}`}>
        {items.length === 0 && (
          <p className="p-6 text-sm text-[var(--muted)]">Nothing yet — insights show up here as Hermes notices patterns worth flagging.</p>
        )}
        {items.map((item, i) => (
          <div
            key={item.id}
            className="fade-in-up flex items-start justify-between gap-4 px-6 py-4 text-sm"
            style={{ "--stagger": Math.min(i, 8) } as React.CSSProperties}
          >
            <div>
              <p className="text-[var(--foreground)]">{item.content}</p>
              <p className="mt-1.5 text-xs text-[#5b4fa3] dark:text-[#bcb2e8]">
                {new Date(item.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIMEZONE })}
              </p>
            </div>
            <form action={dismissInsight.bind(null, item.id)}>
              <button className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--foreground)]">Dismiss</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
