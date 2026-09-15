<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="view-header">
    <div class="header-left">
      <slot name="left" />
      <div class="header-text">
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        <slot name="subtitle-bottom" />
      </div>
    </div>
    <slot />
  </div>
</template>