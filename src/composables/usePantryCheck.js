import { computed, toValue } from 'vue'
import { usePantryStore } from '../stores/pantryStore'
import { PantryService } from '../services/pantryService'
import { DEFAULT_CATEGORY } from '../constants/productOptions'

export function usePantryCheck(ingredientsRef) {
  const pantryStore = usePantryStore()

  const ingredientsList = computed(() => {
    const raw = typeof ingredientsRef === 'function' ? ingredientsRef() : toValue(ingredientsRef)
    return Array.isArray(raw) ? raw : []
  })

  const missingIngredients = computed(() => {
    return pantryStore.checkMissingIngredients(ingredientsList.value)
  })

  const hasAllIngredients = computed(() => missingIngredients.value.length === 0)

  const isInPantry = (name = '', amount = 0) => {
    return PantryService.isInPantry(pantryStore.items, name, amount)
  }

  const isMissing = (name = '', amount = 0) => {
    return PantryService.isIngredientMissing(pantryStore.items, name, amount)
  }

  const hasIngredient = (name) => isInPantry(name)

  function addIngredientToPantry(ingredient) {
    if (!ingredient || !ingredient.name) return
    pantryStore.addItem({
      name: ingredient.name,
      amount: Number(ingredient.amount) || 1,
      unit: ingredient.unit || 'szt',
      category: ingredient.category || DEFAULT_CATEGORY
    })
  }

  function removeIngredientFromPantry(ingredientName) {
    if (!ingredientName) return
    const found = pantryStore.findByName(ingredientName)
    if (found) {
      pantryStore.removeItem(found.id)
    }
  }

  return {
    missingIngredients,
    hasAllIngredients,
    isInPantry,
    isMissing,
    hasIngredient,
    addIngredientToPantry,
    removeIngredientFromPantry
  }
}
