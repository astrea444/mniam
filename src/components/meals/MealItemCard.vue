<script setup>
import { useMealStore } from '@/stores/mealStore'
import { Check } from 'lucide-vue-next'
import BaseBadge from '@/components/common/BaseBadge.vue'

const props = defineProps({
    meal: {
        type: Object,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
})

const mealStore = useMealStore()
</script>

<template>
    <div class="meal-item meal-item-card" data-testid="meal-item-card"
        :class="{ eaten: mealStore.isEaten(date, meal.slot) }">
        <div class="thumb"><img :src="meal.recipe?.image" alt="" />
            <Transition name="pop">
                <Check v-if="mealStore.isEaten(date, meal.slot)" class="eaten-icon" />
            </Transition>
        </div>
        <div class="info">
            <span class="name">
                {{ meal.title }}
            </span>
            <div class="meta">
                <BaseBadge variant="gray" size="md">{{ meal.time }}</BaseBadge>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.meal-item {
    @include box;
    padding: calc($s-2 * 1.1);
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 7.5rem;
    gap: $s-3;
    border-radius: $s-6;
    opacity: 0;
    cursor: pointer;
    animation: item-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;

    &:hover {
        transform: translateY(-2px);
    }

    &:active {
        transform: scale(0.985);
    }

    @for $i from 1 through 8 {
        &:nth-child(#{$i}) {
            animation-delay: #{$i * 0.07}s;
        }
    }

    .thumb {
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: 100%;
        aspect-ratio: 1/1;
        position: relative;
        border-radius: $r-md;
        overflow: hidden;
        flex-shrink: 0;

        .eaten-icon {
            width: 2.5rem;
            height: 2.5rem;
            padding: $s-1;
            color: $primary50;
            background: $green-bg;
            border-radius: $r-full;
            flex-shrink: 0;
            z-index: 99;
            vertical-align: middle;
            margin-left: $s-1;
        }

        img {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 1;
            transition: opacity 0.35s ease;
        }
    }


    .info {
        height: 100%;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        justify-content: space-around;
        align-items: flex-start;

        .name {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
            font-size: calc($fs-base * 1.1);
        }

        .meta {
            width: 100%;
            display: flex;
            gap: $s-2;
            margin-top: $s-2;
        }
    }

    &.eaten {
        opacity: 0.65;
        border-color: $primary300;
        background: $primary50;

        .thumb img {
            opacity: 0.4;
        }
    }
}

@keyframes item-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.pop-enter-active {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.pop-enter-from {
    opacity: 0;
    transform: scale(0.4);
}

.pop-leave-active {
    transition: opacity 0.15s ease;
}

.pop-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
</style>