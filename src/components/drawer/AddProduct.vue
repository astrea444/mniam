<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { PencilLine, Star, Lightbulb, AlertCircle } from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDateSelect from '@/components/common/BaseDateSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTooltip from '@/components/common/BaseTooltip.vue'
import { usePantryStore } from '@/stores/pantryStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { PantryService } from '@/services/pantryService'
import { useToast } from '@/composables/useToast'
import { areUnitsCompatible, normalizeUnits } from '@/utils/formatters'
import { CATEGORY_OPTIONS, UNIT_OPTIONS, PRODUCT_SUGGESTIONS, getCategoryForProduct, DEFAULT_CATEGORY } from '@/constants/productOptions'
import { TOAST } from '@/constants/toastMessages'

const props = defineProps({
    item: { type: Object, default: null },
    initialCategory: { type: String, default: DEFAULT_CATEGORY },
    mode: { type: String, default: 'pantry' },
    icon: { type: [Object, Function], },
    categoryIcon: { type: [Object, Function], default: () => Star },
})

const emit = defineEmits(['close'])

const pantryStore = usePantryStore()
const shoppingStore = useShoppingStore()
const toast = useToast()

const categoryOptions = CATEGORY_OPTIONS
const unitOptions = UNIT_OPTIONS
const showSuggestions = ref(false)
const isSubmitting = ref(false)
const hasInteracted = ref(false)
const suggestionName = ref('')
const hintDismissed = ref(false)
const nameFieldRef = ref(null)
let selectingSuggestion = false

const isEdit = computed(() => !!props.item)

const submitButtonText = computed(() => {
    if (isEdit.value) return 'Zapisz zmiany'
    if (props.mode === 'shopping') return 'Dodaj do listy zakupów'
    if (existingPantryProduct.value) return 'Zaktualizuj produkt'
    return 'Dodaj do spiżarni'
})

function emptyFormData() {
    return {
        name: '',
        amount: 1,
        unit: 'szt',
        category: props.initialCategory || 'other',
        expiresInDays: null
    }
}

const formData = ref(emptyFormData())
const expiryDate = ref(null)

watch(() => props.item, (newItem) => {
    if (newItem) {
        formData.value = {
            name: newItem.name || '',
            amount: newItem.amount ?? 1,
            unit: newItem.unit || 'szt',
            category: newItem.category || props.initialCategory || 'other',
            expiresInDays: newItem.expiresInDays ?? null
        }
        if (newItem.expiryDate) {
            expiryDate.value = new Date(newItem.expiryDate)
        } else if (newItem.expiresInDays !== null && newItem.expiresInDays !== undefined) {
            const d = new Date()
            d.setDate(d.getDate() + Number(newItem.expiresInDays))
            expiryDate.value = d
        } else {
            expiryDate.value = null
        }
    } else {
        formData.value = emptyFormData()
        expiryDate.value = null
    }
    hasInteracted.value = false
    hintDismissed.value = false
}, { immediate: true })

const amountInputmode = computed(() => formData.value.unit === 'szt' ? 'numeric' : 'decimal')

const isPastExpiryDate = computed(() => {
    if (!expiryDate.value) return false
    const exp = new Date(expiryDate.value)
    exp.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return exp < today
})

const filteredSuggestions = computed(() => {
    const query = formData.value.name.trim().toLowerCase()
    if (!query || !showSuggestions.value) return []
    return PRODUCT_SUGGESTIONS
        .filter(s => {
            const lower = s.toLowerCase()
            return lower.includes(query) && lower !== query
        })
        .slice(0, 6)
})

const amountMin = computed(() => (formData.value.unit === 'szt' ? 1 : 0.01))
const amountStep = computed(() => (formData.value.unit === 'szt' ? 1 : 'any'))

const isAmountValid = computed(() => {
    const num = Number(formData.value.amount)
    if (!Number.isFinite(num) || num <= 0) return false
    if (formData.value.unit === 'szt' && !Number.isInteger(num)) return false
    return true
})

const isFormValid = computed(() =>
    formData.value.name.trim().length > 0 &&
    isAmountValid.value &&
    !!formData.value.category
)

const amountValidationMessage = computed(() => {
    const num = Number(formData.value.amount)
    if (!Number.isFinite(num) || num <= 0) return 'Ilość musi być liczbą większą od zera.'
    if (formData.value.unit === 'szt' && !Number.isInteger(num)) return 'Dla sztuk ilość musi być liczbą całkowitą.'
    return ''
})

const existingPantryProduct = computed(() => {
    if (props.mode !== 'pantry' || !formData.value.name.trim() || isEdit.value) return null
    return pantryStore.items.find(
        (item) => item.name && item.name.trim().toLowerCase() === formData.value.name.trim().toLowerCase()
    ) || null
})

watch(() => formData.value.name, (newName) => {
    hintDismissed.value = false
    if (selectingSuggestion) {
        selectingSuggestion = false
        showSuggestions.value = false
        return
    }
    showSuggestions.value = !!newName.trim()
})

const hasDifferentUnit = computed(() =>
    !!existingPantryProduct.value && !areUnitsCompatible(existingPantryProduct.value.unit, formData.value.unit)
)

const showExistingHint = computed(() => !!existingPantryProduct.value && !hintDismissed.value)

const showCategoryHint = computed(() => {
    if (!suggestionName.value) return false
    const current = formData.value.name.trim().toLowerCase()
    return current !== '' && current !== suggestionName.value.toLowerCase()
})

function onNameFocus() {
    showSuggestions.value = true
    hintDismissed.value = false
}

function selectSuggestion(name) {
    selectingSuggestion = true
    formData.value.name = name
    showSuggestions.value = false
    hintDismissed.value = false
    const existing = props.mode === 'pantry' ? pantryStore.findByName(name) : null
    if (existing) {
        formData.value.unit = existing.unit
        formData.value.category = existing.category || formData.value.category
    } else {
        const detectedCategory = getCategoryForProduct(name)
        if (detectedCategory) {
            formData.value.category = detectedCategory
            suggestionName.value = name
        }
    }
}

async function submitForm() {
    if (isSubmitting.value || !isFormValid.value) return
    isSubmitting.value = true

    try {
        const productName = formData.value.name.trim()
        let amount = Number(formData.value.amount)
        let unit = formData.value.unit || 'szt'

        if (existingPantryProduct.value && props.mode === 'pantry' && !isEdit.value) {
            if (areUnitsCompatible(unit, existingPantryProduct.value.unit)) {
                amount = normalizeUnits(amount, unit, existingPantryProduct.value.unit)
                unit = existingPantryProduct.value.unit
            }
        }
        const basePayload = { ...formData.value, name: productName, amount, unit }

        if (props.mode === 'shopping') {
            shoppingStore.addItem({
                name: productName,
                amount,
                unit: formData.value.unit || 'szt',
                category: formData.value.category || 'other'
            })
            toast.success('Lista zakupów', TOAST.SHOPPING.ADDED)
            formData.value = emptyFormData()
            hasInteracted.value = false
            hintDismissed.value = false
            emit('close')
            return
        }

        if (isEdit.value && props.item) {
            pantryStore.updateItem(props.item.id, {
                name: productName,
                amount,
                unit,
                category: formData.value.category || 'other',
                expiryDate: expiryDate.value,
            })
            toast.success('Spiżarnia', 'Zaktualizowano produkt w spiżarni.')
        } else {
            pantryStore.addItem({
                ...basePayload,
                expiryDate: expiryDate.value,
            })
            toast.success('Spiżarnia', TOAST.PANTRY.ADDED)
            formData.value = emptyFormData()
            expiryDate.value = null
            hintDismissed.value = false
        }

        hasInteracted.value = false
        emit('close')
    } finally {
        isSubmitting.value = false
    }
}

async function replaceWithNewUnit() {
    if (isSubmitting.value || !isFormValid.value || !existingPantryProduct.value) return
    isSubmitting.value = true
    try {
        const productName = formData.value.name.trim()
        const amount = Number(formData.value.amount)
        const unit = formData.value.unit || 'szt'
        const basePayload = { ...formData.value, name: productName, amount, unit }
        pantryStore.updateItem(existingPantryProduct.value.id, {
            name: productName,
            amount,
            unit,
            category: formData.value.category || 'other',
            expiryDate: expiryDate.value,
        })
        toast.success('Spiżarnia', 'Zaktualizowano produkt w spiżarni.')
        formData.value = emptyFormData()
        expiryDate.value = null
        hasInteracted.value = false
        hintDismissed.value = false
        emit('close')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="add-product" data-testid="add-product-drawer">
        <form class="form" @submit.prevent="submitForm" @input="hasInteracted = true" @change="hasInteracted = true"
            data-testid="add-product-form">
            <div class="name-field" ref="nameFieldRef">
                <BaseInput v-model="formData.name" label="Nazwa składnika" placeholder="np. Mleko" :icon="icon"
                    size="lg" :maxlength="50" :suggestions="filteredSuggestions" required @focus="onNameFocus"
                    @blur="showSuggestions = false" @select-suggestion="selectSuggestion"
                    data-testid="product-name-input" :error="hasInteracted && !formData.name.trim()" />
                <Transition name="hint-pop">
                    <BaseTooltip v-if="showExistingHint" :icon="Lightbulb" icon-color="#FFB900"
                        text="Masz już ten produkt w spiżarni" direction="bottom" class="existing-product-hint"
                        data-testid="existing-product-hint" />
                    <BaseTooltip v-else-if="hasInteracted && !formData.name.trim()" :icon="AlertCircle"
                        icon-color="#d64545" text="Podaj nazwę składnika" direction="bottom"
                        class="existing-product-hint" data-testid="name-validation-hint" />
                </Transition>
            </div>

            <div class="form-row">
                <div class="amount-field">
                    <BaseInput v-model.number="formData.amount" type="number" class="long" size="lg" label="Ilość"
                        required :min="amountMin" :step="amountStep" :inputmode="amountInputmode" enterkeyhint="done"
                        data-testid="product-amount-input" @focus="hintDismissed = true"
                        :error="hasInteracted && !!formData.name.trim() && !isAmountValid" />
                    <Transition name="hint-pop">
                        <BaseTooltip v-if="hasInteracted && formData.name.trim() && !isAmountValid" :icon="AlertCircle"
                            icon-color="#d64545" :text="amountValidationMessage" direction="top" class="field-hint"
                            data-testid="amount-validation-hint" />
                    </Transition>
                </div>
                <BaseSelect v-model="formData.unit" :options="unitOptions" side="right" class="short" size="lg"
                    label="Jednostka" required data-testid="product-unit-select" />
            </div>

            <div class="category-field">
                <BaseSelect v-model="formData.category" :options="categoryOptions" label="Kategoria"
                    placeholder="Wybierz kategorię" :icon="categoryIcon" size="lg" required
                    data-testid="product-category-select"
                    :class="{ error: hasInteracted && formData.name.trim() && isAmountValid && !formData.category }" />
                <p v-if="showCategoryHint" class="hint-text">Czy kategoria się zgadza?</p>
                <Transition name="hint-pop">
                    <BaseTooltip v-if="hasInteracted && formData.name.trim() && isAmountValid && !formData.category"
                        :icon="AlertCircle" icon-color="#d64545" text="Wybierz kategorię" direction="top"
                        class="field-hint" data-testid="category-validation-hint" />
                </Transition>
            </div>

            <div v-if="mode !== 'shopping'" class="expiry-field">
                <BaseDateSelect v-model="expiryDate" label="Data ważności" placeholder="12.12.2026" size="lg"
                    data-testid="product-expiry-input" />
                <Transition name="hint-pop">
                    <BaseTooltip v-if="isPastExpiryDate" :icon="AlertCircle" icon-color="#FFB900"
                        text="Wprowadzasz datę z przeszłości (produkt przeterminowany)" direction="top"
                        class="field-hint" data-testid="expiry-warning" />
                </Transition>
            </div>
            <div class="actions">
                <Transition name="slide-up">
                    <BaseButton v-if="hasDifferentUnit" block variant="default" size="lg"
                        :disabled="!isFormValid || isSubmitting" @click.prevent="replaceWithNewUnit"
                        data-testid="replace-unit-btn" class="long-btn">
                        Zastąp istniejący nową jednostką
                    </BaseButton>
                </Transition>
                <BaseButton block variant="green" class="long-btn" size="lg" type="submit"
                    :disabled="!isFormValid || isSubmitting" data-testid="submit-product-btn">
                    {{ submitButtonText }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>


<style lang="scss" scoped>
.add-product {
    display: flex;
    flex-direction: column;
    gap: $s-4;
    padding: $s-2 $s-4 $s-8;
    width: 100%;
    height: 100%;
}

.form {
    display: flex;
    flex-direction: column;
    gap: $s-8;
    width: 100%;
    height: 100%;

    .form-row {
        display: flex;
        width: 100%;
        gap: $s-4;

        .input-group {
            width: 100%;
            flex: 1;
        }

        .select-group {
            width: fit-content !important;
        }

        :deep(.short) {
            width: 8.25rem;
            flex-shrink: 1;
            min-width: 0;
        }
    }

    .long-btn {
        margin-top: auto;
    }

    .actions {
        display: flex;
        flex-direction: column;
        margin-top: auto;
        gap: $s-3;
    }
}

.name-field {
    position: relative;

}


.existing-product-hint {
    position: absolute;
    bottom: calc(100% - #{$s-3});
    left: $s-3;
    z-index: $z-dropdown;
    transform-origin: bottom left;
}

.hint-pop-enter-active {
    transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hint-pop-leave-active {
    transition: opacity 0.18s ease-in,
        transform 0.18s ease-in;
}

.hint-pop-enter-from,
.hint-pop-leave-to {
    opacity: 0;
    transform: scale(0.85) translateY(-6px);
}

.hint-text {
    color: $warning;
    font-size: 0.8rem;
    margin: -0.25rem 0 0;
    padding: 0 $s-3;
}

.amount-field,
.category-field,
.expiry-field {
    position: relative;
}

.field-hint {
    position: absolute;
    top: calc(100% + #{$s-2});
    left: $s-3;
    z-index: #{$z-dropdown - 1};
    transform-origin: top left;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.25s ease;
    max-height: 4rem;
    overflow: hidden;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(8px);
    max-height: 0;
}
</style>