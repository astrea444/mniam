<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeft, PencilLine, Star } from 'lucide-vue-next'
import { PhStar } from '@phosphor-icons/vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ButtonGroup from '@/components/common/ButtonGroup.vue'
import MealPortionTracker from '@/components/meals/MealPortionTracker.vue'
import MealPlanForm from '@/components/meals/MealPlanForm.vue'
import IngredientsTab from '@/components/meals/IngredientsTab.vue'
import InstructionsTab from '@/components/meals/InstructionsTab.vue'
import { useMealStore } from '@/stores/mealStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import { getDifficultyBadge, getMatchBadge, getDietBadge } from '@/utils/badgeVariants'
import { formatCalories, formatPrepTime } from '@/utils/formatters'

const props = defineProps({
    meal: { type: Object, required: true },
    date: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save-plan'])

const mealStore = useMealStore()
const toast = useToast()

const activeTab = ref('ingredients')
const portionMultiplier = ref(1.0)
const deductFromPantry = ref(true)

const tabOptions = [
    { label: 'Składniki', size: 'lg', value: 'ingredients' },
    { label: 'Instrukcje', size: 'lg', value: 'instructions' },
]

const macroDefs = [
    { key: 'calories', label: 'Kalorie', unit: ' kcal', primary: true },
    { key: 'protein', label: 'Białko', unit: 'g' },
    { key: 'carbs', label: 'Węgle', unit: 'g' },
    { key: 'fat', label: 'Tłuszcz', unit: 'g' },
]

const recipe = computed(() => props.meal?.recipe ?? props.meal ?? null)
const mealSlot = computed(() => props.meal?.slot ?? null)

const isFav = computed(() =>
    recipe.value ? mealStore.isFavorite(recipe.value.id) : false
)

function toggleFav() {
    if (!recipe.value) return
    const willBeFav = !isFav.value
    mealStore.toggleFavorite(recipe.value.id)
    if (willBeFav) {
        toast.success('Ulubione', TOAST.FAVORITES.ADDED(recipe.value.title))
    } else {
        toast.info('Ulubione', TOAST.FAVORITES.REMOVED(recipe.value.title))
    }
}

const difficultyBadge = computed(() =>
    recipe.value?.difficulty ? getDifficultyBadge(recipe.value.difficulty) : null
)

const matchBadge = computed(() => {
    const percent = recipe.value?.matchRate
    return percent != null ? getMatchBadge(percent) : null
})


function syncPortion() {
    if (props.date && mealSlot.value && mealStore.isEaten(props.date, mealSlot.value)) {
        portionMultiplier.value = mealStore.getEatenPortion(props.date, mealSlot.value)
    } else {
        portionMultiplier.value = 1.0
    }
}

watch([() => props.meal, () => props.date], () => {
    syncPortion()
    activeTab.value = 'ingredients'
}, { immediate: true })

function scale(val) {
    return Math.round(Number(val || 0) * portionMultiplier.value * 10) / 10
}

const scaledMacros = computed(() => ({
    calories: scale(recipe.value?.calories),
    protein: scale(recipe.value?.protein),
    carbs: scale(recipe.value?.carbs),
    fat: scale(recipe.value?.fat),
}))

const scaledIngredients = computed(() =>
    (recipe.value?.ingredients ?? []).map(ing => ({ ...ing, amount: scale(ing.amount) }))
)
</script>

<template>
    <div class="meal-details" data-testid="meal-details">
        <div class="hero">
            <img :src="recipe?.image" :alt="recipe?.title" class="image" />
            <div class="actions">
                <BaseButton class="close" data-testid="meal-details-close-btn" iconOnly :icon="ArrowLeft"
                    variant="default" size="md" @click="emit('close')">
                </BaseButton>
                <BaseButton class="action" data-testid="meal-details-favorite-btn" :data-favorited="isFav" iconOnly
                    variant="default" size="md" @click="toggleFav">
                    <PhStar :weight="isFav ? 'fill' : 'bold'" class="btn-icon" />
                </BaseButton>
            </div>
        </div>

        <div class="content">
            <h2 class="title" data-testid="meal-details-title">{{ recipe?.title }}</h2>
            <div class="meta">
                <BaseBadge size="lg" variant="gray">{{ formatPrepTime(recipe?.prepTime) }}</BaseBadge>
                <BaseBadge v-if="difficultyBadge" size="lg" :variant="difficultyBadge.variant">
                    {{ difficultyBadge.text }}</BaseBadge>
                <BaseBadge v-if="matchBadge" size="lg" :variant="matchBadge.variant">{{ matchBadge.text }}
                </BaseBadge>
            </div>
            <div class="macros">
                <div v-for="m in macroDefs" :key="m.key" class="macro" :class="{ primary: m.primary }"
                    :data-testid="'meal-details-macro-' + m.key">
                    <span class="value">{{ m.key === 'calories' ? formatCalories(scaledMacros.calories) :
                        `${scaledMacros[m.key]}${m.unit}` }}</span>
                    <span class="label">{{ m.label }}</span>
                </div>
            </div>

            <MealPortionTracker v-if="props.date && mealSlot" data-testid="meal-details-portion-tracker"
                :recipe="recipe" :date="props.date" :slot="mealSlot" :portion-multiplier="portionMultiplier"
                :deduct-from-pantry="deductFromPantry" @update:portion-multiplier="portionMultiplier = $event"
                @update:deduct-from-pantry="deductFromPantry = $event" />

            <MealPlanForm v-else data-testid="meal-details-plan-form" :recipe="recipe"
                @save-plan="emit('save-plan', $event)" @close="emit('close')" />

            <div class="section tab-section" data-testid="meal-details-tabs">
                <ButtonGroup v-model="activeTab" :options="tabOptions" />

                <IngredientsTab v-if="activeTab === 'ingredients'" :ingredients="scaledIngredients" />
                <InstructionsTab v-else-if="activeTab === 'instructions'" :instructions="recipe?.instructions ?? []" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.hero {
    position: relative;
    width: 100%;
    height: 16rem;
    overflow: hidden;

    .image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        object-fit: cover;
        border-radius: $r-xl;
        mask-image: linear-gradient(to bottom, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0.1) 80%, transparent 100%);
    }

    .actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        gap: $s-3;
        padding: $s-3;
        z-index: 999;

        .close {
            margin-right: auto;
        }

        .btn-icon {
            color: #f59e0b;
            width: 1.75rem;
            height: 1.75rem;
        }
    }
}

.content {
    padding: $s-6 $s-4 $s-8;

    .title {
        font-size: calc($fs-xl * 1.2);
        font-weight: 600;
        color: $text;
        margin-bottom: $s-3;
    }

    .meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: $s-6;
        gap: $s-3;
    }

    .diet-tags {
        display: flex;
        flex-wrap: wrap;
        gap: $s-3;
        margin-bottom: $s-6;
    }

    .macros {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $s-2;
        margin-bottom: $s-5;

        .macro {
            @include box;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: $r-xl;
            height: 4.95rem;
            gap: $s-2;
            transition: all 0.2s ease;

            &.primary {
                flex: 1.35;
                background: $primary100;
                border-color: $primary200;
            }

            .value {
                font-size: $fs-xl;
                font-weight: 600;
                line-height: 1;
                transition: transform 0.15s ease;
            }

            .label {
                font-size: $fs-base;
                line-height: 1;
                font-weight: 400;
            }
        }
    }

    .tab-section {
        display: flex;
        flex-direction: column;
        gap: $s-4;
        margin-bottom: $s-6;
    }
}
</style>