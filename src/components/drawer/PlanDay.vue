<script setup>
import { ref, onBeforeUnmount, h } from 'vue'
import { PhPlus } from '@phosphor-icons/vue'
import { ArrowLeft, ArrowRight, NotebookPen, RefreshCw, X } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import { formatPrepTime } from '@/utils/formatters'

const PhPlusBold = (props) => h(PhPlus, { weight: 'bold', ...props })

const props = defineProps({
    slots: { type: Array, required: true },
    selectedMeals: { type: Object, required: true },
    currentDateLabel: { type: String, required: true },
    hasAnyMealSelected: { type: Boolean, default: false }
})

const emit = defineEmits([
    'prev-day',
    'next-day',
    'open-recipe-selection',
    'remove-slot',
    'add-custom',
    'save-plan',
    'reorder-slots',
    'close'
])

function isExtraSlot(key) {
    return key.startsWith('extra-')
}

const DRAG_THRESHOLD = 6
const DROP_HYSTERESIS = 6

const dragFromIndex = ref(null)
const dropPosition = ref(null)
const draggedKey = ref(null)
const dragStartY = ref(0)
const dragCurrentY = ref(0)
const boxRectsSnapshot = ref([])
const shiftAmount = ref(0)

const boxEls = new Map()
let pendingDrag = null

function setBoxRef(el, key) {
    if (el) boxEls.set(key, el)
    else boxEls.delete(key)
}

function getBoxRectsSnapshot() {
    return props.slots.map(s => {
        const el = boxEls.get(s.key)
        const rect = el.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom, center: rect.top + rect.height / 2 }
    })
}

function computeShiftAmount(rects, fromIdx) {
    if (rects.length < 2) return 0
    const draggedHeight = rects[fromIdx].bottom - rects[fromIdx].top
    let gap = 12
    for (let i = 0; i < rects.length - 1; i++) {
        const g = rects[i + 1].top - rects[i].bottom
        if (g > 0) {
            gap = g
            break
        }
    }
    return draggedHeight + gap
}

function computeDropPosition(clientY, rects, currentPos) {
    let pos = currentPos ?? rects.length
    while (pos < rects.length && clientY > rects[pos].center + DROP_HYSTERESIS) {
        pos++
    }
    while (pos > 0 && clientY < rects[pos - 1].center - DROP_HYSTERESIS) {
        pos--
    }
    return pos
}

function getBoxShift(idx) {
    if (dragFromIndex.value === null || dropPosition.value === null) return 0
    if (idx === dragFromIndex.value) return 0

    const from = dragFromIndex.value
    const pos = dropPosition.value
    const targetIdx = pos > from ? pos - 1 : pos

    if (idx > from && idx <= targetIdx) return -shiftAmount.value
    if (idx < from && idx >= targetIdx) return shiftAmount.value
    return 0
}

function onDropAt(pos) {
    if (dragFromIndex.value === null) return
    const fromIdx = dragFromIndex.value
    if (pos !== fromIdx && pos !== fromIdx + 1) {
        const targetIdx = pos > fromIdx ? pos - 1 : pos
        emit('reorder-slots', { fromIdx, targetIdx })
    }
}

function onPointerDown(e, idx) {
    if (e.pointerType === 'mouse' && e.button !== 0) return

    pendingDrag = {
        idx,
        key: props.slots[idx].key,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        el: e.currentTarget,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
}

function beginDrag() {
    const { idx, key, pointerId, el, startY } = pendingDrag
    dragFromIndex.value = idx
    draggedKey.value = key
    dragStartY.value = startY
    dragCurrentY.value = startY
    boxRectsSnapshot.value = getBoxRectsSnapshot()
    shiftAmount.value = computeShiftAmount(boxRectsSnapshot.value, idx)
    dropPosition.value = idx
    try {
        el.setPointerCapture?.(pointerId)
    } catch (_) { /* noop */ }
}

function onPointerMove(e) {
    if (!pendingDrag) return

    if (dragFromIndex.value === null) {
        const dx = e.clientX - pendingDrag.startX
        const dy = e.clientY - pendingDrag.startY
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        beginDrag()
    }

    e.preventDefault()
    dragCurrentY.value = e.clientY
    dropPosition.value = computeDropPosition(e.clientY, boxRectsSnapshot.value, dropPosition.value)
}

function onPointerUp() {
    endDrag()
}

function endDrag() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)

    try {
        pendingDrag?.el?.releasePointerCapture?.(pendingDrag.pointerId)
    } catch (_) { /* noop */ }

    if (dragFromIndex.value !== null && dropPosition.value !== null) {
        onDropAt(dropPosition.value)
    }

    dragFromIndex.value = null
    draggedKey.value = null
    dropPosition.value = null
    boxRectsSnapshot.value = []
    shiftAmount.value = 0
    pendingDrag = null
}

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<template>
    <div class="plan-view" data-testid="plan-view">
        <div class="plan-header">
            <h2>Planowanie dnia</h2>
            <BaseButton class="close" data-testid="plan-close-btn" iconOnly :icon="X" variant="default" size="md"
                @click="$emit('close')">
            </BaseButton>
        </div>

        <div class="date-nav">
            <BaseButton iconOnly :icon="ArrowLeft" variant="default" size="sm" aria-label="Poprzedni dzień"
                data-testid="plan-prev-day-btn" @click="$emit('prev-day')">
            </BaseButton>
            <span class="date-label" data-testid="plan-date-label">{{ currentDateLabel }}</span>
            <BaseButton iconOnly :icon="ArrowRight" variant="default" size="sm" aria-label="Następny dzień"
                data-testid="plan-next-day-btn" @click="$emit('next-day')">
            </BaseButton>
        </div>

        <div class="boxes-list">
            <div v-for="(slot, idx) in slots" :key="slot.key" class="meal-box"
                :class="{ filled: selectedMeals[slot.key], dragging: draggedKey === slot.key }"
                :data-slot-key="slot.key" data-testid="meal-slot" data-swipe-ignore="true"
                :ref="el => setBoxRef(el, slot.key)" :style="draggedKey === slot.key
                    ? { transform: `translateY(${dragCurrentY - dragStartY}px)` }
                    : (getBoxShift(idx) ? { transform: `translateY(${getBoxShift(idx)}px)` } : null)"
                @pointerdown="onPointerDown($event, idx)">
                <div class="drag-handle" />

                <template v-if="selectedMeals[slot.key]">
                    <img :src="selectedMeals[slot.key].image" :alt="selectedMeals[slot.key].title" class="thumb" />
                    <div class="info">
                        <span class="title">{{ selectedMeals[slot.key].title }}</span>
                        <div class="meta">
                            <BaseBadge variant="gray" size="md">{{ formatPrepTime(selectedMeals[slot.key].prepTime) }}
                            </BaseBadge>
                        </div>
                    </div>
                    <BaseButton iconOnly :icon="RefreshCw" variant="green" size="sm" aria-label="Zmień przepis"
                        data-testid="meal-slot-change-btn" @click.stop="$emit('open-recipe-selection', slot.key)">
                    </BaseButton>
                    <BaseButton v-if="isExtraSlot(slot.key)" iconOnly :icon="X" variant="default" size="sm"
                        aria-label="Usuń dodatkowy posiłek" data-testid="meal-slot-remove-btn"
                        @click.stop="$emit('remove-slot', slot.key)">
                    </BaseButton>
                </template>

                <template v-else>
                    <div class="icon-circle">
                        <NotebookPen />
                    </div>
                    <span class="label">{{ slot.label }}</span>
                    <BaseButton iconOnly :icon="PhPlusBold" variant="green" size="sm" aria-label="Dodaj posiłek"
                        data-testid="meal-slot-add-btn" @click.stop="$emit('open-recipe-selection', slot.key)">
                    </BaseButton>
                    <BaseButton v-if="isExtraSlot(slot.key)" iconOnly :icon="X" variant="default" size="sm"
                        aria-label="Usuń dodatkowy posiłek" data-testid="meal-slot-remove-btn"
                        @click.stop="$emit('remove-slot', slot.key)">
                    </BaseButton>
                </template>
            </div>
        </div>

        <div class="plan-footer">
            <BaseButton variant="default" size="lg" data-testid="plan-add-custom-btn" @click="$emit('add-custom')">
                Dodaj kolejny
            </BaseButton>
            <BaseButton variant="green" size="lg" data-testid="plan-save-btn" :disabled="!hasAnyMealSelected"
                @click="$emit('save-plan')">
                Zapisz zmiany
            </BaseButton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.plan-view {
    padding: $s-4 $s-1 $s-1;
    display: flex;
    flex-direction: column;
    gap: $s-6;
    min-height: 50rem;
    height: 100%;

    .plan-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $s-3;
        padding: 0 $s-2;

        h2 {
            font-size: $fs-2xl;
            font-weight: 600;
            color: $text;
            margin: 0;
        }
    }
}

.date-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-4;
    width: 100%;
    padding: $s-4 $s-2;

    .date-label {
        text-transform: capitalize;
        font-weight: 500;
        font-size: calc($fs-xl * 1.21);
        color: $text;
        max-width: 16rem;
        letter-spacing: -0.02em;
        text-align: center;
    }
}

.boxes-list {
    display: flex;
    flex-direction: column;
    padding: 0 $s-2;
    height: 100%;
    flex: 1;
    gap: $s-3;
}

.meal-box {
    @include box;
    position: relative;
    display: flex;
    align-items: center;
    gap: $s-3;
    border-radius: $r-full;
    height: 4.5rem;
    width: 100%;
    padding: $s-2;
    cursor: grab;
    touch-action: none;
    user-select: none;
    transition: opacity 0.15s ease, box-shadow 0.15s ease, transform 0.18s ease;

    &.dragging {
        cursor: grabbing;
        z-index: 5;
        opacity: 0.94;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
        transition: none;
    }

    .drag-handle {
        width: 40px;
        height: 4px;
        background-color: $neutral300;
        border-radius: $r-full;
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
    }

    &.filled {
        align-items: flex-end;
        border-radius: 2rem;
        height: 8rem;
        padding: $s-3;

        img {
            height: 100%;
            width: auto;
            border-radius: 1.1rem;
            aspect-ratio: 1/1;
        }
    }

    .icon-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: 100%;
        aspect-ratio: 1/1;
        border-radius: $r-full;
        background: $neutral200;
        color: $neutral400;
        padding: $s-3;
        flex-shrink: 0;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    .thumb {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: $r-lg;
        object-fit: cover;
        flex-shrink: 0;
    }

    .label {
        flex: 1;
        font-weight: 500;
        font-size: $fs-lg;
        color: $text;
    }

    .info {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        gap: $s-1;
        overflow: hidden;

        .title {
            font-weight: 500;
            font-size: calc($fs-base * 1.1);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: $s-2;
        }
    }
}

.plan-footer {
    display: flex;
    gap: $s-3;
    margin-top: auto;

    button {
        flex: 1;
    }
}
</style>
