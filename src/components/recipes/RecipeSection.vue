<script setup>
import { ref, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import RecipeCard from '@/components/recipes/RecipeCard.vue'

const props = defineProps({
    title: { type: String, required: true },
    icon: { type: [Object, Function], required: true },
    recipes: { type: Array, default: () => [] },
    variant: { type: String, default: 'normal' },
    defaultOpen: { type: Boolean, default: true }
})

defineEmits(['select'])

const isOpen = ref(props.defaultOpen)

const cardVariant = computed(() => (props.recipes.length === 1 ? 'xl' : props.variant))
</script>

<template>
    <section class="recipe-section" :class="{ 'is-collapsed': !isOpen }">
        <button type="button" class="section-header" :aria-expanded="isOpen" @click="isOpen = !isOpen">
            <span class="section-title">
                <component :is="icon" :size="18" class="section-icon" />
                {{ title }}
            </span>
            <ChevronDown :size="18" class="chevron" />
        </button>

        <div class="section-content">
            <div class="row-scroll">
                <RecipeCard v-for="recipe in recipes" :key="recipe.id" :variant="cardVariant"
                    :class="{ 'row-item': cardVariant !== 'xl' }" :recipe="recipe" @click="$emit('select', recipe)" />
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
.recipe-section {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    padding: $s-6 $s-2;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
}

.section-title {
    display: flex;
    align-items: center;
    gap: $s-2;
    font-size: calc($fs-lg * 1.08);
    font-weight: 600;
    color: $text;
}

.section-icon {
    flex-shrink: 0;
    color: $text-muted;
}

.chevron {
    flex-shrink: 0;
    color: $text-muted;
    transition: transform 0.2s ease;
}

.is-collapsed .chevron {
    transform: rotate(-90deg);
}

.section-content {
    display: grid;
    grid-template-rows: 1fr;
    overflow: hidden;
    transition: grid-template-rows 0.25s ease;
    padding-bottom: $s-2;
}

.is-collapsed .section-content {
    grid-template-rows: 0fr;
}

.row-scroll {
    display: flex;
    gap: $s-3;
    overflow-x: scroll;
    min-height: 0;

    &::-webkit-scrollbar {
        display: none;
    }

    .row-item {
        flex: 0 0 10.5rem;
    }
}
</style>