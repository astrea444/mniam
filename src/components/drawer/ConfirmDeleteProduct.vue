<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { usePantryStore } from '@/stores/pantryStore'
import { useToast } from '@/composables/useToast'
import { TOAST } from '@/constants/toastMessages'
import { formatAmount } from '@/utils/formatters'

const props = defineProps({
    item: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['close'])

const pantryStore = usePantryStore()
const toast = useToast()

function handleConfirm() {
    if (!props.item) return
    const deletedItem = { ...props.item }
    pantryStore.removeItem(props.item.id)
    toast.add({
        title: 'Spiżarnia',
        message: TOAST.PANTRY.REMOVED(props.item.name),
        type: 'info',
        onUndo: () => {
            pantryStore.addItem(deletedItem)
        }
    })
    emit('close')
}
</script>

<template>
    <div class="confirm-delete" data-testid="confirm-delete-drawer">

        <div class="content">
            <div v-if="item" class="item-preview" data-testid="delete-item-preview">
                <span class="item-name" data-testid="delete-item-name">{{ item.name }}</span>
                <span class="item-qty" data-testid="delete-item-qty">{{ formatAmount(item.amount, item.unit) }}</span>
            </div>
            <p class="question">Czy na pewno chcesz usunąć ten produkt?</p>
        </div>

        <div class="actions">
            <BaseButton variant="default" size="md" class="btn-cancel" @click="$emit('close')"
                data-testid="cancel-delete-btn">
                Anuluj
            </BaseButton>
            <BaseButton variant="red" size="md" class="btn-confirm" @click="handleConfirm"
                data-testid="confirm-delete-btn">
                Usuń
            </BaseButton>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.confirm-delete {
    display: flex;
    flex-direction: column;
    gap: $s-6;
    padding: $s-2 $s-4 $s-8;
    width: 100%;
}

.content {
    display: flex;
    flex-direction: column;
    gap: $s-3;
    padding: $s-2 0;

    .item-preview {
        @include box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $s-3 $s-4;
        border-radius: $r-xl;

        .item-name {
            font-size: $fs-base;
            font-weight: 600;
            color: $text;
        }

        .item-qty {
            font-size: $fs-sm;
            font-weight: 500;
            color: $text-muted;
        }
    }

    .question {
        font-size: $fs-base;
        color: $text;
        font-weight: 500;
        margin: 0;
    }
}

.actions {
    display: flex;
    gap: $s-3;
    width: 100%;
    margin-top: $s-4;

    .btn-cancel,
    .btn-confirm {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
