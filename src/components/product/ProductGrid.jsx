import React, { useMemo } from "react";
import ProductCard from "@/components/product/ProductCard.jsx";
import { useCategoriesQuery } from "@/services/hooks/categories.queries";
import { useSubcategoriesQuery } from "@/services/hooks/subcategories.queries.js";

const ProductGrid = ({ products = [], emptyText = "Sin productos", onAdd, compact = false }) => {
    // 1) Traemos categorías y subcategorías
    const { data: categories = [] } = useCategoriesQuery();
    const { data: subsData } = useSubcategoriesQuery({ page: 1, limit: 500 });
    const allSubs = subsData?.subcategories ?? [];

    // 2) Mapas id->nombre para acceso O(1)
    const catMap = useMemo(
        () => new Map(categories.map((c) => [String(c.id), c.name])),
        [categories]
    );
    const subMap = useMemo(
        () => new Map(allSubs.map((s) => [String(s.id), s.name])),
        [allSubs]
    );

    // 3) Decoramos los productos con categoryName/subcategoryName si faltan
    const display = useMemo(
        () =>
            products.map((p) => ({
                ...p,
                categoryName: p.categoryName ?? catMap.get(String(p.categoryId)) ?? null,
                subcategoryName: p.subcategoryName ?? subMap.get(String(p.subcategoryId)) ?? null,
            })),
        [products, catMap, subMap]
    );

    if (!display.length) {
        return (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                {emptyText}
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {display.map((p) => (
                <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={(product, qty) => onAdd?.(product, qty)}
                    compact={compact}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
