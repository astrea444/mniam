import { ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import {
  getWeekDays,
  formatDateLong,
  getWeekRangeLabel,
  getTodayIso,
} from "@/utils/dateUtils";

export function useDate(initialDate = null, now = new Date()) {
  const userStore = useUserStore();
  const selectedDate = ref(initialDate || getTodayIso(now));
  const currentWeekStart = ref(new Date(selectedDate.value));

  const weekStartsOn = computed(() => userStore.profile?.weekStartsOn || "monday");
  const weekDays = computed(() => getWeekDays(currentWeekStart.value, now, weekStartsOn.value));
  const weekRangeLabel = computed(() => getWeekRangeLabel(weekDays.value));
  const selectedDateLabel = computed(() => formatDateLong(selectedDate.value));

  const weekContainsToday = computed(() =>
    weekDays.value.some((day) => day.isToday),
  );
  const showTodayButton = computed(
    () => !weekContainsToday.value || selectedDate.value !== getTodayIso(now),
  );

  function goToPreviousWeek() {
    const d = new Date(currentWeekStart.value);
    d.setDate(d.getDate() - 7);
    currentWeekStart.value = d;
  }

  function goToNextWeek() {
    const d = new Date(currentWeekStart.value);
    d.setDate(d.getDate() + 7);
    currentWeekStart.value = d;
  }

  function goToToday() {
    const todayIso = getTodayIso(now);
    selectedDate.value = todayIso;
    currentWeekStart.value = new Date(todayIso);
  }

  function selectDate(date) {
    selectedDate.value = date;
  }

  return {
    selectedDate,
    currentWeekStart,
    weekDays,
    weekRangeLabel,
    selectedDateLabel,
    showTodayButton,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    selectDate,
  };
}
