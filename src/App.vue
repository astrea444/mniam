<template>
  <AppLayout>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppLayout>
  <ToastContainer />
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>
