import React, { useMemo, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid.jsx";
import { useCart } from "@/store/cart.js";
import { useProductsQuery } from "@/services/hooks/products.queries";
import { useCategoriesQuery } from "@/services/hooks/categories.queries";

const SectionHeader = ({ title, subtitle, right }) => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg,#763DF2,#9450F2)" }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 17l6-6 4 4 7-7" /><path d="M14 5h7v7" />
                </svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-[#111826]">{title}</h2>
                {subtitle && <p className="text-sm text-[#111826]/60">{subtitle}</p>}
            </div>
        </div>
        {right}
    </div>
);

const Chip = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`rounded-full px-3 py-1.5 text-sm shadow-sm transition ${active ? "text-white" : "text-[#111826] bg-white"}`}
        style={{
            background: active ? "linear-gradient(135deg,#763DF2,#9450F2)" : undefined,
            border: active ? "1px solid transparent" : "1px solid hsl(var(--border))",
        }}
    >
        {children}
    </button>
);

export default function HomePage() {
    const add = useCart((s) => s.add);

    const { data: prodData } = useProductsQuery({ page: 1, limit: 200 });
    const products = prodData?.products ?? [];

    const { data: catData } = useCategoriesQuery();
    const categories = catData?.categories ?? [];

    const featured = useMemo(() => products.filter((p) => p.featured), [products]);
    const offers = useMemo(() => products.filter((p) => (p.discountPct ?? 0) > 0), [products]);

    const [cat, setCat] = useState(null);
    const featuredFiltered = useMemo(
        () => (cat ? featured.filter((p) => String(p.categoryId) === String(cat)) : featured),
        [featured, cat]
    );

    return (
        <div className="space-y-12">
            <section>
                <SectionHeader title="Productos Destacados" subtitle="Los más vendidos y mejor valorados por nuestros clientes" />
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Chip active={cat === null} onClick={() => setCat(null)}>Todos</Chip>
                    {categories.map((c) => (
                        <Chip key={c.id} active={String(c.id) === String(cat)} onClick={() => setCat(c.id)}>
                            {c.name}
                        </Chip>
                    ))}
                </div>
                <ProductGrid products={featuredFiltered} onAdd={add} emptyText="Sin destacados por ahora" compact />
            </section>

            <section>
                <SectionHeader title="Ofertas especiales" subtitle="Descuentos por tiempo limitado" />
                <ProductGrid products={offers} onAdd={add} emptyText="Sin ofertas activas" compact />
            </section>
        </div>
    );
}
