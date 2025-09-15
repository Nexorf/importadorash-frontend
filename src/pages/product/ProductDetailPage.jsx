import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductQuery } from "@/services/hooks/products.queries";
import { useCart } from "@/store/cart";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ShoppingCart, Tag, ShieldCheck, Truck, Star } from "lucide-react";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog.jsx";
import { toYouTubeEmbed } from "@/utils/youtube.js";

const PrettySpinner = ({ label = "Cargando..." }) => (
    <div className="flex items-center justify-center gap-3">
    <span
        aria-hidden
        className="inline-block h-7 w-7 animate-[spin_0.9s_linear_infinite] rounded-full
                 bg-[conic-gradient(from_0deg,theme(colors.violet.500),theme(colors.fuchsia.500),transparent_70%)]
                 [mask:radial-gradient(farthest-side,transparent_45%,black_46%)]"
    />
        <span className="text-sm text-muted-foreground">{label}</span>
    </div>
);

const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded-md bg-muted/40 ${className}`} />;
const currency = (n) => `$${(n ?? 0).toFixed(2)}`;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const Stars = ({ value = 0 }) => {
    const v = clamp(Number(value) || 0, 0, 5);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i + 1 <= v ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            ))}
        </div>
    );
};

export default function ProductDetailPage() {
    const { id } = useParams();
    const add = useCart((s) => s.add);
    const items = useCart((s) => s.items);

    const { data, isLoading } = useProductQuery(id);
    const product = data?.product || data || null;

    // Hooks deben ir ANTES de cualquier return condicional.
    const maxQty = useMemo(() => {
        if (!product) return 1;
        if (typeof product?.maxQty === "number") return Math.max(1, product.maxQty);
        if (typeof product?.stock === "number") return Math.max(1, product.stock);
        if (typeof product?.stockQty === "number") return Math.max(1, product.stockQty);
        return 999;
    }, [product]);

    const cartQty = useMemo(() => {
        if (!product) return 0;
        const it = items.find((i) => (i.product?.id ?? i.product?._id) === product?.id);
        return it?.qty ?? 0;
    }, [items, product]);

    const [qty, setQty] = useState(1);

    useEffect(() => window.scrollTo(0, 0), [id]);
    useEffect(() => setQty((q) => Math.min(Math.max(1, q), maxQty)), [id, maxQty]);

    const gallery = useMemo(() => [product?.imageUrl].filter(Boolean), [product]);

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => Math.min(maxQty, q + 1));
    const onChangeQty = (e) => {
        const n = parseInt(e.target.value || "1", 10);
        if (Number.isNaN(n)) return;
        setQty(Math.min(Math.max(1, n), maxQty));
    };

    // ---- returns condicionales DESPUÉS de declarar hooks ----
    if (isLoading) {
        return (
            <div className="space-y-6">
                <PrettySpinner label="Cargando producto…" />
                <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
                    <Card className="border-border/40">
                        <CardContent className="p-4">
                            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 rounded-lg" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/40">
                        <CardContent className="space-y-3 p-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <Card className="border-border/40">
                <CardContent className="p-8 text-center">
                    <div className="mb-3 text-lg font-semibold">Producto no encontrado</div>
                    <Button asChild className="gap-2">
                        <Link to="/catalogue">
                            <ChevronLeft className="h-4 w-4" />
                            Volver al catálogo
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const {
        name = "Producto",
        description = "Sin descripción.",
        categoryName,
        imageUrl,
        videoUrl,
        price = 0,
        discountPct = 0,
        stock = 0,
        rating = 4,
        sku,
        brand,
        specs = {},
    } = product;

    const hasDiscount = (discountPct ?? 0) > 0;
    const finalPrice = hasDiscount ? price * (1 - discountPct / 100) : price;
    const outOfStock = (stock ?? 0) <= 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/catalogue" className="hover:underline">
                    Catálogo
                </Link>
                <span>/</span>
                {categoryName ? (
                    <>
                        <span>{categoryName}</span>
                        <span>/</span>
                    </>
                ) : null}
                <span className="text-foreground">{name}</span>
            </div>

            {/* Layout más balanceado */}
            <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
                {/* IZQ: Media */}
                <div className="space-y-4">
                    <Card className="border-border/40">
                        <CardContent className="p-3">
                            {gallery.length ? (
                                <img src={imageUrl} alt={name} className="aspect-[4/3] w-full rounded-xl object-contain bg-muted" />
                            ) : (
                                <div className="grid aspect-[4/3] w-full place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
                                    Sin imagen
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {videoUrl && (
                        <div className="flex">
                            <HeroVideoDialog
                                animationStyle="from-center"
                                videoSrc={toYouTubeEmbed(videoUrl)}
                                thumbnailSrc={imageUrl || "/placeholder.png"}
                                thumbnailAlt={`Video de ${name}`}
                                className="mt-2 w-full sm:w-64"
                            />
                        </div>
                    )}
                </div>

                {/* DER: Info (sticky) */}
                <div className="space-y-4 lg:sticky lg:top-24 self-start">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                {categoryName && <Badge variant="secondary" className="rounded-full">{categoryName}</Badge>}
                                {brand && <Badge variant="outline">{brand}</Badge>}
                                {hasDiscount && <Badge className="bg-rose-600 text-white">-{discountPct}%</Badge>}
                            </div>
                        </div>
                        <Stars value={rating} />
                    </div>

                    <Separator />

                    <div className="flex items-baseline gap-3">
                        <div className="text-2xl font-extrabold">{currency(finalPrice)}</div>
                        {hasDiscount && (
                            <>
                                <div className="text-sm text-muted-foreground line-through">{currency(price)}</div>
                                <Badge variant="secondary" className="rounded-full">
                                    <Tag className="mr-1 h-3.5 w-3.5" />
                                    Ahorra {discountPct}%
                                </Badge>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
            <span className={`text-sm ${outOfStock ? "text-rose-600" : "text-green-600"}`}>
              {outOfStock ? "Sin stock" : `En stock: ${stock}`}
            </span>
                        {sku && <span className="text-xs text-muted-foreground">SKU: {sku}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-border/40">
                            <Button type="button" variant="ghost" className="px-3" onClick={dec} disabled={qty <= 1}>
                                -
                            </Button>
                            <Input
                                value={qty}
                                type="number"
                                min={1}
                                max={maxQty}
                                onChange={onChangeQty}
                                className="h-9 w-14 border-0 text-center"
                            />
                            <Button type="button" variant="ghost" className="px-3" onClick={inc} disabled={qty >= maxQty}>
                                +
                            </Button>
                        </div>

                        <Button
                            disabled={outOfStock}
                            onClick={() => add(product, qty, "set")}
                            className="gap-2 rounded-xl"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {outOfStock ? "Sin stock" : (cartQty ? "Actualizar cantidad" : "Agregar al carrito")}
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">{`Máximo disponible: ${maxQty}`}</div>

                    <Separator />

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-violet-600" />
                            Envíos a todo el país
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-violet-600" />
                            Garantía y soporte
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-violet-600" />
                            Ofertas y descuentos
                        </div>
                    </div>

                    <Card className="border-border/40">
                        <CardContent className="space-y-3 p-4">
                            <div>
                                <div className="mb-1 text-sm font-semibold">Descripción</div>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                            {specs && Object.keys(specs).length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="mb-2 text-sm font-semibold">Especificaciones</div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {Object.entries(specs).map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm"
                                                >
                                                    <span className="text-muted-foreground">{k}</span>
                                                    <span className="font-medium">{String(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="pt-2">
                        <Button asChild variant="outline" className="gap-2 border-border/40">
                            <Link to="/catalogue">
                                <ChevronLeft className="h-4 w-4" />
                                Volver al catálogo
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
