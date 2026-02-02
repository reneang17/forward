<script setup>
import IconLucide from './IconLucide.vue';
defineProps(['label', 'variant', 'icon'])
defineEmits(['click'])
</script>

<template>
    <button 
        class="flex items-center gap-2 rounded-lg text-sm font-medium transition-colors"
        :class="[
            variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 shadow-lg shadow-indigo-500/20' : '',
            variant === 'minimal' ? 'text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-2 py-1 border border-indigo-600/30' : '',
            variant === 'minimal-slate' ? 'text-xs bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white px-2 py-1 border border-slate-600/50' : '',
            variant === 'dashed' ? 'w-full py-2 text-slate-500 border border-dashed border-slate-700 hover:text-slate-300' : ''
        ]"
        @click="$emit('click')"
    >
        <icon-lucide v-if="icon" :name="icon" :size="variant && variant.includes('minimal') ? 12 : 16"></icon-lucide>
        <span :class="{ 'hidden sm:inline': variant === 'primary' }">{{ label }}</span>
    </button>
</template>
