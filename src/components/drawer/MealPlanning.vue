<script setup>
import { ref, computed, watch } from 'vue'
import PlanDay from '@/components/drawer/PlanDay.vue'
import SelectRecipe from '@/components/drawer/SelectRecipe.vue'
import { useMealStore } from '@/stores/mealStore'
import { usePantryStore } from '@/stores/pantryStore'
import { useRecipeFilters } from '@/composables/useRecipeFilters'
import { formatDateLong, shiftDateByDays } from '@/utils/dateUtils'
import { MEAL_SLOTS } from '@/constants/mealSlots'
import { MealPlanService, getSlotLabel } from '@/services/mealService'
import { attachMatchRates } from '@/utils/matchRate'

const props = defineProps({
    date: {
        type: String,
        default: '',
    },
    initialSlot: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['close', 'save-plan'])

const mealStore = useMealStore()
const pantryStore = usePantryStore()

const BASE_SLOTS = MEAL_SLOTS.filter(s => s.key !== 'snack')

const slots = ref([...BASE_SLOTS])
const selectedMeals = ref({})
const activeSlot = ref(null)

const categories = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'breakfast', label: 'Śniadanie' },
    { key: 'lunch', label: 'Obiad' },
    { key: 'dinner', label: 'Kolacja' },
    { key: 'snack', label: 'Przekąska' },
]

const recipes = computed(() => attachMatchRates(mealStore.recipes, pantryStore.items))
const { criteria, recipes: filteredRecipes } = useRecipeFilters(recipes)

const hasAnyMealSelected = computed(() => slots.value.some(s => selectedMeals.value[s.key]))

function updateSlotLabels() {
    const total = slots.value.length
    slots.value.forEach((s, idx) => {
        s.label = getSlotLabel(idx, total)
    })
}

function removeSlot(key) {
    const idx = slots.value.findIndex(s => s.key === key)
    if (idx === -1) return
    slots.value.splice(idx, 1)
    delete selectedMeals.value[key]
    updateSlotLabels()
}

function handleReorderSlots({ fromIdx, targetIdx }) {
    const item = slots.value[fromIdx]
    slots.value.splice(fromIdx, 1)
    slots.value.splice(targetIdx, 0, item)
    updateSlotLabels()
}

const currentDate = ref(props.date)

const currentDateLabel = computed(() => {
    return formatDateLong(currentDate.value)
})

const activeSlotHeaderTitle = computed(() => {
    const found = slots.value.find(s => s.key === activeSlot.value)
    if (!found) return 'Dodaj posiłek'
    return `Dodaj ${found.label.toLowerCase()}`
})

const matchedRecipe = computed(() => {
    const found = slots.value.find(s => s.key === activeSlot.value)
    return MealPlanService.matchRecipeForSlot(recipes.value, activeSlot.value, found?.label)
})

const displayedRecipes = computed(() => {
    if (criteria.query && criteria.query.trim()) {
        return filteredRecipes.value;
    }
    if (!matchedRecipe.value) return filteredRecipes.value;
    return filteredRecipes.value.filter(r => r.id !== matchedRecipe.value.id);
})

function loadDayPlan(d) {
    const dayPlan = mealStore.mealPlan[d] || {}
    const { slots: loadedSlots, selectedMeals: loadedMeals } = MealPlanService.getSlotsForDay(dayPlan, mealStore.recipeMap)
    slots.value = loadedSlots
    selectedMeals.value = loadedMeals
}

watch(
    () => [props.date, props.initialSlot],
    ([newDate, slot]) => {
        if (newDate) {
            currentDate.value = newDate
            activeSlot.value = typeof slot === 'string' ? slot : null
            loadDayPlan(newDate)
        }
    },
    { immediate: true }
)

function prevDay() {
    currentDate.value = shiftDateByDays(currentDate.value, -1)
    loadDayPlan(currentDate.value)
}

function nextDay() {
    currentDate.value = shiftDateByDays(currentDate.value, 1)
    loadDayPlan(currentDate.value)
}

function resetSelectionFilters() {
    criteria.query = ''
    criteria.category = 'all'
}

function openRecipeSelection(slotKey) {
    resetSelectionFilters()
    activeSlot.value = slotKey
}

function backToBoxes() {
    activeSlot.value = null
}

function selectRecipeForSlot(recipeItem) {
    if (activeSlot.value) {
        selectedMeals.value[activeSlot.value] = recipeItem
        activeSlot.value = null
    }
}

function addCustom() {
    const idx = slots.value.filter(s => s.key.startsWith('extra-')).length + 1
    const key = `extra-${idx}`
    slots.value.push({ key, label: '' })
    updateSlotLabels()
    selectedMeals.value[key] = null
    openRecipeSelection(key)
}

function savePlan() {
    const existingDayPlan = mealStore.mealPlan[currentDate.value] || {}
    const planData = { snack: existingDayPlan.snack || null }
    const slotOrder = []
    slots.value.forEach(s => {
        planData[s.key] = selectedMeals.value[s.key]?.id || null
        slotOrder.push(s.key)
    })
    planData._slotOrder = slotOrder
    emit('save-plan', { planData, date: currentDate.value })
    emit('close')
}
</script>

<template>
    <PlanDay v-if="!activeSlot" :slots="slots" :selected-meals="selectedMeals" :current-date-label="currentDateLabel"
        :has-any-meal-selected="hasAnyMealSelected" @prev-day="prevDay" @next-day="nextDay"
        @open-recipe-selection="openRecipeSelection" @remove-slot="removeSlot" @add-custom="addCustom"
        @reorder-slots="handleReorderSlots" @save-plan="savePlan" @close="$emit('close')" />

    <SelectRecipe v-else :active-slot-header-title="activeSlotHeaderTitle" :matched-recipe="matchedRecipe"
        :displayed-recipes="displayedRecipes" :categories="categories" v-model:search-query="criteria.query"
        v-model:selected-category="criteria.category" @back="backToBoxes" @select-recipe="selectRecipeForSlot" />
</template>