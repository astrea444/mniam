<script setup>
import { BellOff } from 'lucide-vue-next'
import EmptyState from '@/components/common/EmptyState.vue'
import { PhSealCheck, PhSmileySad, PhWarning, PhInfo, PhX } from '@phosphor-icons/vue'

defineProps({
    notifications: {
        type: Array,
        default: () => []
    }
})

defineEmits(['remove'])

const itemType = (item) => (typeof item === 'object' ? item.type : null)
const itemText = (item) => (typeof item === 'object' ? (item.text || item.message || item.title) : item)
</script>

<template>
    <div class="notifications-panel">
        <div class="header">
            <h3>Powiadomienia</h3>
        </div>

        <TransitionGroup v-if="notifications.length" name="notif" tag="div" class="list">
            <div v-for="(item, idx) in notifications" :key="item.id || idx" class="item" :class="itemType(item)">
                <div class="icon">
                    <PhSealCheck v-if="itemType(item) === 'success'" />
                    <PhSmileySad v-else-if="itemType(item) === 'error'" />
                    <PhWarning v-else-if="itemType(item) === 'warning'" />
                    <PhInfo v-else />
                </div>

                <div class="content">
                    <span class="title">{{ itemText(item) }}</span>
                    <span v-if="item.time" class="time">{{ item.time }}</span>
                </div>

                <button class="dismiss" @click="$emit('remove', item.id ?? idx)" aria-label="Usuń powiadomienie">
                    <PhX />
                </button>
            </div>
        </TransitionGroup>

        <EmptyState v-else :icon="BellOff" description="Brak nowych powiadomień" />
    </div>
</template>

<style lang="scss" scoped>
.notifications-panel {
    @include box;
    width: 88vw;
    max-width: 88vw;
    max-height: 24rem;
    min-height: 15rem;
    overflow: hidden;
    border-radius: $r-xl;
    margin-top: $s-4;
    padding: $s-3 0;
    display: flex;
    flex-direction: column;
    gap: $s-2;

    .header {
        padding: $s-3 $s-6;
        width: 100%;

        h3 {
            font-size: $fs-lg;
            font-weight: 600;
            color: $text;
            margin: 0;
        }
    }

    .list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        width: 100%;
        gap: $s-1;
        mask-image: linear-gradient(to bottom, black 80%, transparent 99%);
        -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 99%);
        padding-bottom: $s-8;
        position: relative;

        .notif-move,
        .notif-enter-active,
        .notif-leave-active {
            transition: all 0.3s ease;
        }

        .notif-enter-from {
            opacity: 0;
            transform: translateY(-10px);
        }

        .notif-leave-to {
            opacity: 0;
            transform: translateX(20px);
        }

        .notif-leave-active {
            position: absolute;
            width: 100%;
        }
    }

    .item {
        display: flex;
        align-items: center;
        gap: $s-4;
        padding: $s-3 $s-5;
        width: 100%;
        border-bottom: 1px solid $neutral200;
        transition: background 0.15s ease;
        position: relative;

        .dismiss {
            flex-shrink: 0;
            background: none;
            border: none;
            color: $text-muted;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: $r-full;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;

            &:hover {
                background: $neutral100;
                color: $text;
            }

            svg {
                width: 100%;
                height: 100%;
            }

            &:hover {
                background: $neutral50;
            }
        }

        &.success .icon {
            background: $primary100;
            color: $primary700;
        }

        &.error .icon {
            background: $error-fg;
            color: $error;
        }

        &.warning .icon {
            background: $warning-fg;
            color: $warning;
        }
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        flex-shrink: 0;
        border-radius: $r-full;
        padding: $s-2;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: $s-1;
        min-width: 0;

        .title {
            font-size: $fs-sm;
            color: $text;
            line-height: 1.3;
        }

        .time {
            font-size: $fs-2xs;
            color: $text-muted;
        }
    }
}
</style>