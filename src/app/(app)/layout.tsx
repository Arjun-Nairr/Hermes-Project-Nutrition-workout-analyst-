import { cookies } from "next/headers";
import { logout } from "./logout-action";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialDark = cookieStore.get("theme")?.value === "dark";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="font-serif text-lg text-[var(--foreground)]">Calorie Tracker</span>
          <div className="flex items-center gap-4">
            <ThemeToggle initialDark={initialDark} />
            <form action={logout}>
              <button className="whitespace-nowrap py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-8"
        style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
