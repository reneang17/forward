<script setup>
import IconLucide from './IconLucide.vue';
defineProps(['label', 'variant', 'icon'])
defineEmits(['click'])
</script>

<template>
    <button 
        class="flex items-center gap-2 rounded-lg text-sm font-medium transition-colors"
        :class="[
            variant === 'primary' ? 'bg-fw-accent hover:bg-fw-accent-bright text-fw-bg-deep px-4 py-2 shadow-lg shadow-fw-accent/20' : '',
            variant === 'minimal' ? 'text-xs bg-fw-accent/20 text-fw-accent hover:bg-fw-accent hover:text-fw-bg-deep px-2 py-1 border border-fw-accent/30' : '',
            variant === 'minimal-slate' ? 'text-xs bg-fw-surface/50 text-fw-text-muted hover:bg-fw-surface hover:text-fw-text px-2 py-1 border border-fw-border/50' : '',
            variant === 'dashed' ? 'w-full py-2 text-fw-text-faint border border-dashed border-fw-border hover:text-fw-text-muted' : ''
        ]"
        @click="$emit('click')"
    >
        <icon-lucide v-if="icon" :name="icon" :size="variant && variant.includes('minimal') ? 12 : 16"></icon-lucide>
        <span :class="{ 'hidden sm:inline': variant === 'primary' }">{{ label }}</span>
    </button>
</template>
