<script setup>
import { ref, computed } from 'vue'
import BaseDropdown from './BaseDropdown.vue'
import BaseButton from './BaseButton.vue'
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: { type: [String, Number, null], default: null },
    options: { type: Array, required: true },
    icon: { type: [Object, Function], default: null },
    placeholder: { type: String, default: 'Wybierz...' },
    label: { type: String, default: '' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    prefix: { type: String, default: '' },
    side: { type: String, default: 'left' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const highlightedIndex = ref(-1)

const normalizedOptions = computed(() =>
    props.options.map((opt) =>
        typeof opt === 'object' && opt !== null ? opt : { label: String(opt), value: opt }
    )
)

const selectedOption = computed(() =>
    normalizedOptions.value.find((opt) => opt.value === props.modelValue)
)

const displayValue = computed(() => {
    if (!selectedOption.value) return props.placeholder
    return props.prefix ? `${props.prefix.trim()} ${selectedOption.value.label}` : selectedOption.value.label
})

function selectOption(opt) {
    if (opt.disabled) return
    emit('update:modelValue', opt.value)
    open.value = false
}

function onKeydown(e) {
    if (!open.value && ['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        open.value = true
        highlightedIndex.value = normalizedOptions.value.findIndex((o) => o.value === props.modelValue)
        return
    }
    if (!open.value) return

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, normalizedOptions.value.length - 1)
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
    } else if (e.key === 'Enter') {
        e.preventDefault()
        const opt = normalizedOptions.value[highlightedIndex.value]
        if (opt) selectOption(opt)
    } else if (e.key === 'Escape') {
        open.value = false
    }
}
</script>

<template>
    <div class="select-group" :class="{ 'is-open': open }">
        <label v-if="label" class="label">{{ label }}</label>

        <BaseDropdown v-model="open" placement="bottom-start" :disabled="disabled" :side="side">
            <template #trigger="{ toggle }">
                <BaseButton type="button" variant="default" :size="size" :disabled="disabled" class="select-trigger"
                    :class="[size, { error, open }]" @click="toggle" @keydown="onKeydown" v-bind="$attrs">
                    <component :is="selectedOption?.icon || icon" v-if="selectedOption?.icon || icon" class="icon" />
                    <span class="value" :class="{ placeholder: !selectedOption }">
                        {{ displayValue }}
                    </span>
                    <ChevronDown class="chevron" />
                </BaseButton>
            </template>

            <template #default>
                <ul class="select-options">
                    <li :data-testid="opt.value" v-for="(opt, index) in normalizedOptions" :key="opt.value"
                        class="option"
                        :class="{ active: opt.value === modelValue, highlighted: index === highlightedIndex, disabled: opt.disabled }"
                        @click="selectOption(opt)" @mouseenter="highlightedIndex = index">
                        <component :is="opt.icon" v-if="opt.icon" class="option-icon" />
                        {{ opt.label }}
                    </li>
                </ul>
            </template>
        </BaseDropdown>
    </div>
</template>
<style lang="scss" scoped>
.select-group {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    gap: $s-1;
    width: 100%;

    &.is-open {
        z-index: $z-dropdown;
    }
}

.label {
    width: 100%;
    padding: 0 $s-3;
    font-size: $fs-base;
    font-weight: 500;
    color: $text;
    opacity: .75;
}

.select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    text-align: left;
    background: $main-bg !important;
    border: 1px solid $border-color;
    border-radius: $r-full;
    box-shadow: none !important;
    transition: border-color .15s ease, box-shadow .15s ease;

    &.open,
    &:focus-visible {
        border-color: $primary500;
        outline: 2px solid $primary200;
    }

    &.error {
        border-color: $error;

        &:focus-visible {
            border-color: $error;
            outline: 2px solid $error-fg;
        }
    }

    &.sm {
        height: 2.75rem;
        padding: $s-3 $s-3;
        padding-right: $s-4;
        gap: $s-2;

        .value {
            font-weight: 500;
            font-size: $fs-base;
        }

        .icon {
            margin-left: -0.3rem;
            width: 1.25rem;
            height: 1.25rem;
        }

        .chevron {
            margin-right: -0.3rem;
            width: 1.25rem;
            height: 1.25rem;
        }
    }

    &.md {
        height: 3.25rem;
        padding: $s-3 $s-5;
        gap: $s-3;

        .value {
            font-size: calc($fs-base * 1.15);
        }

        .icon {
            margin-left: -0.4rem;
            width: 1.5rem;
            height: 1.5rem;
        }

        .chevron {
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
            font-size: calc($fs-lg * 1.15);
        }

        .icon {
            margin-left: -0.4rem;
            width: 1.75rem;
            height: 1.75rem;
        }

        .chevron {
            margin-right: -0.4rem;
            width: 1.75rem;
            height: 1.75rem;
        }
    }
}

.icon {
    flex-shrink: 0;
    color: $text-muted;
}

.value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: -0.01em;
    color: $text;

    &.placeholder {
        color: $text-muted;
    }
}

.chevron {
    flex-shrink: 0;
    color: $text-muted;
    transition: transform .15s ease;

    .open & {
        transform: rotate(180deg);
    }
}

.select-options {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    max-height: 16rem;
    min-width: 12rem;
    width: 100%;
    overflow-y: auto;
    background: $main-bg;
    border: 1px solid $border-color;
    border-radius: $r-xl;
    box-shadow: $shadow;
    margin-top: $s-2;
}

.option {
    display: flex;
    align-items: center;
    gap: $s-3;
    height: 3.5rem;
    padding: $s-3 $s-4;
    border-bottom: 1px solid $border-color;
    font-size: $fs-base;
    font-weight: 400;
    color: $text-muted;
    background-color: transparent;
    cursor: pointer;
    transition: background-color .15s ease;

    .option-icon {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        color: $text-muted;
    }

    &:last-child {
        border-bottom: none;
    }

    &.highlighted {
        background-color: $neutral50;
    }

    &.active {
        background-color: rgba($primary500, 0.1);
        color: $text;
    }

    &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}
</style>