<script setup>
import { ref } from 'vue'
import { Check, CalendarPlus } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDateSelect from '@/components/common/BaseDateSelect.vue'
import { useMealStore } from '@/stores/mealStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import { useTemporaryFlag } from '@/composables/useTemporaryFlag'
import { toIso } from '@/utils/dateUtils'
import { MEAL_SLOT_OPTIONS } from '@/constants/mealSlots'

const props = defineProps({
    recipe: { type: Object, required: true },
})

const emit = defineEmits(['save-plan', 'close'])

const mealStore = useMealStore()
const toast = useToast()

const planDate = ref(new Date())
const planSlot = ref('dinner')
const { flag: isPlanned, trigger: triggerPlanned } = useTemporaryFlag(800)

const slotOptions = MEAL_SLOT_OPTIONS

function planThisMeal() {
    if (!planDate.value) return
    const iso = toIso(planDate.value)
    mealStore.setMealForDay(iso, planSlot.value, props.recipe.id)
    toast.success('Zaplanowano posiłek', TOAST.MEAL_PLAN.PLANNED(props.recipe.title))
    emit('save-plan', { date: iso, slot: planSlot.value, recipeId: props.recipe.id })
    triggerPlanned(() => emit('close'))
}
</script>

<template>
    <div class="plan-form">
        <div class="plan-form-row">
            <BaseDateSelect v-model="planDate" label="Dzień" size="md" />
            <BaseSelect v-model="planSlot" :options="slotOptions" label="Pora posiłku" size="md" />
        </div>
        <BaseButton class="plan-btn" variant="green" size="lg" @click="planThisMeal" :disabled="isPlanned"
            :icon="isPlanned ? Check : CalendarPlus">
            {{ isPlanned ? 'Zaplanowano pomyślnie!' : 'Zaplanuj ten posiłek' }}
        </BaseButton>
    </div>
</template>


<style lang="scss" scoped>
.plan-form {
    display: flex;
    flex-direction: column;
    gap: $s-3;
    margin-bottom: $s-8;

    .plan-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $s-3;
        width: 100%;
    }

    .plan-btn {
        width: 100%;
    }
}
</style>
