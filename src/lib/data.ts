// Typed DB writes shared between the website's server actions (FormData in)
// and the MCP server (typed args in) — one place owns the actual insert logic.
import { db } from "@/db";
import { foodEntries, workoutEntries } from "@/db/schema";

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
