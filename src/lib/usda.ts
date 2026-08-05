// Thin wrapper around USDA FoodData Central's public search API — gives
// Hermes real measured nutrition data instead of estimating from memory.
// Free API key: https://fdc.nal.usda.gov/api-key-signup.html
const NUTRIENT_MAP: Record<string, "calories" | "protein" | "carbs" | "fat" | "fiber"> = {
  Energy: "calories",
  Protein: "protein",
  "Carbohydrate, by difference": "carbs",
  "Total lipid (fat)": "fat",
  "Fiber, total dietary": "fiber",
};

type UsdaNutrient = { nutrientName: string; value: number };
type UsdaFood = {
  description: string;
  dataType: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: UsdaNutrient[];
};

export type UsdaResult = {
  description: string;
  dataType: string;
  servingSize?: string;
  nutrients: Partial<Record<"calories" | "protein" | "carbs" | "fat" | "fiber", number>>;
};

export async function searchUsdaFood(query: string, pageSize = 5): Promise<UsdaResult[]> {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("api_key", process.env.USDA_API_KEY ?? "");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`USDA FoodData Central request failed: ${res.status}`);
  }
  const data: { foods?: UsdaFood[] } = await res.json();

  return (data.foods ?? []).map((food) => {
    const nutrients: UsdaResult["nutrients"] = {};
    for (const n of food.foodNutrients ?? []) {
      const key = NUTRIENT_MAP[n.nutrientName];
      if (key) nutrients[key] = n.value;
    }
    return {
      description: food.description,
      dataType: food.dataType,
      servingSize: food.servingSize ? `${food.servingSize}${food.servingSizeUnit ?? ""}` : undefined,
      nutrients,
    };
  });
}
