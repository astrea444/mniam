import { INITIAL_PANTRY } from "@/mocks/pantryMock";

export const pantryApi = {
  async getInitialPantry() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...INITIAL_PANTRY];
  },

  async getAll(items = []) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Array.isArray(items) ? [...items] : [];
  },
};
