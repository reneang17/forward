export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
export const generateSlug = (text) => text.toLowerCase().trim().replace(/\s+/g, '-') + '-' + Date.now().toString(36).substr(-4);

export const getLocalToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
