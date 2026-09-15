<script setup>
import { ref, computed, watch } from 'vue'
import BaseTooltip from './BaseTooltip.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: {
        type: [Number, Array],
        required: true,
    },
    min: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: 100,
    },
    step: {
        type: Number,
        default: 1,
    },
    size: {
        type: String,
        default: 'md',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    showTooltip: {
        type: String,
        default: 'drag',
    },
    formatValue: {
        type: Function,
        default: (val) => val,
    },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isRange = computed(() => Array.isArray(props.modelValue))

const track = ref(null)
const activeThumb = ref(null)
const hoveredThumb = ref(null)

const values = ref(isRange.value ? [...props.modelValue] : [props.modelValue])

watch(
    () => props.modelValue,
    (val) => {
        if (activeThumb.value) return
        values.value = isRange.value ? [...val] : [val]
    }
)

function clampToStep(val) {
    const stepped = Math.round((val - props.min) / props.step) * props.step + props.min
    return Math.min(props.max, Math.max(props.min, stepped))
}

function valueToPercent(val) {
    return ((val - props.min) / (props.max - props.min)) * 100
}

function percentToValue(percent) {
    const raw = props.min + (percent / 100) * (props.max - props.min)
    return clampToStep(raw)
}

const minPercent = computed(() => (isRange.value ? valueToPercent(values.value[0]) : 0))
const maxPercent = computed(() =>
    isRange.value ? valueToPercent(values.value[1]) : valueToPercent(values.value[0])
)

function percentFromEvent(event) {
    const rect = track.value.getBoundingClientRect()
    const percent = ((event.clientX - rect.left) / rect.width) * 100
    return Math.min(100, Math.max(0, percent))
}

function emitUpdate(commit = false) {
    const payload = isRange.value ? [...values.value] : values.value[0]
    emit('update:modelValue', payload)
    if (commit) emit('change', payload)
}

function startDrag(thumb, event) {
    if (props.disabled) return
    activeThumb.value = thumb
    track.value.setPointerCapture(event.pointerId)
}

function onTrackPointerDown(event) {
    if (props.disabled) return
    const value = percentToValue(percentFromEvent(event))

    if (!isRange.value) {
        values.value[0] = value
        startDrag('single', event)
    } else {
        const distMin = Math.abs(value - values.value[0])
        const distMax = Math.abs(value - values.value[1])
        if (distMin <= distMax) {
            values.value[0] = Math.min(value, values.value[1])
            startDrag('min', event)
        } else {
            values.value[1] = Math.max(value, values.value[0])
            startDrag('max', event)
        }
    }
    emitUpdate()
}

function onPointerMove(event) {
    if (!activeThumb.value) return
    const value = percentToValue(percentFromEvent(event))

    if (activeThumb.value === 'single') {
        values.value[0] = value
    } else if (activeThumb.value === 'min') {
        values.value[0] = Math.min(value, values.value[1])
    } else {
        values.value[1] = Math.max(value, values.value[0])
    }
    emitUpdate()
}

function endDrag() {
    if (!activeThumb.value) return
    activeThumb.value = null
    emitUpdate(true)
}

function onThumbKeydown(thumb, event) {
    if (props.disabled) return
    const idx = thumb === 'max' ? 1 : 0
    let delta = 0

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
            delta = props.step
            break
        case 'ArrowLeft':
        case 'ArrowDown':
            delta = -props.step
            break
        case 'PageUp':
            delta = props.step * 10
            break
        case 'PageDown':
            delta = -props.step * 10
            break
        case 'Home':
            values.value[idx] = props.min
            emitUpdate(true)
            return
        case 'End':
            values.value[idx] = props.max
            emitUpdate(true)
            return
        default:
            return
    }

    event.preventDefault()
    let next = clampToStep(values.value[idx] + delta)
    if (isRange.value) {
        next = idx === 0 ? Math.min(next, values.value[1]) : Math.max(next, values.value[0])
    }
    values.value[idx] = next
    emitUpdate(true)
}

function tooltipVisible(thumb) {
    if (props.showTooltip === 'none') return false
    if (props.showTooltip === 'always') return true
    return activeThumb.value === thumb || hoveredThumb.value === thumb
}
</script>

<template>
    <div class="slider" :class="[size, { disabled }]" v-bind="$attrs">
        <div ref="track" class="slider-track" @pointerdown="onTrackPointerDown" @pointermove="onPointerMove"
            @pointerup="endDrag" @pointercancel="endDrag">
            <div class="slider-fill" :style="{
                left: (isRange ? minPercent : 0) + '%',
                width: maxPercent - (isRange ? minPercent : 0) + '%',
            }" />

            <div v-if="isRange" class="slider-thumb" :class="{ active: activeThumb === 'min' }"
                :style="{ left: minPercent + '%' }" role="slider" :tabindex="disabled ? -1 : 0" :aria-valuemin="min"
                :aria-valuemax="max" :aria-valuenow="values[0]" :aria-disabled="disabled"
                @pointerdown.stop="startDrag('min', $event)" @keydown="onThumbKeydown('min', $event)"
                @mouseenter="hoveredThumb = 'min'" @mouseleave="hoveredThumb = null">
                <BaseTooltip v-if="tooltipVisible('min')" class="slider-value-tooltip" direction="bottom"
                    :text="String(formatValue(values[0]))" />
            </div>

            <div class="slider-thumb" :class="{ active: activeThumb === (isRange ? 'max' : 'single') }"
                :style="{ left: maxPercent + '%' }" role="slider" :tabindex="disabled ? -1 : 0" :aria-valuemin="min"
                :aria-valuemax="max" :aria-valuenow="isRange ? values[1] : values[0]" :aria-disabled="disabled"
                @pointerdown.stop="startDrag(isRange ? 'max' : 'single', $event)"
                @keydown="onThumbKeydown(isRange ? 'max' : 'single', $event)"
                @mouseenter="hoveredThumb = isRange ? 'max' : 'single'" @mouseleave="hoveredThumb = null">
                <BaseTooltip v-if="tooltipVisible(isRange ? 'max' : 'single')" class="slider-value-tooltip"
                    direction="bottom" arrow-position="center"
                    :text="String(formatValue(isRange ? values[1] : values[0]))" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.slider {
    width: 100%;

    &.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
}

.slider-track {
    position: relative;
    width: 100%;
    border-radius: $r-full;
    background: $neutral200;
    touch-action: none;
    cursor: pointer;
}

.slider-fill {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: $r-full;
    background: $green-bg;
    pointer-events: none;
}

.slider-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: $r-full;
    background: $neutral100;
    border: 1px solid $neutral300;
    box-shadow: $shadow;
    cursor: grab;
    touch-action: none;
    user-select: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translate(-50%, -50%) scale(1.08);
    }

    &.active {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.12);
        transition: none;
    }

    &:focus-visible {
        outline: 2px solid $primary200;
        outline-offset: 2px;
    }
}

.slider-value-tooltip {
    position: absolute;
    bottom: calc(100% + #{$s-3});
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
}

.slider.sm {
    .slider-track {
        height: 0.75rem;
    }

    .slider-thumb {
        width: 1rem;
        height: 1rem;
    }
}

.slider.md {

    .slider-track {
        height: 1rem;
    }

    .slider-thumb {
        width: 2rem;
        height: 2rem;
    }
}

.slider.lg {
    .slider-track {
        height: 0.625rem;
    }

    .slider-thumb {
        width: 2.5rem;
        height: 2.5rem;
    }
}
</style>