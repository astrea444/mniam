import { DIET_CATEGORIES } from "@/utils/recipeFilters";

export function getMatchBadge(matchRate) {
  if (matchRate >= 100) {
    return { variant: "green", text: `${matchRate}% dopasowania` };
  }
  if (matchRate >= 50) {
    return { variant: "orange", text: `${matchRate}% dopasowania` };
  }
  return { variant: "gray", text: `${matchRate}% dopasowania` };
}

export function getMissingIngredientBadge() {
  return { variant: "red", text: "Brak składnika" };
}

export function getLowStockBadge() {
  return { variant: "red", text: "Mało" };
}

export function getExpiryBadge(expiresLabel) {
  return { variant: "yellow", text: expiresLabel || "Termin" };
}

export function getPantryStatusBadge(inPantry, inShopping = false) {
  if (inPantry) {
    return null;
  }
  if (inShopping) {
    return { variant: "blue", text: "Na liście" };
  }
  return { variant: "red", text: "Brakuje" };
}

export function getRecentlyAddedBadge() {
  return { variant: "primary", text: "Nowy" };
}

export function getZeroWasteBadge(label = "Zero waste") {
  return { variant: "green", text: label };
}

import { getDifficultyLabel } from "@/constants/mealSlots";

const DIFFICULTY_VARIANTS = {
  easy: "lime",
  medium: "cyan",
  hard: "purple",
};

export function getDifficultyBadge(difficulty) {
  return {
    variant: DIFFICULTY_VARIANTS[difficulty] || "gray",
    text: getDifficultyLabel(difficulty),
  };
}

export function getTagBadge(text) {
  return { variant: "pink", text };
}

export function getDietBadge(rawKey) {
  const key =
    typeof rawKey === "object" && rawKey !== null
      ? rawKey.key || rawKey.label || rawKey.text
      : rawKey;
  const meta = DIET_CATEGORIES.find((c) => c.key === key || c.label === key);
  return {
    variant: "green",
    text: meta?.label || key || "",
    icon: meta?.icon,
  };
}
