<script setup>
import { computed, h } from 'vue'
import { PhPlus } from '@phosphor-icons/vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { AlertTriangle, Snowflake, Leaf } from 'lucide-vue-next'
import { formatPrepTime } from '@/utils/formatters'
import { getMatchBadge, getExpiryBadge, getDifficultyBadge, getDietBadge, getMissingIngredientBadge, getZeroWasteBadge } from '@/utils/badgeVariants'

const PhPlusBold = (props) => h(PhPlus, { weight: 'bold', ...props })

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'normal',
    validator: (v) => ['normal', 'xl', 'list'].includes(v)
  },
  showAddButton: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const matchBadge = computed(() =>
  props.recipe.matchRate != null ? getMatchBadge(props.recipe.matchRate) : null
)

const expiryBadge = computed(() =>
  props.recipe.expiresLabel ? getExpiryBadge(props.recipe.expiresLabel) : null
)

const zeroWasteBadge = computed(() =>
  props.recipe.zeroWasteLabel ? getZeroWasteBadge(props.recipe.zeroWasteLabel) : null
)

const difficultyBadge = computed(() =>
  props.recipe.difficulty ? getDifficultyBadge(props.recipe.difficulty) : null
)

const missingIngredientBadge = getMissingIngredientBadge()

const dietBadges = computed(() => {
  if (!props.recipe.dietCategories?.length) return []
  return props.recipe.dietCategories.slice(0, 2).map(dietKey => getDietBadge(dietKey))
})
</script>

<template>
  <div class="recipe-card" :class="variant" @click="$emit('click', recipe)">
    <div class="image-wrapper">
      <img :src="recipe.image" :alt="recipe.title" class="image" />

      <BaseBadge v-if="variant === 'xl' && matchBadge" :variant="matchBadge.variant" size="md" class="match">
        {{ matchBadge.text }}
      </BaseBadge>

      <BaseButton v-if="variant === 'xl' && showAddButton" iconOnly :icon="PhPlusBold" variant="green" size="md"
        class="add-btn" aria-label="Dodaj przepis" @click.stop="$emit('click', recipe)">
      </BaseButton>
    </div>

    <div class="info">
      <span class="title">{{ recipe.title }}</span>

      <div class="meta">
        <template v-if="expiryBadge">
          <BaseBadge :variant="expiryBadge.variant" size="sm" class="expiry">
            <AlertTriangle class="icon" />
            {{ expiryBadge.text }}
          </BaseBadge>
        </template>

        <template v-else-if="zeroWasteBadge">
          <BaseBadge :variant="zeroWasteBadge.variant" size="sm">
            <Leaf class="icon" />
            {{ zeroWasteBadge.text }}
          </BaseBadge>
          <BaseBadge variant="gray" size="sm">{{ formatPrepTime(recipe.prepTime) }}</BaseBadge>
        </template>

        <template v-else>
          <BaseBadge v-if="recipe.prepTime" variant="gray" size="sm">{{ formatPrepTime(recipe.prepTime) }}</BaseBadge>
          <BaseBadge v-if="recipe.missingIngredient" :variant="missingIngredientBadge.variant" size="sm">
            {{ missingIngredientBadge.text }}
          </BaseBadge>
          <BaseBadge v-if="difficultyBadge" :variant="difficultyBadge.variant" size="sm">
            {{ difficultyBadge.text }}
          </BaseBadge>
          <BaseBadge v-if="variant !== 'normal'" v-for="badge in dietBadges" :key="badge.text" :variant="badge.variant"
            size="sm">
            {{ badge.text }}
          </BaseBadge>
        </template>
      </div>
    </div>

    <BaseButton v-if="variant === 'list' && showAddButton" iconOnly :icon="PhPlusBold" variant="green" size="sm"
      class="list-add-btn" aria-label="Dodaj przepis" @click.stop="$emit('click', recipe)">
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.recipe-card {
  @include box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  .image-wrapper {
    position: relative;
    width: 100%;
    background: $neutral100;
    margin-bottom: -1rem;

    .badge,
    .btn {
      position: absolute;
      z-index: 2;
    }

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      display: block;
    }
  }

  .info {
    display: flex;
    z-index: 99;
    flex-direction: column;
  }

  .title {
    color: $text;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: center;
  }

  .meta {
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;
    flex-wrap: wrap;
    gap: $s-2;

    .icon {
      width: $fs-sm;
      height: $fs-sm;
    }
  }

  .ingredients-note {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $fs-sm;
    font-weight: 500;
    color: $primary700;
  }

  &.normal {
    border-radius: $r-lg;
    min-width: 12rem;
    padding: calc($s-1 * 1.1) calc($s-1 * 1.1) $s-3;
    gap: $s-2;

    .image-wrapper {
      height: 6.5rem;
      margin: 0;
      border-radius: $r-md;
      overflow: hidden;
    }

    .info {
      padding: 0;
      gap: $s-2;
    }

    .meta {
      justify-content: center;
    }

    .title {
      font-size: calc($fs-base * 0.9);
      line-height: 1.7;
      font-weight: 500;
    }
  }

  &.xl {
    border-radius: $s-6;
    min-width: 25rem;
    width: 100%;

    .image-wrapper {
      height: 11.5rem;

      .image {
        mask-image: linear-gradient(to bottom, rgb(0, 0, 0) 45%, rgba(0, 0, 0, 0.1) 85%, transparent 100%);
      }

      .match {
        top: $s-4;
        left: $s-4;
      }

      .add-btn {
        top: $s-4;
        right: $s-4;
      }
    }

    .info {
      padding: $s-4 $s-5 $s-6;
      gap: $s-4;
      margin-top: -1rem;
    }

    .title {
      font-size: $fs-xl;
      font-weight: 600;
    }
  }

  &.list {
    flex-direction: row;
    align-items: flex-end;
    gap: $s-3;
    height: 8rem;
    border-radius: $r-xl;
    padding: $s-3;

    &:hover {
      border-color: $primary400;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .image-wrapper {
      width: auto;
      height: 100%;
      aspect-ratio: 1/1;
      border-radius: $r-lg;
      overflow: hidden;
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .info {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: $s-1;
      flex: 1;
      overflow: hidden;
      margin-top: 0;
      padding: 0;
    }

    .title {
      font-weight: 700;
      font-size: $fs-base;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
    }

    .meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: $s-2;
      margin-top: 2px;
      justify-content: flex-start;
    }

    .list-add-btn {
      flex-shrink: 0;
    }
  }
}
</style>