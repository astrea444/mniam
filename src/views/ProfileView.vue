<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhCalendarHeart,
  PhTarget,
  PhNotebook,
} from "@phosphor-icons/vue";
import { Drumstick, Wheat, Droplets, ArrowLeft, PencilLine, Settings as Gear } from "lucide-vue-next";
import BaseButton from '@/components/common/BaseButton.vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import SummaryCard from '@/components/common/SummaryCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EditProfile from '@/components/drawer/EditProfile.vue'
import UserSettings from '@/components/drawer/UserSettings.vue'
import { useUserStore } from '@/stores/userStore'
import { useMealStore } from '@/stores/mealStore'
import { getTodayIso } from '@/utils/dateUtils'

const router = useRouter()
const userStore = useUserStore()
const mealStore = useMealStore()

onMounted(() => {
  mealStore.fetchMeals()
})

const showEditProfile = ref(false)
const showSettings = ref(false)

const statIcons = {
  'planned-days': PhCalendarHeart,
  'favorites': PhTarget,
  'recipes': PhNotebook,
}

const user = computed(() => userStore.profile)
const todayIso = computed(() => getTodayIso())

const dailyNutrition = computed(() => mealStore.calculateDailyNutrition(todayIso.value))
const calories = computed(() => dailyNutrition.value.calories)
const calorieGoal = computed(() => user.value?.calorieGoal || 2000)
const progressStats = computed(() => userStore.progressStats)

const MACRO_DEFS = [
  { label: "Tłuszcz", key: "fat", icon: Droplets, color: "#FDB022" },
  { label: "Białko", key: "protein", icon: Drumstick, color: "#F97066" },
  { label: "Węgl.", key: "carbs", icon: Wheat, color: "#53B1FD" },
]

const macros = computed(() =>
  MACRO_DEFS.map(def => ({
    label: def.label,
    value: `${dailyNutrition.value[def.key]} g`,
    icon: def.icon,
    color: def.color,
  }))
)
</script>

<template>
  <div class="profile-view">
    <div class="view-header">
      <BaseButton class="close" iconOnly :icon="ArrowLeft" variant="default" size="lg" aria-label="Wróć"
        @click="router.back()">
      </BaseButton>
      <h1>Twój profil</h1>
    </div>
    <div class="profile-header">
      <div class="avatar">
        <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
      </div>
      <div class="user-info">
        <h1>{{ user.name }}</h1>
        <span>{{ user.email }}</span>
      </div>
    </div>
    <div class="actions">
      <BaseButton variant="green" size="lg" class="edit" @click="showEditProfile = true">Edytuj profil</BaseButton>
      <BaseButton variant="default" size="lg" @click="showSettings = true">Ustawienia</BaseButton>
    </div>

    <div class="content">
      <SkeletonLoader v-if="mealStore.isLoading" type="card" :count="2" />
      <template v-else>
        <section class="stats-section">
          <SummaryCard view="day" :show-toggle="false" :calories="calories" :calorie-goal="calorieGoal"
            :macros="macros" />
        </section>

        <section class="progress">
          <span class="section-title">Twoje postępy:</span>

          <div class="cards">
            <div class="card" v-for="stat in progressStats" :key="stat.id || stat.label">
              <component :is="statIcons[stat.id] || PhNotebook" weight="duotone" class="icon" />
              <span class="value">{{ stat.value }}
                <span class="label">{{ stat.label }}</span>
              </span>
            </div>
          </div>
        </section>
      </template>
    </div>

    <BaseDrawer v-model="showEditProfile" title="Edytuj profil" :component="EditProfile" :icon="PencilLine" />
    <BaseDrawer v-model="showSettings" title="Ustawienia" :component="UserSettings" :icon="Gear" />
  </div>
</template>

<style lang="scss" scoped>
.profile-view {
  position: relative;

  .view-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0 0.6rem 0.8rem;

    h1 {
      font-size: $fs-2xl;
      font-weight: 600;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .profile-header {
    @include flex-center;
    flex-direction: column;
    padding: 0;
    align-items: center;
    gap: 0.8rem;
    padding-top: 0.8rem;

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      text-align: center;

      h1 {
        font-size: $fs-2xl;
        font-weight: 600;
      }

      span {
        letter-spacing: 0;
        color: $neutral600;
        font-weight: 500;
        font-size: $fs-lg;
      }
    }

    .avatar {
      width: 6.4rem;
      height: 6.4rem;
      border-radius: $r-full;
      position: relative;
      z-index: 9;
      @include flex-center;
      outline: 0.4rem solid white;

      img {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        object-fit: cover;
        position: relative;
        z-index: 2;
      }
    }

  }

  .actions {
    display: flex;
    gap: 0.6rem;
    padding: 2.4rem 0.6rem 2.4rem;

    button {
      flex: 1;
    }
  }

  .content {
    height: 100%;
    width: 100%;
    padding: 0 0.6rem;
  }

  .stats-section {
    padding: 0 !important;
  }

  .progress {
    padding: 2rem 0.6rem 0.8rem;

    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.6rem;
      margin-top: 0.6rem;

      .card {
        @include box;
        border-radius: $r-xl;
        padding: 0.6rem;
        height: 8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        text-align: center;

        .icon {
          width: 2.8rem;
          height: 2.8rem;
          color: $primary500;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.4rem;
        }

        .value {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: $fs-xl;
          font-weight: 600;
          line-height: 1;
          color: $text;

          .label {
            font-size: $fs-base;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>