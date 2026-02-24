<script setup>
import IconLucide from './ui/IconLucide.vue';
defineProps(['label', 'icon', 'active'])
</script>

<template>
    <button 
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group"
        :class="active ? 'bg-fw-accent text-fw-bg-deep font-semibold' : 'text-fw-text-muted hover:bg-fw-surface hover:text-fw-text'"
    >
        <icon-lucide :name="icon" :class="active ? 'text-fw-bg-deep' : 'text-fw-text-muted group-hover:text-fw-text'"></icon-lucide>
        <span class="font-medium text-sm hidden lg:block">{{ label }}</span>
    </button>
</template>
