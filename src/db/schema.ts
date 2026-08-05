import { pgTable, serial, timestamp, integer, real, text } from "drizzle-orm/pg-core";

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  fiber: real("fiber").notNull().default(0),
  description: text("description").notNull(),
});

export const workoutEntries = pgTable("workout_entries", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  exercise: text("exercise").notNull(),
  weight: real("weight"),
  reps: integer("reps"),
  notes: text("notes"),
});

// Short notes Hermes pushes when it notices a real pattern worth surfacing.
// Add-only from Hermes; dismissed (deleted) from the website once read.
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  content: text("content").notNull(),
});

// Single-row table: always read/write id = 1.
export const preferences = pgTable("preferences", {
  id: integer("id").primaryKey().default(1),
  calorieTarget: integer("calorie_target").notNull().default(2000),
  proteinTarget: integer("protein_target").notNull().default(150),
  carbsTarget: integer("carbs_target").notNull().default(200),
  fatTarget: integer("fat_target").notNull().default(65),
  fiberTarget: integer("fiber_target").notNull().default(30),
  goal: text("goal").notNull().default("maintain"), // 'cut' | 'bulk' | 'maintain'
  trainingDays: text("training_days").notNull().default(""), // free text, e.g. "Mon/Wed/Fri"
  trainingStyle: text("training_style").notNull().default(""), // free text, e.g. "HIT, full body"
});
