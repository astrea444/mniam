import { MealPlanService } from "./mealService";
import { calculateIngredientMatch } from "@/utils/matchRate";
import { DEFAULT_CATEGORY } from "@/constants/productOptions";
import {
  toCommercialUnit,
  toggleCommercialUnit,
} from "@/utils/commercialUnits";
import { filterProducts, sortProducts } from "@/utils/productFilters";

export class ShoppingListService {
  static async add(items = [], newItem = {}, source = "manual") {
    const itemToAdd = {
      id:
        newItem.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: newItem.name || "Nowy produkt",
      amount: Number(newItem.amount) || 1,
      unit: newItem.unit || "szt",
      category: newItem.category || DEFAULT_CATEGORY,
      checked: Boolean(newItem.checked),
      source: newItem.source || source,
      rawAmount: newItem.rawAmount ?? newItem.amount,
      rawUnit: newItem.rawUnit ?? newItem.unit,
      packageSize: newItem.packageSize ?? null,
      commercialType:
        newItem.commercialType ??
        (newItem.unit?.includes("opak") ? "opak" : "szt"),
      totalStockAmount: newItem.totalStockAmount ?? newItem.amount,
      stockUnit: newItem.stockUnit ?? newItem.unit,
    };

    const cleanName = itemToAdd.name.trim().toLowerCase();
    const existingIndex = items.findIndex(
      (i) =>
        i.name.trim().toLowerCase() === cleanName &&
        i.unit.toLowerCase() === itemToAdd.unit.toLowerCase() &&
        (i.category || DEFAULT_CATEGORY) === itemToAdd.category &&
        (i.source || "manual") === itemToAdd.source,
    );

    if (existingIndex > -1) {
      return items.map((item, idx) => {
        if (idx === existingIndex) {
          return {
            ...item,
            amount: item.amount + itemToAdd.amount,
            totalStockAmount:
              (item.totalStockAmount || item.amount) +
              (itemToAdd.totalStockAmount || itemToAdd.amount),
          };
        }
        return item;
      });
    }

    return [...items, itemToAdd];
  }

  static async addIngredientsFromRecipe(existingList = [], ingredients = []) {
    let currentList = [...existingList];
    for (const ing of ingredients || []) {
      const commercial = toCommercialUnit(ing.name, ing.amount, ing.unit);
      currentList = await this.add(
        currentList,
        {
          name: ing.name,
          amount: commercial.amount,
          unit: commercial.unit,
          category: ing.category || DEFAULT_CATEGORY,
          rawAmount: commercial.rawAmount,
          rawUnit: commercial.rawUnit,
          packageSize: commercial.packageSize,
          commercialType: commercial.commercialType,
          totalStockAmount: commercial.totalStockAmount,
          stockUnit: commercial.stockUnit,
        },
        "recipe",
      );
    }
    return currentList;
  }

  static async toggleUnitType(items = [], id) {
    return items.map((item) => {
      if (item.id === id) {
        return toggleCommercialUnit(item);
      }
      return item;
    });
  }

  static async update(items = [], id, updatedData = {}) {
    return items.map((item) =>
      item.id === id ? { ...item, ...updatedData } : item,
    );
  }

  static async remove(items = [], id) {
    return items.filter((i) => i.id !== id);
  }

  static async toggleChecked(items = [], id) {
    return items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
  }

  static async clearChecked(items = []) {
    return items.filter((i) => !i.checked);
  }

  static async removeAutoItems(items = []) {
    return items.filter((i) => i.source !== "auto");
  }

  static subtractPantryFromRequired(
    requiredIngredients = [],
    pantryItems = [],
  ) {
    const toBuyList = [];

    requiredIngredients.forEach((req) => {
      const match = calculateIngredientMatch(req, pantryItems);
      if (match.missingAmount > 0) {
        const commercial = toCommercialUnit(
          req.name,
          match.missingAmount,
          req.unit,
        );
        toBuyList.push({
          name: req.name,
          amount: commercial.amount,
          unit: commercial.unit,
          category: req.category || DEFAULT_CATEGORY,
          checked: false,
          rawAmount: commercial.rawAmount,
          rawUnit: commercial.rawUnit,
          packageSize: commercial.packageSize,
          commercialType: commercial.commercialType,
          totalStockAmount: commercial.totalStockAmount,
          stockUnit: commercial.stockUnit,
        });
      }
    });

    return toBuyList;
  }

  static async generateFromMealPlan(
    plan = {},
    dates = [],
    recipesMap = {},
    pantryItems = [],
    existingShoppingList = [],
  ) {
    const required = MealPlanService.getRequiredIngredientsForPlan(
      plan,
      dates,
      recipesMap,
    );
    const missingItems = this.subtractPantryFromRequired(required, pantryItems);

    const checkedMap = new Map();
    existingShoppingList.forEach((item) => {
      if (item.checked) {
        checkedMap.set(
          `${item.name.trim().toLowerCase()}_${(item.unit || "").toLowerCase()}_${item.category || DEFAULT_CATEGORY}`,
          item,
        );
      }
    });

    const cleanedList = existingShoppingList.filter(
      (i) => i.source !== "auto" || i.checked,
    );

    if (missingItems.length === 0) {
      return { items: cleanedList, addedCount: 0 };
    }

    let updatedList = cleanedList;
    for (const item of missingItems) {
      const key = `${item.name.trim().toLowerCase()}_${(item.unit || "").toLowerCase()}_${item.category || DEFAULT_CATEGORY}`;
      const isAlreadyChecked = checkedMap.has(key);

      const existsInCleaned = updatedList.some(
        (i) =>
          i.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
          i.unit.toLowerCase() === (item.unit || "").toLowerCase() &&
          (i.category || DEFAULT_CATEGORY) ===
            (item.category || DEFAULT_CATEGORY) &&
          (i.source || "manual") === "auto",
      );

      if (!existsInCleaned) {
        updatedList = await this.add(
          updatedList,
          {
            ...item,
            checked: isAlreadyChecked,
          },
          "auto",
        );
      }
    }

    return { items: updatedList, addedCount: missingItems.length };
  }

  static search(items = [], query = "") {
    return filterProducts(items, { query });
  }

  static groupByCategory(items = []) {
    return items.reduce((acc, item) => {
      const category = item.category || DEFAULT_CATEGORY;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }

  static sort(items = [], sortBy = "checked") {
    return sortProducts(items, sortBy);
  }
}