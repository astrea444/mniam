<script setup>
import { House, BookOpen, CookingPot, ShoppingCart, Refrigerator, ToolCase, Carrot } from "lucide-vue-next"

const navItems = [
  { name: 'home', label: 'Start', to: '/', icon: House },
  { name: 'pantry', label: 'Spiżarnia', to: '/pantry', icon: Carrot },
  { name: 'shopping-list', label: 'Zakupy', to: '/shopping-list', icon: ShoppingCart },
  { name: 'recipes', label: 'Przepisy', to: '/recipes', icon: BookOpen },
]
</script>

<template>
  <nav class="app-navbar">
    <RouterLink v-for="item in navItems" :key="item.name" :to="item.to" class="item" active-class="item--active">
      <component :is="item.icon" class="icon" />
      <span class="label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
.app-navbar {
  height: $navbar-height;
  background-color: $neutral50;
  border-top: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  z-index: 100;
  flex-shrink: 0;
  border-radius: $fs-3xl $fs-3xl 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.03);

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: $text-muted;
    font-size: 0.75rem;
    font-weight: 500;
    transition: color 0.2s ease, transform 0.2s ease;

    &--active {
      color: $primary600;
    }
  }

  .icon {
    height: $fs-2xl;
    transition: transform 0.2s ease;
  }
}
</style>
