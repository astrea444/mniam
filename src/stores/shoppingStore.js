import { defineStore } from "pinia";
import { ref } from "vue";
import { ShoppingListService } from "@/services/shoppingService";
import { INITIAL_SHOPPING_LIST } from "@/mocks/shoppingListMock";
import { getStorageItem, setStorageItem } from "@/utils/storage";

export const useShoppingStore = defineStore("shoppingList", () => {
  const items = ref(
    getStorageItem("shoppingList", INITIAL_SHOPPING_LIST),
  );
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchItems() {
    isLoading.value = true;
    error.value = null;
    try {
      const saved = getStorageItem("shoppingList", null);
      if (saved) {
        items.value = await ShoppingListService.getAll(saved);
      } else {
        items.value = await ShoppingListService.getInitialShoppingList();
      }
    } catch (err) {
      error.value = err?.message || "Błąd pobierania listy zakupów";
    } finally {
      isLoading.value = false;
    }
  }

  async function addItem(newItem = {}) {
    error.value = null;
    try {
      items.value = await ShoppingListService.add(items.value, newItem);
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd dodawania pozycji";
    }
  }

  async function addIngredientsFromRecipe(ingredients = []) {
    error.value = null;
    try {
      items.value = await ShoppingListService.addIngredientsFromRecipe(
        items.value,
        ingredients,
      );
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd dodawania składników przepisu";
    }
  }

  async function toggleItem(id) {
    error.value = null;
    try {
      items.value = await ShoppingListService.toggleChecked(items.value, id);
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd zmiany stanu pozycji";
    }
  }

  async function removeItem(id) {
    error.value = null;
    try {
      items.value = await ShoppingListService.remove(items.value, id);
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd usuwania pozycji";
    }
  }

  async function clearCompleted() {
    error.value = null;
    try {
      items.value = await ShoppingListService.clearChecked(items.value);
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd czyszczenia zakupionych pozycji";
    }
  }

  async function generateFromMealPlan(plan, dates, recipesMap, pantryItems) {
    error.value = null;
    try {
      const result = await ShoppingListService.generateFromMealPlan(
        plan,
        dates,
        recipesMap,
        pantryItems,
        items.value,
      );
      items.value = result.items;
      setStorageItem("shoppingList", items.value);
      return result;
    } catch (err) {
      error.value = err?.message || "Błąd generowania listy zakupów";
      return { items: items.value, addedCount: 0 };
    }
  }

  async function toggleUnitType(id) {
    error.value = null;
    try {
      items.value = await ShoppingListService.toggleUnitType(items.value, id);
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd zmiany jednostki handlowej";
    }
  }

  async function reset() {
    error.value = null;
    try {
      items.value = await ShoppingListService.getInitialShoppingList();
      setStorageItem("shoppingList", items.value);
    } catch (err) {
      error.value = err?.message || "Błąd resetowania listy zakupów";
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    addItem,
    addIngredientsFromRecipe,
    toggleItem,
    toggleUnitType,
    removeItem,
    clearCompleted,
    generateFromMealPlan,
    reset,
  };
});

