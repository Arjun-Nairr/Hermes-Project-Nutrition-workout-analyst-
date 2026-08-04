import { login } from "./actions";
import { inputClass, buttonClass, cardClass } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <form action={login} className={`w-full max-w-sm p-8 ${cardClass}`}>
        <h1 className="mb-1 font-serif text-3xl tracking-tight text-[var(--foreground)]">Calorie Tracker</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Enter the password to continue.</p>

        <input type="hidden" name="next" value={next ?? "/"} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          placeholder="Password"
          className={`w-full ${inputClass}`}
        />
        {error && <p className="mt-2 text-sm text-[#9f2f2d] dark:text-[#f3a6a3]">Wrong password.</p>}
        <button type="submit" className={`mt-4 w-full ${buttonClass}`}>
          Enter
        </button>
      </form>
    </main>
  );
}
