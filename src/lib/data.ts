// Typed DB writes shared between the website's server actions (FormData in)
// and the MCP server (typed args in) — one place owns the actual insert logic.
import { db } from "@/db";
import { foodEntries, workoutEntries, preferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPreferences } from "./queries";

export async function createFoodEntry(input: {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const [row] = await db.insert(foodEntries).values(input).returning();
  return row;
}

export async function createWorkoutEntry(input: {
  exercise: string;
  weight?: number | null;
  reps?: number | null;
  notes?: string | null;
}) {
  const [row] = await db.insert(workoutEntries).values(input).returning();
  return row;
}

// Partial update — only the fields passed get changed, everything else keeps
// its current value. Used by both the preferences form (sends all fields) and
// the MCP tool (Hermes may only want to change one, e.g. "switch me to bulk").
export async function updatePreferencesData(input: Partial<{
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  goal: string;
  trainingDays: string;
  trainingStyle: string;
}>) {
  await getPreferences(); // ensures the single row exists before updating it
  const [row] = await db.update(preferences).set(input).where(eq(preferences.id, 1)).returning();
  return row;
}
