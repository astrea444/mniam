import { INITIAL_MEAL_PLAN } from "@/mocks/mealPlanMock";
import { INITIAL_RECIPES } from "@/mocks/recipesMock";

export const mealApi = {
  async getInitialMealPlan() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...INITIAL_MEAL_PLAN };
  },

  async getInitialRecipes() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...INITIAL_RECIPES];
  },
};
