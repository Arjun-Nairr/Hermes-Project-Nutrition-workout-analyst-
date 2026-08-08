import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createFoodEntry, createWorkoutEntry, updatePreferencesData, createInsight, MAX_UNDISMISSED_INSIGHTS } from "@/lib/data";
import { getPreferences, getTodayTotals, getWeeklyStats, getRecentInsights } from "@/lib/queries";
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
      "post_insight",
      {
        title: "Post insight",
        description:
          `Push a short, specific insight to the user's dashboard (a separate Insights tab, not the main page) — for real patterns you've actually noticed in their logged data, not generic advice. Examples: a macro consistently under/over target across several days, a fatigue/diet correlation you found, a workout progression note. Don't post one for every message — only when there's something genuinely worth surfacing. One or two sentences, plain, specific, actionable. Capped at ${MAX_UNDISMISSED_INSIGHTS} undismissed at once — posting past the cap silently replaces the single oldest one (FIFO), so the 5 shown are always the most recent; no need to check capacity first.`,
        inputSchema: z.object({
          content: z.string().describe("The insight text, 1-2 sentences"),
        }),
      },
      async ({ content }) => {
        await createInsight(content);
        return { content: [{ type: "text" as const, text: "Posted." }] };
      }
    );

    server.registerTool(
      "get_status",
      {
        title: "Get today's status",
        description:
          "Fetch today's running totals vs targets, this week's pattern (averages, under/over-target day counts, workout counts), and goal/training preferences. Call this before estimating a new entry, and before deciding whether to post_insight.",
        inputSchema: z.object({}),
      },
      async () => {
        const [prefs, today, week] = await Promise.all([getPreferences(), getTodayTotals(), getWeeklyStats()]);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ preferences: prefs, today, week }) }],
        };
      }
    );

    server.registerTool(
      "get_recent_insights",
      {
        title: "Get recent insights",
        description:
          "Fetch the insights already posted (most recent first, with timestamps). Check this before post_insight to avoid posting a duplicate or re-flagging something already said — e.g. don't post again today if you already posted an insight today.",
        inputSchema: z.object({
          limit: z.number().optional().describe("Max results, default 10"),
        }),
      },
      async ({ limit }) => {
        const rows = await getRecentInsights(limit ?? 10);
        return { content: [{ type: "text" as const, text: JSON.stringify(rows) }] };
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
