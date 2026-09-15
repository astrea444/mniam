<script setup>
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePantryStore } from '@/stores/pantryStore'
import { useMealStore } from '@/stores/mealStore'
import { usePantryCheck } from '@/composables/usePantryCheck'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'

const props = defineProps({
    recipe: { type: Object, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    portionMultiplier: { type: Number, default: 1.0 },
    deductFromPantry: { type: Boolean, default: true },
})

const emit = defineEmits(['update:portionMultiplier', 'update:deductFromPantry'])

const pantryStore = usePantryStore()
const mealStore = useMealStore()
const toast = useToast()

const { hasAllIngredients } = usePantryCheck(() =>
    (props.recipe?.ingredients ?? []).map(ing => ({
        ...ing,
        amount: Number(ing.amount || 0) * (props.portionMultiplier || 1.0)
    }))
)

const cannotEat = computed(() => eaten.value || (props.deductFromPantry && !hasAllIngredients.value))

const portionOptions = [
    { label: '0.5 porcji', value: 0.5 },
    { label: '1 porcja', value: 1.0 },
    { label: '1.5 porcji', value: 1.5 },
    { label: '2 porcje', value: 2.0 },
]

const eaten = computed(() => mealStore.isEaten(props.date, props.slot))

function markAsEaten() {
    if (cannotEat.value) return
    if (props.deductFromPantry) {
        pantryStore.deductIngredients(props.recipe.ingredients ?? [], props.portionMultiplier)
    }
    mealStore.markAsEaten(props.date, props.slot, props.portionMultiplier)
    toast.success('Smacznego!', TOAST.MEAL_PLAN.EATEN(props.recipe.title))
}

function resetPortion() {
    if (eaten.value) {
        if (props.deductFromPantry) {
            pantryStore.addIngredients(props.recipe.ingredients ?? [], props.portionMultiplier)
        }
        mealStore.unmarkEaten(props.date, props.slot)
        toast.info('Cofnięto', TOAST.MEAL_PLAN.UNMARK)
    }
    emit('update:portionMultiplier', 1.0)
}
</script>

<template>
    <div class="portion-tracker">
        <BaseSelect :model-value="portionMultiplier" @update:model-value="emit('update:portionMultiplier', $event)"
            :options="portionOptions" :disabled="eaten" label="Porcja" size="lg" />
        <BaseCheckbox :model-value="deductFromPantry" @update:model-value="emit('update:deductFromPantry', $event)"
            :disabled="eaten" size="md" variant="green" label="Odejmij składniki ze spiżarni" />
        <div class="btns">
            <BaseButton class="eaten-btn" variant="green" size="lg" @click="markAsEaten" :disabled="cannotEat"
                :icon="eaten ? Check : null">
                {{ eaten ? 'Zjedzone!' : 'Oznacz zjedzone' }}
            </BaseButton>
            <BaseButton v-if="eaten" variant="default" size="lg" @click="resetPortion">
                Cofnij
            </BaseButton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.portion-tracker {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $s-3;
    margin-bottom: $s-8;

    .btns {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: $s-3;
    }

    button {
        flex-shrink: unset !important;
        width: 100%;
    }
}
</style>
