import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { MealPlanService } from "@/services/mealService";
import { INITIAL_RECIPES } from "@/mocks/recipesMock";
import { INITIAL_MEAL_PLAN } from "@/mocks/mealPlanMock";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { MEAL_SLOTS } from "@/constants/mealSlots";
export { MEAL_SLOTS };

export const useMealStore = defineStore("meal", () => {
  const recipes = ref(getStorageItem("recipes", INITIAL_RECIPES));
  const mealPlan = ref(getStorageItem("mealPlan", INITIAL_MEAL_PLAN));
  const initialFavorites = INITIAL_RECIPES.filter((r) => r.isFavorite).map(
    (r) => r.id,
  );
  const favorites = ref(getStorageItem("favorites", initialFavorites));
  const eatenMeals = ref(getStorageItem("eatenMeals", {}));
  const isLoading = ref(false);
  const error = ref(null);

  const recipeMap = computed(() => {
    return (recipes.value || []).reduce((acc, recipe) => {
      acc[recipe.id] = recipe;
      return acc;
    }, {});
  });

  async function fetchMeals() {
    isLoading.value = true;
    error.value = null;
    try {
      const savedRecipes = getStorageItem("recipes", null);
      if (savedRecipes) {
        recipes.value = savedRecipes;
      } else {
        recipes.value = await MealPlanService.getInitialRecipes();
      }
      const savedPlan = getStorageItem("mealPlan", null);
      if (savedPlan) {
        mealPlan.value = savedPlan;
      } else {
        mealPlan.value = await MealPlanService.getInitialMealPlan();
      }
    } catch (err) {
      error.value = err?.message || "Błąd pobierania danych posiłków";
    } finally {
      isLoading.value = false;
    }
  }

  function getById(id) {
    return recipeMap.value[id] || null;
  }

  function addRecipe(newRecipe) {
    recipes.value = [...recipes.value, newRecipe];
    setStorageItem("recipes", recipes.value);
  }

  function updateRecipe(id, updatedData) {
    recipes.value = recipes.value.map((recipe) =>
      recipe.id === id ? { ...recipe, ...updatedData } : recipe,
    );
    setStorageItem("recipes", recipes.value);
  }

  function removeRecipe(id) {
    recipes.value = recipes.value.filter((r) => r.id !== id);
    setStorageItem("recipes", recipes.value);
  }

  function groupByCategory() {
    return recipes.value.reduce((acc, recipe) => {
      const category = recipe.category || "Inne";
      if (!acc[category]) acc[category] = [];
      acc[category].push(recipe);
      return acc;
    }, {});
  }

  async function setMealForDay(date, slot, recipeId) {
    mealPlan.value = await MealPlanService.addMealToSlot(
      mealPlan.value,
      date,
      slot,
      recipeId,
    );
    setStorageItem("mealPlan", mealPlan.value);
  }

  async function removeMealForDay(date, slot) {
    mealPlan.value = await MealPlanService.removeMealFromSlot(
      mealPlan.value,
      date,
      slot,
    );
    setStorageItem("mealPlan", mealPlan.value);
  }

  async function clearDayPlan(date) {
    mealPlan.value = await MealPlanService.clearDay(mealPlan.value, date);
    setStorageItem("mealPlan", mealPlan.value);
  }

  function setDayPlan(date, planData) {
    if (!date) return;
    mealPlan.value = {
      ...mealPlan.value,
      [date]: { ...planData },
    };
    setStorageItem("mealPlan", mealPlan.value);
  }

  function isFavorite(recipeId) {
    return favorites.value.includes(recipeId);
  }

  function toggleFavorite(recipeId) {
    const list = [...favorites.value];
    const idx = list.indexOf(recipeId);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(recipeId);
    }
    favorites.value = list;
    setStorageItem("favorites", favorites.value);
  }

  function isEaten(date, slot) {
    if (!date || !slot) return false;
    const key = `${date}::${slot}`;
    const item = eatenMeals.value[key];
    if (!item) return false;
    if (typeof item === "object" && item !== null) {
      return item.eaten !== false;
    }
    return !!item;
  }

  function getEatenPortion(date, slot) {
    if (!date || !slot) return 1.0;
    const key = `${date}::${slot}`;
    const item = eatenMeals.value[key];
    if (!item) return 1.0;
    if (typeof item === "number") return item;
    if (typeof item === "object" && item !== null && item.portion != null) {
      return Number(item.portion) || 1.0;
    }
    return 1.0;
  }

  function markAsEaten(date, slot, portion = 1.0) {
    if (!date || !slot) return;
    const key = `${date}::${slot}`;
    eatenMeals.value = {
      ...eatenMeals.value,
      [key]: { eaten: true, portion: Number(portion) || 1.0 },
    };
    setStorageItem("eatenMeals", eatenMeals.value);
  }

  function unmarkEaten(date, slot) {
    if (!date || !slot) return;
    const key = `${date}::${slot}`;
    const next = { ...eatenMeals.value };
    delete next[key];
    eatenMeals.value = next;
    setStorageItem("eatenMeals", eatenMeals.value);
  }

  function toggleEaten(date, slot, portion = 1.0) {
    if (!date || !slot) return;
    if (isEaten(date, slot)) {
      unmarkEaten(date, slot);
    } else {
      markAsEaten(date, slot, portion);
    }
  }

  function getDailyMeals(date) {
    return MealPlanService.getDailyMeals(mealPlan.value, date, recipeMap.value);
  }

  function calculateDailyNutrition(date, onlyEaten = true) {
    return MealPlanService.calculateDailyNutrition(
      mealPlan.value,
      date,
      recipeMap.value,
      eatenMeals.value,
      onlyEaten,
    );
  }

  function reset() {
    recipes.value = [...INITIAL_RECIPES];
    mealPlan.value = { ...INITIAL_MEAL_PLAN };
    favorites.value = INITIAL_RECIPES.filter((r) => r.isFavorite).map(
      (r) => r.id,
    );
    eatenMeals.value = {};
    setStorageItem("recipes", recipes.value);
    setStorageItem("mealPlan", mealPlan.value);
    setStorageItem("favorites", favorites.value);
    setStorageItem("eatenMeals", eatenMeals.value);
  }

  return {
    recipes,
    mealPlan,
    favorites,
    eatenMeals,
    recipeMap,
    isLoading,
    error,

    fetchMeals,
    getById,
    addRecipe,
    updateRecipe,
    removeRecipe,
    groupByCategory,
    setMealForDay,
    removeMealForDay,
    clearDayPlan,
    setDayPlan,
    isFavorite,
    toggleFavorite,
    isEaten,
    getEatenPortion,
    markAsEaten,
    unmarkEaten,
    toggleEaten,
    getDailyMeals,
    calculateDailyNutrition,
    reset,
  };
});
