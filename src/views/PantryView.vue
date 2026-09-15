<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import {
  PhMagnifyingGlass, PhFunnel
} from '@phosphor-icons/vue'
import { CookingPot, Trash2, PenLine, PencilLine, PackagePlus } from 'lucide-vue-next'
import ViewHeader from '@/components/layout/ViewHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import FilterDrawer from '@/components/drawer/FilterDrawer.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import AddProduct from '@/components/drawer/AddProduct.vue'
import ConfirmDeleteProduct from '@/components/drawer/ConfirmDeleteProduct.vue'
import { usePantryStore } from '@/stores/pantryStore'
import { PantryService } from '@/services/pantryService'
import { iconFor, iconColor } from '@/constants/productOptions'
import { getLowStockBadge, getExpiryBadge, getRecentlyAddedBadge } from '@/utils/badgeVariants'
import { formatAmount } from '@/utils/formatters'
import { filterProducts, sortProducts } from '@/utils/productFilters'
import { useSwipeRow } from '@/composables/useSwipeRow'

const pantryStore = usePantryStore()

onMounted(() => {
  pantryStore.fetchItems()
})
const showAddOrEditModal = ref(false)
const selectedProductForEdit = ref(null)
const showDeleteModal = ref(false)
const selectedProductForDelete = ref(null)

const showFilterDrawer = ref(false)
const search = ref('')
const selectedCategory = ref(null)
const sortBy = ref('name-asc')
const lowStockOnly = ref(false)
const expiringOnly = ref(false)

const {
  swipedItemId,
  nudgingId,
  onPointerDown,
  getRowStyle,
  getActionsMaskStyle,
  closeSwipe,
  getHasMoved,
} = useSwipeRow()

async function onRowClick(item) {
  if (getHasMoved()) return

  if (swipedItemId.value) {
    closeSwipe()
    return
  }

  if (nudgingId.value === item.id) {
    nudgingId.value = null
    await nextTick()
  }
  nudgingId.value = item.id
}

function onNudgeEnd(item) {
  if (nudgingId.value === item.id) {
    nudgingId.value = null
  }
}

function openAddModal() {
  selectedProductForEdit.value = null
  showAddOrEditModal.value = true
}

function openEditModal(item) {
  closeSwipe()
  selectedProductForEdit.value = item
  showAddOrEditModal.value = true
}

function openDeleteModal(item) {
  closeSwipe()
  selectedProductForDelete.value = item
  showDeleteModal.value = true
}

const lowStockBadge = getLowStockBadge()
const expiryBadge = getExpiryBadge()
const recentlyAddedBadge = getRecentlyAddedBadge()

const sortOptions = [
  { label: 'A-Z', value: 'name-asc' },
  { label: 'Z-A', value: 'name-desc' },
  { label: 'Ilość rosnąco', value: 'amount-asc' },
  { label: 'Ilość malejąco', value: 'amount-desc' },
  { label: 'Termin ważności', value: 'expiry-asc' }
]

const allCategoryNames = computed(() => {
  const set = new Set()
  pantryStore.items.forEach(i => { if (i.category) set.add(i.category) })
  return Array.from(set)
})

const hasActiveFilters = computed(() => {
  return selectedCategory.value !== null || lowStockOnly.value || expiringOnly.value || sortBy.value !== 'name-asc'
})


const filteredItems = computed(() => {
  let list = filterProducts(pantryStore.items, {
    query: search.value,
    category: selectedCategory.value,
  })
  if (lowStockOnly.value) list = list.filter(item => isLow(item))
  if (expiringOnly.value) list = list.filter(item => isExpiring(item))
  return sortProducts(list, sortBy.value)
})

const isLow = PantryService.isLow
const isExpiring = PantryService.isExpiring
</script>

<template>
  <div class="pantry-view" data-testid="pantry-view">
    <ViewHeader title="Domowe zapasy." subtitle="Wszystkie produkty w jednym miejscu." />

    <div class="page-content">
      <section>
        <div class="search-bar">
          <BaseInput v-model="search" :icon="PhMagnifyingGlass" placeholder="Szukaj produktu..."
            iconLeft="magnifyingGlass" data-testid="search-input" />
          <BaseButton class="filter-btn" iconOnly :icon="PhFunnel" :variant="hasActiveFilters ? 'green' : 'default'"
            aria-label="Filtruj" @click="showFilterDrawer = true" data-testid="filter-button">
          </BaseButton>
        </div>
      </section>

      <section class="products-section" data-testid="products-section">
        <div class="section-head">
          <h2 class="section-title">Produkty</h2>
          <div class="sort">
            <BaseSelect v-model="sortBy" :options="sortOptions" size="sm" class="sort-select" prefix="Sortuj:"
              side="right" data-testid="sort-select" />
          </div>
        </div>

        <SkeletonLoader v-if="pantryStore.isLoading" type="list" :count="4" />

        <EmptyState v-else-if="filteredItems.length === 0" :icon="CookingPot" title="Brak produktów"
          description="Twoja spiżarnia jest pusta lub brak wyników spełniających kryteria." data-testid="empty-state">
        </EmptyState>

        <div v-else class="list-wrap">
          <div class="list" data-testid="pantry-list">
            <div v-for="item in filteredItems" :key="item.id" class="swipe-row-wrapper"
              @pointerdown="onPointerDown($event, item)" data-testid="pantry-item">

              <div class="actions-mask" :style="getActionsMaskStyle(item)">
                <div class="row-actions">
                  <BaseButton variant="ghost" size="sm" iconOnly :icon="Trash2" aria-label="Usuń produkt"
                    @click.stop="openDeleteModal(item)" class="delete-btn" data-testid="delete-product-btn">
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" iconOnly :icon="PenLine" aria-label="Edytuj produkt"
                    @click.stop="openEditModal(item)" class="edit-btn" data-testid="edit-product-btn">
                  </BaseButton>
                </div>
              </div>

              <div class="row" :class="{ nudge: nudgingId === item.id }" :style="getRowStyle(item)"
                @click="onRowClick(item)" @animationend="onNudgeEnd(item)" data-testid="pantry-item-row">
                <div class="row-left">
                  <div class="icon">
                    <component :is="iconFor(item)" :size="22" weight="regular" :color="iconColor(item)" />
                  </div>
                  <div class="name-col">
                    <span class="name" data-testid="pantry-item-name">{{ item.name }}</span>
                    <div v-if="item.isRecentlyAdded || isLow(item) || isExpiring(item)" class="badges">
                      <BaseBadge v-if="item.isRecentlyAdded" :variant="recentlyAddedBadge.variant" size="sm"
                        data-testid="badge-recent">
                        {{ recentlyAddedBadge.text }}
                      </BaseBadge>
                      <BaseBadge v-if="isLow(item)" :variant="lowStockBadge.variant" size="sm"
                        data-testid="badge-low-stock">
                        {{ lowStockBadge.text }}
                      </BaseBadge>
                      <BaseBadge v-if="isExpiring(item)" :variant="expiryBadge.variant" size="sm"
                        data-testid="badge-expiring">
                        {{ expiryBadge.text }}
                      </BaseBadge>
                    </div>
                  </div>
                </div>

                <div class="row-right">
                  <span class="qty" data-testid="pantry-item-qty">{{ formatAmount(item.amount, item.unit) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <BaseButton @click="openAddModal" class="add long-btn" variant="green" size="lg"
            data-testid="add-product-btn">
            Dodaj produkt
          </BaseButton>
        </div>
      </section>
    </div>

    <BaseDrawer v-model="showAddOrEditModal" :title="selectedProductForEdit ? 'Edytuj produkt' : 'Dodaj produkt'"
      :icon="selectedProductForEdit ? PencilLine : PackagePlus" :component="AddProduct"
      :component-props="{ item: selectedProductForEdit }" height="lg" data-testid="add-edit-drawer" />

    <BaseDrawer v-model="showDeleteModal" title="Usuń produkt" :icon="Trash2" :component="ConfirmDeleteProduct"
      :component-props="{ item: selectedProductForDelete }" height="fit" data-testid="delete-drawer" />

    <FilterDrawer v-model="showFilterDrawer" mode="pantry" :categories="allCategoryNames"
      v-model:category="selectedCategory" v-model:sort-by="sortBy" v-model:low-stock-only="lowStockOnly"
      v-model:expiring-only="expiringOnly" data-testid="filter-drawer" />
  </div>
</template>

<style lang="scss" scoped>
.pantry-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  width: 100%;
  gap: $s-8;
}

.page-content {
  gap: $s-8 !important;
  height: 100%;
  max-height: 100% !important;
  overflow: hidden !important;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: $s-3;
  width: 100%;
  margin-bottom: $s-3;

  .input-group {
    width: 100%;
  }

  .filter-btn {
    flex-shrink: 0;
  }
}

.products-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start !important;
  max-height: 100%;
  overflow-y: hidden;
  height: 100%;
  gap: $s-1;

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $s-2;
  }

  .sort {
    display: flex;
    align-items: center;
    gap: $s-1;

    .sort-select {
      min-width: 0;
    }
  }

  .list-wrap {
    overflow-y: auto;
    padding-bottom: $s-2;
    max-height: 100%;
    height: 100%;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
  }

  .list {
    display: flex;
    flex-direction: column;
    height: fit-content;
    padding: $s-2 0;

    .swipe-row-wrapper {
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid $border-color;
      touch-action: pan-y;

      &:last-child {
        border-bottom: none;
      }

      .actions-mask {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        overflow: hidden;
        z-index: 1;
        transition: width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        padding-left: $s-2;

        .row-actions {
          width: 96px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: $s-1;
          border-left: 1px solid $border-color;
          height: 100%;

          button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 3rem !important;

            &.delete-btn {
              :deep(svg) {
                color: $error !important;
              }

              &:hover {
                background: #fee4e2;
                border-color: #fecdca;
              }
            }

            &.edit-btn {
              color: $primary700;

              &:hover {
                background: $primary100;
                border-color: $primary300;
              }
            }
          }
        }
      }

      .row {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 4rem;
        width: 100%;
        flex-shrink: 0;
        padding: $s-3 $s-3 $s-3 $s-2;
        gap: $s-1;
        transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        user-select: none;

        &.nudge {
          animation: row-nudge 0.55s ease-out;
        }

        .row-left {
          display: flex;
          align-items: center;
          gap: $s-6;
          flex: 1;
          min-width: 0;

          .icon {
            height: $fs-3xl;
            width: $fs-3xl;
            color: $primary700;
            flex-shrink: 0;

            svg {
              height: 100%;
              width: auto;
            }
          }

          .name-col {
            display: flex;
            flex-direction: column;
            gap: $s-1;
            min-width: 0;
            width: 100%;
          }

          .name {
            @include truncate;
            font-size: $fs-base;
            font-weight: 500;
            color: $text;
            width: 100%;
          }

          .badges {
            display: flex;
            align-items: center;
            gap: $s-1;
            flex-wrap: wrap;
          }
        }

        .row-right {
          display: flex;
          width: fit-content;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;

          .qty {
            font-size: $fs-sm;
            color: $text-muted;
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }
}


.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding-top: $s-4;
  z-index: 99;
}

@keyframes row-nudge {
  0% {
    transform: translateX(0);
  }

  35% {
    transform: translateX(-18px);
    animation-timing-function: ease-out;
  }

  55% {
    transform: translateX(-22px);
    animation-timing-function: ease-in-out;
  }

  75% {
    transform: translateX(-14px);
  }

  100% {
    transform: translateX(0);
  }
}
</style>