import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createFoodEntry, createWorkoutEntry, updatePreferencesData } from "@/lib/data";
import { getPreferences, getTodayTotals } from "@/lib/queries";
import { searchUsdaFood } from "@/lib/usda";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "log_food_entry",
      {
        title: "Log food entry",
        description: "Log a confirmed food entry with its estimated calories and macros.",
        inputSchema: z.object({
          description: z.string().describe("What was eaten, e.g. '2 idli with sambar'"),
          calories: z.number().describe("Estimated calories in kcal"),
          protein: z.number().describe("Estimated protein in grams"),
          carbs: z.number().describe("Estimated carbs in grams"),
          fat: z.number().describe("Estimated fat in grams"),
          fiber: z.number().optional().describe("Estimated fiber in grams"),
        }),
      },
      async ({ description, calories, protein, carbs, fat, fiber }) => {
        await createFoodEntry({ description, calories, protein, carbs, fat, fiber });
        return { content: [{ type: "text" as const, text: "Logged." }] };
      }
    );

    server.registerTool(
      "log_workout_entry",
      {
        title: "Log workout entry",
        description: "Log a confirmed workout entry.",
        inputSchema: z.object({
          exercise: z.string(),
          weight: z.number().optional().describe("Weight used, in kg"),
          reps: z.number().optional(),
          notes: z.string().optional(),
        }),
      },
      async ({ exercise, weight, reps, notes }) => {
        await createWorkoutEntry({
          exercise,
          weight: weight ?? null,
          reps: reps ?? null,
          notes: notes ?? null,
        });
        return { content: [{ type: "text" as const, text: "Logged." }] };
      }
    );

    server.registerTool(
      "update_preferences",
      {
        title: "Update preferences",
        description:
          "Update the user's calorie/macro targets, goal, or training info. Only pass the fields that changed — anything omitted keeps its current value. Use this after a first-run setup conversation, or whenever the user explicitly asks to change a target/goal.",
        inputSchema: z.object({
          calorieTarget: z.number().optional(),
          proteinTarget: z.number().optional().describe("grams"),
          carbsTarget: z.number().optional().describe("grams"),
          fatTarget: z.number().optional().describe("grams"),
          fiberTarget: z.number().optional().describe("grams"),
          goal: z.enum(["cut", "maintain", "bulk"]).optional(),
          trainingDays: z.string().optional().describe("e.g. 'Mon/Wed/Fri'"),
          trainingStyle: z.string().optional().describe("e.g. 'HIT, full body'"),
        }),
      },
      async (input) => {
        const row = await updatePreferencesData(input);
        return { content: [{ type: "text" as const, text: JSON.stringify(row) }] };
      }
    );

    server.registerTool(
      "search_usda_food",
      {
        title: "Search USDA FoodData Central",
        description:
          "Look up real measured nutrition data for a food/ingredient from USDA FoodData Central. Use this before estimating from memory. Returns a few candidate matches with calories/protein/carbs/fat/fiber per the API's reported serving — check servingSize/dataType before using a value, since generic ('Foundation'/'SR Legacy') results are usually per 100g while 'Branded' results are per labeled serving.",
        inputSchema: z.object({
          query: z.string().describe("Food or ingredient name, e.g. 'egg, whole, cooked'"),
          pageSize: z.number().optional().describe("Max results, default 5"),
        }),
      },
      async ({ query, pageSize }) => {
        const results = await searchUsdaFood(query, pageSize);
        return { content: [{ type: "text" as const, text: JSON.stringify(results) }] };
      }
    );

    server.registerTool(
      "get_status",
      {
        title: "Get today's status",
        description:
          "Fetch today's running totals vs targets, plus goal and training preferences. Call this before estimating a new entry.",
        inputSchema: z.object({}),
      },
      async () => {
        const [prefs, totals] = await Promise.all([getPreferences(), getTodayTotals()]);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ preferences: prefs, today: totals }) }],
        };
      }
    );
  },
  { serverInfo: { name: "calorie-tracker", version: "1.0.0" } }
);

// ponytail: plain string equality, not constant-time comparison — fine for a
// single-user shared secret over HTTPS, upgrade if this ever isn't personal-only.
function isAuthorized(req: Request): boolean {
  const secret = process.env.MCP_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

async function authedHandler(req: Request) {
  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return handler(req);
}

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };
