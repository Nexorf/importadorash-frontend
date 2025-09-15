// src/pages/BasketPage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/store/cart.js";
import { cartToWhatsAppDetailedURL, getDefaultWhatsAppPhone } from "@/lib/whatsapp.js";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ShoppingBag, MessageCircle, Minus, Plus, Trash2 } from "lucide-react";

/* Utils de la página */
const priceOf = (p) => {
    const base = Number(p?.price || 0);
    return p?.discountPct ? base * (1 - p.discountPct / 100) : base;
};
const formatUSD = (n) => `$${Number(n || 0).toFixed(2)}`;
const maxQtyOf = (product) => {
    if (typeof product?.maxQty === "number") return Math.max(1, product.maxQty);
    if (typeof product?.stock === "number") return Math.max(1, product.stock);
    if (typeof product?.stockQty === "number") return Math.max(1, product.stockQty);
    return 999;
};

export default function BasketPage() {
    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const remove = useCart((s) => s.remove);
    const clear = useCart((s) => s.clear);

    const lines = useMemo(
        () =>
            items.map((it) => ({
                id: it.product.id ?? it.product._id,
                name: it.product.name,
                imageUrl: it.product.imageUrl,
                qty: it.qty,
                unit: priceOf(it.product),
                old: it.product.discountPct ? it.product.price : null,
                discountPct: it.product.discountPct || 0,
                sku: it.product.sku || it.product.code || "",
                product: it.product,
            })),
        [items]
    );

    const subtotal = useMemo(() => lines.reduce((a, x) => a + x.unit * x.qty, 0), [lines]);
    const savings = useMemo(
        () => lines.reduce((a, x) => a + (x.old ? (Number(x.old) - Number(x.unit)) * x.qty : 0), 0),
        [lines]
    );

    // URL de WhatsApp con el número hardcodeado (usa api.whatsapp.com/send)
    const wa = useMemo(() => {
        const payloadItems = lines.map((l) => ({
            name: l.name,
            qty: l.qty,
            price: l.unit,
            sku: l.sku,
        }));
        return cartToWhatsAppDetailedURL({
            phone: getDefaultWhatsAppPhone(),
            items: payloadItems,
            extra: { delivery: "A coordinar", payment: "Efectivo/Transferencia" },
        });
    }, [lines]);

    const decrement = (it) => {
        if (it.qty <= 1) remove(it.id);
        else add(it.product, it.qty - 1, "set");
    };
    const increment = (it) => {
        const max = maxQtyOf(it.product);
        if (it.qty >= max) {
            toast.info(`Alcanzaste el máximo (${max}) para "${it.name}".`);
            return;
        }
        add(it.product, it.qty + 1, "set");
    };
    const setQty = (it, next) => {
        const max = maxQtyOf(it.product);
        let n = Number(next);
        if (Number.isNaN(n)) n = it.qty;
        n = Math.max(1, Math.min(n, max));
        if (n === it.qty) return;
        add(it.product, n, "set");
        if (n === max) toast.info(`Se ajustó al máximo disponible: ${max}`);
    };

    if (lines.length === 0) {
        return (
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Carrito</h1>
                    <Link to="/catalogue" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                        Ir al catálogo
                    </Link>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-8">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-muted text-muted-foreground">
                            <ShoppingBag className="h-7 w-7" />
                        </div>
                        <Alert className="mt-6">
                            <AlertTitle>Tu carrito está vacío</AlertTitle>
                            <AlertDescription>
                                Explora nuestro catálogo y agrega productos para continuar con tu compra.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-6 flex justify-center">
                            <Link to="/catalogue">
                                <Button size="lg">Ir al catálogo</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr,380px]">
                {/* IZQ: Lista */}
                <section className="space-y-4">
                    <div className="flex items-end justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">Carrito</h1>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    Vaciar
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción eliminará todos los productos de tu carrito. No podrás deshacerla.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            clear();
                                            toast.success("Carrito vaciado");
                                        }}
                                    >
                                        Vaciar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <ScrollArea className="rounded-2xl border">
                        <div className="divide-y">
                            {lines.map((it) => (
                                <Card key={it.id} className="rounded-none border-0">
                                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Producto */}
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                                                {it.imageUrl ? (
                                                    <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                                                        Sin imagen
                                                    </div>
                                                )}
                                                {it.discountPct > 0 && (
                                                    <Badge className="absolute left-1 top-1 bg-rose-600 text-white hover:bg-rose-600">
                                                        -{it.discountPct}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium leading-tight">{it.name}</p>
                                                <div className="mt-0.5 flex items-center gap-2 text-sm">
                                                    <span className="font-semibold">{formatUSD(it.unit)}</span>
                                                    {it.old ? (
                                                        <span className="text-xs text-muted-foreground line-through">
                              {formatUSD(it.old)}
                            </span>
                                                    ) : null}
                                                </div>
                                                {it.sku && <p className="mt-0.5 text-xs text-muted-foreground">SKU: {it.sku}</p>}
                                            </div>
                                        </div>

                                        {/* Controles */}
                                        <div className="flex shrink-0 items-center gap-3">
                                            <div className="flex items-center rounded-xl border bg-background/60 shadow-inner">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-l-xl"
                                                            onClick={() => decrement(it)}
                                                            aria-label="Disminuir"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Disminuir</TooltipContent>
                                                </Tooltip>
                                                <Input
                                                    className="h-9 w-16 rounded-none border-x text-center"
                                                    type="number"
                                                    min={1}
                                                    value={it.qty}
                                                    onChange={(e) => setQty(it, e.target.value)}
                                                    onBlur={(e) => {
                                                        const val = e.target.value.trim();
                                                        if (val === "") setQty(it, it.qty);
                                                    }}
                                                />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-r-xl"
                                                            onClick={() => increment(it)}
                                                            aria-label="Aumentar"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Aumentar</TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <div className="w-24 text-right text-sm font-semibold">
                                                {formatUSD(it.unit * it.qty)}
                                            </div>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => remove(it.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Quitar del carrito</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="flex items-center justify-between">
                        <Link to="/catalogue" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                            ← Seguir comprando
                        </Link>
                    </div>
                </section>

                {/* DER: Resumen */}
                <aside className="md:sticky md:top-24">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg tracking-tight">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatUSD(subtotal)}</span>
                            </div>
                            {savings > 0 && (
                                <div className="flex items-center justify-between text-emerald-600">
                                    <span className="">Ahorro</span>
                                    <span className="font-medium">{formatUSD(savings)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Envío</span>
                                <span className="font-medium">A coordinar</span>
                            </div>

                            <Separator className="my-2" />
                            <div className="flex items-center justify-between text-base">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold">{formatUSD(subtotal)}</span>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-2">
                            <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition bg-[#25D366] hover:brightness-95"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Finalizar por WhatsApp
                            </a>
                            <p className="text-center text-xs text-muted-foreground">
                                Al continuar, coordinaremos pago y envío por WhatsApp.
                            </p>
                        </CardFooter>
                    </Card>
                </aside>
            </div>
        </TooltipProvider>
    );
}
