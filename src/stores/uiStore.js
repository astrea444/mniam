import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const loadingCount = ref(0)

  function startLoading() {
    loadingCount.value++
    isLoading.value = true
  }

  function stopLoading() {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
    if (loadingCount.value === 0) {
      isLoading.value = false
    }
  }

  function setLoading(val) {
    isLoading.value = Boolean(val)
    loadingCount.value = val ? 1 : 0
  }

  function reset() {
    isLoading.value = false
    loadingCount.value = 0
  }

  return {
    isLoading,
    loadingCount,
    startLoading,
    stopLoading,
    setLoading,
    reset,
  }
})
