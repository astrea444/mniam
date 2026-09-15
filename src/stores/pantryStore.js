import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { PantryService } from "@/services/pantryService";
import { INITIAL_PANTRY } from "@/mocks/pantryMock";
import { getStorageItem, setStorageItem } from "@/utils/storage";

export const usePantryStore = defineStore("pantry", () => {
  const items = ref(getStorageItem("pantry", INITIAL_PANTRY));
  const isLoading = ref(false);
  const error = ref(null);

  const lowStockItems = computed(() => items.value.filter(PantryService.isLow));

  const expiringItems = computed(() =>
    [...items.value]
      .filter(PantryService.isExpiring)
      .sort(
        (a, b) =>
          (PantryService.getExpiresInDays(a) ?? Infinity) -
          (PantryService.getExpiresInDays(b) ?? Infinity),
      ),
  );


  async function fetchItems() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = getStorageItem("pantry", null);
      if (data) {
        items.value = await PantryService.getAll(data);
      } else {
        items.value = await PantryService.getInitialPantry();
      }
    } catch (err) {
      error.value = err?.message || "Błąd pobierania produktów";
    } finally {
      isLoading.value = false;
    }
  }

  function findByName(name = "") {
    return PantryService.findByName(items.value, name);
  }

  function addItem(newItem) {
    const enriched = { ...newItem };
    enriched.isLowStock = PantryService.isLow(enriched);
    if (enriched.expiryDate) {
      enriched.expiresInDays = PantryService.daysUntil(enriched.expiryDate);
    }
    items.value = PantryService.add(items.value, enriched);
    setStorageItem("pantry", items.value);
  }

  function removeItem(id) {
    items.value = PantryService.remove(items.value, id);
    setStorageItem("pantry", items.value);
  }

  function updateQuantity(id, amount) {
    items.value = PantryService.update(items.value, id, { amount });
    setStorageItem("pantry", items.value);
  }

  function updateItem(id, updatedData) {
    const enriched = { ...updatedData };
    const existing = items.value.find((i) => i.id === id);
    const merged = { ...existing, ...enriched };
    enriched.isLowStock = PantryService.isLow(merged);
    if (enriched.expiryDate !== undefined) {
      enriched.expiresInDays = enriched.expiryDate
        ? PantryService.daysUntil(enriched.expiryDate)
        : null;
    }
    items.value = PantryService.update(items.value, id, enriched);
    setStorageItem("pantry", items.value);
  }

  function deductIngredients(ingredients = [], multiplier = 1) {
    items.value = PantryService.deductIngredients(
      items.value,
      ingredients,
      multiplier,
    );
    setStorageItem("pantry", items.value);
  }

  function reset() {
    items.value = PantryService.getInitialPantry();
    setStorageItem("pantry", items.value);
  }

  function addMultiple(newItems = []) {
    let current = items.value;
    for (const item of newItems || []) {
      current = PantryService.add(current, item);
    }
    items.value = current;
    setStorageItem("pantry", items.value);
  }

  function addIngredients(ingredients = [], multiplier = 1) {
    items.value = PantryService.addIngredients(
      items.value,
      ingredients,
      multiplier,
    );
    setStorageItem("pantry", items.value);
  }

  function isInPantry(name) {
    return PantryService.isInPantry(items.value, name);
  }

  function checkMissingIngredients(ingredients = []) {
    return PantryService.checkMissingIngredients(items.value, ingredients);
  }

  return {
    items,
    isLoading,
    error,
    lowStockItems,
    expiringItems,
    fetchItems,
    findByName,
    isInPantry,
    addItem,
    addMultiple,
    removeItem,
    updateQuantity,
    updateItem,
    deductIngredients,
    addIngredients,
    checkMissingIngredients,
    reset,
  };
});
