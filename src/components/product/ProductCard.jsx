import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const currency = (n) => `$${(n ?? 0).toFixed(2)}`;

const computeBadge = (p = {}) => {
    if (p.badge) return p.badge;
    if (p.featured) return "Más Vendido";
    if ((p.discountPct ?? 0) > 0) return "Oferta";
    if (p.isNew) return "Nuevo";
    return null;
};

export default function ProductCard({ product = {}, onAdd, detailHref /*, categoryAsOverlay = false */ }) {
    const {
        id,
        name = "Producto",
        price = 0,
        discountPct = 0,
        stock = 0,
        imageUrl,
        categoryName, // puede venir decorado desde ProductGrid
    } = product;

    const hasDiscount = (discountPct ?? 0) > 0;
    const finalPrice = useMemo(
        () => (hasDiscount ? price * (1 - discountPct / 100) : price),
        [price, discountPct, hasDiscount]
    );
    const outOfStock = (stock ?? 0) <= 0;

    const badge = computeBadge(product);
    const href = detailHref || `/product/${id ?? ""}`;

    const catLabel = categoryName ?? product.category?.name ?? null;
    const subLabel = product.subcategoryName ?? product.subcategory?.name ?? null;

    const addOne = () => onAdd?.(product, 1);

    return (
        <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
            {/* IMAGEN */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-[#F2F2F2]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] group-hover:blur-[2px]"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-black/50">Sin imagen</div>
                )}

                {/* Badge (estado) */}
                {badge && (
                    <span
                        className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow"
                        style={{ background: "linear-gradient(135deg,#763DF2,#9450F2)" }}
                    >
            {badge}
          </span>
                )}

                {/* Descuento */}
                {hasDiscount && (
                    <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
            -{discountPct}%
          </span>
                )}

                {/* Ojo detalle */}
                <Link
                    to={href}
                    aria-label="Ver detalle"
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                    <div className="rounded-full p-3 shadow-lg" style={{ background: "linear-gradient(135deg,#763DF2,#9450F2)" }}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                </Link>
            </div>

            {/* CONTENIDO */}
            <div className="space-y-2 p-4">
                {(catLabel || subLabel) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {!!catLabel && (
                            <span className="inline-flex items-center rounded-full bg-[#763DF2]/10 px-2.5 py-1 text-[11px] font-medium text-[#763DF2] ring-1 ring-[#763DF2]/25">
                {catLabel}
              </span>
                        )}
                        {!!subLabel && (
                            <span className="inline-flex items-center rounded-full bg-[#111826]/5 px-2.5 py-1 text-[11px] font-medium text-[#111826] ring-1 ring-[#111826]/15">
                {subLabel}
              </span>
                        )}
                    </div>
                )}

                <h3 className="line-clamp-2 text-[15px] font-semibold text-[#111826]">{name}</h3>

                {/* Precios */}
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#111826]">{currency(finalPrice)}</span>
                    {hasDiscount && <span className="text-sm text-[#111826]/50 line-through">{currency(price)}</span>}
                </div>

                {/* CTA */}
                <button
                    type="button"
                    onClick={addOne}
                    disabled={outOfStock}
                    className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                        outOfStock ? "cursor-not-allowed opacity-60" : "hover:brightness-110"
                    }`}
                    style={{ background: "linear-gradient(135deg,#763DF2,#9450F2)" }}
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3h2l2.4 12.3A2 2 0 0 0 9.4 17h7.8a2 2 0 0 0 2-1.6L21 8H7" />
                        <circle cx="9" cy="21" r="1.5" />
                        <circle cx="18" cy="21" r="1.5" />
                    </svg>
                    {outOfStock ? "Sin stock" : "Agregar al Carrito"}
                </button>
            </div>
        </div>
    );
}
