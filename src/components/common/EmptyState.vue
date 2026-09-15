      
<script setup>
defineProps({
  icon: {
    type: [Object, Function],
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <div class="empty-state">
    <div v-if="icon" class="icon-wrapper">
      <component :is="icon" class="icon" />
    </div>
    <h3 v-if="title" class="title">{{ title }}</h3>
    <p v-if="description" class="description">{{ description }}</p>
    <div v-if="$slots.actions || $slots.default" class="actions">
      <slot name="actions">
        <slot />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: $s-8 $s-4;
  gap: $s-2;
  width: 100%;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: $r-full;
    background: $primary100;
    color: $primary700;
    margin-bottom: $s-2;

    .icon {
      width: 1.75rem;
      height: 1.75rem;
    }
  }

  .title {
    font-size: $fs-lg;
    font-weight: 600;
    color: $text;
    margin: 0;
  }

  .description {
    font-size: $fs-sm;
    color: $text-muted;
    max-width: 18rem;
    margin: 0;
    line-height: 1.4;
  }

  .actions {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    gap: $s-3;
    margin-top: $s-8;

    :deep(button) {
      width: 100%;
    }
  }
}
</style>
