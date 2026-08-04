// ponytail: hardcoded IST (UTC+5:30) day boundary — swap for a stored
// timezone preference if this is ever used outside India.
const TZ_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function startOfTodayIST(): Date {
  const now = new Date(Date.now() + TZ_OFFSET_MS);
  now.setUTCHours(0, 0, 0, 0);
  return new Date(now.getTime() - TZ_OFFSET_MS);
}

export function daysAgoIST(days: number): Date {
  const start = startOfTodayIST();
  return new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
}

// Groups by IST calendar date, returns "YYYY-MM-DD".
export function istDateKey(d: Date): string {
  const shifted = new Date(d.getTime() + TZ_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}
