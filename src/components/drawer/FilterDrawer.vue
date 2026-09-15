<script setup>
import { ref, watch } from 'vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSlider from '@/components/common/BaseSlider.vue'
import { DIET_CATEGORIES } from '@/utils/recipeFilters'
import { getCategoryLabel } from '@/constants/productOptions'
import { Funnel } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'recipes' },
  categories: { type: Array, default: () => [] },
  diet: { type: Array, default: () => [] },
  maxPrepTime: { type: Number, default: 120 },
  minMatchRate: { type: Number, default: null },
  favoritesOnly: { type: Boolean, default: false },
  category: { type: String, default: null },
  sortBy: { type: String, default: 'name-asc' },
  lowStockOnly: { type: Boolean, default: false },
  expiringOnly: { type: Boolean, default: false },
  hideChecked: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'update:diet',
  'update:maxPrepTime',
  'update:minMatchRate',
  'update:favoritesOnly',
  'update:category',
  'update:sortBy',
  'update:lowStockOnly',
  'update:expiringOnly',
  'update:hideChecked',
])

const model = ref(props.modelValue)
watch(() => props.modelValue, v => model.value = v)
watch(model, v => emit('update:modelValue', v))

const dietCategories = DIET_CATEGORIES

const localDiet = ref(props.diet ? [...props.diet] : [])
const localMaxPrepTime = ref(props.maxPrepTime ?? 120)
const localMinMatchRate = ref(props.minMatchRate ?? 0)
const localFavoritesOnly = ref(props.favoritesOnly ?? false)
const localCategory = ref(props.category ?? null)
const localSortBy = ref(props.sortBy ?? 'name-asc')
const localLowStockOnly = ref(props.lowStockOnly ?? false)
const localExpiringOnly = ref(props.expiringOnly ?? false)
const localHideChecked = ref(props.hideChecked ?? false)

watch(() => props.modelValue, (open) => {
  if (open) {
    localDiet.value = props.diet ? [...props.diet] : []
    localMaxPrepTime.value = props.maxPrepTime ?? 120
    localMinMatchRate.value = props.minMatchRate ?? 0
    localFavoritesOnly.value = props.favoritesOnly ?? false
    localCategory.value = props.category ?? null
    localSortBy.value = props.sortBy ?? 'name-asc'
    localLowStockOnly.value = props.lowStockOnly ?? false
    localExpiringOnly.value = props.expiringOnly ?? false
    localHideChecked.value = props.hideChecked ?? false
  }
})

function toggleDiet(key) {
  const idx = localDiet.value.indexOf(key)
  idx > -1 ? localDiet.value.splice(idx, 1) : localDiet.value.push(key)
}

function apply() {
  emit('update:diet', [...localDiet.value])
  emit('update:maxPrepTime', localMaxPrepTime.value)
  emit('update:minMatchRate', localMinMatchRate.value === 0 ? null : localMinMatchRate.value)
  emit('update:favoritesOnly', localFavoritesOnly.value)
  emit('update:category', localCategory.value)
  emit('update:sortBy', localSortBy.value)
  emit('update:lowStockOnly', localLowStockOnly.value)
  emit('update:expiringOnly', localExpiringOnly.value)
  emit('update:hideChecked', localHideChecked.value)
  model.value = false
}

function reset() {
  localDiet.value = []
  localMaxPrepTime.value = 120
  localMinMatchRate.value = 0
  localFavoritesOnly.value = false
  localCategory.value = null
  localSortBy.value = 'name-asc'
  localLowStockOnly.value = false
  localExpiringOnly.value = false
  localHideChecked.value = false
  apply()
}

const sortOptions = [
  { label: 'A-Z', value: 'name-asc' },
  { label: 'Z-A', value: 'name-desc' },
  { label: 'Rosnąco', value: 'amount-asc' },
  { label: 'Malejąco', value: 'amount-desc' },
  { label: 'Data ważności', value: 'expiry' },
]
</script>


<template>
  <BaseDrawer v-model="model" title="Filtry" :icon="Funnel" data-testid="filter-base-drawer">
    <div class="filter-drawer" data-testid="filter-drawer-content">
      <div class="sections">
        <template v-if="mode === 'recipes'">
          <div class="section">
            <span class="label">Dieta</span>
            <div class="chips">
              <BaseButton v-for="d in dietCategories" :key="d.key" size="md"
                :variant="localDiet.includes(d.key) ? 'green' : 'default'" @click="toggleDiet(d.key)"
                data-testid="filter-diet-chip">{{ d.label }}
              </BaseButton>
            </div>
          </div>

          <div class="section">
            <span class="label">Czas przygotowania: do <strong>{{ localMaxPrepTime }}min</strong> </span>
            <BaseSlider v-model="localMaxPrepTime" :min="5" :max="120" :step="5" />
          </div>

          <div class="section">
            <span class="label">Min. dopasowanie składników: <strong> {{ localMinMatchRate }}%</strong></span>
            <BaseSlider v-model="localMinMatchRate" :min="0" :max="100" :step="10" />
          </div>

          <div class="section">
            <BaseCheckbox v-model="localFavoritesOnly" size="lg" label="Tylko ulubione przepisy" />
          </div>
        </template>

        <template v-if="mode === 'pantry' || mode === 'shopping'">
          <div class="section" data-testid="filter-categories-section">
            <span class="label">Kategoria</span>
            <div class="chips">
              <BaseButton size="md" :variant="localCategory === null ? 'green' : 'default'"
                @click="localCategory = null" data-testid="filter-category-all">Wszystkie</BaseButton>
              <BaseButton v-for="cat in categories" :key="cat" size="md"
                :variant="localCategory === cat ? 'green' : 'default'"
                @click="localCategory = localCategory === cat ? null : cat" data-testid="filter-category-chip">{{
                  getCategoryLabel(cat) }}</BaseButton>
            </div>
          </div>

          <div v-if="mode === 'pantry'" class="section" data-testid="filter-sort-section">
            <span class="label">Sortowanie</span>
            <div class="chips">
              <BaseButton v-for="opt in sortOptions" :key="opt.value" size="md"
                :variant="localSortBy === opt.value ? 'green' : 'default'" @click="localSortBy = opt.value"
                data-testid="filter-sort-chip">{{ opt.label
                }}</BaseButton>
            </div>
          </div>

          <div v-if="mode === 'pantry'" class="section" data-testid="filter-checkboxes-section">
            <BaseCheckbox v-model="localLowStockOnly" size="lg" label="Tylko kończące się zapasy"
              data-testid="filter-low-stock-checkbox" />
            <BaseCheckbox v-model="localExpiringOnly" size="lg" label="Tylko bliskie daty ważności"
              data-testid="filter-expiring-checkbox" />
          </div>
          <div v-if="mode === 'shopping'" class="section" data-testid="filter-shopping-checkbox-section">
            <BaseCheckbox v-model="localHideChecked" size="lg" label="Ukryj kupione produkty"
              data-testid="filter-hide-checked-checkbox" />
          </div>
        </template>
      </div>

      <div class="footer">
        <BaseButton variant="default" size="md" @click="reset" data-testid="filter-reset-btn">Resetuj</BaseButton>
        <BaseButton variant="green" size="md" @click="apply" data-testid="filter-apply-btn">Zastosuj</BaseButton>
      </div>
    </div>
  </BaseDrawer>
</template>

<style lang="scss" scoped>
.filter-drawer {
  display: flex;
  flex-direction: column;
  gap: $s-6;
  padding: $s-2 $s-2;
  max-height: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: $s-12;
}

.section {
  display: flex;
  flex-direction: column;
  gap: $s-3;
  padding: $s-2 $s-3;

  .label {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: $fs-lg;
    font-weight: 500;
    width: 100%;
    color: $text-muted;

    strong {
      font-weight: inherit;
      color: $text;
    }
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: $s-3;
  }

}

.footer {
  display: flex;
  flex-direction: row;
  gap: $s-3;
  height: fit-content;
  flex-shrink: 0;
  margin-top: auto;

  button {
    height: fit-content;
    flex: 1;
  }
}
</style>
