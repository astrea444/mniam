import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorageItem, setStorageItem } from '@/utils/storage'
import { INITIAL_USER_PROFILE } from '@/mocks/userMock'
import { useMealStore } from '@/stores/mealStore'

export const useUserStore = defineStore('user', () => {
  const initial = INITIAL_USER_PROFILE
  const saved = getStorageItem('userProfile', null)

  const profile = ref(saved ? { ...initial, ...saved, notifications: saved.notifications || initial.notifications || [] } : { ...initial })
  const isLoading = ref(false)
  const error = ref(null)

  const progressStats = computed(() => {
    const mealStore = useMealStore()
    const plannedDaysCount = Object.keys(mealStore.mealPlan || {}).filter(d => {
      const meals = mealStore.getDailyMeals(d)
      return meals.length > 0
    }).length
    const recipesCount = mealStore.recipes?.length || 0
    const favCount = mealStore.favorites?.length || 0

    return [
      {
        id: "planned-days",
        label: "dni w planie",
        value: plannedDaysCount,
      },
      {
        id: "favorites",
        label: "ulubione",
        value: favCount,
      },
      {
        id: "recipes",
        label: "przepisów",
        value: recipesCount,
      },
    ]
  })

  async function updateProfile(updatedData) {
    error.value = null
    try {
      profile.value = { ...profile.value, ...updatedData }
      setStorageItem('userProfile', profile.value)
    } catch (err) {
      error.value = err?.message || "Błąd aktualizacji profilu"
    }
  }

  async function addNotification(notification) {
    error.value = null
    try {
      if (!profile.value.notifications) {
        profile.value.notifications = []
      }
      const item = typeof notification === 'string' ? { id: Date.now(), text: notification, time: 'Przed chwilą' } : notification
      profile.value.notifications.unshift(item)
      setStorageItem('userProfile', profile.value)
    } catch (err) {
      error.value = err?.message || "Błąd dodawania powiadomienia"
    }
  }

  async function removeNotification(id) {
    error.value = null
    try {
      if (!profile.value.notifications) return
      profile.value.notifications = profile.value.notifications.filter((n, idx) => (n.id ?? idx) !== id)
      setStorageItem('userProfile', profile.value)
    } catch (err) {
      error.value = err?.message || "Błąd usuwania powiadomienia"
    }
  }

  async function reset() {
    error.value = null
    try {
      profile.value = { ...INITIAL_USER_PROFILE }
      setStorageItem('userProfile', profile.value)
    } catch (err) {
      error.value = err?.message || "Błąd resetowania profilu"
    }
  }

  return {
    profile,
    isLoading,
    error,
    progressStats,
    updateProfile,
    addNotification,
    removeNotification,
    reset
  }
})

