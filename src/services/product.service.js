import { api } from "@/lib/api";

const mapProduct = (p = {}) => ({
    id: p.id,
    name: p.nombre ?? p.name ?? "Producto",
    description:
        p.descripcionDetallada ??
        p.descripcion ??
        p.description ??
        "Sin descripción.",
    price: p.precio ?? p.price ?? 0,
    categoryId: p.category_id ?? p.categoryId ?? null,
    subcategoryId: p.subcategoria_id ?? p.subcategoryId ?? null,
    stock: p.stock ?? 0,
    featured: p.feature ?? p.destacado ?? p.featured ?? false,
    discountPct: p.discount_pct ?? p.discountPct ?? 0,
    imageUrl: p.urlImagen ?? p.imageUrl ?? null,
    videoUrl: p.urlVideo ?? p.videoUrl ?? null,
    brand: p.marca ?? p.brand ?? null,
    sku: p.code ?? p.sku ?? null,
    rating: p.rating ?? 0,
    specs: Array.isArray(p.especificaciones)
        ? Object.fromEntries(
            p.especificaciones.map((s, i) => [`Item ${i + 1}`, s])
        )
        : p.especificaciones ?? p.specs ?? {},
    createdAt: p.createdAt,
});

const adaptProduct = (p = {}) => ({
    id: p.id,
    name: p.name ?? p.nombre ?? "Producto",
    description: p.description ?? p.descripcion ?? "",
    descriptionLong: p.descripcionDetallada ?? p.descriptionLong ?? "",
    price: Number(p.precio ?? p.price ?? 0),
    stock: Number(p.stock ?? 0),
    discountPct: Number(p.discount_pct ?? p.discountPct ?? 0),
    featured: Boolean(p.destacado ?? p.feature ?? false),
    rating: Number(p.rating ?? 0),
    brand: p.marca ?? p.brand ?? "",
    warranty: p.garantia ?? p.warranty ?? "",
    imageUrl: p.urlImagen ?? p.image_url ?? p.imageUrl ?? "",
    videoUrl: p.urlVideo ?? p.video_url ?? p.videoUrl ?? "",
    // ids
    subcategoryId: p.subcategory_id ?? p.subcategoria_id ?? p.subCategoryId ?? null,
    categoryId:
        p.category_id ?? p.categoria_id ?? p.category?.id ?? p.categoria?.id ?? null,
    // nombres para UI
    categoryName:
        p.category?.name ?? p.categoria?.name ?? p.category_name ?? p.categoria_nombre ?? null,
    subcategoryName:
        p.subcategory?.name ?? p.subcategoria?.name ?? p.subcategory_name ?? p.subcategoria_nombre ?? null,
    code: p.code ?? p.sku ?? "",
    createdAt: p.createdAt,
});

export async function listProducts(params = {}) {
    const res = await api.get("/products", { params });
    // res.data => { products, pagination }
    const data = res.data ?? {};
    return {
        products: (data.products ?? []).map(mapProduct),
        pagination: data.pagination ?? {
            page: 1, limit: 10, total: 0, pages: 0, hasNext: false, hasPrev: false
        },
    };
}

export async function getProductById(id) {
    const safeId = String(id).trim();
    try {
        const r = await api.get(`/products/id/${safeId}`);
        const d = r?.data?.data ?? r?.data ?? {};
        const prod = d.product ?? d;
        return { product: prod ? adaptProduct(prod) : null };
    } catch {
        const r2 = await api.get(`/product/id/${safeId}`);
        const d2 = r2?.data?.data ?? r2?.data ?? {};
        const prod2 = d2.product ?? d2;
        return { product: prod2 ? adaptProduct(prod2) : null };
    }
}

// services/product.service.js
export async function createProduct(input) {
    if (!(input?.imageFile instanceof File)) {
        throw new Error("Debes subir una imagen (imageFile).");
    }

    const fd = new FormData();
    fd.append("code", input.code ?? "");
    fd.append("nombre", input.nombre ?? input.name ?? "");
    fd.append("descripcion", input.descripcion ?? input.description ?? "");
    fd.append("precio", String(input.precio ?? input.price ?? 0));
    fd.append("stock", String(input.stock ?? 0));
    fd.append("discount_pct", String(input.discount_pct ?? input.discountPct ?? 0));
    fd.append("feature", (input.feature ?? input.featured ?? false) ? "true" : "false");

    if (input.category_id ?? input.categoryId) {
        fd.append("category_id", String(input.category_id ?? input.categoryId));
    }
    if (input.subcategoria_id ?? input.subcategoryId) {
        fd.append("subcategoria_id", String(input.subcategoria_id ?? input.subcategoryId));
    }
    if (input.urlVideo ?? input.videoUrl) {
        fd.append("urlVideo", String(input.urlVideo ?? input.videoUrl));
    }

    fd.append("image", input.imageFile, input.imageFile.name);

    const res = await api.post("/products", fd);
    const apiData = res?.data?.data ?? res?.data ?? null;
    const product = apiData?.product ?? apiData ?? null; // ← aquí llega urlImagen y cloudinaryId
    return { product };
}

export async function updateProduct(id, data) {
    if (!id) throw new Error("Falta id");
    if (data?.imageFile) {
        const form = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (k === "imageFile") return;
            if (v !== undefined && v !== null) form.append(k, v);
        });
        form.append("image", data.imageFile, data.imageFile.name);
        const res = await api.put(`/products/${id}`, form);
        return res.data;
    } else {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    }
}

export async function deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data ?? {};
}

export async function deleteProductsBatch(ids = []) {
    await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
    return { deleted: ids };
}
