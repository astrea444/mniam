<script setup>
import { computed, ref, onMounted } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import FilterDrawer from '@/components/drawer/FilterDrawer.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import TipCard from '@/components/common/TipCard.vue'
import AddShopping from '@/components/drawer/AddShopping.vue'
import ShoppingSummary from '@/components/drawer/ShoppingSummary.vue'
import ViewHeader from '@/components/layout/ViewHeader.vue'

import { useShoppingStore } from '@/stores/shoppingStore'
import { useMealStore } from '@/stores/mealStore'
import { usePantryStore } from '@/stores/pantryStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import { useDate } from '@/composables/useDate'
import { ShoppingListService } from '@/services/shoppingService'
import { filterProducts } from '@/utils/productFilters'
import { getCategoryIcon, getCategoryLabel, CATEGORY_IDS } from '@/constants/productOptions'
import { formatAmount } from '@/utils/formatters'

import {
  Search,
  Funnel,
  ShoppingBasket,
  Trash2,
  ChevronDown,
  CheckCheck,
  ShoppingCart,
  WandSparkles,
  ClipboardPen,
} from 'lucide-vue-next'

const shoppingStore = useShoppingStore()
const mealStore = useMealStore()
const pantryStore = usePantryStore()
const toast = useToast()
const { weekDays } = useDate()

onMounted(() => {
  shoppingStore.fetchItems()
})

const search = ref('')
const selectedCategory = ref(null)
const hideChecked = ref(false)
const showFilterDrawer = ref(false)
const isGenerating = ref(false)
const showCompleted = ref(true)

const allCategoryNames = computed(() => CATEGORY_IDS)

const hasActiveFilters = computed(() => {
  return selectedCategory.value !== null || hideChecked.value
})

const filteredItems = computed(() => {
  let list = filterProducts(shoppingStore.items, {
    query: search.value,
    category: selectedCategory.value,
  })
  if (hideChecked.value) {
    list = list.filter(item => !item.checked)
  }
  return list
})

const uncheckedItems = computed(() => filteredItems.value.filter(i => !i.checked))
const checkedItems = computed(() => filteredItems.value.filter(i => i.checked))

const categoryOrder = computed(() => {
  const order = []
  const seen = new Set()
  shoppingStore.items.forEach(item => {
    const category = item.category || 'other'
    if (!seen.has(category)) {
      seen.add(category)
      order.push(category)
    }
  })
  return order
})

const groupedItems = computed(() => {
  const grouped = ShoppingListService.groupByCategory(uncheckedItems.value)
  const ordered = {}

  categoryOrder.value.forEach(cat => {
    if (grouped[cat]) ordered[cat] = grouped[cat]
  })

  return ordered
})

const hasCheckedItems = computed(() => checkedItems.value.length > 0)
const hasItems = computed(() => filteredItems.value.length > 0)

function resolveIcon(category) {
  return getCategoryIcon(category)
}

const isDrawerOpen = ref(false)
const drawerCategory = ref('other')
const isSummaryOpen = ref(false)

function openAddDrawer(category) {
  drawerCategory.value = category
  isDrawerOpen.value = true
}

function openSummaryModal() {
  isSummaryOpen.value = true
}

async function generateFromPlan() {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const dates = weekDays.value.map(d => d.date)
    const hasPlannedMeals = dates.some(date => {
      const meals = mealStore.getDailyMeals(date)
      return meals && meals.length > 0
    })

    if (!hasPlannedMeals) {
      toast.error('Lista zakupów', 'Nie można wygenerować listy – plan posiłków jest pusty.')
      return
    }

    const result = await shoppingStore.generateFromMealPlan(
      mealStore.mealPlan,
      dates,
      mealStore.recipeMap,
      pantryStore.items
    )
    if (!result || result.addedCount === 0) {
      toast.info('Lista zakupów', TOAST.SHOPPING.EMPTY_PLAN)
    } else {
      toast.success('Lista zakupów', TOAST.SHOPPING.GENERATED(result.addedCount))
    }
  } finally {
    isGenerating.value = false
  }
}

function clearCompleted() {
  const previousCompleted = [...checkedItems.value]
  shoppingStore.clearCompleted()
  toast.add({
    title: 'Lista zakupów',
    message: TOAST.SHOPPING.CLEARED,
    type: 'info',
    onUndo: () => {
      previousCompleted.forEach(item => {
        shoppingStore.addItem(item)
      })
    }
  })
}
</script>

<template>
  <div class="shopping-view" data-testid="shopping-view">
    <ViewHeader title="Zakupy zaczynają się tutaj."
      subtitle="Wszystko czego potrzebujesz na posiłki z tego tygodnia." />

    <div class="page-content">
      <section>
        <div class="search-row">
          <BaseInput v-model="search" :icon="Search" placeholder="Szukaj produktu..." class="search-input"
            data-testid="search-input" />

          <BaseButton iconOnly :icon="Funnel" :variant="hasActiveFilters ? 'green' : 'default'" aria-label="Filtruj"
            @click="showFilterDrawer = true" data-testid="filter-button">
          </BaseButton>
        </div>
      </section>

      <section class="list-section" data-testid="shopping-list-section">
        <SkeletonLoader v-if="shoppingStore.isLoading" type="list" :count="4" />
        <template v-else-if="hasItems">
          <TransitionGroup name="category-fade" tag="div" class="categories" data-testid="shopping-categories">
            <div v-for="(categoryItems, categoryName) in groupedItems" :key="categoryName" class="category"
              data-testid="shopping-category">
              <div class="category-header">
                <div class="category-title-group">
                  <component :is="resolveIcon(categoryName)" :size="18" class="category-icon" />
                  <span class="category-title">
                    {{ getCategoryLabel(categoryName) }}
                  </span>
                </div>

                <div class="count-badge">
                  {{ categoryItems.length }}
                </div>
              </div>

              <TransitionGroup name="item-fade" tag="div" class="items" data-testid="shopping-list">
                <div v-for="item in categoryItems" :key="item.id" class="item" data-testid="shopping-item">
                  <BaseCheckbox :model-value="item.checked" strikethrough
                    @update:modelValue="shoppingStore.toggleItem(item.id)" data-testid="shopping-item-checkbox">
                    <span data-testid="shopping-item-name">{{ item.name }}</span>
                  </BaseCheckbox>

                  <div class="item-right-group">
                    <span class="item-qty" data-testid="shopping-item-qty">
                      {{ formatAmount(item.amount, item.unit) }}
                    </span>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </TransitionGroup>

          <section v-if="hasCheckedItems" class="completed-section" data-testid="completed-section">
            <div class="completed-header" @click="showCompleted = !showCompleted" data-testid="completed-header">
              <span class="completed-title">
                <ChevronDown :size="18" class="chevron" :class="{ collapsed: !showCompleted }" />
                Kupione:
                <!-- <div class="count-badge" data-testid="completed-count">{{ checkedItems.length }}</div> -->
              </span>
              <div class="completed-actions">
                <BaseButton variant="green" size="sm"  @click="openSummaryModal"
                  data-testid="finish-shopping-btn">
                  Dodaj do spiżarni
                </BaseButton>
                <BaseButton variant="default" iconOnly class="clear-all" size="sm" :icon="Trash2"
                  aria-label="Wyczyść kupione" @click="clearCompleted" data-testid="clear-completed-btn">
                </BaseButton>
              </div>
            </div>


            <div class="completed-collapse-wrapper" :class="{ expanded: showCompleted }">
              <div class="completed-collapse-inner">
                <TransitionGroup name="item-fade" tag="div" class="completed-collapse" data-testid="completed-list">
                  <div v-for="item in checkedItems" :key="item.id" class="item" data-testid="completed-item">
                    <BaseCheckbox :model-value="item.checked" strikethrough
                      @update:modelValue="shoppingStore.toggleItem(item.id)" data-testid="completed-item-checkbox">
                      <span data-testid="completed-item-name">{{ item.name }}</span>
                    </BaseCheckbox>

                    <div class="item-right-group">
                      <span class="item-qty" data-testid="completed-item-qty">
                        {{ formatAmount(item.amount, item.unit) }}
                      </span>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </section>
        </template>

        <EmptyState class="empty" v-else :icon="ShoppingCart" title="Lista zakupów jest pusta"
          description="Dodaj produkty ręcznie lub wygeneruj je z planu posiłków." data-testid="empty-state" />
        <div class="add-row">
          <BaseButton size="lg" class="long-btn" @click="openAddDrawer('other')" data-testid="add-product-btn">
            Dodaj do listy
          </BaseButton>
          <BaseButton variant="green" :icon="WandSparkles" class="long-btn" size="lg" :disabled="isGenerating"
            @click="generateFromPlan" data-testid="generate-plan-btn">
            Generuj z planu
          </BaseButton>
        </div>
      </section>

      <section>
        <TipCard title="Czy wiesz że...?" text="Kupowanie sezonowych produktów często pozwala zaoszczędzić."
          :icon="ShoppingBasket" rotate />
      </section>
    </div>

    <BaseDrawer v-model="isDrawerOpen" title="Dodaj produkt" :component="AddShopping"
      :component-props="{ initialCategory: drawerCategory }" height="fit" :icon="ShoppingCart"
      data-testid="add-shopping-drawer" />

    <BaseDrawer v-model="isSummaryOpen" title="Podsumowanie zakupów" :component="ShoppingSummary"
      :component-props="{ items: checkedItems.length ? checkedItems : shoppingStore.items }"
      @completed="isSummaryOpen = false" height="md" :icon="ShoppingCart" data-testid="shopping-summary-drawer" />

    <FilterDrawer v-model="showFilterDrawer" mode="shopping" :categories="allCategoryNames"
      v-model:category="selectedCategory" v-model:hide-checked="hideChecked" data-testid="filter-drawer" />
  </div>
</template>

<style lang="scss" scoped>
.shopping-view {
  display: flex;
  flex-direction: column;
  gap: $s-8;
  height: 100%;

  .page-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: $s-10;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: $s-3;

    .search-input {
      flex: 1;
    }
  }

  .empty {
    padding: $s-10 $s-4 0;
    text-align: center;
    font-size: $fs-sm;
    height: 100%;
    color: $text-muted;
  }

  .categories {
    display: flex;
    flex-direction: column;
    gap: $s-10;
    position: relative;

    .category {
      display: flex;
      flex-direction: column;
      gap: $s-4;

      .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .category-title-group {
          display: flex;
          align-items: center;
          height: $s-6;
          gap: $s-2;

          .category-icon {
            color: $primary700;
            height: 100%;
            width: auto;
            aspect-ratio: 1/1;
          }

          .category-title {
            font-size: $fs-base;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: $text;
          }
        }
      }

      .items {
        display: flex;
        flex-direction: column;
        gap: $s-2;
        position: relative;
      }
    }
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-3;

    .item-right-group {
      display: flex;
      align-items: center;
      gap: $s-2;
    }

    .item-qty {
      font-size: $fs-sm;
      font-weight: 500;
      color: $text-muted;
      white-space: nowrap;
    }

    .checkbox {
      width: fit-content;
    }
  }

  .count-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.7rem;
    height: 1.7rem;
    width: 1.7rem;
    aspect-ratio: 1/1;
    padding: 1px 0 0;
    border-radius: $r-full;
    background: $primary600;
    color: $text-light;
    font-size: $fs-base;
    line-height: 1.7;
    font-weight: 500;
    transition: background-color 0.2s ease;

    &.muted {
      background: $main-bg;
      color: $text-muted;
    }
  }

  .completed-section {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    opacity: 0.9;

    .completed-header {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;

      .completed-title {
        @include flex-center;
        justify-content: flex-start;
        font-size: $fs-base;
        font-weight: 600;
        letter-spacing: 0.05em;
        width: 100%;
        gap: $s-2;
        text-transform: uppercase;

        .count-badge {
          margin-left: auto;
        }

        .chevron {
          color: $text-muted;
          transition: transform 0.2s ease;

          &.collapsed {
            transform: rotate(-90deg);
          }
        }
      }
    }

    .completed-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: $s-2;

      .clear-all {
        color: $error;
      }
    }

    .completed-collapse-wrapper {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s ease;

      &.expanded {
        grid-template-rows: 1fr;
      }
    }

    .completed-collapse-inner {
      overflow: hidden;
      min-height: 0;
    }

    .completed-collapse {
      display: flex;
      flex-direction: column;
      gap: $s-2;
      position: relative;
    }
  }

  .add-row {
    display: flex;
    flex-direction: column;
    gap: $s-3;
    padding-top: $s-6;
    width: 100%;

    .long-btn {
      width: 100%;
    }
  }
}

.list-section {
  height: auto;
  display: flex;
  flex-direction: column;
  gap: $s-3;
}

.category-fade-enter-active,
.category-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease;
}

.category-fade-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(10px);
}

.category-fade-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(-8px);
}

.category-fade-leave-active {
  position: absolute;
  width: 100%;
}

.category-fade-move {
  transition: transform 0.3s ease;
}

.item-fade-enter-active,
.item-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease;
}

.item-fade-enter-from,
.item-fade-leave-to {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(-6px);
}

.item-fade-leave-active {
  position: absolute;
  width: 100%;
}

.item-fade-move {
  transition: transform 0.3s ease;
}
</style>