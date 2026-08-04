"use client";

import { useEffect, useState } from "react";

// Tracks the .dark class on <html>. Only needed by SVG chart libraries (Recharts)
// that take raw color strings instead of CSS classes/variables.
export function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const check = () => setIsDark(root.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
