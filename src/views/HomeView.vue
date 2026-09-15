<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue';
import SummaryCard from '@/components/common/SummaryCard.vue';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';
import TipCard from '@/components/common/TipCard.vue';
import DayMeal from '@/components/meals/DayMeal.vue';
import WeekMeal from '@/components/meals/WeekMeal.vue';
import { Drumstick, Wheat, Droplets, ArrowLeft, ArrowRight, ArrowDownLeft, Cookie, Calendar1, CalendarDays } from "lucide-vue-next";
import { useDate } from '@/composables/useDate'
import { useMealStore } from '@/stores/mealStore'
import { useUserStore } from '@/stores/userStore'

const dayMealRef = ref(null)
const mealStore = useMealStore()
const userStore = useUserStore()

const {
  selectedDate,
  currentWeekStart,
  weekDays,
  weekRangeLabel,
  goToPreviousWeek,
  goToNextWeek,
  goToToday,
  showTodayButton
} = useDate()

const calendarView = ref('day')

const dailyNutrition = computed(() => mealStore.calculateDailyNutrition(selectedDate.value))
const calories = computed(() => dailyNutrition.value.calories)
const calorieGoal = computed(() => userStore.profile?.calorieGoal || 2000)

const MACRO_DEFS = [
  { label: "Tłuszcz", key: "fat", icon: Droplets, color: "#FDB022" },
  { label: "Białko", key: "protein", icon: Drumstick, color: "#F97066" },
  { label: "Węgl.", key: "carbs", icon: Wheat, color: "#53B1FD" },
]

const macros = computed(() =>
  MACRO_DEFS.map(def => ({
    label: def.label,
    value: `${dailyNutrition.value[def.key]} g`,
    icon: def.icon,
    color: def.color,
  }))
)

const weekSummaryMessage = computed(() => {
  const total = weekDays.value.length
  const planned = weekDays.value.filter(day => {
    const dailyMeals = mealStore.getDailyMeals(day.date)
    return dailyMeals.length > 0
  }).length

  return planned === total
    ? 'Tydzień w pełni zaplanowany!'
    : `Zaplanowano ${planned} z ${total} dni`
})

const setCalendarView = (view) => {
  calendarView.value = view
}
onMounted(() => {
  mealStore.fetchMeals()
})
</script>

<template>
  <div class="home-view">
    <div class="page-content">
      <section class="calendar-section">
        <div class="week-nav">
          <BaseButton variant="default" size="sm" iconOnly :icon="ArrowLeft" @click="goToPreviousWeek">
          </BaseButton>

          <div class="nav-center" :class="{ expanded: showTodayButton }">
            <Transition name="week-fade" mode="out-in">
              <span class="label" :key="weekRangeLabel">{{ weekRangeLabel }}</span>
            </Transition>
            <div class="today">
              <BaseButton class="today-btn" :icon="ArrowDownLeft" size="sm" variant="ghost" @click="goToToday">
                Dziś
              </BaseButton>
            </div>
          </div>
          <BaseButton variant="default" size="sm" iconOnly :icon="ArrowRight" @click="goToNextWeek"
            aria-label="Następny tydzień">
          </BaseButton>
        </div>

        <div class="day-strip-wrapper" :class="{ collapsed: calendarView !== 'day' }">
          <div class="day-strip-inner">
            <div class="day-strip">
              <button v-for="day in weekDays" :key="day.date" class="item"
                :class="{ 'item--active': day.date === selectedDate }" @click="selectedDate = day.date">
                <span class="num">{{ day.dayNumber }}</span>
                <span class="label">{{ day.dayName }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="summary">
        <div class="top-actions">
          <BaseButton iconOnly :icon="Calendar1" :variant="calendarView === 'day' ? 'default' : 'ghost'"
            @click="setCalendarView('day')" size="sm">
          </BaseButton>

          <BaseButton iconOnly :icon="CalendarDays" :variant="calendarView === 'week' ? 'default' : 'ghost'"
            @click="setCalendarView('week')" size="sm">
          </BaseButton>
        </div>
        <SummaryCard :view="calendarView" :calories="calories" :calorie-goal="calorieGoal" :macros="macros"
          :week-summary-message="weekSummaryMessage" @update:view="setCalendarView" />
      </section>

      <section class="meals">
        <h2 class="section-title">Twoje posiłki:</h2>

        <SkeletonLoader v-if="mealStore.isLoading" type="card" :count="2" />
        <Transition v-else name="meal-swap" mode="out-in">
          <DayMeal ref="dayMealRef" v-if="calendarView === 'day'" :date="selectedDate" key="day" />
          <WeekMeal v-else :week-days="weekDays" key="week" />
        </Transition>
      </section>

      <section>
        <TipCard title="Małe co nieco?" text="Dodaj szybką przekąskę, zanim ucieknie z pamięci." :icon="Cookie"
          rotate />
      </section>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
}

.calendar-section {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.day-strip {
  display: flex;
  gap: $s-2;
  overflow-x: auto;
  justify-content: space-around;
  padding: 0;

  .item {
    @include box;
    width: 4rem;
    height: 4.75rem;
    display: flex;
    border-radius: 1.25rem;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 0;
    padding: $s-3 0;
    cursor: pointer;
    opacity: 0;
    animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease;

    &:active {
      transform: scale(0.96);
    }

    &--active {
      background: $green-bg;
      border-color: $primary400;
      color: $text-light;
      box-shadow: $shadow-green !important;
    }

    .num {
      font-weight: 500;
      font-size: $fs-2xl;
      line-height: 1.25;
    }

    .label {
      line-height: 1;
      font-size: $fs-sm;
      text-transform: lowercase;
    }
  }

  @for $i from 1 through 7 {
    .item:nth-child(#{$i}) {
      animation-delay: #{0.3 + $i * 0.05}s;
    }
  }
}

.summary {
  padding: $s-5 $s-5 $s-2;
  position: relative;
}

.meals {
  padding: $s-2 $s-3;
  display: flex;
  flex-direction: column;
  gap: $s-4;

  button {
    width: 100%;
  }
}

.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $s-4;
  width: 100%;
  padding: 0;
  height: 4rem;

  .label {
    max-width: 20rem;
    font-size: $fs-2xl;
    font-weight: 500;
    color: $text;
    text-align: center;
  }
}

.day-strip {
  height: 5rem;
}

.top-actions {
  @include box;
  border-radius: $r-full;
  padding: $s-1;
  display: flex;
  position: absolute;
  z-index: 99;
  top: -0.25rem;
  right: 0;

  button {
    padding: 0 !important;

    &.ghost {
      opacity: .45;
    }

    :deep(svg) {
      stroke-width: 1.65;
      height: 1.5rem !important;
      width: 1.5rem !important;
    }
  }
}

.nav-center {
  display: grid;
  grid-template-rows: auto 0fr;
  justify-items: center;
  gap: 0;
  transition: grid-template-rows 0.3s ease, gap 0.3s ease;

  &.expanded {
    grid-template-rows: auto 1fr;
    gap: $s-1;
  }
}

.today {
  overflow: hidden;
  min-height: 0;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.2s ease;

  .expanded & {
    max-height: 2.5rem;
    opacity: 1;
  }
}

.today-btn {
  color: $primary700 !important;
  height: fit-content !important;
  padding: 0 $s-2 !important;
  flex-direction: row-reverse !important;

  :deep(svg) {
    height: 1rem !important;
    width: 1rem !important;
  }
}

.week-fade-enter-active,
.week-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.week-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.week-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.meal-swap-enter-active,
.meal-swap-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.meal-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.meal-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.day-strip-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  padding: $s-5 0 $s-4;
  transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), padding 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  &.collapsed {
    grid-template-rows: 0fr;
    padding: 0;

    .day-strip-inner {
      opacity: 0;
    }
  }
}

.day-strip-inner {
  overflow: hidden;
  min-height: 0;
  transition: opacity 0.2s ease;
}
</style>