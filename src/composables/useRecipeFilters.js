import { ref, reactive, computed } from "vue";
import { filterRecipes, sortRecipes } from "@/utils/recipeFilters";

function defaultCriteria() {
  return {
    query: "",
    category: "Wszystkie",
    tags: [],
    tagsAll: [],
    diet: [],
    maxPrepTime: 120,
    maxCalories: null,
    minMatchRate: null,
    favoritesOnly: false,
  };
}

export function useRecipeFilters(recipesRef, opts = {}) {
  const criteria = reactive(defaultCriteria());
  const sortBy = ref(opts.sortBy ?? "title");
  const sortOrder = ref(opts.sortOrder ?? "asc");

  const context = computed(() => ({
    favorites: opts.favoritesRef?.value ?? [],
  }));

  const filteredRecipes = computed(() =>
    filterRecipes(recipesRef.value || [], criteria, context.value),
  );

  const recipes = computed(() =>
    sortRecipes(filteredRecipes.value, sortBy.value, sortOrder.value),
  );

  const activeFilterCount = computed(() => {
    let count = 0;
    if (criteria.query) count++;
    if (criteria.category && criteria.category !== "Wszystkie" && criteria.category !== "all") count++;
    count +=
      criteria.tags.length + criteria.tagsAll.length + criteria.diet.length;
    if (criteria.maxPrepTime < 120) count++;
    if (criteria.maxCalories != null) count++;
    if (criteria.minMatchRate != null) count++;
    if (criteria.favoritesOnly) count++;
    return count;
  });

  function toggleInList(key, value) {
    const list = criteria[key];
    const idx = list.indexOf(value);
    idx > -1 ? list.splice(idx, 1) : list.push(value);
  }

  const toggleTag = (tag) => toggleInList("tags", tag);
  const toggleDiet = (key) => toggleInList("diet", key);

  function reset() {
    Object.assign(criteria, defaultCriteria());
  }

  return {
    criteria,
    sortBy,
    sortOrder,
    recipes,
    filteredRecipes: recipes,
    items: recipes,
    activeFilterCount,
    toggleTag,
    toggleDiet,
    reset,
  };
}
