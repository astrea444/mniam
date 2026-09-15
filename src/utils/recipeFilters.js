function normalize(str = "") {
  return str.toLowerCase().trim();
}

export const matchers = {
  query(recipe, value) {
    const q = normalize(value);
    if (!q) return true;
    const title = recipe.title || recipe.name || '';
    return normalize(title).includes(q);
  },
  category(recipe, value) {
    if (!value || value === "Wszystkie" || value === "all") return true;
    const catMap = {
      "Śniadanie": "breakfast",
      "Obiad": "lunch",
      "Kolacja": "dinner",
      "Przekąska": "snack",
    };
    const normalizedValue = catMap[value] || value;
    return recipe.category === normalizedValue || recipe.category === value;
  },
  tags(recipe, value) {
    if (!value?.length) return true;
    const recipeTags = recipe.tags || [];
    return value.some((tag) => {
      if (tag === "Zero-Waste") {
        return (
          (recipe.matchRate ?? 0) >= 50 ||
          (recipe.ingredientsInFridge ?? 0) >= 2 ||
          recipeTags.includes(tag)
        );
      }
      return recipeTags.includes(tag);
    });
  },
  tagsAll(recipe, value) {
    if (!value?.length) return true;
    const recipeTags = recipe.tags || [];
    return value.every((tag) => {
      if (tag === "Zero-Waste") {
        return (
          (recipe.matchRate ?? 0) >= 50 ||
          (recipe.ingredientsInFridge ?? 0) >= 2 ||
          recipeTags.includes(tag)
        );
      }
      return recipeTags.includes(tag);
    });
  },
  diet(recipe, value) {
    if (!value?.length) return true;
    const recipeDiet = recipe.dietCategories || [];
    const recipeTags = recipe.tags || [];
    return value.every((key) => {
      const cat = DIET_CATEGORIES.find((c) => c.key === key);
      const label = cat?.label;
      return (
        recipeDiet.includes(key) ||
        (label && recipeTags.includes(label)) ||
        (key === "zero-waste" &&
          ((recipe.matchRate ?? 0) >= 50 ||
            (recipe.ingredientsInFridge ?? 0) >= 2))
      );
    });
  },
  maxPrepTime(recipe, value) {
    if (value == null) return true;
    return (recipe.prepTime || 0) <= value;
  },
  maxCalories(recipe, value) {
    if (value == null) return true;
    return (recipe.calories || 0) <= value;
  },
  minMatchRate(recipe, value) {
    if (value == null) return true;
    return (recipe.matchRate ?? 0) >= value;
  },
  favoritesOnly(recipe, value, context) {
    if (!value) return true;
    return Boolean((context?.favorites || []).includes(recipe.id));
  },
};

export function filterRecipes(recipes = [], criteria = {}, context = {}) {
  const active = Object.entries(criteria).filter(
    ([key, value]) =>
      matchers[key] &&
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0),
  );
  if (!active.length) return [...recipes];
  return recipes.filter((recipe) =>
    active.every(([key, value]) => matchers[key](recipe, value, context)),
  );
}

const SORT_KEYS = {
  title: (r) => (r.title || "").toLowerCase(),
  prepTime: (r) => r.prepTime || 0,
  calories: (r) => r.calories || 0,
  matchRate: (r) => r.matchRate || 0,
};

export function sortRecipes(recipes = [], sortBy = "title", order = "asc") {
  const getValue = SORT_KEYS[sortBy] || SORT_KEYS.title;
  const multiplier = order === "desc" ? -1 : 1;
  return [...recipes].sort((a, b) => {
    const valA = getValue(a);
    const valB = getValue(b);
    if (valA < valB) return -1 * multiplier;
    if (valA > valB) return 1 * multiplier;
    return 0;
  });
}

import {
  Leaf,
  Sprout,
  Wheat,
  Milk,
  Salad,
  Dumbbell,
  TrendingDown,
  Beef,
  Ban,
  Activity,
  Sparkles,
} from "lucide-vue-next";

export const DIET_CATEGORIES = [
  { key: "zero-waste", label: "Zero-Waste", icon: Sparkles },
  { key: "vegetarian", label: "Wegetariańskie", icon: Leaf },
  { key: "vegan", label: "Wegańskie", icon: Sprout },
  { key: "gluten-free", label: "Bez glutenu", icon: Wheat },
  { key: "lactose-free", label: "Bez laktozy", icon: Milk },
  { key: "keto", label: "Keto", icon: Salad },
  { key: "high-protein", label: "Wysokobiałkowe", icon: Dumbbell },
  { key: "low-carb", label: "Low carb", icon: TrendingDown },
  { key: "paleo", label: "Paleo", icon: Beef },
  { key: "sugar-free", label: "Bez cukru", icon: Ban },
  { key: "fit", label: "Fit", icon: Activity },
];
export const SECTION_THRESHOLDS = {
  expiringDays: 3,
  quickPrepTime: 15,
  smallBiteCalories: 250,
};

function isExpiringIngredient(ingredientName, pantryItems, thresholdDays) {
  const clean = normalize(ingredientName);
  return pantryItems.some(
    (item) =>
      normalize(item.name) === clean &&
      Number(item.expiresInDays) <= thresholdDays,
  );
}

function usesExpiringIngredient(recipe, pantryItems, thresholdDays) {
  return (recipe.ingredients || []).some((ing) =>
    isExpiringIngredient(ing.name, pantryItems, thresholdDays),
  );
}

function isQuickAndEasy(recipe, maxPrepTime) {
  return (recipe.prepTime || 0) <= maxPrepTime && recipe.difficulty === "easy";
}

function isSmallBite(recipe, maxCalories) {
  return (
    recipe.category === "snack" && (recipe.calories || 0) <= maxCalories
  );
}

export function groupRecipesIntoSections(
  recipes = [],
  pantryItems = [],
  options = {},
) {
  const thresholds = { ...SECTION_THRESHOLDS, ...options };

  const sections = {
    matched: [],
    zeroWaste: [],
    expiring: [],
    quick: [],
    smallBites: [],
  };

  recipes.forEach((recipe) => {
    const inFridgeCount = recipe.ingredientsInFridge || 0;
    const matchRate = recipe.matchRate ?? 0;
    const isExpiring = usesExpiringIngredient(
      recipe,
      pantryItems,
      thresholds.expiringDays,
    );

    if (matchRate >= 100) {
      sections.matched.push(recipe);
    } else if (isExpiring) {
      sections.expiring.push({ ...recipe, expiresLabel: "Kończy się termin" });
    } else if (matchRate >= 50 || inFridgeCount >= 2) {
      sections.zeroWaste.push({ ...recipe, zeroWasteLabel: `Zero waste` });
    } else if (isQuickAndEasy(recipe, thresholds.quickPrepTime)) {
      sections.quick.push(recipe);
    } else if (isSmallBite(recipe, thresholds.smallBiteCalories)) {
      sections.smallBites.push(recipe);
    }
  });

  return sections;
}

export function normalizeStep(step) {
  if (typeof step === "string") {
    return { text: step, time: null };
  }
  return { text: step?.text ?? "", time: step?.time ?? null };
}
