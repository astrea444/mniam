import { usePantryStore } from "./pantryStore";
import { useMealStore } from "./mealStore";
import { useShoppingStore } from "./shoppingStore";
import { useUserStore } from "./userStore";
import { useUiStore } from "./uiStore";

export function resetAllStores() {
  usePantryStore().reset();
  useMealStore().reset();
  useShoppingStore().reset();
  useUserStore().reset();
  useUiStore().reset();
}

export { usePantryStore, useMealStore, useShoppingStore, useUserStore, useUiStore };

