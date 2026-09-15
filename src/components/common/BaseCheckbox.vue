<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String,
        default: 'md',
    },
    strikethrough: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        default: '',
    },
})

defineEmits(['update:modelValue'])
</script>

<template>
    <label class="checkbox" :class="[size, { disabled, strikethrough }]">
        <input type="checkbox" class="input" :checked="modelValue" :disabled="disabled"
            @change="$emit('update:modelValue', $event.target.checked)" v-bind="$attrs">
        <span class="box">
            <svg class="check" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 6L5.5 10L14.5 1.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>
        <span v-if="label || $slots.default" class="label">
            <slot>{{ label }}</slot>
        </span>
    </label>
</template>

<style lang="scss" scoped>
.checkbox {
    display: inline-flex;
    align-items: center;
    gap: $s-3;
    cursor: pointer;
    padding: $s-2;
    width: 100%;
    user-select: none;

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &.sm {
        height: 1.5rem;

        .box {
            width: 1.25rem;
            height: 1.25rem;
        }

        .label {
            font-size: $fs-sm;
        }
    }

    &.md {
        height: 2.65rem;

        .box {
            width: 1.75rem;
            height: 1.75rem;
        }

        .label {
            font-size: $fs-base;
        }
    }

    &.lg {
        .box {
            width: 2rem;
            height: 2rem;
        }

        .label {
            font-size: $fs-lg;
        }
    }

    .input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;

        &:checked~.box {
            background: $green-bg;
            border-color: transparent;

            .check {
                opacity: 1;
                transform: scale(1);
            }
        }

        &:checked~.label {
            font-weight: 500;
        }

        &:hover:not(:disabled):not(:checked)~.box {
            border-color: $primary400;
        }

        &:active:not(:disabled)~.box {
            transform: translateY(1px);
        }

        &:focus-visible~.box {
            border-color: $primary500;
            outline: 2px solid $primary200;
        }
    }

    .box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: $r-full;
        background: $neutral50;
        border: 1.5px solid $neutral200;
        transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 44px;
            min-height: 44px;
        }
    }

    .check {
        width: 60%;
        height: 60%;
        opacity: 0;
        transform: scale(0.6);
        transition: opacity 0.15s ease, transform 0.15s ease;
        stroke: $text-light;
    }

    .label {
        color: $text;
        line-height: 1.2;
        font-weight: 400;
        transition: color 0.15s ease;
    }

    &.strikethrough .input:checked~.label {
        text-decoration: line-through;
    }
}
</style>