"use client";

// Hard reload, not router.refresh() — a bookmarked/home-screen tab can resume
// from a suspended browser state where even the JS isn't re-executing, so a
// soft data refetch wouldn't help. This forces a genuinely fresh page load.
export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      aria-label="Refresh"
      className="flex h-9 w-9 items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}
