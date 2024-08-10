export const generateUniqueId = (() => {
    let id = 0;
    return () => `id-${++id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
})();
