import { MEAL_SLOT_META, MEAL_SLOTS } from "@/constants/mealSlots";
import { DEFAULT_CATEGORY } from "@/constants/productOptions";

export const SLOT_LABELS_BY_COUNT = {
  1: ["Śniadanie"],
  2: ["Śniadanie", "Obiad"],
  3: ["Śniadanie", "Obiad", "Kolacja"],
  4: ["Śniadanie", "Lunch", "Obiad", "Kolacja"],
  5: ["Śniadanie", "Lunch", "Obiad", "Podwieczorek", "Kolacja"],
};

export function getSlotLabel(index, total) {
  if (SLOT_LABELS_BY_COUNT[total]?.[index]) {
    return SLOT_LABELS_BY_COUNT[total][index];
  }
  const defaultLabels = [
    "Śniadanie",
    "Lunch",
    "Obiad",
    "Podwieczorek",
    "Kolacja",
  ];
  if (index < defaultLabels.length) return defaultLabels[index];
  return `Dodatkowy ${index - defaultLabels.length + 1}`;
}

export class MealPlanService {
  static createEmptyDay() {
    return {
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    };
  }

  static getPlanForDay(plan = {}, date) {
    if (!date) return this.createEmptyDay();
    return plan[date] || this.createEmptyDay();
  }

  static getDailyMeals(plan = {}, date, recipesMap = {}) {
    const dayPlan = this.getPlanForDay(plan, date);
    const BASE_SLOT_META = MEAL_SLOT_META;

    const meals = [];

    const slotKeys =
      dayPlan._slotOrder && Array.isArray(dayPlan._slotOrder)
        ? [
            ...dayPlan._slotOrder,
            ...Object.keys(dayPlan).filter(
              (k) => !dayPlan._slotOrder.includes(k) && !k.startsWith("_"),
            ),
          ]
        : Object.keys(dayPlan).filter((k) => !k.startsWith("_"));

    slotKeys.forEach((key) => {
      if (key.startsWith("_")) return;
      const slotVal = dayPlan[key];
      if (!slotVal) return;

      const meta = BASE_SLOT_META[key] || {
        label: key.startsWith("extra-")
          ? `Dodatkowy ${key.split("-")[1]}`
          : key,
      };

      const recipe =
        typeof slotVal === "object" && !Array.isArray(slotVal)
          ? slotVal
          : recipesMap[slotVal];
      if (recipe) {
        meals.push({
          id: recipe.id || `${date}_${key}`,
          title: recipe.title || meta.label,
          time:
            recipe.time ||
            (recipe.prepTime ? `${recipe.prepTime} min` : meta.label),
          tags: (recipe.tags || []).map((tag) =>
            typeof tag === "string" ? { text: tag, type: "default" } : tag,
          ),
          slot: key,
          recipe,
        });
      } else if (typeof slotVal === "string") {
        meals.push({
          id: `${date}_${key}_${slotVal}`,
          title: meta.label,
          time: meta.label,
          tags: [],
          slot: key,
          recipe: null,
        });
      }
    });

    return meals;
  }

  static async addMealToSlot(plan = {}, date, slot, recipeId) {
    if (!date || !slot) return { ...plan };

    const dayPlan = this.getPlanForDay(plan, date);
    return {
      ...plan,
      [date]: {
        ...dayPlan,
        [slot]: recipeId,
      },
    };
  }

  static async removeMealFromSlot(plan = {}, date, slot) {
    return this.addMealToSlot(plan, date, slot, null);
  }

  static async clearDay(plan = {}, date) {
    if (!date) return { ...plan };
    const updatedPlan = { ...plan };
    delete updatedPlan[date];
    return updatedPlan;
  }

  static calculateDailyNutrition(
    plan = {},
    date,
    recipesMap = {},
    eatenMeals = {},
    onlyEaten = true,
  ) {
    const dayPlan = this.getPlanForDay(plan, date);
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    Object.keys(dayPlan).forEach((slot) => {
      if (slot.startsWith("_")) return;
      const slotVal = dayPlan[slot];
      if (!slotVal) return;

      const recipe =
        typeof slotVal === "object" && !Array.isArray(slotVal)
          ? slotVal
          : recipesMap[slotVal];
      if (!recipe) return;

      const eatenKey = `${date}::${slot}`;
      const eatenData = eatenMeals ? eatenMeals[eatenKey] : null;
      const isMealEaten = !!eatenData;

      if (onlyEaten && !isMealEaten) return;

      let portion = 1.0;
      if (isMealEaten) {
        if (typeof eatenData === "number") portion = eatenData;
        else if (
          typeof eatenData === "object" &&
          eatenData !== null &&
          eatenData.portion != null
        ) {
          portion = Number(eatenData.portion) || 1.0;
        }
      }

      totals.calories += (Number(recipe.calories) || 0) * portion;
      totals.protein += (Number(recipe.protein) || 0) * portion;
      totals.carbs += (Number(recipe.carbs) || 0) * portion;
      totals.fat += (Number(recipe.fat) || 0) * portion;
    });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    };
  }

  static getRequiredIngredientsForPlan(plan = {}, dates = [], recipesMap = {}) {
    const aggregated = {};

    dates.forEach((date) => {
      const dayPlan = this.getPlanForDay(plan, date);
      Object.keys(dayPlan).forEach((slot) => {
        if (slot.startsWith("_")) return;
        const recipeId = dayPlan[slot];
        if (recipeId && recipesMap[recipeId]) {
          const recipe = recipesMap[recipeId];
          const ingredients = recipe.ingredients || [];

          ingredients.forEach((ing) => {
            const key = `${ing.name.trim().toLowerCase()}_${(ing.unit || "szt").toLowerCase()}`;
            if (!aggregated[key]) {
              aggregated[key] = {
                name: ing.name.trim(),
                amount: 0,
                unit: ing.unit || "szt",
                category: ing.category || DEFAULT_CATEGORY,
              };
            }
            aggregated[key].amount += Number(ing.amount) || 0;
          });
        }
      });
    });

    return Object.values(aggregated);
  }

  static getSlotsForDay(dayPlan = {}, recipeMap = {}) {
    const BASE_SLOTS = MEAL_SLOTS.filter((s) => s.key !== "snack");
    const slots = [...BASE_SLOTS];
    const selectedMeals = {};

    BASE_SLOTS.forEach((s) => {
      selectedMeals[s.key] = dayPlan[s.key]
        ? recipeMap[dayPlan[s.key]] || null
        : null;
    });

    Object.keys(dayPlan).forEach((k) => {
      if (
        !BASE_SLOTS.some((s) => s.key === k) &&
        k !== "snack" &&
        !k.startsWith("_")
      ) {
        slots.push({ key: k, label: "" });
        selectedMeals[k] = dayPlan[k] ? recipeMap[dayPlan[k]] || null : null;
      }
    });

    if (dayPlan._slotOrder && Array.isArray(dayPlan._slotOrder)) {
      slots.sort((a, b) => {
        const idxA = dayPlan._slotOrder.indexOf(a.key);
        const idxB = dayPlan._slotOrder.indexOf(b.key);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    slots.forEach((s, idx) => {
      s.label = getSlotLabel(idx, slots.length);
    });

    return { slots, selectedMeals };
  }

  static matchRecipeForSlot(recipes = [], slotKey, slotLabel = "") {
    if (!recipes || recipes.length === 0) return null;
    const SLOT_CATEGORY_MAP = {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snack: "snack",
      "Śniadanie": "breakfast",
      "Obiad": "lunch",
      "Kolacja": "dinner",
      "Przekąska": "snack",
    };
    const targetCategory = SLOT_CATEGORY_MAP[slotKey] || SLOT_CATEGORY_MAP[slotLabel] || slotKey;
    const pool = targetCategory
      ? recipes.filter(
          (r) =>
            r.category?.toLowerCase() === targetCategory.toLowerCase() ||
            r.category?.toLowerCase() === (slotLabel || "").toLowerCase() ||
            r.category?.toLowerCase() === (slotKey || "").toLowerCase(),
        )
      : recipes;
    if (!pool.length) return recipes[0] || null;
    return pool.find((r) => r.matchRate >= 90) || pool[0];
  }
}