<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    component: {
        type: [Object, Function, String],
        default: null,
    },
    componentProps: {
        type: Object,
        default: () => ({}),
    },
    height: {
        type: String,
        default: 'default',
    },
    title: {
        type: String,
        default: '',
    },
    icon: {
        type: [Object, Function],
        default: null,
    },
})

const emit = defineEmits(['update:modelValue', 'save-plan'])

const activeComponent = computed(() => props.component)
const activeProps = computed(() => props.componentProps)

const drawerClass = computed(() => {
    if (props.height === 'fit') return 'drawer--fit'
    if (['sm', 'md', 'lg', 'xl', 'full'].includes(props.height)) {
        return `drawer--${props.height}`
    }
    return ''
})

const drawerStyle = computed(() => {
    if (props.height && !['default', 'auto', 'fit', 'sm', 'md', 'lg', 'xl', 'full'].includes(props.height)) {
        return { height: props.height, minHeight: props.height }
    }
    return null
})

let touchStartY = null
let touchStartX = 0

function onTouchStart(e) {
    if (e.touches.length !== 1) return

    if (e.target.closest('[data-swipe-ignore]')) {
        touchStartY = null
        return
    }

    touchStartY = e.touches[0].clientY
    touchStartX = e.touches[0].clientX
}

function onTouchEnd(e) {
    if (touchStartY === null) return
    if (e.changedTouches.length === 1) {
        const deltaY = e.changedTouches[0].clientY - touchStartY
        const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX)
        if (deltaY > 60 && deltaY > deltaX * 1.2) {
            close()
        }
    }
    touchStartY = null
}

function onKeydown(e) {
    if (e.key === 'Escape' && props.modelValue) {
        close()
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
})

function close() {
    emit('update:modelValue', false)
}

function handleSavePlan(payload) {
    emit('save-plan', payload)
    close()
}
</script>

<template>
    <Teleport to="body">
        <Transition name="overlay-fade">
            <div v-if="modelValue" class="overlay" @click="close" />
        </Transition>

        <Transition name="drawer-slide">
            <div v-if="modelValue" v-bind="$attrs" :class="['drawer', drawerClass]" :style="drawerStyle" role="dialog"
                aria-modal="true" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
                <div v-if="title" class="drawer-header">
                    <div class="drawer-header__left">
                        <component :is="icon" v-if="icon" :size="22" class="drawer-header__icon" />
                        <h2>{{ title }}</h2>
                    </div>
                    <BaseButton iconOnly variant="default" size="md" @click="close" aria-label="Zamknij" :icon="X">
                    </BaseButton>
                </div>
                <component :is="activeComponent" v-if="activeComponent" v-bind="activeProps" @close="close"
                    @save-plan="handleSavePlan" />
                <slot v-else />
            </div>
        </Transition>
    </Teleport>
</template>


<style lang="scss" scoped>
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: $z-drawer-overlay;
    touch-action: none;
}

.drawer {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: $z-drawer;
    background: $neutral50;
    border-radius: $r-2xl $r-2xl 0 0;
    padding: $s-4;
    height: 65rem;
    max-height: 94vh;
    overflow-y: auto;
    scrollbar-width: none;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);

    &::-webkit-scrollbar {
        display: none;
    }

    &--fit {
        height: auto;
    }

    &--sm {
        height: 50vh;
        min-height: 50vh;
    }

    &--md {
        height: 65vh;
        min-height: 65vh;
    }

    &--lg {
        height: 75vh;
        min-height: 75vh;
    }

    &--xl {
        height: 85vh;
        min-height: 85vh;
    }

    &--full {
        height: 94vh;
        min-height: 94vh;
    }
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $s-6;
    padding: $s-2 $s-4;

    &__left {
        display: flex;
        align-items: center;
        gap: $s-3;
    }

    &__icon {
        color: $neutral500;
        height: $fs-3xl;
        width: $fs-3xl;
    }

    h2 {
        font-size: $fs-2xl;
        font-weight: 600;
        color: $text;
        margin: 0;
    }
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 0.28s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
    transform: translateY(100%);
}
</style>