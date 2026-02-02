<script setup>
defineProps(['name', 'size'])
</script>

<template>
    <svg :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="name==='target'" d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"></path>
        <path v-if="name==='calendar'" d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"></path>
        <path v-if="name==='infinity'" d="M12 12c-2.3 2.3-2.3 6 0 8.3s6 2.3 8.3 0c2.3-2.3 2.3-6 0-8.3m-8.3 0c-2.3-2.3-2.3-6 0-8.3s-6-2.3-8.3 0c-2.3 2.3-2.3 6 0 8.3"></path>
        <path v-if="name==='plus'" d="M12 5v14M5 12h14"></path>
        <path v-if="name==='clock'" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2"></path>
        <path v-if="name==='check-square'" d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        <path v-if="name==='chevron-left'" d="M15 18l-6-6 6-6"></path>
        <path v-if="name==='chevron-right'" d="M9 18l6-6-6-6"></path>
        <path v-if="name==='x'" d="M18 6L6 18M6 6l12 12"></path>
        <path v-if="name==='copy'" d="M8 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3 M16 4h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"></path>
        <path v-if="name==='arrow-right-circle'" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16l4-4-4-4 M8 12h8"></path>
        <path v-if="name==='trash'" d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <path v-if="name==='archive'" d="M21 8v13H3V8 M1 3h22v5H1V3z M10 12h4"></path>
    </svg>
</template>
