"use client";

import { useState } from "react";

export function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  return (
    <button onClick={toggle} className="whitespace-nowrap py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
