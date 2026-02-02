import { defineStore } from 'pinia';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'; 

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        blocks: [],
        columns: [],
        loading: true
    }),
    getters: {
        activeColumns: (state) => state.columns.filter(c => !c.isArchived),
        archivedColumnsList: (state) => state.columns.filter(c => c.isArchived),
        
        todayBlocks: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && !b.isArchived);
        },
        todayTimeline: (state) => {
            const today = getLocalToday();
            return state.blocks
                .filter(b => b.date === today && b.time && !b.isCompleted && !b.isArchived && !b.isDeleted)
                .sort((a, b) => a.time.localeCompare(b.time));
        },
        todayTodos: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && !b.time && !b.isCompleted && !b.isArchived && !b.isDeleted);
        },
        todayCompletedTimeline: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && b.isCompleted && b.time && !b.isArchived && !b.isDeleted);
        },
        todayCompletedTodos: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && b.isCompleted && !b.time && !b.isArchived && !b.isDeleted);
        },
        todayArchivedTimeline: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && b.isArchived && b.time && !b.isDeleted);
        },
        todayArchivedTodos: (state) => {
            const today = getLocalToday();
            return state.blocks.filter(b => b.date === today && b.isArchived && !b.time && !b.isDeleted);
        },

        getBacklogByType: (state) => (type) => {
            return state.blocks.filter(b => !b.date && b.type === type && !b.isCompleted && !b.isArchived && !b.isDeleted);
        },
        getCompletedBacklogByType: (state) => (type) => {
            return state.blocks.filter(b => !b.date && b.type === type && b.isCompleted && !b.isArchived && !b.isDeleted);
        },
        getArchivedBacklogByType: (state) => (type) => {
            return state.blocks.filter(b => !b.date && b.type === type && b.isArchived && !b.isDeleted);
        },

        getBlocksByDate: (state) => (date) => {
            return state.blocks.filter(b => b.date === date && !b.isArchived && !b.isDeleted);
        },
        getCompletedTimelineByDate: (state) => (date) => {
            return state.blocks.filter(b => b.date === date && b.isCompleted && b.time && !b.isArchived && !b.isDeleted);
        },
        getCompletedTodosByDate: (state) => (date) => {
            return state.blocks.filter(b => b.date === date && b.isCompleted && !b.time && !b.isArchived && !b.isDeleted);
        },
        getArchivedTimelineByDate: (state) => (date) => {
            return state.blocks.filter(b => b.date === date && b.isArchived && b.time && !b.isDeleted);
        },
        getArchivedTodosByDate: (state) => (date) => {
            return state.blocks.filter(b => b.date === date && b.isArchived && !b.time && !b.isDeleted);
        },
        getTimelineByDate: (state) => (date) => {
             return state.blocks.filter(b => b.date === date && b.time && !b.isCompleted && !b.isArchived && !b.isDeleted).sort((a, b) => a.time.localeCompare(b.time));
        },
        getTodosByDate: (state) => (date) => {
             return state.blocks.filter(b => b.date === date && !b.time && !b.isCompleted && !b.isArchived && !b.isDeleted);
        }
    },
    actions: {
        init() {
            // Subscribe to Firestore
            // For now, we subscribe to everything. ideally we'd paginate or filter.
            const blocksCol = collection(db, 'blocks');
            const columnsCol = collection(db, 'columns');

            onSnapshot(blocksCol, (snapshot) => {
                this.blocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            });

            onSnapshot(columnsCol, (snapshot) => {
                this.columns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Fallback default columns if empty
                if(this.columns.length === 0) {
                     // We could init defaults here, but let's leave it empty or user will create them.
                     // Or push defaults.
                }
            });
        },
        async addBlock(block) {
            // Firestore auto-id or custom? Using auto-id is easier but we might want to keep the local optimistic update structure?
            // We'll use addDoc which generates ID.
            const col = collection(db, 'blocks');
            await addDoc(col, { 
                isCompleted: false, 
                isArchived: false, 
                isDeleted: false, 
                ...block 
            });
        },
        async updateBlock(id, updates) {
            const docRef = doc(db, 'blocks', id);
            await updateDoc(docRef, updates);
        },
        async toggleComplete(id) {
            const block = this.blocks.find(b => b.id === id);
            if (block) { 
                const newStatus = !block.isCompleted;
                const updates = { isCompleted: newStatus };
                if (newStatus) {
                    updates.completedAt = getLocalToday();
                } else {
                    updates.completedAt = null;
                }
                await this.updateBlock(id, updates);
            }
        },
        async toggleArchive(id) {
            const block = this.blocks.find(b => b.id === id);
            if (block) { 
                await this.updateBlock(id, { isArchived: !block.isArchived });
            }
        },
        async deleteBlock(id) {
            const docRef = doc(db, 'blocks', id);
            await deleteDoc(docRef);
        },
        async duplicateBlock(id) {
            const original = this.blocks.find(b => b.id === id);
            if (original) {
                const { id: _, ...data } = original; // Exclude ID
                const copy = {
                    ...data,
                    title: `${data.title} (Copia)`,
                    isCompleted: false,
                    isArchived: false,
                    completedAt: null,
                };
                if(Array.isArray(copy.content)) copy.content.forEach(i => i.done = false);
                await this.addBlock(copy);
            }
        },
        // Columns
        async addColumn(col) {
            const colRef = collection(db, 'columns');
            await addDoc(colRef, { isArchived: false, ...col });
        },
        async toggleArchiveColumn(id) {
            const col = this.columns.find(c => c.id === id);
            if(col) { 
                await updateDoc(doc(db, 'columns', id), { isArchived: !col.isArchived });
            }
        },
        async deleteColumn(id) {
            await deleteDoc(doc(db, 'columns', id));
        }
    }
});

// Utils
const getLocalToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
