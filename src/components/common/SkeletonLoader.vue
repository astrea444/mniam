<script setup>
defineProps({
  type: {
    type: String,
    default: 'rect',
  },
  count: {
    type: Number,
    default: 1,
  },
  width: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '',
  },
  borderRadius: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="skeleton-group" :class="`skeleton--${type}`" data-testid="skeleton-loader">
    <div v-for="n in count" :key="n" class="skeleton-item" :style="{
      width: width || undefined,
      height: height || undefined,
      borderRadius: borderRadius || undefined,
    }">
      <slot />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.skeleton-group {
  display: flex;
  flex-direction: column;
  gap: $s-3;
  width: 100%;
}

.skeleton-item {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg,
      $neutral200 25%,
      $neutral100 37%,
      $neutral200 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: $r-md;
  min-height: 1.25rem;
}

.skeleton--card .skeleton-item {
  height: 6rem;
  border-radius: $r-xl;
}

.skeleton--list .skeleton-item {
  height: 3.5rem;
  border-radius: $r-lg;
}

.skeleton--text .skeleton-item {
  height: 1rem;
  border-radius: $r-sm;
}

.skeleton--circle .skeleton-item {
  width: 3rem;
  height: 3rem;
  border-radius: $r-full;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
