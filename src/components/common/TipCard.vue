<script setup>
defineProps({
    title: String,
    text: String,
    icon: [Object, Function],
    rotate: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <div class="tip-card" :class="{ 'tip-card-rotate': rotate }">
        <div class="text-group">
            <p class="title">{{ title }}</p>
            <p class="text">{{ text }}</p>
        </div>
        <component :is="icon" class="icon" />
    </div>
</template>

<style lang="scss" scoped>
.tip-card {
    @include box;
    background: $light-bg;
    border-radius: $r-xl;
    box-shadow: $shadow-green;
    padding: $s-2 $s-3 $s-2 $s-5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-3;
    border-color: $primary600;
    height: 7rem;

    .title {
        display: block;
        line-height: 1.3;
        font-weight: 600;
        font-size: $fs-lg;
    }

    .text {
        margin: 0;
        font-size: $fs-base;
        line-height: 1.2;
        color: $text;
    }

    .icon {
        height: 5rem;
        width: auto;
        aspect-ratio: 1/1;
        flex-shrink: 0;
        color: $primary700;
    }

    .text-group {
        display: flex;
        flex-direction: column;
        gap: $s-1;
    }
}

.tip-card-rotate .icon {
    rotate: 14deg;
}
</style>