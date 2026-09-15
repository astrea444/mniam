<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from '@/composables/useToast'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CloudUploadIcon } from '@hugeicons/core-free-icons'
import { TOAST } from '@/constants/toastMessages'

const emit = defineEmits(['close'])

const userStore = useUserStore()
const toast = useToast()

const profile = computed(() => userStore.profile)
const [initialFirst = '', initialLast = ''] = (profile.value?.name || '').split(' ')

const firstName = ref(initialFirst)
const lastName = ref(initialLast)
const email = ref(profile.value?.email || '')
const avatarPreview = ref(profile.value?.avatar || null)

const fileInput = ref(null)

function pickFile() {
    fileInput.value?.click()
}

function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        avatarPreview.value = reader.result
    }
    reader.readAsDataURL(file)
}

function handleSave() {
    userStore.updateProfile({
        name: `${firstName.value} ${lastName.value}`.trim(),
        email: email.value,
        avatar: avatarPreview.value,
    })
    toast.success('Profil', TOAST.SETTINGS.PROFILE_UPDATED)
    emit('close')
}
</script>

<template>
    <div class="edit-profile">

        <div class="section">
            <span class="label">Informacje osobiste</span>

            <BaseInput id="firstName" v-model="firstName" label="Imię" placeholder="Imię" enterkeyhint="next" />
            <BaseInput id="lastName" v-model="lastName" label="Nazwisko" placeholder="Nazwisko" enterkeyhint="next" />
            <BaseInput id="email" v-model="email" type="email" inputmode="email" enterkeyhint="done" label="E-mail"
                placeholder="E-mail" />
        </div>

        <div class="section">
            <span class="label">Twoje zdjęcie</span>

            <div class="avatar-row" v-if="avatarPreview">
                <img :src="avatarPreview" class="avatar-preview" alt="avatar" />
            </div>

            <button type="button" class="upload-zone" @click="pickFile">
                <div class="icon">
                    <HugeiconsIcon :icon="CloudUploadIcon" :size="80" />
                </div>
                <div class="text">
                    <span class="main-text"><strong>Kliknij tu</strong> aby dodać zdjęcie</span>
                    <span class="sub-text">SVG, PNG, JPG, GIF (max. 800x400px)</span>
                </div>
                <input ref="fileInput" type="file" accept="image/*" class="file-input" @change="handleFileChange" />
            </button>
        </div>

        <BaseButton variant="green" size="lg" class="save long-btn" @click="handleSave">
            Zapisz zmiany
        </BaseButton>
    </div>
</template>

<style lang="scss" scoped>
.edit-profile {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    padding: $s-2 $s-4 $s-4;
    height: 100%;
    overflow-y: auto;

    .section {
        display: flex;
        flex-direction: column;
        gap: $s-3;
        padding-top: $s-10;

        .label {
            font-size: $fs-lg;
            font-weight: 600;
            padding-bottom: $s-3;
        }
    }

    .avatar-row {
        display: flex;
        margin-bottom: $s-4;

        .avatar-preview {
            width: 6.5rem;
            height: 6.5rem;
            border-radius: $r-full;
            outline: 2px solid $primary500;
            object-fit: cover;
            margin: 0 auto;
        }
    }

    .upload-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $s-3;
        background: none;
        border: 1px solid $border-color;
        border-radius: $r-2xl;
        padding: $s-4 $s-4 $s-6;
        cursor: pointer;
        font-family: inherit;
        font-size: $fs-base;

        .icon {
            color: $primary400;
        }

        .text {
            display: flex;
            flex-direction: column;
            gap: 0;
            align-items: center;

            .main-text {
                font-size: calc($fs-base * 1.1);
            }

        }

        strong {
            font-weight: 500;
        }
    }

    .file-input {
        display: none;
    }

    .save {
        margin-top: auto;
    }
}
</style>