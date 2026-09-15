import { DEFAULT_CATEGORY } from "../constants/productOptions";

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function findInPantry(pantryItems = [], name = "") {
  if (!name) return null;
  const clean = normalize(name);
  return pantryItems.find((i) => i.name && normalize(i.name) === clean) || null;
}

export function calculateIngredientMatch(ingredient, pantryItems = []) {
  const pantryItem = findInPantry(pantryItems, ingredient.name);
  const requiredAmount = Number(ingredient.amount) || 0;

  if (!pantryItem) {
    return { ratio: 0, missingAmount: requiredAmount, isAvailable: false };
  }

  const availableAmount = Number(pantryItem.amount) || 0;
  if (availableAmount >= requiredAmount) {
    return { ratio: 1, missingAmount: 0, isAvailable: true };
  }

  const ratio = requiredAmount > 0 ? availableAmount / requiredAmount : 0;
  const missingAmount = Math.max(0, requiredAmount - availableAmount);

  return { ratio, missingAmount, isAvailable: ratio > 0 };
}

export function calculateMatchRate(recipe, pantryItems = []) {
  const ingredients = recipe.ingredients || [];
  if (ingredients.length === 0) {
    return {
      matchRate: 100,
      availableCount: 0,
      totalCount: 0,
      missingIngredients: [],
    };
  }

  let totalScore = 0;
  let availableCount = 0;
  const missingIngredients = [];

  ingredients.forEach((ing) => {
    const match = calculateIngredientMatch(ing, pantryItems);
    totalScore += match.ratio;
    if (match.isAvailable) availableCount++;

    if (match.missingAmount > 0) {
      missingIngredients.push({
        name: ing.name,
        amount: match.missingAmount,
        unit: ing.unit,
        category: ing.category || DEFAULT_CATEGORY,
      });
    }
  });

  const matchRate = Math.round((totalScore / ingredients.length) * 100);

  return {
    matchRate,
    availableCount,
    totalCount: ingredients.length,
    missingIngredients,
  };
}

export function attachMatchRates(recipes = [], pantryItems = []) {
  return recipes.map((recipe) => {
    const matchData = calculateMatchRate(recipe, pantryItems);
    return {
      ...recipe,
      matchRate: matchData.matchRate,
      ingredientsInFridge: matchData.availableCount,
      ingredientsTotal: matchData.totalCount,
      missingIngredients: matchData.missingIngredients,
    };
  });
}
