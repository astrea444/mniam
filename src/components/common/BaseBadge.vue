<script setup>
defineProps({
  variant: {
    type: String,
    default: 'gray',
  },
  size: {
    type: String,
    default: 'md',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="badge" :class="[size, variant, { 'icon-only': iconOnly }]">
    <component :is="icon" v-if="icon" class="icon" />
    <slot v-if="!iconOnly" />
  </div>
</template>

<style lang="scss" scoped>
@use "sass:map";

$badge-colors: (
  "yellow": (bg: #fef3c6,
    text: #e17100,
  ),
  "orange": (bg: #ffedd4,
    text: #f54900,
  ),
  "red": (bg: #ffe2e2,
    text: #e7000b,
  ),
  "lime": (bg: #e8f0d6,
    text: #497d00,
  ),
  "primary": (bg: #D9EDD6,
    text: #3E7D31,
  ),
  "green": (bg: #E0F2DA,
    text: #469136,
  ),
  "cyan": (bg: #cefafe,
    text: #007595,
  ),
  "blue": (bg: #dbeafe,
    text: #155dfc,
  ),
  "purple": (bg: #ede9fe,
    text: #7008e7,
  ),
  "pink": (bg: #fce7f3,
    text: #db2777,
  ),
);

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $s-1;
  border-radius: $r-full;
  font-weight: 500;
  white-space: nowrap;

  .icon {
    margin-left: -0.1rem;
  }

  &.sm {
    height: 1.5rem;
    padding: 0 $s-2;
    font-size: $fs-sm;
  }

  &.md {
    height: 1.9rem;
    padding: 0 $s-3;
    font-size: $fs-base;
  }

  &.lg {
    height: $s-10;
    padding: 0 $s-4;
    font-size: $fs-lg;
  }

  &.icon-only {
    padding: 0;
    aspect-ratio: 1;

    .icon {
      margin-left: 0;
    }
  }

  &.gray {
    background: $neutral200;
    color: $text;

    .icon {
      color: $neutral600;
    }
  }

  @each $name, $colors in $badge-colors {
    &.#{$name} {
      background: map.get($colors, bg);
      color: map.get($colors, text);

      .icon {
        color: map.get($colors, text);
      }
    }
  }
}

.badge :deep(.icon) {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
</style>