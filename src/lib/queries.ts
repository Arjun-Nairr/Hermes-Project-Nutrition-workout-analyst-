import { db } from "@/db";
import { foodEntries, workoutEntries, preferences, insights } from "@/db/schema";
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
      fiber: acc.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export async function getRecentFoodEntries(limit = 30) {
  return db.select().from(foodEntries).orderBy(desc(foodEntries.timestamp)).limit(limit);
}

type DailyTotals = { calories: number; protein: number; carbs: number; fat: number; fiber: number };

// Daily macro totals for the last N days, oldest first — feeds the trend chart.
export async function getMacroTrend(days = 14) {
  const rows = await db
    .select()
    .from(foodEntries)
    .where(gte(foodEntries.timestamp, daysAgoIST(days - 1)));

  const byDay = new Map<string, DailyTotals>();
  for (const e of rows) {
    const key = istDateKey(e.timestamp);
    const cur = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    cur.calories += e.calories;
    cur.protein += e.protein;
    cur.carbs += e.carbs;
    cur.fat += e.fat;
    cur.fiber += e.fiber;
    byDay.set(key, cur);
  }

  const out: ({ date: string } & DailyTotals)[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = istDateKey(daysAgoIST(i));
    const totals = byDay.get(key) ?? { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    out.push({ date: key, ...totals });
  }
  return out;
}

export async function getRecentWorkouts(limit = 20) {
  return db.select().from(workoutEntries).orderBy(desc(workoutEntries.timestamp)).limit(limit);
}

export async function getRecentInsights(limit = 20) {
  return db.select().from(insights).orderBy(desc(insights.timestamp)).limit(limit);
}

export async function getInsightCount() {
  const rows = await db.select({ id: insights.id }).from(insights);
  return rows.length;
}

// Rule-based weekly summary — computed straight from logged data, no LLM.
// Averages are over days something was actually logged (a day you forgot to
// log shouldn't drag the average down and look like you under-ate).
export async function getWeeklyStats() {
  const [trend, prefs, workoutRows] = await Promise.all([
    getMacroTrend(7),
    getPreferences(),
    db.select({ timestamp: workoutEntries.timestamp }).from(workoutEntries).where(gte(workoutEntries.timestamp, daysAgoIST(13))),
  ]);

  const loggedDays = trend.filter((d) => d.calories > 0);
  const n = loggedDays.length || 1;
  const avg = (key: keyof DailyTotals) => loggedDays.reduce((sum, d) => sum + d[key], 0) / n;

  const underTargetDays = (key: keyof DailyTotals, target: number) =>
    loggedDays.filter((d) => d[key] < target).length;
  const overTargetDays = (key: keyof DailyTotals, target: number) =>
    loggedDays.filter((d) => d[key] > target).length;

  const thisWeekStart = daysAgoIST(6);
  const workoutsThisWeek = workoutRows.filter((w) => w.timestamp >= thisWeekStart).length;
  const workoutsLastWeek = workoutRows.length - workoutsThisWeek;

  return {
    daysLogged: loggedDays.length,
    avgCalories: avg("calories"),
    avgProtein: avg("protein"),
    avgCarbs: avg("carbs"),
    avgFat: avg("fat"),
    avgFiber: avg("fiber"),
    proteinUnderTargetDays: underTargetDays("protein", prefs.proteinTarget),
    fiberUnderTargetDays: underTargetDays("fiber", prefs.fiberTarget),
    caloriesOverTargetDays: overTargetDays("calories", prefs.calorieTarget),
    workoutsThisWeek,
    workoutsLastWeek,
  };
}
