<script setup>
import { ref } from 'vue'
import { Search, Funnel, CornerDownLeft, BookOpen } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RecipeCard from '@/components/recipes/RecipeCard.vue'

const props = defineProps({
    activeSlotHeaderTitle: { type: String, required: true },
    matchedRecipe: { type: Object, default: null },
    displayedRecipes: { type: Array, required: true },
    categories: { type: Array, required: true },
    searchQuery: { type: String, default: '' },
    selectedCategory: { type: String, default: 'Wszystkie' }
})

defineEmits(['back', 'select-recipe', 'update:searchQuery', 'update:selectedCategory'])

const isFilterOpen = ref(false)
</script>

<template>
    <div class="selection-view" data-testid="recipe-selection">
        <div class="plan-header selection-header">
            <h2 data-testid="recipe-selection-title">{{ activeSlotHeaderTitle }}</h2>
            <BaseButton iconOnly :icon="CornerDownLeft" variant="default" size="sm"
                data-testid="recipe-selection-back-btn" @click="$emit('back')" aria-label="Wróć" />
        </div>

        <div v-if="matchedRecipe" class="matched-section" data-testid="recipe-selection-matched">
            <h3 class="section-title">Dopasowane do Twojej lodówki</h3>
            <RecipeCard variant="xl" :recipe="matchedRecipe" show-add-button data-testid="recipe-selection-matched-card"
                @click="$emit('select-recipe', matchedRecipe)" />
        </div>

        <div class="more-section">
            <h3 class="section-title">Więcej propozycji</h3>

            <div class="search-row">
                <BaseInput :model-value="searchQuery" @update:model-value="$emit('update:searchQuery', $event)"
                    size="md" :icon="Search" placeholder="Szukaj przepisu..." data-testid="recipe-search-input" />
                <BaseButton iconOnly :icon="Funnel" variant="default" size="md" :class="{ active: isFilterOpen }"
                    data-testid="recipe-filter-toggle-btn" @click="isFilterOpen = !isFilterOpen" aria-label="Filtruj" />
            </div>

            <Transition name="fade-slide">
                <div v-if="isFilterOpen" class="category-filters" data-testid="recipe-category-filters">
                    <BaseButton v-for="cat in categories" :key="typeof cat === 'object' ? cat.key : cat"
                        :variant="selectedCategory === (typeof cat === 'object' ? cat.key : cat) ? 'green' : 'default'" size="md"
                        :data-testid="'recipe-category-btn-' + (typeof cat === 'object' ? cat.key : cat)"
                        @click="$emit('update:selectedCategory', selectedCategory === (typeof cat === 'object' ? cat.key : cat) ? 'all' : (typeof cat === 'object' ? cat.key : cat))">
                        {{ typeof cat === 'object' ? cat.label : cat }}
                    </BaseButton>
                </div>
            </Transition>

            <div class="recipes-list" data-testid="recipe-results-list">
                <RecipeCard v-for="recipeItem in displayedRecipes" :key="recipeItem.id" variant="list"
                    :recipe="recipeItem" show-add-button :data-testid="'recipe-card-' + recipeItem.id"
                    @click="$emit('select-recipe', recipeItem)" />
                <EmptyState v-if="displayedRecipes.length === 0" :icon="BookOpen" title="Brak przepisów"
                    description="Nie znaleziono przepisów spełniających podane kryteria."
                    data-testid="recipe-results-empty" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.selection-view {
    padding: $s-4 $s-1 $s-1;
    display: flex;
    flex-direction: column;
    gap: $s-6;
    min-height: 50rem;
    height: 100%;

    .plan-header {
        display: flex;
        align-items: center;
        gap: $s-3;
        padding: 0 $s-2;

        h2 {
            font-size: $fs-2xl;
            font-weight: 600;
            color: $text;
            margin: 0;
        }

        &.selection-header {
            justify-content: space-between;
        }
    }

    .section-title {
        font-size: calc($fs-lg * 1.08);
        font-weight: 600;
        color: $text;
        margin: 0 0 $s-2;
    }
}

.matched-section {
    display: flex;
    flex-direction: column;
    margin-top: $s-6;
    gap: $s-3;
    padding: 0 $s-2;
}

.more-section {
    display: flex;
    flex-direction: column;
    gap: $s-3;
    padding: 0 $s-2;
    margin-top: $s-6;
}

.search-row {
    display: flex;
    align-items: center;
    gap: $s-2;
}

.category-filters {
    display: flex;
    gap: $s-2;
    overflow-x: auto;
    padding: $s-1 0;
}

.recipes-list {
    display: flex;
    flex-direction: column;
    gap: $s-3;
    width: 100%;
    padding: 0 0 $s-12;
}
</style>
