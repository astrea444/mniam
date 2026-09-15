<script setup>
import { ref, computed } from 'vue'
import { useMealPlan } from '@/composables/useMealPlan'
import { useMealStore } from '@/stores/mealStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import { getYesterdayIso } from '@/utils/dateUtils'
import BaseButton from '../common/BaseButton.vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseDrawer from '../common/BaseDrawer.vue'
import MealItemCard from './MealItemCard.vue'
import EmptyState from '../common/EmptyState.vue'
import MealDetails from '@/components/drawer/MealDetails.vue'
import MealPlanning from '@/components/drawer/MealPlanning.vue'
import { Notebook, PencilLine, Check } from 'lucide-vue-next'

const props = defineProps({
    date: {
        type: String,
        required: true,
    },
})

const dateRef = computed(() => props.date)
const { dailyMeals } = useMealPlan(dateRef)
const mealStore = useMealStore()
const toast = useToast()

const activeMeal = ref(null)
const isMealOpen = ref(false)
const isPlanning = ref(false)

const hasAnyMeal = computed(() => (dailyMeals.value ?? []).length > 0)

function openDrawer(meal) {
    if (meal?.recipe) {
        activeMeal.value = meal
        isMealOpen.value = true
    }
}

const planningSlot = ref(null)

function openPlanDrawer(slot = null) {
    planningSlot.value = typeof slot === 'string' ? slot : null
    isPlanning.value = true
}

function closeDrawers() {
    activeMeal.value = null
    isMealOpen.value = false
    isPlanning.value = false
    planningSlot.value = null
}

function copyFromYesterday() {
    const yesterdayStr = getYesterdayIso(props.date)
    const yesterdayPlan = mealStore.mealPlan[yesterdayStr]
    if (yesterdayPlan && Object.values(yesterdayPlan).some(Boolean)) {
        mealStore.setDayPlan(props.date, yesterdayPlan)
        toast.success('Skopiowano plan', TOAST.MEAL_PLAN.COPIED)
    } else {
        toast.info('Brak planu', TOAST.MEAL_PLAN.NO_PLAN)
    }
}

function handleSavePlan(payload) {
    const targetDate = payload?.date || props.date
    const data = payload?.planData || payload
    mealStore.setDayPlan(targetDate, data)
    toast.success('Zapisano plan', TOAST.MEAL_PLAN.SAVED)
    isPlanning.value = false
    planningSlot.value = null
}

defineExpose({
    openPlanDrawer
})
</script>

<template>
    <div class="list" :key="hasAnyMeal">
        <template v-if="hasAnyMeal">
            <MealItemCard v-for="meal in dailyMeals" :key="meal.id" :meal="meal" :date="date"
                @click.stop="openDrawer(meal)" />
            <BaseButton variant="green" class="long-btn" size="lg" @click="openPlanDrawer()">Edytuj plan
            </BaseButton>
        </template>

        <EmptyState v-else :icon="Notebook" title="Twój plan robi się głodny."
            description="Zaplanuj dzień lub skopiuj plan z wczoraj.">
            <template #actions>
                <BaseButton variant="default" size="lg" @click="copyFromYesterday">
                    Skopiuj z wczoraj
                </BaseButton>
                <BaseButton variant="green" size="lg" :icon="PencilLine" @click="openPlanDrawer()">
                    Zaplanuj cały dzień
                </BaseButton>
            </template>
        </EmptyState>
        <BaseDrawer v-model="isMealOpen" :component="MealDetails" :component-props="{ meal: activeMeal, date }"
            height="xl" />
        <BaseDrawer v-model="isPlanning" :component="MealPlanning"
            :component-props="{ date, initialSlot: planningSlot }" @save-plan="handleSavePlan" height="xl" />
    </div>
</template>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-direction: column;
    gap: $s-2;


    .long-btn {
        opacity: 0;
        animation: item-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-delay: 0.55s;
    }
}



@keyframes item-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
</style>