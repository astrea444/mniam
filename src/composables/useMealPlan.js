import { computed } from 'vue'
import { useMealStore } from '../stores/mealStore'

export function useMealPlan(dateRef) {
  const mealStore = useMealStore()

  const dateStr = computed(() => {
    return typeof dateRef === 'string' ? dateRef : (dateRef?.value ?? dateRef)
  })

  const dailyMeals = computed(() => {
    return mealStore.getDailyMeals(dateStr.value)
  })

  const dailyNutrition = computed(() => {
    return mealStore.calculateDailyNutrition(dateStr.value)
  })

  return {
    dailyMeals,
    dailyNutrition
  }
}
