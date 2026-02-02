<script setup>
import IconLucide from './ui/IconLucide.vue';
defineProps(['label', 'icon', 'active'])
</script>

<template>
    <button 
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group"
        :class="active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'"
    >
        <icon-lucide :name="icon" :class="active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'"></icon-lucide>
        <span class="font-medium text-sm hidden lg:block">{{ label }}</span>
    </button>
</template>
