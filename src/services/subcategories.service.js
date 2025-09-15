import { api } from "@/lib/api";

const mapSubcategory = (s = {}) => ({
    id: s.id,
    name: s.name ?? s.nombre ?? "Subcategoría",
    categoryId: s.category_id ?? null,
});

export async function listSubcategories(params = {}) {
    const res = await api.get("/subcategory", { params });
    const payload = res.data ?? {};
    const arr = Array.isArray(payload?.data?.subCategory)
        ? payload.data.subCategory
        : Array.isArray(payload?.subCategory)
            ? payload.subCategory
            : Array.isArray(payload?.subcategories)
                ? payload.subcategories
                : Array.isArray(payload?.data)
                    ? payload.data
                    : [];
    return { subcategories: arr.map(mapSubcategory) };
}

export async function createSubcategory(input) {
    const res = await api.post("/subcategory", input);
    const data = res.data ?? {};
    return { subcategory: data.subcategory ? mapSubcategory(data.subcategory) : null };
}

// NUEVO: update
export async function updateSubcategory({ id, name, category_id }) {
    const res = await api.put(`/subcategory/${id}`, { name, category_id });
    const data = res.data ?? {};
    return { subcategory: data.subcategory ? mapSubcategory(data.subcategory) : null };
}

export async function deleteSubcategory(id) {
    const res = await api.delete(`/subcategory/${id}`);
    return res.data ?? {};
}
