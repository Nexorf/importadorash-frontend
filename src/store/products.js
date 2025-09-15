import { create } from "zustand";

export const useProductUI = create((set) => ({
    page: 1,
    limit: 12,
    q: "",
    subcategoryId: null,
    selectedIds: [],

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit }),
    setSearch: (q) => set({ q, page: 1 }),
    setSubcategory: (id) => set({ subcategoryId: id, page: 1 }),
    setSelected: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
}));
