<script setup>
import { ref, computed } from 'vue'
import {
  Minus,
  Check,
  RotateCcw,
  Trash,
  SlidersHorizontal,
  PenLine
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePantryStore } from '@/stores/pantryStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useToast } from '@/composables/useToast'
import { UNIT_OPTIONS } from '@/constants/productOptions'
import { getCategoryIcon, getCategoryLabel } from '@/constants/productOptions'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'completed'])

const pantryStore = usePantryStore()
const shoppingStore = useShoppingStore()
const toast = useToast()

function resolveIcon(category) {
  return getCategoryIcon(category)
}

const unitSelectOptions = [
  ...UNIT_OPTIONS,
  { label: 'opak', value: 'opak' },
  { label: 'szt', value: 'szt' },
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'l', value: 'l' },
]

const localItems = ref(
  props.items.map((i) => {
    const isPack = (i.unit || '').includes('opak')
    const packSize = i.packageSize || 500
    const defAmount = i.totalStockAmount ?? (isPack ? (i.amount || 1) * packSize : i.amount || 1)
    const defUnit = i.stockUnit || (isPack ? 'g' : i.unit || 'szt')

    return {
      id: i.id,
      name: i.name,
      amount: defAmount,
      unit: defUnit,
      category: i.category || 'other',
      defaultAmount: defAmount,
      defaultUnit: defUnit,
      originalAmount: i.amount,
      originalUnit: i.unit,
      packageSize: i.packageSize,
      showCustom: false,
    }
  })
)

function getStep(item) {
  const unit = (item.unit || '').toLowerCase()
  if (unit === 'g' || unit === 'ml') return 100
  if (unit === 'kg' || unit === 'l') return 0.5
  return 1
}

function getPillsForItem(item) {
  const unit = (item.unit || '').toLowerCase()
  if (unit === 'g') {
    return [
      { label: '100 g', amount: 100, unit: 'g' },
      { label: '250 g', amount: 250, unit: 'g' },
      { label: '500 g', amount: 500, unit: 'g' },
      { label: '1 kg', amount: 1, unit: 'kg' },
    ]
  }
  if (unit === 'ml') {
    return [
      { label: '250 ml', amount: 250, unit: 'ml' },
      { label: '500 ml', amount: 500, unit: 'ml' },
      { label: '1 l', amount: 1, unit: 'l' },
    ]
  }
  if (unit === 'kg') {
    return [
      { label: '0.5 kg', amount: 0.5, unit: 'kg' },
      { label: '1 kg', amount: 1, unit: 'kg' },
      { label: '2 kg', amount: 2, unit: 'kg' },
    ]
  }
  if (unit === 'l') {
    return [
      { label: '0.5 l', amount: 0.5, unit: 'l' },
      { label: '1 l', amount: 1, unit: 'l' },
      { label: '2 l', amount: 2, unit: 'l' },
    ]
  }
  return [
    { label: '1 szt', amount: 1, unit: 'szt' },
    { label: '2 szt', amount: 2, unit: 'szt' },
    { label: '5 szt', amount: 5, unit: 'szt' },
    { label: '+1', delta: 1 },
  ]
}

function isPillActive(item, pill) {
  if (pill.delta) return false
  return item.amount === pill.amount && item.unit === pill.unit
}

function applyPill(idx, pill) {
  const item = localItems.value[idx]
  if (pill.delta) {
    item.amount = Math.round((item.amount + pill.delta) * 100) / 100
  } else {
    item.amount = pill.amount
    if (pill.unit) item.unit = pill.unit
  }
}

const hasChanges = computed(() => {
  return localItems.value.some(
    (item) => Number(item.amount) !== Number(item.defaultAmount) || item.unit !== item.defaultUnit
  )
})

function resetToDefaults() {
  localItems.value.forEach((item) => {
    item.amount = item.defaultAmount
    item.unit = item.defaultUnit
  })
}

function addCustomized() {
  const toAdd = localItems.value.map((item) => ({
    name: item.name,
    amount: Number(item.amount) || 1,
    unit: item.unit || 'szt',
    category: item.category,
    isRecentlyAdded: true,
    addedAt: Date.now(),
  }))

  pantryStore.addMultiple(toAdd)

  localItems.value.forEach((item) => {
    shoppingStore.removeItem(item.id)
  })

  toast.success('Spiżarnia', `Dodano ${toAdd.length} produktów do spiżarni!`)
  emit('completed')
  emit('close')
}

function handleRemoveItem(id) {
  shoppingStore.removeItem(id)
  localItems.value = localItems.value.filter((i) => i.id !== id)
  if (localItems.value.length === 0) {
    emit('close')
  }
}
</script>

<template>
  <div class="shopping-summary" data-testid="shopping-summary-content">

    <div class="items-list" data-testid="summary-items-list">
      <div v-for="(item, idx) in localItems" :key="item.id" class="summary-item" data-testid="summary-item">
        <div class="item-main">
          <div class="item-info">
            <component :is="resolveIcon(item.category)" class="item-icon" :size="24" />
            <div class="item-text">
              <span class="item-name" data-testid="summary-item-name">{{ item.name }}</span>
              <span class="item-category">{{ getCategoryLabel(item.category) }}</span>
            </div>
          </div>
          <span class="qty-display" data-testid="summary-item-qty">
            {{ item.amount }} {{ item.unit }}
            <BaseButton variant="ghost" iconOnly :icon="Trash" size="sm" class="trash-btn" aria-label="Usuń z kupionych"
              @click="handleRemoveItem(item.id)" data-testid="summary-remove-item-btn">
            </BaseButton>
          </span>
        </div>

        <div class="pills-row">
          <label class="pills-label">Szybki wybór:</label>
          <div class="pills">
            <BaseButton v-for="pill in getPillsForItem(item)" :key="pill.label"
              :variant="isPillActive(item, pill) ? 'green' : 'default'" size="sm" @click="applyPill(idx, pill)"
              data-testid="summary-pill-btn">
              {{ pill.label }}
            </BaseButton>
          </div>
        </div>

        <div class="custom-qty-section">
          <BaseInput v-model.number="item.amount" size="md" type="number" step="1" placeholder="Inna ilość"
            class="amount-input" :icon="PenLine" :inputmode="item.unit === 'szt' ? 'numeric' : 'decimal'"
            enterkeyhint="done" data-testid="summary-amount-input" />
          <BaseSelect v-model="item.unit" size="md" side="right" :options="unitSelectOptions" class="unit-select"
            data-testid="summary-unit-select" />
        </div>
      </div>
    </div>

    <div class="actions">

      <BaseButton variant="green" size="lg" class="confirm-btn" :icon="Check" @click="addCustomized"
        data-testid="summary-confirm-btn">
        Zatwierdź i dodaj do spiżarni
      </BaseButton>
      <Transition name="slide">
        <BaseButton v-if="hasChanges" variant="default" size="lg" class="reset-btn" :icon="RotateCcw"
          @click="resetToDefaults" data-testid="summary-reset-btn">
          Przywróć domyślne
        </BaseButton>
      </Transition>
    </div>

  </div>
</template>


<style lang="scss" scoped>
.shopping-summary {
  display: flex;
  flex-direction: column;
  gap: $s-6;
  padding: $s-2 $s-2 $s-8;
  height: 100%;
  width: 100%;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: $s-4;
  height: 100%;
  overflow-y: auto;
  padding-right: $s-1;
}

.summary-item {
  @include box;
  border-radius: $r-2xl;
  border-color: $neutral200;
  background: $btn-bg;
  padding: $s-5 $s-5 $s-6;
  display: flex;
  flex-direction: column;
  gap: $s-3;

  .item-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $s-3;
    padding: 0 0 0 $s-2;

    .item-info {
      display: flex;
      align-items: center;
      gap: $s-3;
      min-width: 0;
      flex: 1;

      .item-icon {
        color: $primary700;
        flex-shrink: 0;
      }

      .item-text {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .item-name {
          letter-spacing: 0.01em;
          font-size: calc($fs-lg * 1.1);
          font-weight: 600;
          color: $text;
          @include truncate;
        }

        .item-category {
          font-size: $fs-base;
          font-weight: 500;
          color: $text-muted;
          letter-spacing: 0.01em;
        }
      }
    }

    .qty-display {
      display: flex;
      align-items: center;
      gap: $s-5;
      font-variant-numeric: tabular-nums;
      font-size: $fs-xl;
      font-weight: 500;
      color: $text;
      letter-spacing: -0.05em;
      min-width: 4.5rem;
      text-align: center;
      white-space: nowrap;

      .trash-btn {
        :deep(svg) {
          color: $error !important;
        }
      }
    }
  }

  .pills-row {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: $s-3;
    padding: $s-4 0;

    label {
      font-size: $fs-base;
      color: $text-muted;
      font-weight: 500;
    }

    .pills {
      display: flex;
      align-items: center;
      flex-direction: row;
      gap: $s-3;
      width: 100%;

      button {
        flex: 1;
        font-size: $fs-lg;
      }
    }
  }

  .custom-qty-section {
    display: flex;
    flex-direction: row;
    gap: $s-2;

    .amount-input {
      flex: 3;

      :deep(input) {
        font-size: $fs-lg;
        font-weight: 500;
      }
    }

    .unit-select {
      flex: 1;
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: $s-3;
  width: 100%;
  margin-top: $s-2;

  .reset-btn,
  .confirm-btn {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>