<script setup>
import { ref, computed, watch } from 'vue'
import { PencilLine, Utensils } from 'lucide-vue-next'
import { getDayName, formatDateShort } from '@/utils/dateUtils'
import { useMealStore } from '@/stores/mealStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import MealItemCard from './MealItemCard.vue'
import MealDetails from '@/components/drawer/MealDetails.vue'
import MealPlanning from '@/components/drawer/MealPlanning.vue'
import EmptyState from '../common/EmptyState.vue'

const props = defineProps({
    weekDays: {
        type: Array,
        required: true,
    },
})

const mealStore = useMealStore()
const toast = useToast()
const expandedDates = ref(new Set())

watch(
    () => props.weekDays,
    (days) => {
        const todayDate = days.find(d => d.isToday)?.date
        expandedDates.value = new Set(todayDate ? [todayDate] : [])
    },
    { immediate: true }
)

const toggleDay = (date) => {
    const next = new Set(expandedDates.value)
    next.has(date) ? next.delete(date) : next.add(date)
    expandedDates.value = next
}

const weekDayItems = computed(() =>
    props.weekDays.map(day => {
        return {
            ...day,
            fullDayName: getDayName(day.date, false),
            expanded: expandedDates.value.has(day.date),
            meals: mealStore.getDailyMeals(day.date),
        }
    })
)

const activeMeal = ref(null)
const activeMealDate = ref('')
const isMealOpen = ref(false)
const isPlanning = ref(false)
const planningDate = ref('')

function openDrawer(meal, date) {
    if (meal?.recipe) {
        activeMeal.value = meal
        activeMealDate.value = date
        isMealOpen.value = true
    }
}

function openPlanDrawer(date) {
    planningDate.value = date
    isPlanning.value = true
}

function handleSavePlan(payload) {
    const targetDate = payload?.date || planningDate.value
    const data = payload?.planData || payload
    mealStore.setDayPlan(targetDate, data)
    toast.success('Zapisano plan', TOAST.MEAL_PLAN.SAVED)
    isPlanning.value = false
    planningDate.value = ''
}
</script>

<template>
    <div class="week-list">
        <div class="day" v-for="(day, i) in weekDayItems" :key="day.date" :class="{ today: day.isToday }"
            :style="{ animationDelay: `${i * 0.06}s` }">
            <button class="header" :class="{ expanded: day.expanded }" @click="toggleDay(day.date)">
                <span class="day-name">{{ day.fullDayName }}</span>
                <span class="day-date">{{ formatDateShort(day.date) }}</span>
            </button>

            <div class="meals-wrapper" :class="{ expanded: day.expanded }">
                <div class="collapse-content">
                    <div class="meals-list">
                        <template v-if="day.meals.length">
                            <MealItemCard v-for="meal in day.meals" :key="meal.id || meal.slot" :meal="meal"
                                :date="day.date" @click.stop="openDrawer(meal, day.date)" />
                        </template>
                        <EmptyState v-else :icon="Utensils" title="Twój plan robi się głodny."
                            description="Zaplanuj dzień bez zgadywania.">
                        </EmptyState>
                    </div>

                    <div class="edit-day">
                        <BaseButton variant="ghost" size="md" :icon="PencilLine" @click.stop="openPlanDrawer(day.date)">
                            Edytuj dzień
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
        <BaseDrawer v-model="isMealOpen" :component="MealDetails"
            :component-props="{ meal: activeMeal, date: activeMealDate }" height="xl" />
        <BaseDrawer v-model="isPlanning" :component="MealPlanning" :component-props="{ date: planningDate }"
            @save-plan="handleSavePlan" height="xl" />
    </div>
</template>

<style lang="scss" scoped>
.week-list {
    display: flex;
    flex-direction: column;
    gap: $s-3;
}

.day {
    background: linear-gradient(180deg, rgba(242, 243, 244, 0.35) 0%, rgba(231, 232, 236, 0.35) 100%), #FFFFFF !important;
    border: 1px solid #E4E7EC;
    @include box;
    border-radius: $r-2xl;
    overflow: hidden;
    animation: day-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: $s-4 $s-6 $s-3;
        border: none;
        background: transparent;
        cursor: pointer;
        border-bottom: 1px solid transparent;
        border-image: none;

        &.expanded {
            border-image: repeating-linear-gradient(90deg,
                    $neutral300 0 12px,
                    transparent 12px 18px) 1;
        }

        background: transparent;

        .day-name {
            letter-spacing: -0.02em;
            font-size: $fs-xl;
            font-weight: 500;
            color: $neutral600;
        }

        .day-date {
            letter-spacing: -0.01em;
            font-size: calc($fs-2xl * 1.1);
            font-weight: 500;
            color: $text;
        }
    }

    .meals-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1);

        &.expanded {
            grid-template-rows: 1fr;
        }
    }

    .collapse-content {
        overflow: hidden;
        min-height: 0;
    }

    .meals-list {
        padding: $s-4 $s-4 $s-3;
        display: flex;
        flex-direction: column;
        gap: $s-3;
    }
}

.edit-day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 4.5rem;
    padding: $s-3 $s-4 $s-4;
    border: none;
    border-top: 1px solid transparent;
    border-image: repeating-linear-gradient(90deg,
            $neutral300 0 12px,
            transparent 12px 18px) 1;
    background: transparent;
    color: $text-muted;
    opacity: 0.7;
    cursor: pointer;
    transition: color 0.15s ease;

    button {
        font-size: $fs-xl !important;
    }

    svg {
        margin-right: $s-2;
        height: $fs-2xl;
        width: $fs-2xl;
        opacity: .8;
    }
}

@keyframes day-in {
    from {
        opacity: 0;
        transform: translateY(10px);
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