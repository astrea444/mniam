<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpen, Star, Sparkles, Recycle, AlarmClock, Zap, Cookie } from 'lucide-vue-next'
import RecipeFilter from '@/components/recipes/RecipeFilter.vue'
import RecipeCard from '@/components/recipes/RecipeCard.vue'
import RecipeSection from '@/components/recipes/RecipeSection.vue'
import MealDetails from '@/components/drawer/MealDetails.vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import FilterDrawer from '@/components/drawer/FilterDrawer.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ViewHeader from '@/components/layout/ViewHeader.vue'
import { useMealStore } from '@/stores/mealStore'
import { usePantryStore } from '@/stores/pantryStore'
import { useRecipeFilters } from '@/composables/useRecipeFilters'
import { groupRecipesIntoSections } from '@/utils/recipeFilters'
import { attachMatchRates } from '@/utils/matchRate'

const mealStore = useMealStore()
const pantryStore = usePantryStore()

onMounted(() => {
  mealStore.fetchMeals()
})

const showFilterDrawer = ref(false)

const recipesRef = computed(() => attachMatchRates(mealStore.recipes, pantryStore.items))
const favoritesRef = computed(() => mealStore.favorites)
const { criteria, recipes: filteredRecipes, activeFilterCount } = useRecipeFilters(recipesRef, { favoritesRef })
const hasSearchQuery = computed(() => Boolean(criteria.query && criteria.query.trim()))

const favoriteRecipes = computed(() =>
  recipesRef.value.filter(r => mealStore.isFavorite(r.id))
)

const sections = computed(() => groupRecipesIntoSections(filteredRecipes.value, pantryStore.items))

const activeMeal = ref(null)
const isMealOpen = ref(false)
function openDrawer(meal) {
  if (meal) {
    activeMeal.value = meal
    isMealOpen.value = true
  }
}
</script>

<template>
  <div class="recipes-view">
    <ViewHeader title="Odkrywaj przepisy." subtitle="Co dziś gotujemy?" />

    <div class="content">
      <section class="search-section">
        <RecipeFilter :search-query="criteria.query" :selected-filters="criteria.tags"
          :favorites-only="criteria.favoritesOnly" :has-active-filters="activeFilterCount > 0"
          @update:search-query="criteria.query = $event" @update:selected-filters="criteria.tags = $event"
          @update:favorites-only="criteria.favoritesOnly = $event" @open-filters="showFilterDrawer = true" />
      </section>

      <SkeletonLoader v-if="mealStore.isLoading" type="card" :count="3" class="skeleton" />

      <template v-else-if="hasSearchQuery">
        <section v-if="filteredRecipes.length" class="more-section">
          <h2 class="section-title">Wyniki wyszukiwania:</h2>
          <div class="recipes-list">
            <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.id" variant="list" :recipe="recipe"
              @click="openDrawer(recipe)" />
          </div>
        </section>
      </template>

      <template v-else-if="criteria.favoritesOnly">
        <section v-if="filteredRecipes.length" class="more-section">
          <h2 class="section-title">Ulubione przepisy</h2>
          <div class="recipes-list">
            <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.id" variant="normal" :recipe="recipe"
              @click="openDrawer(recipe)" />
          </div>
        </section>
      </template>

      <template v-else>
        <RecipeSection v-if="favoriteRecipes.length" title="Ulubione" :icon="Star" :recipes="favoriteRecipes"
          variant="normal" @select="openDrawer" />

        <RecipeSection v-if="sections.matched.length" title="Idealne dopasowanie" :icon="Sparkles"
          :recipes="sections.matched" variant="xl" @select="openDrawer" />

        <RecipeSection v-if="sections.zeroWaste.length" title="Zero-Waste: Wykorzystaj zapasy" :icon="Recycle"
          :recipes="sections.zeroWaste" variant="normal" @select="openDrawer" />

        <RecipeSection v-if="sections.expiring.length" title="Zużyj zanim się zepsuje" :icon="AlarmClock"
          :recipes="sections.expiring" variant="normal" @select="openDrawer" />

        <RecipeSection v-if="sections.quick.length" title="Szybkie i proste" :icon="Zap" :recipes="sections.quick"
          variant="normal" @select="openDrawer" />

        <RecipeSection v-if="sections.smallBites.length" title="Małe co nieco" :icon="Cookie"
          :recipes="sections.smallBites" variant="normal" @select="openDrawer" />

        <section v-if="filteredRecipes.length" class="more-section">
          <h2 class="section-title">Wszystkie przepisy</h2>
          <div class="recipes-list">
            <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.id" variant="list" :recipe="recipe"
              @click="openDrawer(recipe)" />
          </div>
        </section>
      </template>

      <EmptyState v-if="filteredRecipes.length === 0" :icon="BookOpen" title="Brak przepisów"
        :description="criteria.favoritesOnly ? 'Nie masz jeszcze ulubionych przepisów spełniających podane kryteria.' : 'Nie znaleźliśmy przepisów spełniających wybrane kryteria.'" />
    </div>

    <BaseDrawer v-model="isMealOpen" :component="MealDetails" :component-props="{ meal: activeMeal }" height="xl" />

    <FilterDrawer v-model="showFilterDrawer" mode="recipes" v-model:diet="criteria.diet"
      v-model:max-prep-time="criteria.maxPrepTime" v-model:min-match-rate="criteria.minMatchRate"
      v-model:favorites-only="criteria.favoritesOnly" />
  </div>
</template>

<style lang="scss" scoped>
.recipes-view {
  display: flex;
  flex-direction: column;
  gap: $s-6;
}

.skeleton {
  margin-top: $s-8;

  :deep(.skeleton-item) {
    margin-top: $s-3;
    height: 12rem;
  }
}

.search-section {
  padding: 0;
}

.more-section {
  display: flex;
  flex-direction: column;
  gap: $s-3;
  padding: $s-6 $s-2;

  .section-title {
    font-size: calc($fs-lg * 1.08);
    font-weight: 600;
    color: $text;
    margin: 0 0 $s-2;
  }
}

.recipes-list {
  display: flex;
  flex-direction: column;
  gap: $s-3;
  width: 100%;
}
</style>