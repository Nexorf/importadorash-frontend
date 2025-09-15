import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

const maxQtyOf = (p) => {
    if (typeof p?.maxQty === "number") return Math.max(1, p.maxQty);
    if (typeof p?.stock === "number") return Math.max(1, p.stock);
    if (typeof p?.stockQty === "number") return Math.max(1, p.stockQty);
    return 999;
};
const clamp = (v, min, max) => Math.max(min, Math.min(Number(v) || 0, max));

export const useCart = create(
    persist(
        (set, get) => ({
            items: [],

            /**
             * add(product, amount, mode)
             * - mode "delta": suma/resta
             * - mode "set": fija la cantidad exacta
             */
            add: (product, amount = 1, mode = "delta") => {
                const id = product?.id ?? product?._id;
                if (id == null) return;

                const items = [...get().items];
                const idx = items.findIndex((x) => (x.product?.id ?? x.product?._id) === id);
                const max = maxQtyOf(product);

                if (mode === "set") {
                    const next = clamp(Number(amount) || 1, 1, max);
                    if (idx === -1) items.push({ product, qty: next });
                    else items[idx] = { product: items[idx].product, qty: next };
                    if (next === max) toast.info(`Cantidad ajustada al máximo disponible (${max}).`);
                    set({ items });
                    return;
                }

                // mode === "delta"
                if (idx === -1) {
                    const next = clamp(Number(amount) || 1, 1, max);
                    items.push({ product, qty: next });
                    if (next === max) toast.info(`Cantidad ajustada al máximo disponible (${max}).`);
                } else {
                    const cur = items[idx].qty;
                    const next = clamp(cur + (Number(amount) || 0), 1, max);
                    if (next === cur) {
                        toast.info(`Alcanzaste el máximo (${max}) para "${product?.name ?? "producto"}".`);
                    }
                    items[idx] = { product: items[idx].product, qty: next };
                }
                set({ items });
            },

            remove: (id) =>
                set((s) => ({ items: s.items.filter((it) => (it.product?.id ?? it.product?._id) !== id) })),

            clear: () => set({ items: [] }),
        }),
        { name: "cart-storage" }
    )
);
