<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppNavbar from './AppNavbar.vue'

const route = useRoute()
const mainRef = ref(null)

watch(() => route.path, () => {
  if (mainRef.value) {
    mainRef.value.scrollTo({ top: 0 })
  }
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main ref="mainRef">
      <slot></slot>
    </main>
    <AppNavbar />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;

  main {
    flex: 1;
    overflow-y: auto;
    padding: 0 $s-6 $s-8;
  }

}
</style>
