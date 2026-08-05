// ponytail: hardcoded UTC+4 (Dubai) day boundary — swap for a stored
// timezone preference if this is ever used somewhere else.
export const APP_TIMEZONE = "Asia/Dubai";
const TZ_OFFSET_MS = 4 * 60 * 60 * 1000;

export function startOfTodayLocal(): Date {
  const now = new Date(Date.now() + TZ_OFFSET_MS);
  now.setUTCHours(0, 0, 0, 0);
  return new Date(now.getTime() - TZ_OFFSET_MS);
}

export function daysAgoLocal(days: number): Date {
  const start = startOfTodayLocal();
  return new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
}

// Groups by local calendar date, returns "YYYY-MM-DD".
export function localDateKey(d: Date): string {
  const shifted = new Date(d.getTime() + TZ_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}
