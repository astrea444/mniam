import { INITIAL_PANTRY } from "@/mocks/pantryMock";
import { INITIAL_RECIPES } from "@/mocks/recipesMock";
import {
  PhCheese,
  PhCarrot,
  PhOrange,
  PhFish,
  PhGrains,
  PhDrop,
  PhBread,
  PhSnowflake,
  PhCoffee,
  PhLeaf,
  PhJar,
  PhCookie,
  PhPackage,
} from "@phosphor-icons/vue";

import {
  Beef,
  Droplets,
  Snowflake,
  Coffee,
  Leaf,
  Apple,
  Carrot,
  Wheat,
  Candy,
  Bookmark,
} from "lucide-vue-next";

export const PRODUCT_CATEGORIES = [
  { id: "dairy", label: "Nabiał", color: "#00A6F4", icon: PhCheese },
  { id: "vegetables", label: "Warzywa", color: "#76C541", icon: Carrot },
  { id: "fruits", label: "Owoce", color: "#FF6B35", icon: Apple },
  { id: "meat_fish", label: "Mięso i ryby", color: "#FF6467", icon: Beef },
  {
    id: "grains_pasta",
    label: "Ziarna i makarony",
    color: "#D08700",
    icon: Wheat,
  },
  {
    id: "oils_fats",
    label: "Oleje i tłuszcze",
    color: "#F0B100",
    icon: Droplets,
  },
  { id: "bakery", label: "Pieczywo", color: "#FF8904", icon: PhBread },
  { id: "frozen", label: "Mrożonki", color: "#00D3F3", icon: Snowflake },
  { id: "beverages", label: "Napoje", color: "#A684FF", icon: Coffee },
  {
    id: "spices_herbs",
    label: "Przyprawy i zioła",
    color: "#989cb3",
    icon: Leaf,
  },
  {
    id: "canned_jarred",
    label: "Konserwy i słoiki",
    color: "#2B7FFF",
    icon: PhJar,
  },
  {
    id: "sweets_snacks",
    label: "Słodycze i przekąski",
    color: "#D97AA0",
    icon: Candy,
  },
  { id: "other", label: "Inne", color: "#98A2B3", icon: Bookmark },
];

export const CATEGORY_COLORS = PRODUCT_CATEGORIES.reduce(
  (acc, { id, color }) => {
    acc[id] = color;
    return acc;
  },
  {},
);

export const CATEGORY_ICONS = PRODUCT_CATEGORIES.reduce((acc, { id, icon }) => {
  acc[id] = icon;
  return acc;
}, {});

export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(({ id }) => id);

export const CATEGORY_LABELS = PRODUCT_CATEGORIES.map(({ label }) => label);

export const DEFAULT_CATEGORY = "other";
export const ALL_CATEGORIES_LABEL = "Wszystkie";

export function getCategoryColor(categoryId) {
  return CATEGORY_COLORS[categoryId] ?? CATEGORY_COLORS[DEFAULT_CATEGORY];
}

export function getCategoryIcon(categoryId) {
  return CATEGORY_ICONS[categoryId] ?? CATEGORY_ICONS[DEFAULT_CATEGORY];
}

export function getCategoryLabel(categoryId) {
  if (!categoryId) return "";
  const cat = PRODUCT_CATEGORIES.find(
    (c) => c.id === categoryId || c.label === categoryId,
  );
  return (
    cat?.label ??
    PRODUCT_CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)?.label ??
    categoryId
  );
}


export const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map(
  ({ id, label, icon }) => ({
    label,
    value: id,
    icon,
  }),
);

const units = new Set(["szt", "opak", "g", "ml", "kg", "l"]);

INITIAL_PANTRY.forEach((item) => {
  if (item.unit) units.add(item.unit.trim());
});

INITIAL_RECIPES.forEach((recipe) => {
  (recipe.ingredients || []).forEach((ing) => {
    if (ing.unit) units.add(ing.unit.trim());
  });
});

export const UNIT_OPTIONS = Array.from(units)
  .sort((a, b) => a.localeCompare(b, "pl"))
  .map((unit) => ({ label: unit, value: unit }));

const names = new Set();
const productCategoryMap = new Map();

INITIAL_PANTRY.forEach((item) => {
  if (item.name) {
    const trimmed = item.name.trim();
    names.add(trimmed);
    if (item.category) {
      productCategoryMap.set(trimmed.toLowerCase(), item.category);
    }
  }
});

INITIAL_RECIPES.forEach((recipe) => {
  (recipe.ingredients || []).forEach((ing) => {
    if (ing.name) {
      const trimmed = ing.name.trim();
      names.add(trimmed);
      if (ing.category && !productCategoryMap.has(trimmed.toLowerCase())) {
        productCategoryMap.set(trimmed.toLowerCase(), ing.category);
      }
    }
  });
});

export const PRODUCT_SUGGESTIONS = Array.from(names).sort((a, b) =>
  a.localeCompare(b, "pl"),
);

export function getCategoryForProduct(name = "") {
  return productCategoryMap.get(name.trim().toLowerCase()) || null;
}

export function iconFor(item) {
  return getCategoryIcon(item?.category);
}

export function iconColor(item) {
  return getCategoryColor(item?.category);
}
