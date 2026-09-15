<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { PartyPopper, Waves, Drumstick, Wheat } from 'lucide-vue-next'
import { useCountUp, useAnimatedMacros } from '@/composables/useAnimation'

const props = defineProps({
    view: { type: String, default: 'day' },
    calories: { type: Number, default: 0 },
    calorieGoal: { type: Number, default: 2000 },
    fat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    macros: { type: Array, default: null },
    weekSummaryMessage: { type: String, default: 'Świetna robota w tym tygodniu, tak trzymaj!' },
})

const calendarView = computed(() => props.view)

const calories = computed(() => props.calories)
const calorieGoal = computed(() => props.calorieGoal)

const displayMacros = computed(() => {
    if (props.macros && props.macros.length > 0) return props.macros
    return [
        { label: 'Tłuszcz', value: `${props.fat}g`, icon: Waves, color: '#F79009' },
        { label: 'Białko', value: `${props.protein}g`, icon: Drumstick, color: '#F04438' },
        { label: 'Węgl.', value: `${props.carbs}g`, icon: Wheat, color: '#2E90FA' },
    ]
})

const animatedCalories = useCountUp(calories)
const animatedMacros = useAnimatedMacros(displayMacros)

const radius = 190
const size = 290
const center = size / 2

const arcDegrees = 260
const fullCircumference = 2 * Math.PI * radius
const arcLength = fullCircumference * (arcDegrees / 360)
const arcDasharray = `${arcLength} ${fullCircumference}`

const rotationDeg = 270 - arcDegrees / 2

const gaugeOffset = computed(() => {
    const percent = Math.min(calories.value / calorieGoal.value, 1)
    return arcLength * (1 - percent)
})

const animatedOffset = ref(arcLength)

const safeRaf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 0)

onMounted(() => {
    safeRaf(() => {
        animatedOffset.value = gaugeOffset.value
    })
})
const bodyWrapperRef = ref(null)
let previousHeight = 0

function onBeforeLeave() {
    if (bodyWrapperRef.value) {
        previousHeight = bodyWrapperRef.value.offsetHeight
    }
}

function onEnter(el, done) {
    const wrapper = bodyWrapperRef.value
    if (!wrapper) { done(); return }

    const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
        done()
        return
    }

    wrapper.style.height = `${previousHeight}px`
    wrapper.style.overflow = 'hidden'
    void wrapper.offsetHeight

    const newHeight = el.offsetHeight

    safeRaf(() => {
        wrapper.style.transition = 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
        wrapper.style.height = `${newHeight}px`
    })

    const cleanup = (e) => {
        if (e.propertyName !== 'height') return
        wrapper.style.height = ''
        wrapper.style.overflow = ''
        wrapper.style.transition = ''
        wrapper.removeEventListener('transitionend', cleanup)
        done()
    }
    wrapper.addEventListener('transitionend', cleanup)
}
watch(gaugeOffset, (val) => {
    animatedOffset.value = val
})
</script>

<template>
    <div class="card">
        <div class="top">
            <span class="title">{{ calendarView === 'day' ? 'Podsumowanie dnia:' : 'Podsumowanie tygodnia:'
                }}</span>
        </div>

        <div class="body-wrapper" ref="bodyWrapperRef">
            <Transition name="view-swap" mode="out-in" @before-leave="onBeforeLeave" @enter="onEnter">
                <div class="body" v-if="calendarView === 'day'" key="day">
                    <div class="gauge">
                        <svg :viewBox="`0 0 ${size} ${size}`" class="ring">
                            <circle :cx="center" :cy="center" :r="radius" class="track" stroke-width="20"
                                stroke-linecap="round" :stroke-dasharray="arcDasharray"
                                :transform="`rotate(${rotationDeg} ${center} ${center})`" />
                            <circle :cx="center" :cy="center" :r="radius" class="progress" stroke-width="20"
                                stroke-linecap="round" :stroke-dasharray="arcDasharray"
                                :stroke-dashoffset="animatedOffset"
                                :transform="`rotate(${rotationDeg} ${center} ${center})`" />
                        </svg>
                        <div class="center">
                            <span class="label">Kalorie:</span>
                            <span class="value">{{ animatedCalories }} kcal</span>
                        </div>
                    </div>

                    <div class="macros">
                        <div class="item" v-for="(macro, i) in animatedMacros" :key="macro.label"
                            :style="{ animationDelay: `${0.25 + i * 0.1}s` }">
                            <div class="icon" :style="{ color: macro.color }">
                                <component :is="macro.icon" />
                            </div>

                            <span class="label">{{ macro.label }}</span>
                            <span class="value">{{ macro.displayValue }}</span>
                        </div>
                    </div>
                </div>

                <div class="week-summary" v-else key="week">
                    <PartyPopper class="icon" />
                    <p class="text">{{ weekSummaryMessage }}</p>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card {
    width: 100%;
    z-index: 1;
    @include box;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border-radius: 1.4rem;
    padding: 0.4rem;
    height: fit-content;
    position: relative;
    animation: card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);

    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0.8rem;

        .title {
            font-weight: 600;
            letter-spacing: 0;
            font-size: $fs-lg;
        }

    }

    .body {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1.6rem;
        padding: 1.6rem 0.6rem 0.8rem 1.6rem;
        width: 100%;

        .track,
        .progress {
            stroke-width: 2.6rem !important;
        }

        .gauge {
            position: relative;
            width: 6rem;
            height: 6rem;
            flex-shrink: 0;
            margin-left: 0.4rem;
            animation: gauge-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

            .ring {
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            .track {
                fill: none;
                stroke: $neutral200;
                stroke-width: 6.4;
            }

            .progress {
                fill: none;
                stroke: $primary500;
                stroke-width: 6.4;
                stroke-linecap: round;
                transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .center {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: center;
                text-align: center;
                padding: 0 0 0.2rem;
                gap: 0.2rem;

                .label {
                    font-size: $fs-sm;
                    letter-spacing: -0.02em;
                    font-weight: 600;
                    line-height: 1.2;
                }

                .value {
                    font-weight: 500;
                    font-size: $fs-sm;
                    line-height: 1.2;
                    font-family: $font-secondary;
                    font-variant-numeric: tabular-nums;
                }
            }
        }

        .macros {
            display: flex;
            flex-direction: row;
            gap: 0;

            .item {
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: flex-start;
                width: 100%;
                gap: 0.1rem;
                padding: 0 0 0.6rem;
                opacity: 0;
                animation: macro-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                transition: transform 0.2s ease;

                &:hover {
                    transform: translateY(-2.4px);
                }

                .icon svg {
                    width: $fs-2xl;
                    height: $fs-2xl;
                }

                .label {
                    font-size: $fs-sm;
                    margin-top: 0.6rem;
                    font-weight: 600;
                    line-height: 1.2;
                }

                .value {
                    font-weight: 400;
                    font-size: $fs-sm;
                    line-height: 1.2;
                    font-family: $font-secondary;
                    font-variant-numeric: tabular-nums;
                }
            }
        }
    }

    .week-summary {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0 1.2rem 1rem;
        border-radius: $r-lg;

        .icon {
            color: $primary600;
            width: $fs-xl;
            height: $fs-xl;
            flex-shrink: 0;
            animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .text {
            margin: 0;
            font-size: $fs-base;
            font-weight: 500;
            line-height: 1.5;
            color: $text;
        }
    }
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(9.6px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes gauge-in {
    from {
        opacity: 0;
        transform: scale(0.85);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes macro-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pop-in {
    from {
        opacity: 0;
        transform: scale(0.6);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.view-swap-enter-active,
.view-swap-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.view-swap-enter-from {
    opacity: 0;
    transform: translateY(6.4px);
}

.view-swap-leave-to {
    opacity: 0;
    transform: translateY(-6.4px);
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
</style>