<script setup>
import { X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'
import { PhSealCheck, PhSmileySad, PhWarning, PhInfo } from '@phosphor-icons/vue';

const { toasts, remove } = useToast()

function handleUndo(toast) {
  if (typeof toast.onUndo === 'function') {
    toast.onUndo()
  } else if (typeof toast.action?.onClick === 'function') {
    toast.action.onClick()
  }
  remove(toast.id)
}
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="container" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.id" class="item toast-item" :class="toast.type" data-testid="toast-item">
      <div class="item-icon">
        <PhSealCheck v-if="toast.type === 'success'" />
        <PhSmileySad v-else-if="toast.type === 'error'" />
        <PhWarning v-else-if="toast.type === 'warning'" />
        <PhInfo v-else />
      </div>

      <div class="toast-content">
        <div v-show="toast.title || toast.type === 'error'" class="title">
          {{ toast.title || (toast.type === 'error' ? 'Błąd' : '') }}
        </div>
        <div v-show="toast.message" class="message">{{ toast.message }}</div>
      </div>

      <button v-if="toast.onUndo || toast.action" type="button" class="undo-btn" @click="handleUndo(toast)"
        data-testid="toast-undo-btn">
        {{ toast.action?.label || 'Cofnij' }}
      </button>

      <BaseButton variant="ghost" :icon="X" iconOnly size="md" aria-label="Zamknij powiadomienie"
        @click="remove(toast.id)">
      </BaseButton>
    </div>
  </TransitionGroup>
</template>


<style lang="scss" scoped>
.container {
  position: fixed;
  top: $s-6;
  right: $s-6;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: $s-4;
  pointer-events: none;
  max-width: calc(100vw - #{$s-8});
  width: 100%;
  max-height: 29dvh;
  overflow: hidden;

  @media (max-width: 640px) {
    top: $s-4;
    right: $s-4;
    left: $s-4;
    width: auto;
  }
}

.item {
  @include box;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: $s-4;
  height: 4.85rem;
  padding: $s-2 $s-3 $s-2 $s-3;
  border-radius: $r-full;
  border: 1px solid $border-color;
  background: $neutral25;
  color: $text;
  font-size: $fs-sm;
  flex-shrink: 0;
  width: 100%;
  line-height: 1.4;

  &.success {
    .item-icon {
      background: $primary100;
      color: $primary700;
    }
  }

  &.error {
    .item-icon {
      background: $error-fg;
      color: $error;
    }
  }

  &.warning {
    .item-icon {
      background: $warning-fg;
      color: $warning;
    }
  }

  &.info {
    .item-icon {
      background: $neutral100;
      color: $neutral700;
    }
  }
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 95%;
  aspect-ratio: 1;
  border-radius: $r-full;
  padding: $s-2;

  svg {
    width: auto;
    height: 100%;
    aspect-ratio: 1/1;
  }
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: $s-1;
  min-width: 0;

  .title {
    font-weight: 600;
    font-size: calc($fs-sm * 1.1);
    color: $text;
    line-height: 1.2;
  }

  .message {
    font-size: $fs-sm;
    color: $text-muted;
    line-height: 1.2;
    word-break: break-word;
  }
}

.undo-btn {
  background: none;
  border: none;
  color: $primary600;
  font-weight: 600;
  font-size: $fs-sm;
  cursor: pointer;
  padding: $s-1 $s-2;
  border-radius: $r-md;
  text-decoration: underline;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: $primary700;
  }
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>