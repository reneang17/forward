<script setup>
import { ref, computed } from 'vue';
import IconLucide from './ui/IconLucide.vue';
import { useTaskStore } from '../stores/tasks';

const props = defineProps(['block', 'isBacklog']);
const emit = defineEmits(['schedule', 'request-delete']);

const store = useTaskStore();
const showActions = ref(false);

const toggle = () => { store.toggleComplete(props.block.id); };
const duplicate = () => { store.duplicateBlock(props.block.id); showActions.value = false; };
const schedule = () => { emit('schedule', props.block); showActions.value = false; };
const archive = () => { store.toggleArchive(props.block.id); showActions.value = false; };

const requestDelete = () => { 
     emit('request-delete', { id: props.block.id, title: props.block.title, type: 'block' }); 
};

const isList = computed(() => Array.isArray(props.block.content));
const listItems = computed(() => Array.isArray(props.block.content) ? props.block.content : []);

const toggleSubItem = (idx) => {
    const newContent = [...listItems.value];
    newContent[idx].done = !newContent[idx].done;
    store.updateBlock(props.block.id, { content: newContent });
};
</script>

<template>
    <div class="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-all duration-200 shadow-sm"
            @mouseenter="showActions = true" @mouseleave="showActions = false">
        <div class="flex items-start gap-3">
            <button 
                @click.stop="toggle" 
                class="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0" 
                :class="block.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-indigo-400'"
            >
                <icon-lucide v-if="block.isCompleted" name="x" size="12" class="text-white transform rotate-45" style="transform: rotate(0deg) !important; stroke-width: 4px"></icon-lucide>
            </button>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium truncate transition-all" :class="block.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'">{{ block.title }}</h4>
                    <p v-if="block.description" class="text-xs text-slate-500 truncate mt-0.5">{{ block.description }}</p>

                <div class="flex gap-2 mt-1">
                    <span v-if="block.time" class="text-[10px] bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/50">{{ block.time }}</span>
                    <span v-if="block.type !== 'task'" class="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded capitalize">{{ block.type }}</span>
                    <span v-if="block.isArchived" class="text-[10px] bg-amber-900/30 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/50">Archivado</span>
                </div>
                <div v-if="isList && listItems.length > 0" class="mt-2 space-y-1">
                    <div v-for="(item, idx) in listItems" :key="idx" @click.stop="toggleSubItem(idx)" class="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                        <div class="w-3 h-3 border rounded border-slate-600" :class="{'bg-slate-600': item.done}"></div>
                        <span :class="{'line-through opacity-50': item.done}">{{ item.text }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Actions Overlay -->
            <div v-show="showActions" class="flex items-center gap-1 bg-slate-900 rounded-md p-1 shadow-lg absolute top-2 right-2 border border-slate-700 animate-fade-in z-20">
                <button @click.stop="duplicate" title="Duplicar" class="p-1 hover:text-indigo-400 text-slate-400"><icon-lucide name="copy" size="14"></icon-lucide></button>
                <button @click.stop="schedule" title="Agendar" class="p-1 hover:text-emerald-400 text-slate-400"><icon-lucide name="calendar" size="14"></icon-lucide></button>
                <button @click.stop="archive" :title="block.isArchived ? 'Desarchivar' : 'Archivar'" class="p-1 hover:text-amber-400 text-slate-400"><icon-lucide name="archive" size="14"></icon-lucide></button>
                <button @click.stop="requestDelete" title="Borrar" class="p-1 hover:text-red-400 text-slate-400"><icon-lucide name="trash" size="14"></icon-lucide></button>
            </div>
        </div>
    </div>
</template>
