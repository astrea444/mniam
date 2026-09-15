<script setup>
import { computed } from 'vue'
import { Check, ShoppingCart } from 'lucide-vue-next'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useShoppingStore } from '@/stores/shoppingStore'
import { usePantryCheck } from '@/composables/usePantryCheck'
import { getPantryStatusBadge } from '@/utils/badgeVariants'
import { formatAmount } from '@/utils/formatters'

const props = defineProps({
    ingredients: { type: Array, default: () => [] },
})

const ingredientsRef = computed(() => props.ingredients)
const { isInPantry, isMissing } = usePantryCheck(ingredientsRef)
const shoppingStore = useShoppingStore()

function isInShoppingList(name) {
    if (!name) return false
    const clean = name.trim().toLowerCase()
    return shoppingStore.items.some(item => item.name && item.name.trim().toLowerCase() === clean)
}

const missingIngredients = computed(() => props.ingredients.filter(ing => isMissing(ing.name)))
const missingNotOnShopping = computed(() => missingIngredients.value.filter(ing => !isInShoppingList(ing.name)))

const isAllAddedOrNoMissing = computed(() => {
    if (missingIngredients.value.length === 0) return true
    return missingNotOnShopping.value.length === 0
})

const isButtonDisabled = computed(() => {
    return isAllAddedOrNoMissing.value
})

const buttonText = computed(() => {
    if (missingIngredients.value.length > 0 && missingNotOnShopping.value.length === 0) {
        return 'Dodano do listy zakupów'
    }
    return `Uzupełnij listę zakupów (${missingNotOnShopping.value.length})`
})

function pantryBadge(name) {
    return getPantryStatusBadge(isInPantry(name), isInShoppingList(name))
}

function addMissingToShopping() {
    if (!missingNotOnShopping.value.length) return
    shoppingStore.addIngredientsFromRecipe(missingNotOnShopping.value)
}
</script>

<template>
    <div class="ingredients-tab">
        <ul v-if="ingredients.length" class="list">
            <li v-for="(ing, i) in ingredients" :key="i" class="item">
                <div class="ing-left">
                    <span class="name">{{ ing.name }}</span>
                    <BaseBadge v-if="pantryBadge(ing.name)" size="sm" :variant="pantryBadge(ing.name).variant">
                        {{ pantryBadge(ing.name).text }}
                    </BaseBadge>
                </div>
                <div class="ing-right">
                    <span class="amount">{{ formatAmount(ing.amount, ing.unit) }}</span>
                </div>
            </li>
        </ul>
        <BaseButton v-if="missingIngredients.length > 0" variant="default" size="lg" class="missing-btn" @click="addMissingToShopping"
            :disabled="isButtonDisabled">
            {{ buttonText }}
        </BaseButton>
    </div>
</template>

<style lang="scss" scoped>
.ingredients-tab {
    display: flex;
    flex-direction: column;
    gap: $s-4;
}

.list {
    display: flex;
    flex-direction: column;
    gap: $s-2;
    list-style: none;
    padding: 0;
    margin: 0;

    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $s-2;
        border-bottom: 1px solid $border-color;
        min-height: 3.5rem;
        gap: $s-2;

        .ing-left {
            display: flex;
            align-items: center;
            gap: $s-2;
            flex-wrap: wrap;

            .name {
                font-size: $fs-lg;
                font-weight: 500;
                color: $text;
            }
        }

        .ing-right {
            display: flex;
            align-items: center;
            gap: $s-3;

            .amount {
                color: $text-muted;
                font-weight: 500;
                white-space: nowrap;
            }
        }
    }
}
.missing-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $s-5;
    gap: $s-2;
}
</style>
