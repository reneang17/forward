<script setup>
import BlockItem from './BlockItem.vue';
import IconLucide from './ui/IconLucide.vue';
import PlanButton from './ui/PlanButton.vue';

defineProps({
    timeline: { type: Array, default: () => [] },
    todos: { type: Array, default: () => [] },
    completedTimeline: { type: Array, default: () => [] },
    completedTodos: { type: Array, default: () => [] },
    archivedTimeline: { type: Array, default: () => [] },
    archivedTodos: { type: Array, default: () => [] },
    dateRef: String
});

defineEmits(['request-plan', 'schedule', 'request-delete']);
</script>

<template>
    <div class="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <!-- Left: Timeline (Agenda - HAS TIME) -->
        <div class="flex flex-col h-full glass-panel rounded-2xl p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-fw-text-muted text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                    <icon-lucide name="clock" size="16"></icon-lucide> Agenda
                </h2>

                <plan-button 
                    variant="minimal" 
                    label="+ Add" 
                    @click="$emit('request-plan', 'agenda', { date: dateRef })"

                ></plan-button>
            </div>
            
            <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <div v-if="timeline.length === 0 && completedTimeline.length === 0 && archivedTimeline.length === 0" class="text-center py-10 text-fw-text-faint italic">
                    Nothing scheduled with time.
                </div>

                <div v-for="block in timeline" :key="block.id" class="relative pl-6 border-l border-fw-border pb-6 last:pb-0">
                    <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-fw-accent ring-4 ring-fw-bg-deep"></div>
                    <span class="text-xs font-mono text-fw-accent mb-1 block">{{ block.time }}</span>
                    <block-item :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                </div>

                <!-- Agenda Completed Section -->
                <div v-if="completedTimeline.length > 0" class="mt-8 pt-4 border-t border-fw-border/50">
                    <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider">Completed</h3>
                    <div class="space-y-4 opacity-60">
                        <div v-for="block in completedTimeline" :key="block.id" class="relative pl-6 border-l border-fw-border pb-6 last:pb-0">
                            <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-fw-border ring-4 ring-fw-bg-deep"></div>
                            <span class="text-xs font-mono text-fw-text-faint mb-1 block">{{ block.time }}</span>
                            <block-item :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                        </div>
                    </div>
                </div>

                <!-- Agenda Archived Section -->
                <div v-if="archivedTimeline.length > 0" class="mt-8 pt-4 border-t border-fw-border/50">
                    <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider flex items-center gap-1">
                        <icon-lucide name="archive" size="12"></icon-lucide> Archived
                    </h3>
                    <div class="space-y-4 opacity-40 hover:opacity-80 transition-opacity">
                        <div v-for="block in archivedTimeline" :key="block.id" class="relative pl-6 border-l border-fw-border pb-6 last:pb-0">
                            <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-fw-bg-deep ring-4 ring-fw-bg-deep"></div>
                            <span class="text-xs font-mono text-fw-text-faint mb-1 block">{{ block.time }}</span>
                            <block-item :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: To-Do (NO TIME) -->
        <div class="flex flex-col h-full glass-panel rounded-2xl p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-fw-text-muted text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                    <icon-lucide name="check-square" size="16"></icon-lucide> Tasks of the Day
                </h2>

                    <plan-button 
                    variant="minimal-slate" 
                    label="+ Add" 
                    @click="$emit('request-plan', 'todo', { date: dateRef })"

                ></plan-button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <div v-if="todos.length === 0 && completedTodos.length === 0 && archivedTodos.length === 0" class="text-center py-10 text-fw-text-faint italic">
                    No general tasks pending.
                </div>

                <block-item v-for="block in todos" :key="block.id" :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                
                <!-- Completed Section -->
                <div v-if="completedTodos.length > 0" class="mt-8 pt-4 border-t border-fw-border/50">
                    <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider">Completed</h3>
                    <div class="space-y-3 opacity-60">
                        <block-item v-for="block in completedTodos" :key="block.id" :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                    </div>
                </div>

                <!-- Archived Section -->
                <div v-if="archivedTodos.length > 0" class="mt-8 pt-4 border-t border-fw-border/50">
                    <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider flex items-center gap-1">
                        <icon-lucide name="archive" size="12"></icon-lucide> Archived
                    </h3>
                    <div class="space-y-3 opacity-40 hover:opacity-80 transition-opacity">
                        <block-item v-for="block in archivedTodos" :key="block.id" :block="block" @schedule="$emit('schedule', $event)" @request-delete="$emit('request-delete', $event)"></block-item>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
