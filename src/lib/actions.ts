"use server";

import { db } from "@/db";
import { foodEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createFoodEntry, createWorkoutEntry, updatePreferencesData } from "./data";

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}

export async function addFoodEntry(formData: FormData) {
  await createFoodEntry({
    description: String(formData.get("description") ?? "").trim(),
    calories: num(formData, "calories"),
    protein: num(formData, "protein"),
    carbs: num(formData, "carbs"),
    fat: num(formData, "fat"),
  });
  revalidatePath("/");
}

export async function deleteFoodEntry(id: number) {
  await db.delete(foodEntries).where(eq(foodEntries.id, id));
  revalidatePath("/");
}

export async function addWorkoutEntry(formData: FormData) {
  const weight = formData.get("weight");
  const reps = formData.get("reps");
  await createWorkoutEntry({
    exercise: String(formData.get("exercise") ?? "").trim(),
    weight: weight ? Number(weight) : null,
    reps: reps ? Number(reps) : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidatePath("/workouts");
}

export async function updatePreferences(formData: FormData) {
  await updatePreferencesData({
    calorieTarget: num(formData, "calorieTarget"),
    proteinTarget: num(formData, "proteinTarget"),
    carbsTarget: num(formData, "carbsTarget"),
    fatTarget: num(formData, "fatTarget"),
    goal: String(formData.get("goal") ?? "maintain"),
    trainingDays: String(formData.get("trainingDays") ?? ""),
    trainingStyle: String(formData.get("trainingStyle") ?? ""),
  });
  revalidatePath("/preferences");
  revalidatePath("/");
}
