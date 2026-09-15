<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    closeOnClickOutside: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    side: { type: String, default: 'left' },
})

const emit = defineEmits(['update:modelValue'])
const rootRef = ref(null)

function toggle() {
    if (props.disabled) return
    emit('update:modelValue', !props.modelValue)
}

function close() {
    emit('update:modelValue', false)
}

function removeListeners() {
    document.removeEventListener('pointerdown', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
}

function handleClickOutside(e) {
    if (rootRef.value?.contains(e.target)) return
    close()
}

function handleEscape(e) {
    if (e.key === 'Escape') close()
}

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        if (props.closeOnClickOutside) document.addEventListener('pointerdown', handleClickOutside)
        if (props.closeOnEscape) document.addEventListener('keydown', handleEscape)
    } else {
        removeListeners()
    }
}, { immediate: true })

onBeforeUnmount(removeListeners)

defineExpose({ close, toggle })
</script>

<template>
    <div ref="rootRef" class="dropdown" :class="{ 'is-open': modelValue }">
        <slot name="trigger" :open="modelValue" :toggle="toggle" />
        <Transition name="dropdown">
            <div v-if="modelValue" class="dropdown-panel" :class="side">
                <slot :close="close" />
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.dropdown {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    width: 100%;

    &.is-open {
        z-index: $z-dropdown;
    }
}

.dropdown-panel {
    position: absolute;
    top: 100%;
    z-index: $z-dropdown;
    min-width: 100%;

    &.left {
        left: 0;
        right: auto;
        transform-origin: top left;
    }

    &.right {
        right: 0;
        left: auto !important;
        transform-origin: top right;
    }
}

.dropdown-enter-active {
    transition: opacity .18s cubic-bezier(0.16, 1, 0.3, 1),
        transform .4s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-leave-active {
    transition: opacity .12s ease-in,
        transform .12s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-14px) scaleY(0.7);
}
</style>