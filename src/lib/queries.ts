import { db } from "@/db";
import { foodEntries, workoutEntries, preferences } from "@/db/schema";
import { desc, gte } from "drizzle-orm";
import { startOfTodayIST, daysAgoIST, istDateKey } from "./dates";

export async function getPreferences() {
  const rows = await db.select().from(preferences).limit(1);
  if (rows[0]) return rows[0];
  // No row yet — insert the default single row and return it.
  const [row] = await db.insert(preferences).values({ id: 1 }).returning();
  return row;
}

export async function getTodayFoodEntries() {
  return db
    .select()
    .from(foodEntries)
    .where(gte(foodEntries.timestamp, startOfTodayIST()))
    .orderBy(desc(foodEntries.timestamp));
}

export async function getTodayTotals() {
  const entries = await getTodayFoodEntries();
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export async function getRecentFoodEntries(limit = 30) {
  return db.select().from(foodEntries).orderBy(desc(foodEntries.timestamp)).limit(limit);
}

// Daily macro totals for the last N days, oldest first — feeds the trend chart.
export async function getMacroTrend(days = 14) {
  const rows = await db
    .select()
    .from(foodEntries)
    .where(gte(foodEntries.timestamp, daysAgoIST(days - 1)));

  const byDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
  for (const e of rows) {
    const key = istDateKey(e.timestamp);
    const cur = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    cur.calories += e.calories;
    cur.protein += e.protein;
    cur.carbs += e.carbs;
    cur.fat += e.fat;
    byDay.set(key, cur);
  }

  const out: { date: string; calories: number; protein: number; carbs: number; fat: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = istDateKey(daysAgoIST(i));
    const totals = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    out.push({ date: key, ...totals });
  }
  return out;
}

export async function getRecentWorkouts(limit = 20) {
  return db.select().from(workoutEntries).orderBy(desc(workoutEntries.timestamp)).limit(limit);
}
