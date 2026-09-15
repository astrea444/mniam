<script setup>
import AddProduct from './AddProduct.vue'

defineProps({
    initialCategory: {
        type: String,
        default: 'other',
    },
})

defineEmits(['close'])
</script>

<template>
    <AddProduct mode="shopping" :initial-category="initialCategory" @close="$emit('close')" />
</template>