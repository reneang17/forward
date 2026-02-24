<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue';
import { useTaskStore } from './stores/tasks';
import { generateSlug, getLocalToday } from './utils';
import NavItem from './components/NavItem.vue';
import BlockItem from './components/BlockItem.vue';
import IconLucide from './components/ui/IconLucide.vue';
import DayDashboard from './components/DayDashboard.vue';
import PlanButton from './components/ui/PlanButton.vue';

const store = useTaskStore();
const currentView = ref('focus');

// Modal States
const showModal = ref(false);
const showColumnModal = ref(false);
// New: Delete Confirmation Modal State
const showDeleteModal = ref(false);
const deleteTargetId = ref(null);
const deleteTargetType = ref(null); // 'block' or 'column'
const deleteTargetTitle = ref(''); // For display
const deleteModal = reactive({
    show: false,
    title: '',
    id: null,
    type: null
});


const selectedDay = ref(null);
const editingId = ref(null);

// Toggle for Archived in Timeless
const showArchivedItems = ref(false);

// Form States
const isTimeless = ref(false);
const hasTime = ref(false);
const hasCategory = ref(false); 
const selectedCategoryId = ref('');
const customCategoryTitle = ref('');
const customCategoryColor = ref('#6366f1');
const isCategoryLocked = ref(false);
const isDateDisabled = ref(false);
const isDateLocked = ref(false);
const isTimeDisabled = ref(false);

// New Block Structure
const newBlock = ref({ title: '', description: '', type: 'task', date: '', time: '', listItems: [] });
const newColumn = ref({ title: '', typeFilter: '', color: '#6366f1' });


const todayIso = computed(() => getLocalToday());

const selectedCategoryColor = computed(() => {
    if (selectedCategoryId.value === 'NEW') return customCategoryColor.value;
    const col = store.columns.find(c => c.id === selectedCategoryId.value);
    return col ? col.color : '#6366f1';
});

const viewTitle = computed(() => {
    const titles = { focus: 'Good Today 😃', calendar: 'Planning', timeless: 'Backlog & Ideas' };
    return titles[currentView.value];
});


// Display Columns in Timeless (Active + Archived if toggle ON)
const displayColumns = computed(() => {
    if (showArchivedItems.value) {
            return store.columns; // Show all (active and archived)
    }
    return store.activeColumns;
});

// Calendar Logic
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const currentMonthName = computed(() => new Date(currentYear.value, currentMonth.value).toLocaleString('en-US', { month: 'long' }));


// HELPER: Get block color for calendar grid
const getBlockColor = (block) => {
    const col = store.columns.find(c => c.typeFilter === block.type);
    return col ? col.color : '#64748b'; // Default slate-500
};

// HELPER: Get block opacity for calendar grid (List progress)
const getBlockOpacity = (block) => {
    if (block.type !== 'list' || !Array.isArray(block.content) || block.content.length === 0) {
        return 1; // Full opacity for simple tasks or empty lists
    }
    // For lists: Base opacity 0.4 + percentage * 0.6
    const total = block.content.length;
    const checked = block.content.filter(i => i.done).length;
    if (total === 0) return 1;
    return 0.4 + (checked / total) * 0.6;
};

// HELPER: Get list progress string
const getListProgress = (block) => {
        if (!Array.isArray(block.content)) return '';
        const total = block.content.length;
        const checked = block.content.filter(i => i.done).length;
        return `${checked}/${total}`;
};

const calendarDays = computed(() => {
    const days = [];
    const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
    const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push({ dayNumber: '', isCurrentMonth: false, taskCount: 0 });
    for (let i = 1; i <= daysInMonth; i++) {
        const d = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Dots: Pending tasks scheduled for this day
        const dots = store.blocks.filter(b => {
            return !b.isCompleted && !b.isArchived && b.date === d;
        });

        // Squares: Completed tasks
        const squares = store.blocks.filter(b => {
            if (!b.isCompleted || b.isArchived) return false;
            
            if (b.date) {
                // Scheduled task: Show on scheduled date
                return b.date === d;
            } else {
                // Timeless task: Show on completedAt date
                return b.completedAt === d;
            }
        });

        days.push({ 
            dayNumber: i, 
            dateString: d, 
            isCurrentMonth: true, 
            isToday: d === getLocalToday(), 
            dots: dots,
            squares: squares
        });
    }
    return days;
});

const changeMonth = (d) => {
    let nm = currentMonth.value + d;
    if (nm > 11) { nm = 0; currentYear.value++; } else if (nm < 0) { nm = 11; currentYear.value--; }
    currentMonth.value = nm;
};

// --- CENTRALIZED ACTION HANDLER ---
const openPlan = (context, data = {}) => {
    // Reset Basic State
    newBlock.value = { title: '', description: '', listItems: [], type: 'task', date: '', time: '' };
    editingId.value = null;
    
    // Reset Flags
    hasCategory.value = false;
    selectedCategoryId.value = '';
    customCategoryTitle.value = '';
    customCategoryColor.value = '#6366f1';
    isCategoryLocked.value = false;
    
    // Defaults
    let defaultDate = '';
    let defaultTime = false;
    let defaultTimeless = false;
    let defaultHasCategory = false;
    let defaultCatId = '';

    switch(context) {
        case 'header':
            if (currentView.value === 'focus') {
                defaultDate = todayIso.value;
                defaultTime = false; 
                defaultTimeless = false;
            } else if (currentView.value === 'calendar') {
                if (selectedDay.value) {
                    defaultDate = selectedDay.value;
                } else {
                    // Default to 1st of month if navigating
                    const now = new Date();
                    if (currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth()) {
                        defaultDate = getLocalToday();
                    } else {
                        const y = currentYear.value;
                        const m = String(currentMonth.value + 1).padStart(2, '0');
                        defaultDate = `${y}-${m}-01`;
                    }
                }
                defaultTime = false;
                defaultTimeless = false;
            } else if (currentView.value === 'timeless') {
                defaultDate = '';
                defaultTime = false;
                defaultTimeless = true;
                defaultHasCategory = true;
            }
            break;

        case 'agenda':
            defaultDate = data.date;
            defaultTime = true;
            defaultTimeless = false;
            
            // Fix: Default time value if not present
            newBlock.value.time = '09:00'; 
            break;

        case 'todo':
            defaultDate = data.date;
            defaultTime = false;
            defaultTimeless = false;
            break;

        case 'column': // Timeless Column
            defaultDate = '';
            defaultTime = false;
            defaultTimeless = true;
            defaultHasCategory = true;
            defaultCatId = data.column.id;
            if (data.column) newBlock.value.type = data.column.typeFilter; // Inherit type
            break;
            
        case 'schedule': // Schedule existing item
            const block = data.block;
            editingId.value = block.id;
            newBlock.value = { 
                ...block,
                listItems: Array.isArray(block.content) ? JSON.parse(JSON.stringify(block.content)) : []
            };
            
            // Scheduling defaults: Use existing date, or today if none
            if (block.date) {
                defaultDate = block.date;
            } else {
                // If timeless item being scheduled, default to today
                defaultDate = getLocalToday();
            }

            defaultTimeless = false; 
            defaultTime = !!block.time; // If block has time, toggle ON
            
            // Check for category
            const col = store.columns.find(c => c.typeFilter === block.type);
            if(col) {
                defaultHasCategory = true;
                defaultCatId = col.id;
            }
            break;
    }

    // Apply Configuration
    newBlock.value.date = defaultDate;
    isTimeless.value = defaultTimeless;
    hasTime.value = defaultTime;
    hasCategory.value = defaultHasCategory;
    if(defaultCatId) selectedCategoryId.value = defaultCatId;

    // Final safety for timeless
    if(isTimeless.value) newBlock.value.date = '';

    // Open Modal
    showModal.value = true;
};

// --- DELETE HANDLERS (Unified) ---
const initDelete = (payload) => {
    deleteModal.id = payload.id;
    deleteModal.title = payload.title;
    deleteModal.type = payload.type;
    deleteModal.show = true;
};

// --- EXECUTE DELETE (After Confirmation) ---
const executeDelete = () => {
    if (deleteModal.type === 'block') {
        store.deleteBlock(deleteModal.id);
    } else if (deleteModal.type === 'column') {
        store.deleteColumn(deleteModal.id); 
    }
    deleteModal.show = false;
    deleteModal.id = null;
    deleteModal.type = null;
    deleteModal.title = '';
};

const toggleTimeless = () => {
    isTimeless.value = !isTimeless.value;
    if(isTimeless.value) hasTime.value = false;
    if(!isTimeless.value && !newBlock.value.date) {
            if (selectedDay.value && currentView.value === 'calendar') {
                newBlock.value.date = selectedDay.value;
            } else {
                newBlock.value.date = getLocalToday();
            }
    }
}

const addListItem = () => { newBlock.value.listItems.push({ text: '', done: false }); };
const removeListItem = (index) => { newBlock.value.listItems.splice(index, 1); };

const saveNewBlock = () => {
    if (!newBlock.value.title) return;
    
    const finalDate = isTimeless.value ? null : (newBlock.value.date || getLocalToday());
    let finalTime = null;
    if (!isTimeless.value && hasTime.value) {
            finalTime = newBlock.value.time ? newBlock.value.time : '12:00';
    }
    
    let finalType = newBlock.value.type;
    if (hasCategory.value) {
        if (selectedCategoryId.value === 'NEW' && customCategoryTitle.value) {
            const typeSlug = generateSlug(customCategoryTitle.value);
            store.addColumn({
                title: customCategoryTitle.value,
                typeFilter: typeSlug,
                color: customCategoryColor.value
            });
            finalType = typeSlug;
        } else if (selectedCategoryId.value && selectedCategoryId.value !== 'NEW') {
            const col = store.columns.find(c => c.id === selectedCategoryId.value);
            if (col) finalType = col.typeFilter;
        }
    }

    const payload = {
        title: newBlock.value.title,
        description: newBlock.value.description,
        date: finalDate,
        time: finalTime,
        type: finalType
    };

    if (newBlock.value.listItems.length > 0) {
        payload.content = newBlock.value.listItems;
    } else {
        payload.content = '';
    }

    if (editingId.value) {
        store.updateBlock(editingId.value, payload);
    } else {
        store.addBlock(payload);
    }
    
    showModal.value = false;
    editingId.value = null;
};

const selectDay = (date) => {
    if(!date) return;
    selectedDay.value = date;
};

const formatDateFriendly = (d) => {
    if(!d) return '';
    const date = new Date(d);
    // Fix: Ensure we are not shifting due to timezone, assume d is YYYY-MM-DD
    const [y,m,day] = d.split('-').map(Number);
    const dateObj = new Date(y, m-1, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);

};

const saveNewColumn = () => {
    if(!newColumn.value.title) return;
    const typeSlug = generateSlug(newColumn.value.title);
    store.addColumn({
        title: newColumn.value.title,
        typeFilter: typeSlug,
        color: newColumn.value.color
    });
    newColumn.value = { title: '', typeFilter: '', color: '#6366f1' };
    showColumnModal.value = false;
};

const handleHeaderPlan = () => openPlan('header');

watch(currentView, () => selectedDay.value = null);

// --- COMPUTED PROPERTIES FOR SELECTED DAY (Moved to use Store Getters) ---
const selectedDayTimeline = computed(() => {
    if (!selectedDay.value) return [];
    return store.getTimelineByDate(selectedDay.value);
});
const selectedDayTodos = computed(() => {
    if (!selectedDay.value) return [];
    return store.getTodosByDate(selectedDay.value);
});
const selectedDayCompletedTimeline = computed(() => {
    if (!selectedDay.value) return [];
    return store.getCompletedTimelineByDate(selectedDay.value);
});
const selectedDayCompletedTodos = computed(() => {
    if (!selectedDay.value) return [];
    return store.getCompletedTodosByDate(selectedDay.value);
});
const selectedDayArchivedTimeline = computed(() => {
    if (!selectedDay.value) return [];
    return store.getArchivedTimelineByDate(selectedDay.value);
});
const selectedDayArchivedTodos = computed(() => {
    if (!selectedDay.value) return [];
    return store.getArchivedTodosByDate(selectedDay.value);
});

onMounted(() => {
    store.init();
});
</script>

<template>
<div class="h-screen flex text-fw-text font-sans antialiased bg-fw-bg-deep overflow-hidden selection:bg-fw-accent selection:text-fw-bg-deep">
    <!-- Sidebar -->
    <aside class="w-20 lg:w-64 border-r border-fw-border flex flex-col justify-between bg-fw-bg-alt/50 transition-all duration-300 hidden md:flex">
        <div>
            <div class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-fw-border">
                <div class="w-8 h-8 bg-fw-accent rounded-lg flex items-center justify-center mr-0 lg:mr-3 shadow-lg shadow-fw-accent/20">
                     <icon-lucide name="target" size="20" class="text-white hidden lg:block" style="display:none"></icon-lucide> <!-- Placeholder logic if needed -->
                     <!-- SVG Logo matching original -->
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <span class="font-bold text-lg tracking-tight hidden lg:block">Forward</span>
            </div>
            
            <nav class="mt-6 flex flex-col gap-2 px-2">
                <nav-item label="Focus" icon="target" :active="currentView === 'focus'" @click="currentView = 'focus'"></nav-item>
                <nav-item label="Calendar" icon="calendar" :active="currentView === 'calendar'" @click="currentView = 'calendar'"></nav-item>
                <nav-item label="Timeless" icon="infinity" :active="currentView === 'timeless'" @click="currentView = 'timeless'"></nav-item>
            </nav>
        </div>
        
        <div class="p-4 border-t border-fw-border">
            <div class="hidden lg:flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-fw-surface"></div>
                <div class="text-sm">
                    <p class="font-medium">User</p>
                    <p class="text-xs text-fw-text-faint">Pro Plan</p>
                </div>
            </div>
        </div>
    </aside>

    <!-- Mobile Nav (Bottom) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-fw-bg-alt border-t border-fw-border p-2 z-40 flex justify-around">
        <button class="p-2 text-fw-text-muted" :class="currentView==='focus' ? 'text-fw-accent' : ''" @click="currentView='focus'"><icon-lucide name="target" size="24"></icon-lucide></button>
        <button class="p-2 text-fw-text-muted" :class="currentView==='calendar' ? 'text-fw-accent' : ''" @click="currentView='calendar'"><icon-lucide name="calendar" size="24"></icon-lucide></button>
        <button class="p-2 text-fw-text-muted" :class="currentView==='timeless' ? 'text-fw-accent' : ''" @click="currentView='timeless'"><icon-lucide name="infinity" size="24"></icon-lucide></button>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
        <!-- Top Bar -->
        <header class="h-16 border-b border-fw-border flex items-center justify-between px-6 bg-fw-bg-alt/50 backdrop-blur-sm z-10">
            <h1 class="text-xl font-semibold capitalize">{{ viewTitle }}</h1>
            <div class="flex gap-3 items-center">
                <!-- SHOW ARCHIVED TOGGLE (Only in Timeless) -->
                <div v-if="currentView === 'timeless'" class="flex items-center gap-2 mr-2">
                    <span class="text-xs font-medium text-fw-text-muted">Show Archived</span>
                    <button 
                        @click="showArchivedItems = !showArchivedItems" 
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                        :class="showArchivedItems ? 'bg-fw-accent' : 'bg-fw-surface'"
                    >
                        <span class="inline-block h-3 w-3 transform rounded-full transition-transform" :class="[showArchivedItems ? 'translate-x-5 bg-fw-bg-deep' : 'translate-x-1 bg-fw-text-muted']"></span>
                    </button>
                </div>

                <plan-button variant="primary" label="Plan" icon="plus" @click="handleHeaderPlan"></plan-button>
            </div>
        </header>

        <!-- Views -->
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth bg-gradient-to-br from-fw-bg-deep to-fw-bg">

            
            <!-- VIEW: FOCUS (TODAY) -->
            <div v-if="currentView === 'focus'" class="h-full animate-fade-in">
                <day-dashboard 
                    :timeline="store.todayTimeline"
                    :todos="store.todayTodos"
                    :completed-timeline="store.todayCompletedTimeline"
                    :completed-todos="store.todayCompletedTodos"
                    :archived-timeline="store.todayArchivedTimeline"
                    :archived-todos="store.todayArchivedTodos"
                    :date-ref="todayIso"
                    @request-plan="(ctx, data) => openPlan(ctx, data)"
                    @schedule="(b) => openPlan('schedule', { block: b })"
                    @request-delete="initDelete"
                ></day-dashboard>
            </div>

                <!-- VIEW: CALENDAR -->
                <div v-if="currentView === 'calendar'" class="h-full flex flex-col max-w-6xl mx-auto glass-panel rounded-2xl overflow-hidden">
                    
                    <!-- CALENDAR GRID (Default View) -->
                    <div v-if="!selectedDay" class="h-full flex flex-col">
                    <!-- Calendar Header -->
                    <div class="flex items-center justify-between p-4 border-b border-fw-border bg-fw-surface/50">
                        <button @click="changeMonth(-1)" class="p-2 hover:bg-fw-surface-hover rounded-lg"><icon-lucide name="chevron-left" size="20"></icon-lucide></button>
                        <h2 class="text-lg font-semibold">{{ currentMonthName }} {{ currentYear }}</h2>
                        <button @click="changeMonth(1)" class="p-2 hover:bg-fw-surface-hover rounded-lg"><icon-lucide name="chevron-right" size="20"></icon-lucide></button>
                    </div>
                    <!-- Week Days -->
                    <div class="grid grid-cols-7 border-b border-fw-border bg-fw-bg/50">
                        <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="py-2 text-center text-xs font-medium text-fw-text-faint uppercase">
                            {{ day }}
                        </div>
                    </div>
                    <!-- Days Grid -->
                    <div class="grid grid-cols-7 grid-rows-5 flex-1 bg-fw-border gap-[1px]">
                        <div 
                            v-for="(day, index) in calendarDays" 
                            :key="index"
                            @click="selectDay(day.dateString)"
                            class="bg-fw-bg min-h-[80px] p-2 relative group hover:bg-fw-surface transition-colors cursor-pointer"
                            :class="{'opacity-30': !day.isCurrentMonth, 'bg-fw-accent/10': day.isToday}"
                        >
                            <div class="flex justify-between items-start">
                                <span class="text-sm font-medium z-10" :class="day.isToday ? 'text-fw-accent' : 'text-fw-text-muted'">{{ day.dayNumber }}</span>
                            </div>
                            
                            <div class="flex flex-wrap content-start gap-1 mt-1">
                                <!-- Pending Tasks (DOTS) -->
                                <div 
                                    v-for="block in day.dots" 
                                    :key="'d'+block.id"
                                    class="w-1.5 h-1.5 rounded-full"
                                    :style="{ backgroundColor: getBlockColor(block) }"
                                    :title="block.title + ' (Pending)'"
                                ></div>
                                
                                <!-- Completed Tasks (SQUARES) -->
                                <div 
                                    v-for="block in day.squares" 
                                    :key="'s'+block.id" 
                                    class="w-2.5 h-2.5 rounded-[2px] transition-opacity duration-300"
                                    :style="{ 
                                        backgroundColor: getBlockColor(block),
                                        opacity: getBlockOpacity(block)
                                    }"
                                    :title="block.title + ' (Completed)' + (block.type === 'list' ? ' ' + getListProgress(block) : '')"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SELECTED DAY VIEW (Replaces Grid) -->
                <div v-else class="h-full flex flex-col p-2 animate-fade-in">
                    <!-- Drill-down Header -->
                    <div class="flex items-center gap-4 mb-2 pb-2 border-b border-fw-border">
                        <button @click="selectedDay = null" class="flex items-center gap-2 text-sm text-fw-text-muted hover:text-fw-text transition-colors bg-fw-surface px-3 py-1.5 rounded-lg">
                            <icon-lucide name="chevron-left" size="16"></icon-lucide> Back to Month
                        </button>
                        <div>
                            <h2 class="text-xl font-semibold text-fw-text">{{ formatDateFriendly(selectedDay) }}</h2>
                        </div>
                    </div>

                    <!-- Reuse DayDashboard Component -->
                    <day-dashboard 
                        :timeline="selectedDayTimeline"
                        :todos="selectedDayTodos"
                        :completed-timeline="selectedDayCompletedTimeline"
                        :completed-todos="selectedDayCompletedTodos"
                        :archived-timeline="selectedDayArchivedTimeline"
                        :archived-todos="selectedDayArchivedTodos"
                        :date-ref="selectedDay"
                        @request-plan="(ctx, data) => openPlan(ctx, data)"
                        @schedule="(b) => openPlan('schedule', { block: b })"
                        @request-delete="initDelete"
                    ></day-dashboard>
                </div>

            </div>

            <!-- VIEW: TIMELESS (BACKLOG) -->
            <div v-if="currentView === 'timeless'" class="h-full flex flex-col">
                <div class="flex gap-6 h-full overflow-x-auto pb-4 items-stretch px-2">
                    
                    <!-- Columns Loop -->
                    <div v-for="col in displayColumns" :key="col.id" class="flex flex-col glass-panel rounded-xl h-full min-w-[320px] w-full max-w-sm bg-fw-bg/80 border-t-4" :style="{ borderColor: col.color }" :class="{'opacity-75 border-dashed': col.isArchived}">
                        <div class="p-4 border-b border-fw-border flex justify-between items-center">
                            <h3 class="font-medium truncate pr-2 flex items-center gap-2">
                                {{ col.title }}
                                <span v-if="col.isArchived" class="text-[10px] text-amber-500 bg-amber-900/30 px-1.5 rounded border border-amber-900/50">Archived</span>
                            </h3>
                            <div class="flex items-center gap-1">
                                <!-- Archive/Unarchive Column -->
                                <button @click="store.toggleArchiveColumn(col.id)" :title="col.isArchived ? 'Unarchive' : 'Archive'" class="p-1.5 text-fw-text-faint hover:text-amber-400 hover:bg-fw-surface rounded transition-colors">
                                    <icon-lucide name="archive" size="14"></icon-lucide>
                                </button>
                                <!-- Permanent Delete Column -->
                                <button @click="initDelete({ id: col.id, type: 'column', title: col.title })" title="Delete forever" class="p-1.5 text-fw-text-faint hover:text-red-400 hover:bg-fw-surface rounded transition-colors">
                                    <icon-lucide name="trash" size="14"></icon-lucide>
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            <div class="space-y-3">
                                <!-- Use new @schedule listener here and pass to openPlan -->
                                <block-item 
                                    v-for="block in store.getBacklogByType(col.typeFilter)" 
                                    :key="block.id" 
                                    :block="block" 
                                    :is-backlog="true" 
                                    @schedule="(b) => openPlan('schedule', { block: b })"
                                    @request-delete="initDelete"
                                ></block-item>
                                
                                <!-- Add Button -->
                                <button @click="openPlan('column', { column: col })" class="w-full py-2 text-sm text-fw-text-faint border border-dashed border-fw-border rounded-lg hover:text-fw-text-muted transition-colors" :style="{ borderColor: col.color, color: col.color }">
                                    + Add
                                </button>
                            </div>

                            <!-- Completed Section for Backlog -->
                            <div v-if="store.getCompletedBacklogByType(col.typeFilter).length > 0" class="mt-6 pt-4 border-t border-fw-border/50">
                                <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider">Completed</h3>
                                <div class="space-y-3 opacity-60">
                                    <block-item v-for="block in store.getCompletedBacklogByType(col.typeFilter)" :key="block.id" :block="block" :is-backlog="true" @request-delete="initDelete"></block-item>
                                </div>
                            </div>

                            <!-- Archived Section for Backlog (Controlled by Toggle) -->
                            <div v-if="showArchivedItems && store.getArchivedBacklogByType(col.typeFilter).length > 0" class="mt-4 pt-4 border-t border-fw-border/50">
                                <h3 class="text-xs text-fw-text-faint font-medium mb-3 uppercase tracking-wider flex items-center gap-1">
                                    <icon-lucide name="archive" size="12"></icon-lucide> Archived
                                </h3>
                                <div class="space-y-3 opacity-40 hover:opacity-80 transition-opacity">
                                    <block-item v-for="block in store.getArchivedBacklogByType(col.typeFilter)" :key="block.id" :block="block" :is-backlog="true" @request-delete="initDelete"></block-item>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- NEW COLUMN PLACEHOLDER CARD -->
                    <button @click="showColumnModal = true" class="flex flex-col items-center justify-center glass-panel rounded-xl h-full min-w-[320px] w-full max-w-sm bg-fw-bg/40 border-2 border-dashed border-fw-border hover:bg-fw-surface/50 hover:border-fw-border-strong transition-all group cursor-pointer">
                        <div class="w-12 h-12 rounded-full bg-fw-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                            <icon-lucide name="plus" size="24" class="text-fw-text-faint group-hover:text-fw-text transition-colors"></icon-lucide>
                        </div>
                        <span class="text-fw-text-faint font-medium group-hover:text-fw-text transition-colors">Add New Column</span>
                    </button>

                </div>
            </div>

        </div>
    </main>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="deleteModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div class="bg-fw-bg border border-fw-border w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-scale-in">
            <div class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <icon-lucide name="trash" size="24" class="text-red-500"></icon-lucide>
            </div>
            <h3 class="text-lg font-bold text-fw-text mb-2">Are you sure?</h3>
            <p class="text-fw-text-muted text-sm mb-6">
                It will delete <strong class="text-fw-text">"{{ deleteModal.title }}"</strong> forever. This action cannot be undone.
            </p>
            <div class="flex gap-3 justify-center">
                <button @click="deleteModal.show = false" class="px-4 py-2 text-sm text-fw-text-muted hover:text-fw-text bg-fw-surface hover:bg-fw-surface-hover rounded-lg transition-colors">Cancel</button>
                <button @click="executeDelete" class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/20 transition-colors">Delete</button>
            </div>
        </div>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-fw-bg border border-fw-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div class="p-4 border-b border-fw-border flex justify-between items-center">
                <h3 class="font-semibold text-fw-text">Plan</h3>
                <button @click="showModal = false" class="text-fw-text-muted hover:text-fw-text"><icon-lucide name="x" size="20"></icon-lucide></button>
            </div>
            <div class="p-6 space-y-5 overflow-y-auto">
                <!-- Title -->
                <div>
                    <input v-model="newBlock.title" type="text" placeholder="Title" class="w-full bg-transparent border-0 border-b border-fw-border px-0 py-2 text-lg text-fw-text placeholder-fw-text-faint focus:outline-none focus:border-fw-accent transition-colors" autofocus>
                </div>

                 <!-- Description -->
                 <div>
                    <textarea v-model="newBlock.description" rows="2" placeholder="Description (optional)..." class="w-full bg-fw-surface/50 border border-fw-border rounded-lg px-3 py-2 text-sm text-fw-text focus:outline-none focus:ring-1 focus:ring-fw-accent resize-none"></textarea>
                </div>

                <!-- Checklist Section -->
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-fw-text-muted uppercase tracking-wide">List Items</label>
                    <div v-for="(item, index) in newBlock.listItems" :key="index" class="flex gap-2">
                        <div class="mt-2 w-4 h-4 rounded-sm border border-fw-border flex-shrink-0"></div>
                        <input v-model="item.text" type="text" class="flex-1 bg-transparent border-0 border-b border-fw-border/50 py-1 text-sm focus:outline-none focus:border-fw-accent" placeholder="List item">
                        <button @click="removeListItem(index)" class="text-fw-text-faint hover:text-red-400"><icon-lucide name="x" size="14"></icon-lucide></button>
                    </div>
                    <button @click="addListItem" class="text-xs text-fw-accent hover:text-fw-accent-bright flex items-center gap-1 font-medium mt-1">
                        <icon-lucide name="plus" size="12"></icon-lucide> Add list item
                    </button>
                </div>

                <!-- CATEGORY TOGGLE -->
                <div class="pt-2 border-t border-fw-border/50">
                    <div class="flex items-center justify-between mb-3" :class="{'opacity-50': isCategoryLocked}">
                        <span class="text-sm font-medium text-fw-text-muted">Add Category?</span>
                        <button 
                            @click="hasCategory = !hasCategory" 
                            :disabled="isCategoryLocked"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fw-accent focus:ring-offset-2 focus:ring-offset-fw-bg"
                            :class="[hasCategory ? 'bg-fw-accent' : 'bg-fw-surface', isCategoryLocked ? 'cursor-not-allowed' : '']"
                        >
                            <span class="inline-block h-4 w-4 transform rounded-full transition-transform" :class="[hasCategory ? 'translate-x-6 bg-fw-bg-deep' : 'translate-x-1 bg-fw-text-muted']"></span>
                        </button>
                    </div>
                    
                    <div v-if="hasCategory" class="space-y-3 animate-fade-in mb-4 bg-fw-surface/30 p-3 rounded-lg">
                        <div>
                            <label class="block text-[10px] text-fw-text-muted mb-1 uppercase">Category</label>
                            <select v-model="selectedCategoryId" class="w-full bg-fw-surface border border-fw-border rounded px-2 py-1.5 text-sm text-fw-text focus:outline-none focus:border-fw-accent">
                                <option v-for="col in store.columns" :key="col.id" :value="col.id">{{ col.title }}</option>
                                <option value="NEW">+ Create new...</option>
                            </select>
                        </div>

                        <div v-if="selectedCategoryId === 'NEW'" class="animate-fade-in space-y-3 pt-1">
                            <div>
                                <label class="block text-[10px] text-fw-text-muted mb-1 uppercase">Category Name</label>
                                <input v-model="customCategoryTitle" type="text" placeholder="Ex: University" class="w-full bg-fw-surface border border-fw-border rounded px-2 py-1.5 text-sm text-fw-text focus:outline-none focus:border-fw-accent">
                            </div>
                            <div>
                                <label class="block text-[10px] text-fw-text-muted mb-1 uppercase">Color</label>
                                <input v-model="customCategoryColor" type="color" class="w-full h-8 bg-fw-surface border border-fw-border rounded cursor-pointer">
                            </div>
                        </div>
                        <div v-else-if="selectedCategoryId" class="animate-fade-in pt-1">
                            <label class="block text-[10px] text-fw-text-muted mb-1 uppercase">Color (Assigned)</label>
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded border border-fw-border" :style="{ backgroundColor: selectedCategoryColor }"></div>
                                <span class="text-xs text-fw-text-faint">{{ selectedCategoryColor }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Meta Controls (Date/Time) -->
                <div class="pt-2 border-t border-fw-border/50">
                    <!-- Date Toggle -->
                    <div class="flex items-center justify-between mb-3" :class="{'opacity-50': isDateDisabled}">
                        <span class="text-sm font-medium text-fw-text-muted">Assign Date?</span>
                        <button 
                            @click="toggleTimeless" 
                            :disabled="isDateDisabled"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fw-accent focus:ring-offset-2 focus:ring-offset-fw-bg"
                            :class="[!isTimeless ? 'bg-fw-accent' : 'bg-fw-surface', isDateDisabled ? 'cursor-not-allowed' : '']"
                        >
                            <span class="inline-block h-4 w-4 transform rounded-full transition-transform" :class="[!isTimeless ? 'translate-x-6 bg-fw-bg-deep' : 'translate-x-1 bg-fw-text-muted']"></span>
                        </button>
                    </div>

                    <!-- Date Inputs -->
                    <div v-if="!isTimeless" class="space-y-4 animate-fade-in bg-fw-surface/30 p-3 rounded-lg">
                        <div class="flex gap-3">
                            <div class="flex-1">
                                <label class="block text-[10px] text-fw-text-muted mb-1 uppercase">Date</label>
                                <input v-model="newBlock.date" type="date" :disabled="isDateLocked" class="w-full bg-fw-surface border border-fw-border rounded px-2 py-1.5 text-sm text-fw-text focus:outline-none focus:border-fw-accent disabled:opacity-50 disabled:cursor-not-allowed">
                            </div>
                        </div>
                        
                        <!-- TOGGLE TIME -->
                        <div class="flex items-center justify-between" :class="{'opacity-50': isTimeDisabled}">
                            <span class="text-xs font-medium text-fw-text-muted">Specific Time?</span>
                            <div class="flex items-center gap-3">
                                <button 
                                    @click="hasTime = !hasTime" 
                                    :disabled="isTimeDisabled"
                                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                    :class="[hasTime ? 'bg-fw-accent' : 'bg-fw-surface', isTimeDisabled ? 'cursor-not-allowed' : '']"
                                >
                                    <span class="inline-block h-3 w-3 transform rounded-full transition-transform" :class="[hasTime ? 'translate-x-5 bg-fw-bg-deep' : 'translate-x-1 bg-fw-text-muted']"></span>
                                </button>
                            </div>
                        </div>

                        <div v-if="hasTime" class="animate-fade-in">
                            <input v-model="newBlock.time" type="time" class="w-full bg-fw-surface border border-fw-border rounded px-2 py-1.5 text-sm text-fw-text focus:outline-none focus:border-fw-accent">
                        </div>
                    </div>

                    <!-- Backlog Message -->
                    <div v-else class="p-3 bg-fw-surface/50 rounded-lg border border-fw-border/50 text-xs text-fw-text-muted flex items-center justify-center gap-2 animate-fade-in">
                        <icon-lucide name="infinity" size="14"></icon-lucide>
                        <span>Will be saved in <strong>Timeless</strong></span>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-fw-surface/50 flex justify-end gap-2 border-t border-fw-border">
                <button @click="showModal = false" class="px-4 py-2 text-sm text-fw-text-muted hover:text-fw-text transition-colors">Cancel</button>
                <button @click="saveNewBlock" class="px-6 py-2 text-sm bg-fw-accent hover:bg-fw-accent-bright text-fw-bg-deep rounded-lg font-medium shadow-lg shadow-fw-accent/20 transition-all transform active:scale-95">Save</button>
            </div>
        </div>
    </div>

    <!-- NEW COLUMN MODAL -->
    <div v-if="showColumnModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-fw-bg border border-fw-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div class="p-4 border-b border-fw-border flex justify-between items-center">
                <h3 class="font-semibold text-fw-text">New Column</h3>
                <button @click="showColumnModal = false" class="text-fw-text-muted hover:text-fw-text"><icon-lucide name="x" size="20"></icon-lucide></button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-xs text-fw-text-muted mb-1">Column Title</label>
                    <input v-model="newColumn.title" type="text" placeholder="Ex: Projects" class="w-full bg-fw-surface border border-fw-border rounded-lg px-3 py-2 text-fw-text focus:outline-none focus:ring-2 focus:ring-fw-accent">
                </div>
                <div>
                    <label class="block text-xs text-fw-text-muted mb-1">Color (Hex)</label>
                    <input v-model="newColumn.color" type="color" class="w-full h-10 bg-fw-surface border border-fw-border rounded-lg cursor-pointer">
                </div>
            </div>
            <div class="p-4 bg-fw-surface/50 flex justify-end gap-2">
                <button @click="showColumnModal = false" class="px-4 py-2 text-sm text-fw-text-muted hover:text-fw-text">Cancel</button>
                <button @click="saveNewColumn" class="px-4 py-2 text-sm bg-fw-accent hover:bg-fw-accent-bright text-fw-bg-deep rounded-lg font-medium">Create</button>
            </div>
            </div>
    </div>
</div>
</template>
