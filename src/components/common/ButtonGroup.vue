<script setup>
import { ref, computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
    modelValue: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const internalActive = ref(props.options?.[0]?.value || null)

const currentActive = computed(() => {
    return props.modelValue !== null && props.modelValue !== undefined
        ? props.modelValue
        : internalActive.value
})

function select(val) {
    internalActive.value = val
    emit('update:modelValue', val)
    emit('change', val)
}
</script>

<template>
    <div class="btn-group">
        <BaseButton v-for="o in options" :key="o.value" :variant="currentActive === o.value ? 'default' : 'ghost'"
            :size="o.size" :icon="o.icon" :icon-only="o.iconOnly" :disabled="o.disabled"
            :aria-label="o.iconOnly ? o.label : null" @click="select(o.value)">
            <template v-if="!o.iconOnly">{{ o.label }}</template>
        </BaseButton>
    </div>
</template>

<style lang="scss" scoped>
.btn-group {
    @include box;
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0;
    border-radius: $r-full;
    overflow: hidden;

    button {
        position: relative;
        flex-shrink: unset !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 100%;
        border: none !important;

        &:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            width: 1px;
            height: 100%;
            background-color: $border-color;
        }

        &.icon-only {
            width: auto;
            flex: 0 0 auto;
        }
    }
}
</style>