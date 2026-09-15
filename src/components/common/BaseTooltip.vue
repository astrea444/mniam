<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    icon: {
        type: [Object, Function],
        default: null,
    },
    iconColor: {
        type: String,
        default: 'currentColor',
    },
    text: {
        type: String,
        required: true,
    },
    direction: {
        type: String,
        default: 'top',
        validator: (val) => ['top', 'bottom', 'left', 'right'].includes(val),
    },
    arrowPosition: {
        type: String,
        default: 'start',
        validator: (val) => ['start', 'center'].includes(val),
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val),
    },
})

const emit = defineEmits(['close', 'click-outside'])

const tooltipRef = ref(null)
const isVisible = ref(true)

watch(() => props.text, () => {
    isVisible.value = true
})

function handleClickOutside(event) {
    if (tooltipRef.value && !tooltipRef.value.contains(event.target)) {
        isVisible.value = false
        emit('click-outside', event)
        emit('close')
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handleClickOutside)
})
</script>

<template>
    <div v-if="isVisible" ref="tooltipRef" class="tooltip" :class="[direction, `arrow-${arrowPosition}`, size]" role="tooltip" v-bind="$attrs">
        <component :is="icon" v-if="icon" class="tooltip-icon" :style="{ color: iconColor }" />
        <span class="tooltip-text">{{ text }}</span>
    </div>
</template>

<style lang="scss" scoped>
$arrow: 7px;

.tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: $s-2;
    padding: $s-3;
    min-height: $s-10;
    background: $neutral100;
    border: 1px solid $neutral300;
    border-radius: $r-md;
    box-shadow: $shadow;
    white-space: nowrap;

    .tooltip-icon {
        flex-shrink: 0;
        width: calc($fs-xl * 1.1);
        height: calc($fs-xl * 1.1);
    }

    .tooltip-text {
        font-size: $fs-xl;
        font-weight: 500;
        color: $text;
        line-height: 1.5;
    }

    &::before,
    &::after {
        content: '';
        position: absolute;
        border: $arrow solid transparent;
    }

    &.top,
    &.bottom {

        &::before,
        &::after {
            left: $s-5;
            transform: translateX(-50%);
        }
    }

    &.arrow-center.top,
    &.arrow-center.bottom {

        &::before,
        &::after {
            left: 50%;
        }
    }

    &.left,
    &.right {

        &::before,
        &::after {
            top: $s-5;
            transform: translateY(-50%);
        }
    }

    &.arrow-center.left,
    &.arrow-center.right {

        &::before,
        &::after {
            top: 50%;
        }
    }

    &.top {
        &::before {
            bottom: 100%;
            border-bottom-color: $neutral300;
        }

        &::after {
            bottom: calc(100% - 1px);
            border-width: 0 ($arrow - 1px) ($arrow - 1px) ($arrow - 1px);
            border-bottom-color: $neutral100;
        }
    }

    &.bottom {
        &::before {
            top: 100%;
            border-top-color: $neutral300;
        }

        &::after {
            top: calc(100% - 1px);
            border-width: ($arrow - 1px) ($arrow - 1px) 0 ($arrow - 1px);
            border-top-color: $neutral100;
        }
    }

    &.left {
        &::before {
            right: 100%;
            border-right-color: $neutral300;
        }

        &::after {
            right: calc(100% - 1px);
            border-width: ($arrow - 1px) ($arrow - 1px) ($arrow - 1px) 0;
            border-right-color: $neutral100;
        }
    }

    &.right {
        &::before {
            left: 100%;
            border-left-color: $neutral300;
        }

        &::after {
            left: calc(100% - 1px);
            border-width: ($arrow - 1px) 0 ($arrow - 1px) ($arrow - 1px);
            border-left-color: $neutral100;
        }
    }

    &.sm .tooltip-text {
        font-size: $fs-sm;
    }

    &.md .tooltip-text {
        font-size: $fs-base;
    }

    &.lg .tooltip-text {
        font-size: $fs-lg;
    }
}
</style>