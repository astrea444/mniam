        <script setup>
        import { computed } from 'vue'
        import EmptyState from '@/components/common/EmptyState.vue'
        import { normalizeStep } from '@/utils/recipeFilters'

        const props = defineProps({
            instructions: { type: Array, default: () => [] },
        })

        const steps = computed(() => props.instructions.map(normalizeStep))
</script>
<template>
    <div class="instructions-tab">
        <ol v-if="steps.length" class="list">
            <li v-for="(step, i) in steps" :key="i" class="item">
                <span class="step-left">
                    <strong class="num">{{ i + 1 }}.</strong>{{ step.text }}
                </span>
                <div v-if="step.time" class="step-right">
                    <span class="time">{{ step.time }} min</span>
                </div>
            </li>
        </ol>
        <EmptyState v-else title="Brak instrukcji" description="Brak podanych instrukcji przygotowania." />
    </div>
</template>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-direction: column;
    gap: $s-2;
    list-style: none;
    padding: 0;
    margin: 0;

    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: $s-3;
        padding: $s-2;
        border-bottom: 1px solid $border-color;
        min-height: 3.5rem;
    }
}

.step-left {
    display: flex;
    align-items: flex-start;
    gap: $s-2;
    flex: 1;
    font-size: $fs-base;
    color: $text;
    font-weight: 500;
    line-height: 1.4;

    .num {
        flex-shrink: 0;
        color: $neutral500;
        font-weight: 500;
    }
}

.step-right {
    display: flex;
    align-items: center;
    gap: $s-1;
    flex-shrink: 0;
    color: $text-muted;

    .time {
        font-size: $fs-sm;
        font-weight: 500;
        white-space: nowrap;
    }
}

.empty-text {
    text-align: center;
    padding: $s-4;
    color: $text-muted;
}
</style>
