<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import BaseButton from './BaseButton.vue'
import BaseSelect from './BaseSelect.vue'

defineOptions({ name: 'BaseDateSelect', inheritAttrs: false })
const root = ref(null)
const popover = ref(null)
const yearPickerRoot = ref(null)
const props = defineProps({
    modelValue: {
        type: Date,
        default: null,
    },
    icon: {
        type: [Object, Function],
        default: () => Calendar,
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Wybierz datę',
    },
    size: {
        type: String,
        default: 'md',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    error: {
        type: Boolean,
        default: false,
    },
    minDate: {
        type: Date,
        default: null,
    },
    maxDate: {
        type: Date,
        default: null,
    },
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const isSundayStart = computed(() => userStore.profile?.weekStartsOn === 'sunday')

const id = `date-select-${Math.random().toString(36).slice(2, 9)}`

const isOpen = ref(false)
const yearOpen = ref(false)

const today = startOfDay(new Date())
const viewDate = ref(startOfDay(props.modelValue || new Date()))
const selectedDate = ref(props.modelValue ? startOfDay(props.modelValue) : null)

const weekDays = computed(() => isSundayStart.value
    ? ['ND', 'PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB']
    : ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND']
)

const monthLabel = computed(() => {
    const label = viewDate.value.toLocaleDateString('pl-PL', { month: 'long' })
    return label.charAt(0).toUpperCase() + label.slice(1)
})

const yearLabel = computed(() => viewDate.value.getFullYear())

const yearOptions = computed(() => {
    const base = viewDate.value.getFullYear()
    return Array.from({ length: 12 }, (_, i) => base - 6 + i)
})

const displayValue = computed(() =>
    selectedDate.value ? formatDate(selectedDate.value) : ''
)

const days = computed(() => {
    const year = viewDate.value.getFullYear()
    const month = viewDate.value.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const startOffset = isSundayStart.value
        ? firstOfMonth.getDay()
        : (firstOfMonth.getDay() + 6) % 7
    const gridStart = new Date(year, month, 1 - startOffset)

    return Array.from({ length: 42 }, (_, i) => {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + i)

        return {
            date,
            label: date.getDate(),
            outside: date.getMonth() !== month,
            isToday: isSameDay(date, today),
            isSelected: isSameDay(date, selectedDate.value),
            disabled: isOutOfRange(date),
        }
    })
})

watch(() => props.modelValue, (value) => {
    selectedDate.value = value ? startOfDay(value) : null
})

function startOfDay(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

function isSameDay(a, b) {
    return !!a && !!b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}

function isOutOfRange(date) {
    if (props.minDate && date < startOfDay(props.minDate)) return true
    if (props.maxDate && date > startOfDay(props.maxDate)) return true
    return false
}

function pad(n) {
    return String(n).padStart(2, '0')
}

function formatDate(date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

function open() {
    if (props.disabled) return
    viewDate.value = new Date(selectedDate.value || today)
    isOpen.value = true
    nextTick(() => {
        popover.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
}
function close() {
    isOpen.value = false
    yearOpen.value = false
}

function toggle() {
    isOpen.value ? close() : open()
}

function prevMonth() {
    viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}

function nextMonth() {
    viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

function toggleYearPicker() {
    yearOpen.value = !yearOpen.value
}

function selectYear(year) {
    viewDate.value = new Date(year, viewDate.value.getMonth(), 1)
    yearOpen.value = false
}

function selectDay(day) {
    if (day.disabled) return
    selectedDate.value = day.date
    emit('update:modelValue', day.date)
    close()
}

function selectToday() {
    const date = new Date(today)
    selectedDate.value = date
    viewDate.value = new Date(today)
    emit('update:modelValue', date)
    close()
}

function onClickOutside(event) {
    if (root.value && !root.value.contains(event.target)) close()
}

function onYearClickOutside(event) {
    if (yearPickerRoot.value && !yearPickerRoot.value.contains(event.target)) {
        yearOpen.value = false
    }
}

function onKeydown(event) {
    if (event.key === 'Escape') close()
}

watch(isOpen, (value) => {
    if (value) {
        document.addEventListener('click', onClickOutside)
        document.addEventListener('keydown', onKeydown)
    } else {
        document.removeEventListener('click', onClickOutside)
        document.removeEventListener('keydown', onKeydown)
    }
})

watch(yearOpen, (value) => {
    if (value) {
        document.addEventListener('click', onYearClickOutside)
    } else {
        document.removeEventListener('click', onYearClickOutside)
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('click', onYearClickOutside)
})
</script>

<template>
    <div class="date-select" :class="{ 'is-open': isOpen }" ref="root">
        <label v-if="label" class="label" :for="id">{{ label }}</label>

        <button :id="id" class="field" type="button" :class="[size, { open: isOpen, error }]" :disabled="disabled"
            aria-haspopup="dialog" :aria-expanded="isOpen" @click="toggle" v-bind="$attrs">
            <span class="value" :class="{ placeholder: !displayValue }">
                {{ displayValue || placeholder }}
            </span>
            <component :is="icon" v-if="icon" class="icon" />
        </button>

        <Transition name="popover">
            <div v-if="isOpen" ref="popover" class="popover calendar-dropdown" role="dialog" :aria-hidden="!isOpen">
                <div class="calendar-header">
                    <BaseButton size="md" variant="ghost" iconOnly :icon="ChevronLeft" class="nav-arrow"
                        aria-label="Poprzedni miesiąc" @click="prevMonth">
                    </BaseButton>

                    <div class="month-year">
                        <span class="month-label">{{ monthLabel }}</span>
                        <div class="year-picker" ref="yearPickerRoot">
                            <BaseSelect :model-value="viewDate.getFullYear()" :options="yearOptions" size="sm"
                                @update:model-value="selectYear" />
                        </div>
                    </div>

                    <BaseButton size="md" variant="ghost" iconOnly :icon="ChevronRight" class="nav-arrow"
                        aria-label="Następny miesiąc" @click="nextMonth">
                    </BaseButton>
                </div>

                <div class="weekdays">
                    <span v-for="day in weekDays" :key="day">{{ day }}</span>
                </div>

                <div class="days">
                    <button v-for="(day, i) in days" :key="i" type="button" class="day"
                        :class="{ outside: day.outside, today: day.isToday, selected: day.isSelected }"
                        :disabled="day.disabled" @click="selectDay(day)">
                        {{ day.label }}
                    </button>
                </div>

                <div class="divider"></div>

                <div class="footer">
                    <BaseButton variant="green" size="md" class="today-btn" @click="selectToday">Dzisiaj</BaseButton>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.date-select {
    position: relative;
    width: 100%;
    font-family: inherit;

    &.is-open {
        z-index: $z-dropdown;
    }

    .label {
        display: block;
        margin-bottom: $s-2;
        padding: 0 $s-3;
        font-size: $fs-base;
        font-weight: 500;
        color: $text;
        opacity: .75;
    }

    .field {
        display: flex;
        align-items: center;
        width: 100%;
        background: $main-bg;
        border: 1px solid $border-color;
        border-radius: $r-full;
        box-shadow: none !important;
        color: $text;
        font-family: inherit;
        cursor: pointer;
        transition: border-color .15s ease, box-shadow .15s ease;

        &.open,
        &:focus-visible {
            outline: 2px solid $primary200;
        }

        &.error {
            border-color: $error;

            &:focus-visible {
                box-shadow: $shadow, 0 0 0 3px rgba($error, 0.15);
            }
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &.sm {
            height: 2.75rem;
            padding: $s-3 $s-4;
            gap: $s-2;

            .value {
                font-size: $fs-sm;
            }

            .icon {
                margin-right: -0.3rem;
                width: 1.25rem;
                height: 1.25rem;
            }
        }

        &.md {
            height: 3.25rem;
            padding: $s-2 $s-5;
            gap: $s-3;

            .value {
                font-size: calc($fs-base * 1.15) !important;
                padding-top: 2px;
            }

            .icon {
                margin-right: -0.4rem;
                width: 1.5rem;
                height: 1.5rem;
            }
        }

        &.lg {
            height: 3.75rem;
            padding: $s-3 $s-6;
            gap: $s-4;

            .value {
                font-size: calc($fs-lg * 1.15) !important;
            }

            .icon {
                margin-right: -0.4rem;
                width: 1.65rem;
                height: 1.65rem;
            }
        }

        .icon {
            flex-shrink: 0;
            color: $text;
            opacity: 0.4;
        }

        .value {
            flex: 1;
            text-align: left;
            line-height: 1.2;
            color: $text;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &.placeholder {
                color: $text-muted;
            }
        }
    }

    .popover {
        position: absolute;
        top: calc(100% + #{$s-3});
        left: 0;
        z-index: $z-dropdown;
        width: 100%;
        min-width: 320px;
        padding: $s-2 $s-3;
        margin-bottom: $s-6;
        scroll-margin-bottom: $s-6;
        background: $main-bg;
        border: 1px solid $border-color;
        border-radius: $fs-2xl;
        box-shadow: $shadow;

        &-enter-active,
        &-leave-active {
            transition: opacity 0.15s ease, transform 0.15s ease;
        }

        &-enter-from,
        &-leave-to {
            opacity: 0;
            transform: translateY(-$s-1);
        }

        .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: $s-3;

            .nav-arrow {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                color: $primary500;
            }

            .month-year {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: $s-3;

                .month-label {
                    font-size: $fs-base;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                    color: $text;
                    text-transform: capitalize;
                }

                .year-picker {
                    position: relative;
                    width: 6.5rem;
                }
            }
        }

        .weekdays {
            display: grid;
            grid-template-columns: repeat(7, 36px);
            justify-content: space-between;
            margin-bottom: $s-1;

            span {
                display: flex;
                align-items: center;
                justify-content: center;
                height: $s-8;
                font-size: $fs-sm;
                font-weight: 600;
                color: $text;
                opacity: .5;
                text-transform: uppercase;
            }
        }

        .days {
            display: grid;
            grid-template-columns: repeat(7, 36px);
            justify-content: space-between;
            row-gap: $s-1;

            .day {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                font-family: inherit;
                font-size: calc($fs-base * 1.15);
                font-weight: 400;
                color: $text;
                background-color: transparent;
                border: none;
                border-radius: $r-full;
                cursor: pointer;
                transition: background-color 0.15s ease, color 0.15s ease;

                &:hover:not(:disabled) {
                    background-color: $neutral100;
                }

                &.outside {
                    color: $neutral400;
                }

                &.today {
                    background-color: $primary100;
                    color: $primary700;
                }

                &.selected {
                    background-color: $primary500;
                    color: $text-light;

                    &:hover {
                        background-color: $primary700;
                    }
                }

                &:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
            }
        }

        .divider {
            height: 1px;
            margin: $s-3 0;
            background-color: $border-color;
        }

        .footer {
            display: flex;
            justify-content: flex-start;
        }
    }
}
</style>