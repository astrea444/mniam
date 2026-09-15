<script setup>
import { ref } from 'vue'
import {
    ChevronRight, Download, HelpCircle, Star, LogOut, Bell, Languages, Ruler, CalendarDays, Check
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useMealStore } from '@/stores/mealStore'
import { resetAllStores } from '@/stores'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'

const emit = defineEmits(['close'])

const userStore = useUserStore()
const mealStore = useMealStore()
const toast = useToast()

const languages = [
    { code: 'pl', label: 'Polski', flag: 'pl' },
    { code: 'en', label: 'English', flag: 'en' },
]
const weekStartOptions = [
    { code: 'monday', label: 'Poniedziałek' },
    { code: 'sunday', label: 'Niedziela' },
]
const units = [
    { code: 'metric', label: 'Metryczne (kg, cm)' },
    { code: 'imperial', label: 'Imperialne (lb, ft)' },
]

const language = ref(languages.find(l => l.code === userStore.profile?.language) || languages[0])
const weekStart = ref(weekStartOptions.find(w => w.code === userStore.profile?.weekStartsOn) || weekStartOptions[0])
const unit = ref(units.find(u => u.code === userStore.profile?.units) || units[0])
const notificationsEnabled = ref(userStore.profile?.notificationsEnabled ?? true)

const openDropdown = ref(null)

function toggleDropdown(key) {
    openDropdown.value = openDropdown.value === key ? null : key
}

function selectOption(item, opt) {
    item.selected.value = opt
    openDropdown.value = null
    item.onSelect(opt)
}

function toggleNotifications() {
    notificationsEnabled.value = !notificationsEnabled.value
    userStore.updateProfile({ notificationsEnabled: notificationsEnabled.value })
}

function handleExportData() {
    const data = {
        profile: userStore.profile,
        mealPlan: mealStore.mealPlan,
        recipes: mealStore.recipes,
        favorites: mealStore.favorites,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'moje-dane.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Ustawienia', TOAST.SETTINGS.DATA_EXPORTED)
}

function handleHelpCenter() {
    toast.success('Centrum pomocy', 'Ta funkcja pojawi się wkrótce')
}

function handleRateApp() {
    toast.success('Oceń aplikację', 'Ta funkcja pojawi się wkrótce')
}

function handleLogout() {
    if (confirm('Czy na pewno chcesz się wylogować? Zapisane dane zostaną wyczyszczone.')) {
        resetAllStores()
        emit('close')
    }
}

const sections = [
    {
        title: 'Preferencje',
        items: [
            {
                key: 'notifications', type: 'toggle', icon: Bell, label: 'Powiadomienia',
                checked: notificationsEnabled, onToggle: toggleNotifications,
            },
            {
                key: 'weekStart', type: 'select', icon: CalendarDays, label: 'Początek tygodnia',
                options: weekStartOptions, selected: weekStart,
                onSelect: (opt) => userStore.updateProfile({ weekStartsOn: opt.code }),
            },
            {
                key: 'language', type: 'select', icon: Languages, label: 'Język',
                options: languages, selected: language,
                onSelect: (opt) => userStore.updateProfile({ language: opt.code }),
            },
        ],
    },
    {
        title: 'Aplikacja',
        items: [
            {
                key: 'units', type: 'select', icon: Ruler, label: 'Jednostki miary',
                options: units, selected: unit,
                onSelect: (opt) => userStore.updateProfile({ units: opt.code }),
            },
            { key: 'export', type: 'link', icon: Download, label: 'Eksportuj dane', onClick: handleExportData },
            { key: 'help', type: 'link', icon: HelpCircle, label: 'Centrum pomocy', onClick: handleHelpCenter },
            { key: 'rate', type: 'link', icon: Star, label: 'Oceń aplikację', onClick: handleRateApp },
        ],
    },
]
</script>

<template>
    <div class="settings">
        <div class="section" v-for="section in sections" :key="section.title">
            <h2>{{ section.title }}</h2>

            <div class="list">
                <div class="item" :class="{ open: item.type === 'select' && openDropdown === item.key }"
                    v-for="item in section.items" :key="item.key">
                    <button v-if="item.type !== 'toggle'" type="button" class="row"
                        :aria-expanded="item.type === 'select' ? openDropdown === item.key : undefined"
                        @click="item.type === 'select' ? toggleDropdown(item.key) : item.onClick()">
                        <component :is="item.icon" class="icon" />
                        <span class="text">{{ item.label }}</span>
                        <ChevronRight class="chevron" :class="{ open: openDropdown === item.key }" />
                    </button>

                    <div v-else class="row">
                        <component :is="item.icon" class="icon" />
                        <span class="text">{{ item.label }}</span>
                        <BaseCheckbox v-model="notificationsEnabled" @update:model-value="toggleNotifications" />
                    </div>

                    <div v-if="item.type === 'select'" class="dropdown" :class="{ open: openDropdown === item.key }">
                        <div class="dropdown-content">
                            <button v-for="opt in item.options" :key="opt.code" type="button" class="option"
                                :class="{ active: opt.code === item.selected.value.code }"
                                @click="selectOption(item, opt)">
                                <div v-if="opt.flag" class="flag">
                                    <svg v-if="opt.flag === 'pl'" viewBox="0 0 40 40"
                                        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="20" fill="#fff" />
                                        <rect y="20" width="40" height="20" fill="#dc143c" />
                                    </svg>

                                    <svg v-else-if="opt.flag === 'en'" viewBox="0 0 60 36"
                                        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="60" height="36" fill="#012169" />
                                        <g stroke="#fff" stroke-width="8">
                                            <line x1="0" y1="0" x2="60" y2="36" />
                                            <line x1="60" y1="0" x2="0" y2="36" />
                                        </g>
                                        <g stroke="#C8102E" stroke-width="3">
                                            <line x1="0" y1="0" x2="60" y2="36" />
                                            <line x1="60" y1="0" x2="0" y2="36" />
                                        </g>
                                        <rect x="24" width="12" height="36" fill="#fff" />
                                        <rect y="12" width="60" height="12" fill="#fff" />
                                        <rect x="27" width="6" height="36" fill="#C8102E" />
                                        <rect y="15" width="60" height="6" fill="#C8102E" />
                                    </svg>
                                </div>
                                <span class="option-name">{{ opt.label }}</span>
                                <Check class="check" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <BaseButton variant="ghost" size="lg" :icon="LogOut" class="logout long-btn" @click="handleLogout">
            Wyloguj się
        </BaseButton>
    </div>
</template>


<style lang="scss" scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: $s-6;
    padding: $s-2 $s-4 $s-4;
    height: 100%;
    overflow-y: auto;

    .section {
        display: flex;
        flex-direction: column;
        gap: $s-3;

        h2 {
            padding-left: $s-3;
        }
    }

    .list {
        @include box;
        display: flex;
        flex-direction: column;
        border-radius: $r-2xl;
        overflow: hidden;
        background: #F2F4F7;
    }

    .item {
        display: flex;
        flex-direction: column;

        &:last-child {
            border-bottom: none;
        }

        &.open {

            .row {
                background-color: $neutral200;
            }
        }
    }

    .row {
        display: flex;
        align-items: center;
        gap: $s-4;
        width: 100%;
        padding: $s-3 $s-4 $s-3 $s-5;
        min-height: 4rem;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        border-bottom: 1px solid $border-color;
        font-family: inherit;

        .icon {
            width: 1.75rem;
            height: 1.75rem;
            color: $text-muted;
            flex-shrink: 0;
        }

        .text {
            flex: 1;
            font-size: $fs-lg;
            font-weight: 500;
            color: $neutral800;
        }

        .value {
            font-size: $fs-xs;
            color: $neutral500;
        }

        .chevron {
            flex-shrink: 0;
            width: 1.5rem;
            height: 1.5rem;
            color: $neutral400;
            transition: transform .2s ease;

            &.open {
                transform: rotate(90deg);
            }
        }
    }

    .dropdown {
        background-color: rgba(228, 231, 236, 0.45);
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows .25s ease;

        &.open {
            border-bottom: 1px solid $border-color;
            grid-template-rows: 1fr;
        }

        .dropdown-content {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
    }

    .option {
        display: flex;
        align-items: center;
        gap: $s-3;
        height: 3.5rem;
        padding: $s-3 $s-4;
        border: none;
        border-bottom: 1px solid $border-color;
        font-family: inherit;
        font-weight: 400;
        background: transparent;
        cursor: pointer;
        text-align: left;

        &:last-child {
            border-bottom: none;
        }

        .option-name {
            font-size: $fs-lg;
            flex: 1;
        }

        &.active {
            font-weight: 500;

            .check {
                opacity: 1;
            }
        }

        .check {
            aspect-ratio: 1/1;
            opacity: 0;
            min-width: 1.5rem;
            height: 1.5rem;
            color: $primary500;
            transition: opacity 0.2s ease;
        }

        .flag {
            font-size: $fs-xl;
            background: $neutral200;
            border: 1px solid $border-color;
            border-radius: $r-full;
            width: 2rem;
            height: 2rem;
            display: flex;
            overflow: hidden;
            align-items: center;
            justify-content: center;

            svg {
                width: 100%;
                height: 100%;
                display: block;
            }
        }
    }

    .checkbox {
        width: auto;
    }

    .logout {
        color: $error;
        margin-top: auto;
    }
}
</style>