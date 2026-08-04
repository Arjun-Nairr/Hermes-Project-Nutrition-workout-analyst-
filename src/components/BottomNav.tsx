"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
  { href: "/preferences", label: "Preferences" },
];

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
              {tab.label}
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
