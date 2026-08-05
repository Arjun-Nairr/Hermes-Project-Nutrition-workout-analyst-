"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLinkStatus } from "next/link";

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/workouts", label: "Workouts" },
  { href: "/preferences", label: "Preferences" },
];

// Per-tab pending state from Next's own Link transition — pure client-side,
// no server Suspense/streaming involved (that path is what hung, see
// loading.tsx revert). Only the tapped tab shows a spinner in place of its
// label while its own navigation is in flight.
function TabLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  if (pending) {
    return <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />;
  }
  return <>{label}</>;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium ${
                active ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              <TabLabel label={tab.label} />
              <span
                className="h-0.5 w-8 rounded-full"
                style={{ backgroundColor: active ? "var(--primary)" : "transparent" }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
