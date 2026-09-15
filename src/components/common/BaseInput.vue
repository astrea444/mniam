<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  min: {
    type: Number,
    default: undefined,
  },
  max: {
    type: Number,
    default: undefined,
  },
  maxlength: {
    type: Number,
    default: undefined,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  inputmode: {
    type: String,
    default: undefined,
  },
  enterkeyhint: {
    type: String,
    default: undefined,
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'select-suggestion'])

const isSearch = computed(() => {
  return props.type === 'search' || props.clearable || (typeof props.placeholder === 'string' && props.placeholder.toLowerCase().includes('szukaj'))
})

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}

function handleBlur(event) {
  emit('blur', event)
}

function handleFocus(event) {
  emit('focus', event)
}

function clearInput() {
  emit('update:modelValue', '')
  emit('clear')
}

function pickSuggestion(value) {
  emit('update:modelValue', value)
  emit('select-suggestion', value)
}
</script>

<template>
  <div class="input-group">
    <label v-if="label" class="label">
      {{ label }}
    </label>

    <div class="input-base" :class="[size, { error, disabled }]">
      <component :is="icon" v-if="icon" class="icon" />

      <input class="input" :type="type" :placeholder="placeholder" :disabled="disabled" :value="modelValue" :min="min"
        :max="max" :maxlength="maxlength" :inputmode="inputmode" :enterkeyhint="enterkeyhint" @input="handleInput"
        @blur="handleBlur" @focus="handleFocus" v-bind="$attrs">

      <button v-if="modelValue && !disabled && (isSearch || clearable)" type="button" class="clear-btn"
        aria-label="Wyczyść" data-testid="clear-input-btn" @click="clearInput">
        <X />
      </button>
    </div>

    <ul v-if="suggestions.length" class="suggestions" data-testid="suggestions-list">
      <li v-for="s in suggestions" :key="s" :data-testid="`suggestion-item-${s}`"
        @mousedown.prevent="pickSuggestion(s)" @click="pickSuggestion(s)">{{ s }}</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.input-group {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: $s-1;
  width: 100%;


  &.has-suggestions {
    z-index: $z-dropdown;
  }
}

.label {
  width: 100%;
  padding: 0 $s-3;
  font-size: $fs-base;
  font-weight: 500;
  color: $text;
  opacity: .75;
}

.input-base {
  display: flex;
  align-items: center;
  width: 100%;
  background: $main-bg;
  border: 1px solid $border-color;
  border-radius: $r-full;
  box-shadow: none !important;
  transition: border-color .15s ease, box-shadow .15s ease;

  &:focus-within {
    border-color: $primary500;
    outline: 2px solid $primary200;
  }

  &.error {
    border-color: $error;
    background: rgba(255, 70, 70, 0.1);

    &:focus-within {
      border-color: $error;
      outline: 2px solid $error-fg;
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.sm {
    height: 2.75rem;
    padding: $s-3 $s-4;
    gap: $s-2;

    .input {
      font-size: $fs-sm;
    }

    .icon {
      margin-left: -0.3rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .clear-btn svg {
      margin-right: -0.6rem;
      width: 1.125rem;
      height: 1.125rem;
    }
  }

  &.md {
    height: 3.25rem;
    padding: $s-3 $s-5;
    gap: $s-3;

    .input {
      font-size: calc($fs-base * 1.15);
    }

    .icon {
      margin-left: -0.4rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .clear-btn svg {
      margin-right: -0.7rem;
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &.lg {
    height: 3.75rem;
    padding: $s-3 $s-6;
    gap: $s-4;

    .input {
      font-size: calc($fs-lg * 1.15);
    }

    .icon {
      margin-left: -0.5rem;
      width: 1.75rem;
      height: 1.75rem;
    }

    .clear-btn svg {
      margin-right: -0.8rem;
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

.icon {
  flex-shrink: 0;
  color: $text-muted;
}

.input {
  flex: 1;
  height: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  color: $text;
  padding: 0;

  &::placeholder {
    color: $text-muted;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }

  &[type='search'] {
    -webkit-appearance: none;
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: $text;
    -webkit-box-shadow: 0 0 0 1000px $main-bg inset;
    transition: background-color 5000s ease-in-out 0s;
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  padding: $s-1;
  color: $text-muted;
  cursor: pointer;
  border-radius: $r-full;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: $text;
    background-color: rgba($text, 0.06);
  }
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: $z-dropdown;
  margin: $s-1 0 0;
  padding: $s-2 0;
  list-style: none;
  background: $main-bg;
  border: 1px solid $border-color;
  border-radius: $r-xl;
  box-shadow: $shadow;

  li {
    padding: $s-3 $s-5;
    font-size: $fs-sm;
    font-weight: 400;
    color: $text;
    cursor: pointer;
    transition: background .12s ease;

    &:hover {
      background: rgba($primary500, 0.08);
    }
  }
}
</style>