// src/pages/admin/reports/ReportsPage.jsx
import { useMemo, useState } from "react";
import {
    Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip,
    XAxis, YAxis, CartesianGrid, Legend, Cell,
} from "recharts";

import { useProductsQuery } from "@/services/hooks/products.queries";
import { useCategoriesQuery } from "@/services/hooks/categories.queries";
import { useSubcategoriesQuery } from "@/services/hooks/subcategories.queries";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { BarChart3, Layers3, Boxes, DollarSign, Clock, FileDown, AlertTriangle } from "lucide-react";

const nf = (n) => new Intl.NumberFormat("es-EC").format(Number(n || 0));
const money = (n) => new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(n || 0));
const monthLabel = (d) => `${d.toLocaleString("es", { month: "short" })} ${String(d.getFullYear()).slice(-2)}`;
const COLORS = [
    "hsl(var(--primary))","hsl(var(--muted-foreground))","#22c55e","#eab308",
    "#ef4444","#06b6d4","#a855f7","#f97316",
];
const AxisStyle = { tick: { fill: "hsl(var(--muted-foreground))", fontSize: 12 }, stroke: "hsl(var(--border))" };

function SoftTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border/40 bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur">
            {label && <div className="mb-1 font-medium">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded" style={{ background: p.color || p.fill }} />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-medium">
            {typeof p.value === "number" ? nf(p.value) : String(p.value)}
          </span>
                </div>
            ))}
        </div>
    );
}
const Empty = ({ text = "Sin datos para mostrar" }) => (
    <div className="grid h-64 place-items-center text-sm text-muted-foreground">{text}</div>
);

export default function ReportsPage() {
    const [exporting, setExporting] = useState(false);
    const [fFrom, setFFrom] = useState(""); // YYYY-MM-DD
    const [fTo,   setFTo]   = useState(""); // YYYY-MM-DD
    const LOW_STOCK_THRESHOLD = 5; // puedes ajustar

    // ---- datos reales ----
    const { data: prodData, isLoading: loadingP, error: errorP } = useProductsQuery({ page: 1, limit: 1000 });
    const rawProducts = useMemo(() => {
        const p = prodData;
        if (Array.isArray(p)) return p;
        if (Array.isArray(p?.products)) return p.products;
        if (Array.isArray(p?.items)) return p.items;
        return [];
    }, [prodData]);

    const { data: catData, isLoading: loadingC, error: errorC } = useCategoriesQuery();
    const categories = useMemo(() => {
        const c = catData;
        if (Array.isArray(c)) return c;
        if (Array.isArray(c?.categories)) return c.categories;
        return [];
    }, [catData]);

    const { data: subData } = useSubcategoriesQuery({ page: 1, limit: 1000 });
    const subcategories = useMemo(() => {
        const s = subData;
        if (Array.isArray(s)) return s;
        if (Array.isArray(s?.subcategories)) return s.subcategories;
        return [];
    }, [subData]);

    const isLoading = loadingP || loadingC;
    const hasError = errorP || errorC;

    // mapas
    const subIdToCatId = useMemo(() => {
        const m = new Map();
        for (const s of subcategories) {
            const sid = String(s.id);
            const cid = s.categoryId ?? s.category_id ?? s.categoria_id ?? s?.category?.id ?? s?.categoria?.id ?? null;
            if (cid != null) m.set(sid, String(cid));
        }
        return m;
    }, [subcategories]);

    const catNameById = useMemo(() => {
        const m = new Map();
        for (const c of categories) m.set(String(c.id), c.name);
        return m;
    }, [categories]);

    const subNameById = useMemo(() => {
        const m = new Map();
        for (const s of subcategories) m.set(String(s.id), s.name);
        return m;
    }, [subcategories]);

    const subcategoryIdOf = (p) =>
        p?.subcategoryId ?? p?.subcategoria_id ?? p?.subCategoryId ?? p?.subcategory?.id ?? p?.subcategoria?.id ?? null;

    const categoryIdOf = (p) => {
        const direct = p?.categoryId ?? p?.category_id ?? p?.categoria_id ?? p?.category?.id ?? p?.categoria?.id ?? null;
        if (direct != null && direct !== "") return String(direct);
        const sid = subcategoryIdOf(p);
        if (sid != null) {
            const fromSub = subIdToCatId.get(String(sid));
            if (fromSub != null) return String(fromSub);
        }
        return null;
    };

    // Filtro por fecha (para métricas temporales)
    const fromDate = fFrom ? new Date(`${fFrom}T00:00:00`) : null;
    const toDate   = fTo   ? new Date(`${fTo}T23:59:59.999`) : null;
    const inRange = (p) => {
        if (!fromDate && !toDate) return true;
        const created = p?.createdAt ? new Date(p.createdAt) : null;
        if (!created) return false;
        if (fromDate && created < fromDate) return false;
        if (toDate   && created > toDate)   return false;
        return true;
    };

    const products = useMemo(() => rawProducts.filter(inRange), [rawProducts, fFrom, fTo]);

    // Valor unitario final (con descuento)
    const unitValue = (p) => {
        const base = Number(p?.price || 0);
        const d = Number(p?.discountPct || 0);
        return d > 0 ? base * (1 - d / 100) : base;
    };

    // KPIs SIN interacciones
    const kpis = useMemo(() => {
        if (!products.length) return { total: 0, uniqCats: 0, stockTotal: 0, inventoryValue: 0, lastAdded: null };
        const total = products.length;
        const uniqCats = new Set(products.map((p) => categoryIdOf(p)).filter(Boolean)).size;
        const stockTotal = products.reduce((a, p) => a + Number(p?.stock ?? 0), 0);
        const inventoryValue = products.reduce((a, p) => a + Number(p?.stock ?? 0) * unitValue(p), 0);
        const lastAdded =
            products
                .map((p) => new Date(p?.createdAt ?? 0))
                .filter((d) => !Number.isNaN(d.getTime()))
                .sort((a, b) => b.getTime() - a.getTime())[0] || null;
        return { total, uniqCats, stockTotal, inventoryValue, lastAdded };
    }, [products]);

    // Productos por mes
    const porMes = useMemo(() => {
        const map = new Map();
        for (const p of products) {
            const dt = new Date(p?.createdAt ?? 0);
            if (Number.isNaN(dt.getTime())) continue;
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
            const item = map.get(key) || { key, mes: monthLabel(dt), cantidad: 0 };
            item.cantidad += 1;
            map.set(key, item);
        }
        return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    }, [products]);

    // Productos por categoría (conteo)
    const productosPorCategoria = useMemo(() => {
        const agg = new Map();
        for (const p of products) {
            const cid = categoryIdOf(p);
            if (!cid) continue;
            agg.set(cid, (agg.get(cid) || 0) + 1);
        }
        return Array.from(agg, ([cid, count]) => ({
            category: catNameById.get(cid) ?? `Categoría ${cid}`,
            count,
        })).sort((a, b) => b.count - a.count);
    }, [products, catNameById]);

    // Stock por categoría
    const stockPorCategoria = useMemo(() => {
        const agg = new Map();
        for (const p of products) {
            const cid = categoryIdOf(p);
            if (!cid) continue;
            agg.set(cid, (agg.get(cid) || 0) + Number(p?.stock ?? 0));
        }
        return Array.from(agg, ([cid, stock]) => ({
            category: catNameById.get(cid) ?? `Categoría ${cid}`,
            stock,
        })).sort((a, b) => b.stock - a.stock);
    }, [products, catNameById]);

    // Valor inventario por categoría
    const valorPorCategoria = useMemo(() => {
        const agg = new Map();
        for (const p of products) {
            const cid = categoryIdOf(p);
            if (!cid) continue;
            const val = Number(p?.stock ?? 0) * unitValue(p);
            agg.set(cid, (agg.get(cid) || 0) + val);
        }
        return Array.from(agg, ([cid, value]) => ({
            category: catNameById.get(cid) ?? `Categoría ${cid}`,
            value,
        })).sort((a, b) => b.value - a.value);
    }, [products, catNameById]);

    // Top 10 con menos stock (para reabastecer)
    const lowStock = useMemo(() => {
        return [...products]
            .map((p) => ({
                id: p.id,
                name: p.name ?? "Sin nombre",
                sku: p.sku ?? p.code ?? "",
                stock: Number(p?.stock ?? 0),
                category: (() => {
                    const cid = categoryIdOf(p);
                    return cid ? (catNameById.get(cid) ?? `Categoría ${cid}`) : "";
                })(),
            }))
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10);
    }, [products, catNameById]);

    // Export Excel (sin interacciones)
    const exportProductsExcel = async () => {
        try {
            setExporting(true);
            const XLSX = await import("xlsx");

            const rows = products.map((p, i) => {
                const cid = categoryIdOf(p);
                const sid = subcategoryIdOf(p);
                const uv = unitValue(p);
                return {
                    "#": i + 1,
                    SKU: p.sku ?? p.code ?? "",
                    Nombre: p.name ?? "",
                    Descripción: p.description ?? "",
                    Categoría: cid != null ? (catNameById.get(String(cid)) ?? `Categoría ${cid}`) : "",
                    Subcategoría: sid != null ? (subNameById.get(String(sid)) ?? `Subcategoría ${sid}`) : "",
                    Precio: Number(p.price ?? 0),
                    "Descuento %": Number(p.discountPct ?? 0),
                    "Precio Final": uv,
                    Stock: Number(p.stock ?? 0),
                    "Valor Inventario (línea)": uv * Number(p.stock ?? 0),
                    Destacado: p.featured ? "Sí" : "No",
                    "URL Imagen": p.imageUrl ?? "",
                    "URL Video": p.videoUrl ?? "",
                    Creado: p.createdAt ? new Date(p.createdAt) : "",
                    Actualizado: p.updatedAt ? new Date(p.updatedAt) : "",
                };
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            const headers = Object.keys(rows[0] || { Nombre: "" });
            ws["!cols"] = headers.map((k) => ({ wch: Math.min(Math.max(12, k.length + 2), 40) }));
            XLSX.utils.book_append_sheet(wb, ws, "Productos");

            // Resumen
            const resumen = XLSX.utils.aoa_to_sheet([
                ["Reporte de Productos"],
                [""],
                ["Generado", new Date().toLocaleString()],
                ["Desde", fFrom || "—"],
                ["Hasta", fTo || "—"],
                [""],
                ["Total productos", rows.length],
                ["Stock total", kpis.stockTotal],
                ["Valor inventario", kpis.inventoryValue],
            ]);
            XLSX.utils.book_append_sheet(wb, resumen, "Resumen");

            // Totales por categoría (stock y valor)
            const ws2 = XLSX.utils.aoa_to_sheet([
                ["Categoría", "Stock total", "Valor inventario"],
                ...Array.from(new Set([...stockPorCategoria.map(x=>x.category), ...valorPorCategoria.map(x=>x.category)])).map(cat => {
                    const stock = stockPorCategoria.find(x=>x.category===cat)?.stock ?? 0;
                    const val   = valorPorCategoria.find(x=>x.category===cat)?.value ?? 0;
                    return [cat, stock, val];
                })
            ]);
            XLSX.utils.book_append_sheet(wb, ws2, "Totales por categoría");

            // Bajo stock
            const ws3 = XLSX.utils.aoa_to_sheet([
                ["SKU", "Nombre", "Categoría", "Stock"],
                ...lowStock.map(r => [r.sku, r.name, r.category, r.stock])
            ]);
            XLSX.utils.book_append_sheet(wb, ws3, "Bajo stock");

            XLSX.writeFile(wb, `productos_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            console.error(err);
            alert("No se pudo exportar. Asegúrate de tener instalado 'xlsx' (npm i xlsx).");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header + filtros + export */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
                    <p className="text-sm text-muted-foreground">Métricas de inventario y altas de productos.</p>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-40">
                        <Label className="text-xs text-muted-foreground">Desde</Label>
                        <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} className="rounded-xl" />
                    </div>

                    <div className="w-40">
                        <Label className="text-xs text-muted-foreground">Hasta</Label>
                        <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} className="rounded-xl" />
                    </div>

                    <Button onClick={exportProductsExcel} disabled={exporting} className="gap-2 rounded-xl">
                        <FileDown className="h-4 w-4" />
                        {exporting ? "Exportando…" : "Exportar a Excel"}
                    </Button>
                </div>
            </div>

            {/* Loading / Error */}
            {isLoading && (
                <Card className="border-border/40">
                    <CardContent className="p-6 text-sm text-muted-foreground">Cargando datos…</CardContent>
                </Card>
            )}
            {hasError && (
                <Card className="border-border/40">
                    <CardContent className="p-6 text-sm text-red-600">No pudimos cargar los reportes. Intenta nuevamente.</CardContent>
                </Card>
            )}

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Productos</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Total registrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-semibold">{nf(kpis.total)}</div></CardContent>
                </Card>

                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Categorías activas</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <Layers3 className="h-4 w-4 text-primary" /> Con productos
                        </CardDescription>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-semibold">{nf(kpis.uniqCats)}</div></CardContent>
                </Card>

                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Stock total</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-primary" /> Unidades en inventario
                        </CardDescription>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-semibold">{nf(kpis.stockTotal)}</div></CardContent>
                </Card>

                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Valor inventario</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" /> ∑ stock × precio final
                        </CardDescription>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-semibold">{money(kpis.inventoryValue)}</div></CardContent>
                </Card>
            </div>

            {/* Último ingreso */}
            <Card className="border-border/40">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Último ingreso</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Fecha de alta más reciente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-semibold">{kpis.lastAdded ? kpis.lastAdded.toLocaleDateString() : "—"}</div>
                </CardContent>
            </Card>

            {/* Productos por mes */}
            <Card className="border-border/40">
                <CardHeader>
                    <CardTitle>Productos ingresados por mes</CardTitle>
                    <CardDescription>Evolución mensual de altas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!porMes.length ? (
                        <Empty />
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={porMes} margin={{ left: 8, right: 8, top: 8 }}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="mes" {...AxisStyle} />
                                    <YAxis {...AxisStyle} />
                                    <Tooltip content={<SoftTooltip />} />
                                    <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <Bar dataKey="cantidad" name="Productos" fill="url(#barGrad)" radius={[8, 8, 4, 4]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Distribuciones por categoría */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle>Productos por categoría</CardTitle>
                        <CardDescription>Conteo de productos por categoría.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!productosPorCategoria.length ? <Empty /> : (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productosPorCategoria} margin={{ left: 8, right: 8, top: 8 }}>
                                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="category" interval={0} angle={-15} textAnchor="end" height={60} tick={{ ...AxisStyle.tick }} />
                                        <YAxis {...AxisStyle} />
                                        <Tooltip content={<SoftTooltip />} />
                                        <Bar dataKey="count" name="Productos" radius={[8, 8, 4, 4]}>
                                            {productosPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle>Stock por categoría</CardTitle>
                        <CardDescription>Unidades en inventario.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!stockPorCategoria.length ? <Empty text="Sin stock cargado" /> : (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stockPorCategoria} margin={{ left: 8, right: 8, top: 8 }}>
                                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="category" interval={0} angle={-15} textAnchor="end" height={60} tick={{ ...AxisStyle.tick }} />
                                        <YAxis {...AxisStyle} />
                                        <Tooltip content={<SoftTooltip />} />
                                        <Bar dataKey="stock" name="Stock" radius={[8, 8, 4, 4]}>
                                            {stockPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Valor de inventario por categoría + Low stock */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle>Valor inventario por categoría</CardTitle>
                        <CardDescription>Suma de stock × precio final.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!valorPorCategoria.length ? <Empty /> : (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip content={<SoftTooltip />} />
                                        <Legend
                                            layout="vertical"
                                            align="right"
                                            verticalAlign="middle"
                                            wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                        />
                                        <Pie
                                            data={valorPorCategoria}
                                            dataKey="value"
                                            nameKey="category"
                                            outerRadius={100}
                                            innerRadius={50}
                                            stroke="hsl(var(--background))"
                                            strokeWidth={2}
                                            label={({ name, value }) => `${name}: ${money(value)}`}
                                        >
                                            {valorPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle>Top 10 con menos stock</CardTitle>
                        <CardDescription>Productos a reabastecer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!lowStock.length ? <Empty /> : (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={lowStock} layout="vertical" margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
                                        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" {...AxisStyle} />
                                        <YAxis type="category" dataKey="name" width={140} tick={{ ...AxisStyle.tick }} />
                                        <Tooltip content={<SoftTooltip />} />
                                        <Bar dataKey="stock" name="Stock" radius={[0, 8, 8, 0]}>
                                            {lowStock.map((r, i) => (
                                                <Cell
                                                    key={r.id ?? i}
                                                    fill={r.stock <= LOW_STOCK_THRESHOLD ? "#ef4444" : COLORS[i % COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {lowStock.some(r => r.stock <= LOW_STOCK_THRESHOLD) && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-rose-600">
                                <AlertTriangle className="h-4 w-4" />
                                Hay productos por debajo del umbral de stock ({LOW_STOCK_THRESHOLD}).
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">Tip</Badge>
                Usa los filtros de fecha para acotar los KPIs y la exportación.
            </div>
        </div>
    );
}
