<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'md',
  },
  icon: {
    type: [Object, Function, Boolean],
    default: null,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])
</script>

<template>
  <button class="btn" :class="[size, variant, { 'icon-only': iconOnly || icon === true }]" :type="type"
    :disabled="disabled" @click="$emit('click', $event)" v-bind="$attrs">
    <slot />
    <component :is="icon" v-if="icon && icon !== true" class="btn-icon" />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $r-full;
  font-family: inherit;
  flex-shrink: 0;
  font-weight: 400;
  line-height: 1;
  width: fit-content;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
  height: 3.25rem;
  padding: $s-3 $s-5;
  gap: $s-3;
  font-size: calc($fs-base * 1.15);

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid $primary200;
  }

  &.sm {
    height: 2.75rem;
    padding: $s-3 $s-4;
    gap: $s-1;
    font-size: $fs-sm;

    .btn-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    :deep(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &.md {
    height: 3.25rem;
    padding: $s-3 $s-5;
    gap: $s-3;
    font-size: calc($fs-base * 1.15);

    .btn-icon {
      width: 1.4rem;
      height: 1.4rem;
    }

    :deep(svg) {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  &.lg {
    height: 3.75rem;
    padding: $s-3 $s-6;
    gap: $s-4;
    font-size: calc($fs-lg * 1.15);

    .btn-icon {
      width: 1.65rem;
      height: 1.65rem;
    }

    :deep(svg) {
      width: 1.75rem;
      height: 1.75rem;
    }
  }

  &.icon-only {
    aspect-ratio: 1/1 !important;
    gap: 0;
    padding: 0;

    &::after {
      content: '';
      position: absolute;
      inset: -0.4rem;
    }

    &.sm {
      width: 2.75rem;
    }

    &.md {
      width: 3.25rem;
    }

    &.lg {
      width: 3.75rem;
    }
  }

  &.default {
    background: $btn-bg;
    border: 1px solid $border-color;
    color: $text;
    box-shadow: $shadow-light;

    &:hover:not(:disabled) {
      background: $neutral200;
    }
  }

  &.green {
    background: $green-bg;
    color: $text-light;
    box-shadow: $shadow-green !important;

    &:hover:not(:disabled) {
      filter: brightness(1.05);
    }
  }

  &.red {
    background: linear-gradient(180deg, #F04438 0%, #D92D20 100%);
    color: #ffffff;
    box-shadow: $shadow-dark !important;

    &:hover:not(:disabled) {
      filter: brightness(1.05);
    }
  }

  &.ghost {
    background: transparent;
    color: $text;
    box-shadow: none !important;
  }
}

.btn-icon {
  flex-shrink: 0;
}

.btn :deep(svg) {
  flex-shrink: 0;
}
</style>