<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { Search, Funnel } from 'lucide-vue-next'
import { PhStar } from '@phosphor-icons/vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  selectedFilters: { type: Array, default: () => [] },
  favoritesOnly: { type: Boolean, default: false },
  hasActiveFilters: { type: Boolean, default: false },
})

const emit = defineEmits(['update:searchQuery', 'update:selectedFilters', 'update:favoritesOnly', 'open-filters'])
</script>

<template>
  <div class="recipe-filter">
    <div class="search-row">
      <BaseInput :model-value="searchQuery" :icon="Search" placeholder="Szukaj przepisu..." class="search-input"
        data-testid="search-input" @update:model-value="$emit('update:searchQuery', $event)" />
      <BaseButton iconOnly :icon="Funnel" aria-label="Filtry" @click="$emit('open-filters')">
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recipe-filter {
  display: flex;
  flex-direction: column;
  gap: $s-3;
}

.search-row {
  display: flex;
  align-items: center;
  gap: $s-2;
}

.search-input {
  flex: 1;
}
</style>