import { INITIAL_SHOPPING_LIST } from "@/mocks/shoppingListMock";

export const shoppingApi = {
  async getInitialShoppingList() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...INITIAL_SHOPPING_LIST];
  },

  async getAll(items = []) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Array.isArray(items) ? [...items] : [];
  },
};
