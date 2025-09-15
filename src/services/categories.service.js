import { api } from "@/lib/api";

const mapCategory = (c = {}) => ({
    id: c.id,
    name: c.name ?? c.nombre ?? "Categoría",
});

export async function listCategories() {
    const res = await api.get("/category");
    const payload = res.data ?? {};
    const arr = Array.isArray(payload?.data?.category)
        ? payload.data.category
        : Array.isArray(payload?.category)
            ? payload.category
            : Array.isArray(payload?.data)
                ? payload.data
                : [];
    return { categories: arr.map(mapCategory) };
}

export async function getCategoryTree() {
    const res = await api.get("/category/tree/");
    const payload = res.data ?? {};
    const raw = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.categories)
            ? payload.categories
            : Array.isArray(payload?.category)
                ? payload.category
                : [];
    return raw.map((c) => ({
        ...mapCategory(c),
        subcategories: Array.isArray(c.sub_categories ?? c.subcategories ?? c.subCats)
            ? (c.sub_categories ?? c.subcategories ?? c.subCats).map((s) => ({
                id: s.id,
                name: s.name ?? s.nombre ?? "Subcategoría",
                categoryId: s.category_id ?? c.id ?? null,
            }))
            : [],
    }));
}

export async function createCategory(input) {
    const data = (await api.post("/category", input)).data ?? {};
    return { category: data.category ? mapCategory(data.category) : null };
}

// NUEVO: update (ajusta PUT/PATCH según tu backend)
export async function updateCategory({ id, name }) {
    const data = (await api.put(`/category/${id}`, { name })).data ?? {};
    return { category: data.category ? mapCategory(data.category) : null };
}

export async function deleteCategory(id) {
    const data = (await api.delete(`/category/${id}`)).data ?? {};
    return data ?? {};
}
