import React, {useEffect, useMemo, useState} from "react";
import {useCart} from "@/store/cart";
import ProductGrid from "@/components/product/ProductGrid";
import {useProductsQuery} from "@/services/hooks/products.queries";
import {useCategoriesQuery, useCategoryTreeQuery} from "@/services/hooks/categories.queries";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Slider} from "@/components/ui/slider";
import {Grid3X3, List, ChevronLeft, ChevronRight, Percent, PackageCheck, Search, X} from "lucide-react";
import {useSubcategoriesQuery} from "@/services/hooks/subcategories.queries.js";
import {useSearchParams} from "react-router-dom";

const Skeleton = ({className = ""}) => <div className={`animate-pulse rounded-md bg-muted/40 ${className}`}/>;

function Pagination({page, pages, onChange}) {
    if (pages <= 1) return null;
    const prev = () => onChange(Math.max(1, page - 1));
    const next = () => onChange(Math.min(pages, page + 1));
    const nums = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return (
        <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={prev} className="gap-1 border-border/40">
                <ChevronLeft className="h-4 w-4"/> Anterior
            </Button>
            {nums.map((n) => (
                <Button key={n} variant={n === page ? "default" : "outline"} size="sm" onClick={() => onChange(n)}
                        className="min-w-9 border-border/40">
                    {n}
                </Button>
            ))}
            <Button variant="outline" size="sm" onClick={next} className="gap-1 border-border/40">
                Siguiente <ChevronRight className="h-4 w-4"/>
            </Button>
        </div>
    );
}

export default function CataloguePage() {
    const add = useCart((s) => s.add);
    const [searchParams, setSearchParams] = useSearchParams();
    const qParam = searchParams.get("q") ?? "";
    const {data: prodData, isLoading: loadingProducts} = useProductsQuery({page: 1, limit: 500});
    const products = prodData?.products ?? [];

    // Árbol principal
    const {data: tree = [], isLoading: loadingTree} = useCategoryTreeQuery();

    // Fallback: lista plana de categorías y subcategorías
    const {data: flatCats = [], isLoading: loadingCats} = useCategoriesQuery();
    const {data: subsData} = useSubcategoriesQuery({page: 1, limit: 500});
    const allSubs = subsData?.subcategories ?? [];

    // Usamos el árbol si viene con datos; si no, construimos uno
    const treeToUse = useMemo(() => {
        if (Array.isArray(tree) && tree.length > 0) return tree;
        if (!Array.isArray(flatCats) || flatCats.length === 0) return [];
        const byCat = flatCats.map((c) => ({
            id: c.id,
            name: c.name,
            subcategories: allSubs.filter((s) => String(s.categoryId) === String(c.id)),
        }));
        return byCat;
    }, [tree, flatCats, allSubs]);

    const [q, setQ] = useState(qParam);
    const [cat, setCat] = useState(null);
    const [sub, setSub] = useState(null);
    const [onlyDiscount, setOnlyDiscount] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState("relevance");
    const [view, setView] = useState("grid");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    useEffect(() => {
        setQ(qParam);
    }, [qParam]);

    // Helper para escribir en estado y URL a la vez
    const setQBoth = (value) => {
        setQ(value);
        const params = new URLSearchParams(searchParams);
        if (value && value.trim()) params.set("q", value);
        else params.delete("q");
        setSearchParams(params, {replace: true});
    };

    useEffect(() => {
        setPage(1);
    }, [q, cat, sub, minPrice, maxPrice, onlyDiscount, inStockOnly, sortBy, perPage]);

    const subsOfCat = useMemo(() => {
        if (!cat) return [];
        const node = treeToUse.find((c) => String(c.id) === String(cat));
        return node?.subcategories ?? [];
    }, [cat, treeToUse]);

    useEffect(() => {
        if (!cat || !sub) return;
        if (!subsOfCat.some((s) => String(s.id) === String(sub))) setSub(null);
    }, [cat, sub, subsOfCat]);

    const [minSugerido, maxSugerido] = useMemo(() => {
        if (!products.length) return [0, 0];
        const ps = products.map((p) => Number(p.price ?? 0));
        return [Math.min(...ps), Math.max(...ps)];
    }, [products]);

    const sliderValue = useMemo(() => {
        const min = minPrice === "" ? minSugerido : Math.max(minSugerido, Number(minPrice) || minSugerido);
        const max = maxPrice === "" ? maxSugerido : Math.min(maxSugerido, Number(maxPrice) || maxSugerido);
        return [min, max].sort((a, b) => a - b);
    }, [minPrice, maxPrice, minSugerido, maxSugerido]);

    const onSliderChange = (val) => {
        const [a, b] = val || [minSugerido, maxSugerido];
        setMinPrice(String(a));
        setMaxPrice(String(b));
    };

    const filtered = useMemo(() => {
        let arr = products;

        if (sub != null) {
            arr = arr.filter((p) => String(p.subcategoryId) === String(sub));
        } else if (cat != null) {
            const hasCategoryField = arr.some((p) => p.categoryId != null);
            if (hasCategoryField) {
                arr = arr.filter((p) => String(p.categoryId) === String(cat));
            } else {
                const subIds = new Set((subsOfCat ?? []).map((s) => String(s.id)));
                arr = arr.filter((p) => subIds.has(String(p.subcategoryId)));
            }
        }

        const term = q.trim().toLowerCase();
        if (term) {
            arr = arr.filter((p) => {
                const blob = `${p.name || ""} ${p.description || ""} ${p.brand || ""} ${p.sku || p.code || ""}`.toLowerCase();
                return blob.includes(term);
            });
        }

        const min = minPrice === "" ? -Infinity : Number(minPrice);
        const max = maxPrice === "" ? Infinity : Number(maxPrice);
        arr = arr.filter((p) => (p.price ?? 0) >= min && (p.price ?? 0) <= max);

        if (onlyDiscount) arr = arr.filter((p) => (p.discountPct ?? 0) > 0);
        if (inStockOnly) arr = arr.filter((p) => (p.stock ?? 0) > 0);

        const sorters = {
            relevance: (a, b) => 0,
            priceAsc: (a, b) => (a.price ?? 0) - (b.price ?? 0),
            priceDesc: (a, b) => (b.price ?? 0) - (a.price ?? 0),
            name: (a, b) => (a.name || "").localeCompare(b.name || ""),
            discount: (a, b) => (b.discountPct || 0) - (a.discountPct || 0),
        };
        return [...arr].sort(sorters[sortBy] || sorters.relevance);
    }, [products, cat, sub, q, minPrice, maxPrice, onlyDiscount, inStockOnly, sortBy, subsOfCat]);

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const slice = useMemo(() => {
        const start = (page - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, page, perPage]);

    const someFilterOn =
        !!q || cat != null || sub != null || minPrice !== "" || maxPrice !== "" || onlyDiscount || inStockOnly || sortBy !== "relevance";

    const clearAll = () => {
        setQ("");
        setCat(null);
        setQBoth("")
        setSub(null);
        setMinPrice("");
        setMaxPrice("");
        setOnlyDiscount(false);
        setInStockOnly(false);
        setSortBy("relevance");
        setPerPage(12);
        setView("grid");
    };

    const loading = loadingProducts || (treeToUse.length === 0 && (loadingTree || loadingCats));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
                    <p className="text-sm text-muted-foreground">
                        {total} resultado{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Label className="text-sm">Ordenar</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[190px] border-border/40">
                            <SelectValue placeholder="Ordenar por"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relevance">Relevancia</SelectItem>
                            <SelectItem value="priceAsc">Precio: menor a mayor</SelectItem>
                            <SelectItem value="priceDesc">Precio: mayor a menor</SelectItem>
                            <SelectItem value="name">Nombre A–Z</SelectItem>
                            <SelectItem value="discount">Mayor descuento</SelectItem>
                        </SelectContent>
                    </Select>

                    <div
                        className="hidden h-9 items-center rounded-full border border-border/40 bg-background/60 p-0.5 shadow-sm md:flex">
                        <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm"
                                onClick={() => setView("grid")} className="gap-1 rounded-full">
                            <Grid3X3 className="h-4 w-4"/> Grid
                        </Button>
                        <Separator orientation="vertical" className="mx-1 h-5"/>
                        <Button variant={view === "list" ? "secondary" : "ghost"} size="sm"
                                onClick={() => setView("list")} className="gap-1 rounded-full">
                            <List className="h-4 w-4"/> Lista
                        </Button>
                    </div>

                    <Label className="text-sm">Por página</Label>
                    <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                        <SelectTrigger className="w-[100px] border-border/40">
                            <SelectValue placeholder="12"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[280px,1fr]">
                <aside className="hidden md:block">
                    <div className="sticky top-24 space-y-4">
                        {/* Buscar */}
                        <Card className="border-border/40">
                            <CardHeader className="py-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Search className="h-4 w-4 text-violet-600"/>
                                    Buscar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <Input value={q} onChange={(e) => setQ(e.target.value)}
                                           placeholder="Nombre, marca o código…" className="pr-9"/>
                                    {q && (
                                        <button type="button" onClick={() => setQ("")} aria-label="Limpiar"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                                            <X className="h-4 w-4"/>
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categorías y subcategorías */}
                        <Card className="border-border/40">
                            <CardHeader className="py-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <PackageCheck className="h-4 w-4 text-violet-600"/>
                                    Categorías
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <Button variant={cat == null ? "secondary" : "ghost"} size="sm"
                                        className="w-full justify-start" onClick={() => {
                                    setCat(null);
                                    setSub(null);
                                }}>
                                    Todas
                                </Button>
                                {treeToUse.map((c) => (
                                    <Button key={c.id} variant={String(cat) === String(c.id) ? "secondary" : "ghost"}
                                            size="sm" className="w-full justify-start" onClick={() => {
                                        setCat(c.id);
                                        setSub(null);
                                    }}>
                                        {c.name}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {cat != null && (
                            <Card className="border-border/40">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm">Subcategorías</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <Button variant={sub == null ? "secondary" : "ghost"} size="sm"
                                            className="w-full justify-start" onClick={() => setSub(null)}>
                                        Todas
                                    </Button>
                                    {subsOfCat.map((s) => (
                                        <Button key={s.id}
                                                variant={String(sub) === String(s.id) ? "secondary" : "ghost"} size="sm"
                                                className="w-full justify-start" onClick={() => setSub(s.id)}>
                                            {s.name}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-border/40">
                            <CardHeader className="py-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Percent className="h-4 w-4 text-violet-600"/>
                                    Precio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Slider min={minSugerido} max={maxSugerido} step={1} value={sliderValue}
                                        onValueChange={onSliderChange}/>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input inputMode="decimal" value={minPrice}
                                           onChange={(e) => setMinPrice(e.target.value)}
                                           placeholder={minSugerido ? minSugerido.toFixed(2) : "0.00"}
                                           className="border-border/40"/>
                                    <Input inputMode="decimal" value={maxPrice}
                                           onChange={(e) => setMaxPrice(e.target.value)}
                                           placeholder={maxSugerido ? maxSugerido.toFixed(2) : "999.99"}
                                           className="border-border/40"/>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/40">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm">Opciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="onlyDiscount" className="text-sm">Solo con descuento</Label>
                                    <Checkbox id="onlyDiscount" checked={onlyDiscount}
                                              onCheckedChange={setOnlyDiscount}/>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inStockOnly" className="text-sm">Solo en stock</Label>
                                    <Checkbox id="inStockOnly" checked={inStockOnly} onCheckedChange={setInStockOnly}/>
                                </div>
                                {(!!q || cat != null || sub != null || minPrice !== "" || maxPrice !== "" || onlyDiscount || inStockOnly) && (
                                    <Button variant="outline" className="mt-2 w-full border-border/40"
                                            onClick={clearAll}>
                                        Limpiar filtros
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </aside>

                <section>
                    {someFilterOn && (
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {!!q && (
                                <Badge variant="secondary" className="flex items-center gap-1 rounded-full">
                                    “{q}”
                                    <button onClick={() => setQ("")} className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                            aria-label="Quitar búsqueda">
                                        <X className="h-3.5 w-3.5"/>
                                    </button>
                                </Badge>
                            )}
                            {cat != null && (
                                <Badge variant="secondary" className="flex items-center gap-1 rounded-full">
                                    {treeToUse.find((c) => String(c.id) === String(cat))?.name || "Categoría"}
                                    <button onClick={() => {
                                        setCat(null);
                                        setSub(null);
                                    }} className="ml-1 rounded-full p-0.5 hover:bg-muted" aria-label="Quitar categoría">
                                        <X className="h-3.5 w-3.5"/>
                                    </button>
                                </Badge>
                            )}
                            {sub != null && (
                                <Badge variant="secondary" className="flex items-center gap-1 rounded-full">
                                    {subsOfCat.find((s) => String(s.id) === String(sub))?.name || "Subcategoría"}
                                    <button onClick={() => setSub(null)}
                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                            aria-label="Quitar subcategoría">
                                        <X className="h-3.5 w-3.5"/>
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-2xl border border-border/40 bg-background/60 p-6 shadow-sm">
                            <div className="flex items-center justify-center gap-3">
                                <span
                                    className="inline-block h-7 w-7 animate-[spin_0.9s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,theme(colors.violet.500),theme(colors.fuchsia.500),transparent_70%)] [mask:radial-gradient(farthest-side,transparent_45%,black_46%)]"/>
                                <span className="text-sm text-muted-foreground">Cargando catálogo…</span>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({length: 6}).map((_, i) => (
                                    <Card key={i} className="border-border/40">
                                        <CardContent className="p-0">
                                            <Skeleton className="h-40 w-full rounded-t-xl"/>
                                            <div className="space-y-2 p-4">
                                                <Skeleton className="h-4 w-20"/>
                                                <Skeleton className="h-5 w-3/4"/>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-6 w-20"/>
                                                    <Skeleton className="h-6 w-12"/>
                                                </div>
                                                <Skeleton className="h-9 w-full rounded-xl"/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : slice.length === 0 ? (
                        <Card className="border-dashed border-border/40">
                            <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                No se encontraron productos con los filtros aplicados.
                            </CardContent>
                        </Card>
                    ) : view === "grid" ? (
                        <ProductGrid products={slice} onAdd={(p, qty) => add(p, qty)}
                                     emptyText="No se encontraron productos."/>
                    ) : (
                        <div
                            className="divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-sm">
                            {slice.map((p) => (
                                <div key={p.id}
                                     className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                                            {p.imageUrl ? (
                                                <img src={p.imageUrl} alt={p.name}
                                                     className="h-full w-full object-cover"/>
                                            ) : (
                                                <div
                                                    className="grid h-full w-full place-items-center text-xs text-muted-foreground">Sin
                                                    imagen</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.discountPct ? (
                                                    <>
                                                        <span
                                                            className="font-semibold">${(p.price * (1 - p.discountPct / 100)).toFixed(2)}</span>{" "}
                                                        <span
                                                            className="text-muted-foreground line-through">${p.price?.toFixed?.(2)}</span>{" "}
                                                        <span className="text-green-600">-{p.discountPct}%</span>
                                                    </>
                                                ) : (
                                                    <span className="font-semibold">${p.price?.toFixed?.(2)}</span>
                                                )}
                                                {" · "}Stock: {p.stock ?? 0}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => add(p, 1)}
                                                className="border-border/40">
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Pagination page={page} pages={pages} onChange={setPage}/>
                </section>
            </div>
        </div>
    );
}
