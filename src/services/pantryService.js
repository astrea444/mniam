import { calculateIngredientMatch } from '@/utils/matchRate'
import {
  DEFAULT_CATEGORY,
  ALL_CATEGORIES_LABEL,
} from "../constants/productOptions";
import { normalizeUnits, areUnitsCompatible } from "../utils/formatters";
import { filterProducts, sortProducts } from "../utils/productFilters";

export class PantryService {
  static getDefaultLowStockThreshold(unit = "szt") {
    const cleanUnit = (unit || "szt").toLowerCase().trim();
    const thresholds = {
      szt: 2,
      opak: 1,
      but: 1,
      pusz: 1,
      kg: 0.5,
      g: 200,
      l: 0.5,
      ml: 250,
      dl: 2,
    };

    return thresholds[cleanUnit] ?? 2;
  }

  static getById(items = [], id) {
    return items.find((item) => item.id === id) || null;
  }

  static findByName(items = [], name = "") {
    if (!name) return null;

    const cleanName = name.trim().toLowerCase();

    return (
      items.find(
        (item) => item.name && item.name.trim().toLowerCase() === cleanName,
      ) || null
    );
  }

  static daysUntil(date, now = new Date()) {
    if (!date) return null;

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  }

  static add(items = [], newItem = {}) {
    const rawUnit = (newItem.unit || "szt").toLowerCase();
    const stockUnit =
      newItem.stockUnit ||
      (rawUnit.includes("opak")
        ? newItem.totalStockAmount
          ? "g"
          : "szt"
        : newItem.unit || "szt");
    const unit = stockUnit;
    const addedAmount = Number(newItem.totalStockAmount ?? newItem.amount) || 1;

    const itemToAdd = {
      id:
        newItem.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: newItem.name || "",
      amount: addedAmount,
      unit,
      category: newItem.category || DEFAULT_CATEGORY,
      expiryDate: newItem.expiryDate || null,
      expiresInDays: newItem.expiryDate
        ? this.daysUntil(newItem.expiryDate)
        : (newItem.expiresInDays ?? null),
      isLowStock: Boolean(newItem.isLowStock),
      isRecentlyAdded: true,
      addedAt: Date.now(),
      lowStockThreshold:
        newItem.lowStockThreshold ?? this.getDefaultLowStockThreshold(unit),
    };

    const existing = items.find(
      (item) =>
        item.name &&
        item.name.trim().toLowerCase() === itemToAdd.name.trim().toLowerCase() &&
        areUnitsCompatible(item.unit, itemToAdd.unit)
    );

    if (existing) {
      const convertedAmount = normalizeUnits(itemToAdd.amount, itemToAdd.unit, existing.unit);
      const newAmount = Math.round((existing.amount + convertedAmount) * 100) / 100;

      return items.map((item) => {
        if (item.id === existing.id) {
          return {
            ...item,
            amount: newAmount,
            isRecentlyAdded: true,
            addedAt: Date.now(),
            isLowStock: newAmount <= (item.lowStockThreshold ?? this.getDefaultLowStockThreshold(item.unit)),
          };
        }

        return item;
      });
    }

    return [...items, itemToAdd];
  }

  static update(items = [], id, updatedData = {}) {
    return items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedData,
        };
      }

      return item;
    });
  }

  static remove(items = [], id) {
    return items.filter((item) => item.id !== id);
  }

  static search(items = [], query = "") {
    return filterProducts(items, { query });
  }

  static filterByCategory(items = [], category = ALL_CATEGORIES_LABEL) {
    return filterProducts(items, { category });
  }

  static sort(items = [], sortBy = "name", order = "asc") {
    if (sortBy === "name" || sortBy === "amount" || sortBy === "expiry") {
      return sortProducts(items, `${sortBy}-${order}`);
    }
    return sortProducts(items, sortBy);
  }

  static groupByCategory(items = []) {
    return items.reduce((acc, item) => {
      const category = item.category || DEFAULT_CATEGORY;

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(item);

      return acc;
    }, {});
  }

  static hasEnough(items = [], ingredientName = "", requiredAmount = 0) {
    const match = calculateIngredientMatch(
      { name: ingredientName, amount: requiredAmount },
      items,
    );
    return match.missingAmount === 0;
  }

  static isInPantry(items = [], ingredientName = "", requiredAmount = 0) {
    if (requiredAmount > 0) {
      return this.hasEnough(items, ingredientName, requiredAmount);
    }
    return Boolean(this.findByName(items, ingredientName));
  }

  static isIngredientMissing(
    items = [],
    ingredientName = "",
    requiredAmount = 0,
  ) {
    return !this.isInPantry(items, ingredientName, requiredAmount);
  }

  static checkMissingIngredients(pantryItems = [], ingredients = []) {
    return (ingredients || []).filter((ing) => {
      return calculateIngredientMatch(ing, pantryItems).missingAmount > 0;
    });
  }

  static deductIngredients(items = [], ingredients = [], multiplier = 1) {
    let updated = [...items];

    for (const ing of ingredients || []) {
      const existing = this.findByName(updated, ing.name);

      if (existing) {
        let scaled = normalizeUnits(Number(ing.amount) * multiplier, ing.unit, existing.unit);

        const newAmount = Math.max(
          0,
          Math.round((existing.amount - scaled) * 100) / 100,
        );

        updated = this.update(updated, existing.id, {
          amount: newAmount,
          isLowStock:
            newAmount <=
            (existing.lowStockThreshold ??
              this.getDefaultLowStockThreshold(existing.unit)),
        });
      }
    }

    return updated;
  }

  static addIngredients(items = [], ingredients = [], multiplier = 1) {
    let updated = [...items];

    for (const ing of ingredients || []) {
      const existing = this.findByName(updated, ing.name);

      if (existing) {
        let scaled = normalizeUnits(Number(ing.amount) * multiplier, ing.unit, existing.unit);

        const newAmount = Math.round((existing.amount + scaled) * 100) / 100;

        updated = this.update(updated, existing.id, {
          amount: newAmount,
          isLowStock:
            newAmount <=
            (existing.lowStockThreshold ??
              this.getDefaultLowStockThreshold(existing.unit)),
        });
      }
    }

    return updated;
  }

  static isLow(item) {
    if (!item) return false;

    const unit = (item.unit || "szt").toLowerCase().trim();
    const threshold =
      item.lowStockThreshold ?? this.getDefaultLowStockThreshold(unit);

    const amount = Number(item.amount);

    if (!Number.isFinite(amount)) {
      return false;
    }

    return amount <= threshold;
  }

  static getExpiresInDays(item) {
    if (!item) return null;
    if (item.expiryDate) {
      return this.daysUntil(item.expiryDate);
    }
    return item.expiresInDays ?? null;
  }

  static isExpiring(item) {
    if (!item) return false;
    const days = PantryService.getExpiresInDays(item);
    return days !== null && days !== undefined && days <= 5;
  }
}