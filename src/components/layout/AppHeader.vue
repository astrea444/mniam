<script setup>
import { ref, computed } from 'vue'
import { BellRing, } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseDropdown from '@/components/common/BaseDropdown.vue'
import NotifsPanel from '@/components/common/NotifsPanel.vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const showNotifications = ref(false)

const user = computed(() => userStore.profile)
const notifications = computed(() => userStore.profile.notifications || [])
const hasNotifications = computed(() => notifications.value.length > 0)
const recentNotifications = computed(() => notifications.value.slice(0, 10))
</script>

<template>
  <header class="app-header">
    <div class="user">
      <div class="avatar" @click="router.push('/profile')">
        <img :src="user.avatar" :alt="user.name" />
      </div>
      <div class="info">
        <span class="name">{{ user.name }}</span>
        <span class="email">{{ user.email }}</span>
      </div>
    </div>
    <BaseDropdown v-model="showNotifications" side="right" class="bell-dropdown">
      <template #trigger="{ toggle }">
        <BaseButton class="bell" size="lg" iconOnly :icon="BellRing" variant="default" @click="toggle">
          <Transition name="dot-pulse">
            <span v-if="hasNotifications" class="dot" />
          </Transition>
        </BaseButton>
      </template>

      <template #default>
        <NotifsPanel :notifications="recentNotifications" @remove="userStore.removeNotification" />
      </template>
    </BaseDropdown>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  min-height: calc($navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: $s-8 $s-8 $s-12;
  flex-shrink: 0;

  .user {
    display: flex;
    align-items: center;
    gap: $s-4;
  }

  .avatar {
    width: 4rem;
    height: 4rem;
    border-radius: $r-full;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: $s-2;
    height: fit-content;

    .name {
      letter-spacing: -0.02em;
      line-height: 1;
      font-size: $fs-xl;
      font-weight: 600;
      color: $text;
    }

    .email {
      letter-spacing: 0;
      font-size: $fs-base;
      color: $text;
      opacity: .7;
      font-weight: 500;
      line-height: 1;
    }
  }

  .bell-dropdown {
    width: auto;
  }

  .bell {
    position: relative;

    .dot {
      position: absolute;
      top: 0.1rem;
      right: -0.1rem;
      width: 1rem;
      height: 1rem;
      border-radius: $r-full;
      background: $error;
      border: 1.5px solid $error-fg;
    }
  }
}

@keyframes dot-pulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style>