// src/pages/ProductoFormPage.jsx
import React, {useEffect, useMemo, useState} from "react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Link, useNavigate, useParams} from "react-router-dom";

/* hooks de datos (React Query) */
import {useCategoriesQuery} from "@/services/hooks/categories.queries";
import {
    useCreateProductMutation,
    useDeleteProductMutation,
    useProductQuery,
    useProductsQuery,
} from "@/services/hooks/products.queries";

/* shadcn/ui */
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {ScrollArea} from "@/components/ui/scroll-area";

/* Icons */
import {Package, Pencil, Percent, Plus, Save, Search, Trash2, UploadCloud, Video} from "lucide-react";
import {useSubcategoriesQuery} from "@/services/hooks/subcategories.queries.js";

/* ================= Constantes de límite ================= */
const MAX_PRODUCTS = 50;

/* ============== Schema (UI) ============== */
const Schema = z.object({
    code: z.string().min(1, "Requerido"),
    name: z.string().min(2, "Mínimo 2 caracteres"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    subcategoryId: z.string().min(1, "Selecciona una subcategoría"),
    price: z.coerce.number().min(0, "≥ 0"),
    stock: z.coerce.number().int().min(0, "≥ 0"),
    discountPct: z.coerce.number().min(0).max(100).optional().default(0),
    featured: z.boolean().optional().default(false),

    imageUrl: z.string().url("URL inválida").optional().or(z.literal("")).optional(),
    imageFile: z
        .any()
        .refine((f) => !f || f instanceof File, "Archivo inválido")
        .refine((f) => !f || f.size <= 5 * 1024 * 1024, "Máx. 5 MB")
        .optional(),

    videoUrl: z.string().url("URL inválida").optional().or(z.literal("")).optional(),
});

const currency = (n) => `$${(Number(n) || 0).toFixed(2)}`;

/** Mapea del formulario (EN) al backend (ES) */
function toApiPayload(values) {
    return {
        code: values.code,
        nombre: values.name,
        descripcion: values.description || "",
        precio: Number(values.price || 0),
        stock: Number(values.stock || 0),
        discount_pct: Number(values.discountPct || 0),
        feature: Boolean(values.featured),

        urlImagen: values.imageUrl || "",
        urlVideo: values.videoUrl || "",

        category_id: values.categoryId ? Number(values.categoryId) : null,
        subcategoria_id: values.subcategoryId ? Number(values.subcategoryId) : null,
    };
}

/* ============== Página ============== */
export default function ProductoFormPage() {
    const {id} = useParams(); // si hay edición futura
    const navigate = useNavigate();
    const [fileKey, setFileKey] = useState(0);

    // datos del server
    const {data: categories = []} = useCategoriesQuery();

    const {data: subsData} = useSubcategoriesQuery();
    const allSubcategories = React.useMemo(() => subsData?.subcategories ?? [], [subsData]);

    const parentCategoryIdOf = (sid) => {
        const s = allSubcategories.find((x) => String(x.id) === String(sid));
        return s?.categoryId ?? s?.category_id ?? s?.category?.id ?? null;
    };

    const {data: productDetail} = useProductQuery(id, {enabled: !!id});
    const record = productDetail?.product ?? null;

    // Trae como máximo 50 desde el server
    const {data: prodListData} = useProductsQuery();
    const products = prodListData?.products ?? [];
    const editing = Boolean(id);
    const canCreateProduct = !editing && products.length < MAX_PRODUCTS;

    // mutations
    const createMutation = useCreateProductMutation();
    const deleteMutation = useDeleteProductMutation();

    const [openDeleteId, setOpenDeleteId] = useState(null);
    const prodToDelete = useMemo(
        () => (products || []).find((x) => x.id === openDeleteId),
        [products, openDeleteId]
    );

    const defaultValues = useMemo(() => {
        if (!record) {
            return {
                code: "",
                name: "",
                description: "",
                categoryId: "",
                subcategoryId: "",
                price: 0,
                stock: 0,
                discountPct: 0,
                featured: false,
                imageUrl: "",
                imageFile: undefined,
                videoUrl: "",
            };
        }
        const inferredCat = record.categoryId;
        return {
            code: record.sku ?? record.code ?? "",
            name: record.name ?? "",
            description: record.description ?? "",
            categoryId: inferredCat ? String(inferredCat) : "",
            subcategoryId: record.subcategoryId ? String(record.subcategoryId) : "",
            price: record.price ?? 0,
            stock: record.stock ?? 0,
            discountPct: record.discountPct ?? 0,
            featured: !!record.featured,
            imageUrl: record.imageUrl ?? "",
            imageFile: undefined,
            videoUrl: record.videoUrl ?? "",
        };
    }, [record]);

    const form = useForm({
        resolver: zodResolver(Schema),
        defaultValues,
        mode: "onBlur",
    });

    useEffect(() => {
        form.reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, defaultValues]);

    /* ======= Submit (POST) ======= */
    const onSubmit = async (data) => {
        // Guard de seguridad por si cambió la lista entre renders
        if (!editing && products.length >= MAX_PRODUCTS) {
            alert(`No puedes crear más productos (máx. ${MAX_PRODUCTS}).`);
            return;
        }

        const base = toApiPayload(data);
        if (!base.category_id && base.subcategoria_id) {
            const cid = parentCategoryIdOf(base.subcategoria_id);
            if (cid) base.category_id = Number(cid);
        }

        const imageFile = data.imageFile instanceof File ? data.imageFile : undefined;
        const payload = imageFile ? {...base, imageFile} : base;

        try {
            await createMutation.mutateAsync(payload);
            navigate("/admin/products");
        } catch (e) {
            console.error(e);
            alert(e.message || "No se pudo guardar el producto.");
        }
    };

    /* ======= Filtro de tabla ======= */
    const [q, setQ] = useState("");
    const catName = (cid) => categories.find((c) => String(c.id) === String(cid))?.name || "—";
    const subName = (sid) => allSubcategories.find((s) => String(s.id) === String(sid))?.name || "—";

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return products;
        return products.filter((p) => {
            const effectiveCatId = p.categoryId ?? parentCategoryIdOf(p.subcategoryId);
            const cat = categories.find((c) => String(c.id) === String(effectiveCatId))?.name;
            const sub = subName(p.subcategoryId);
            return [p.code, p.name, cat, sub].filter(Boolean).join(" ").toLowerCase().includes(term);
        });
    }, [products, categories, q, allSubcategories]);

    /* ======= UI helpers ======= */
    const inputCN = "rounded-xl bg-background";
    const selectTriggerCN =
        "rounded-xl bg-background ring-1 ring-border/50 data-[state=open]:ring-2 data-[state=open]:ring-ring";
    const selectContentCN = "bg-background border border-border/40 rounded-xl shadow-lg";

    const price = form.watch("price");
    const discountPct = form.watch("discountPct") || 0;
    const finalPrice = Math.max(0, (Number(price) || 0) * (1 - (Number(discountPct) || 0) / 100));

    const selectedCat = form.watch("categoryId");
    const subsOfCat = useMemo(
        () => allSubcategories.filter((s) => String(s.categoryId) === String(selectedCat)),
        [allSubcategories, selectedCat]
    );

    useEffect(() => {
        const subId = form.getValues("subcategoryId");
        if (!subId) return;
        if (!subsOfCat.some((s) => String(s.id) === String(subId))) {
            const catId = form.getValues("categoryId");
            if (!catId) return;
            form.setValue("subcategoryId", "", {shouldDirty: true});
        }
    }, [subsOfCat, form]); // eslint-disable-line react-hooks/exhaustive-deps

    // Previsualización
    const [localPreview, setLocalPreview] = useState("");
    const file = form.watch("imageFile");
    useEffect(() => {
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            setLocalPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setLocalPreview("");
        }
    }, [file]);
    const previewSrc = localPreview || form.watch("imageUrl");

    /* ================= Render ================= */
    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {editing ? "Editar producto" : "Nuevo producto"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Completa los campos y guarda los cambios. Abajo tienes el listado para gestionar productos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!editing && (
                        <Button
                            variant="secondary"
                            className="gap-2"
                            onClick={() => {
                                form.reset({
                                    code: "",
                                    name: "",
                                    description: "",
                                    categoryId: "",
                                    subcategoryId: "",
                                    price: 0,
                                    stock: 0,
                                    discountPct: 0,
                                    featured: false,
                                    imageUrl: "",
                                    imageFile: undefined,
                                    videoUrl: "",
                                });
                                setFileKey((prev) => prev + 1);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* CONTENEDOR: formulario + preview */}
            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                {/* FORM CARD */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle>Datos del producto</CardTitle>
                        <CardDescription>Campos básicos, medios y precios con descuento.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {/* Sticky action bar */}
                        <div className="sticky top-[64px] z-10 -mx-4 mb-4 border-b border-t border-border/40 bg-background/75 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    onClick={form.handleSubmit(onSubmit)}
                                    className="gap-2 rounded-xl"
                                    disabled={createMutation.isPending || !canCreateProduct}
                                >
                                    <Save className="h-4 w-4" />
                                    {createMutation.isPending ? "Guardando..." : "Guardar"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-border/40"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancelar
                                </Button>
                                <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                                    <Package className="h-3.5 w-3.5" />
                                    <span>SKU:</span>
                                    <code className="rounded-md bg-muted px-1.5 py-0.5">
                                        {form.watch("code") || "—"}
                                    </code>
                                </div>
                            </div>

                            {!canCreateProduct && (
                                <p className="mt-2 text-xs text-amber-600">
                                    Límite alcanzado: ya existen {products.length}/{MAX_PRODUCTS} productos.
                                    Elimina alguno para poder crear más.
                                </p>
                            )}
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Código */}
                            <div>
                                <Label htmlFor="code">Código</Label>
                                <div className="relative">
                                    <Input id="code" placeholder="SKU-0001" className={`${inputCN} pl-10`} {...form.register("code")} />
                                    <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                                {form.formState.errors.code && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.code.message}</p>
                                )}
                            </div>

                            {/* Nombre */}
                            <div>
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" placeholder="Nombre del producto" className={inputCN} {...form.register("name")} />
                                {form.formState.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="sm:col-span-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Detalles, materiales, etc."
                                    className={inputCN}
                                    {...form.register("description")}
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <Label>Categoría</Label>
                                <Select
                                    value={form.watch("categoryId") || undefined}
                                    onValueChange={(v) => form.setValue("categoryId", v, {shouldDirty: true})}
                                >
                                    <SelectTrigger className={selectTriggerCN}>
                                        <SelectValue placeholder="Selecciona categoría" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentCN}>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.categoryId && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoryId.message}</p>
                                )}
                            </div>

                            {/* Subcategoría */}
                            <div>
                                <Label>Subcategoría</Label>
                                <Select
                                    value={form.watch("subcategoryId") || undefined}
                                    onValueChange={(v) => {
                                        form.setValue("subcategoryId", v, {shouldDirty: true});
                                        const cid = parentCategoryIdOf(v);
                                        if (cid) form.setValue("categoryId", String(cid), {shouldDirty: true});
                                    }}
                                    disabled={!selectedCat && !form.watch("subcategoryId")}
                                >
                                    <SelectTrigger className={selectTriggerCN}>
                                        <SelectValue
                                            placeholder={
                                                selectedCat
                                                    ? subsOfCat.length
                                                        ? "Selecciona subcategoría"
                                                        : "No hay subcategorías"
                                                    : "Primero elige categoría"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentCN}>
                                        {subsOfCat.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Precio */}
                            <div>
                                <Label htmlFor="price">Precio</Label>
                                <div className="relative">
                                    <Input id="price" type="number" step="0.01" className={`${inputCN} pl-8`} {...form.register("price")} />
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                                </div>
                                {form.formState.errors.price && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.price.message}</p>
                                )}
                            </div>

                            {/* Stock */}
                            <div>
                                <Label htmlFor="stock">Stock</Label>
                                <Input id="stock" type="number" className={inputCN} {...form.register("stock")} />
                                {form.formState.errors.stock && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.stock.message}</p>
                                )}
                            </div>

                            {/* Descuento */}
                            <div>
                                <Label htmlFor="discountPct">Descuento %</Label>
                                <div className="relative">
                                    <Input id="discountPct" type="number" min="0" max="100" className={`${inputCN} pr-10`} {...form.register("discountPct")} />
                                    <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                                {form.formState.errors.discountPct && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.discountPct.message}</p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Precio final: <span className="font-medium">{currency(finalPrice)}</span>
                                </p>
                            </div>

                            {/* Destacado */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="featured"
                                    checked={!!form.watch("featured")}
                                    onCheckedChange={(v) => form.setValue("featured", v, {shouldDirty: true})}
                                />
                                <Label htmlFor="featured" className="cursor-pointer">Destacado</Label>
                            </div>

                            {/* Subir imagen */}
                            <div className="sm:col-span-2">
                                <Label htmlFor="imageFile">Subir imagen (opcional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        key={fileKey}
                                        id="imageFile"
                                        type="file"
                                        accept="image/*"
                                        className={inputCN}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            form.setValue("imageFile", f, {shouldDirty: true, shouldValidate: true});
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 border-border/40"
                                        onClick={() => form.setValue("imageFile", undefined, {shouldDirty: true})}
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        Quitar archivo
                                    </Button>
                                </div>
                                {form.formState.errors.imageFile && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.imageFile.message}</p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Si subes un archivo, se usará en lugar de la URL de imagen.
                                </p>
                            </div>

                            {/* Video URL */}
                            <div className="sm:col-span-2">
                                <Label htmlFor="videoUrl" className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    Video URL (opcional)
                                </Label>
                                <Input id="videoUrl" placeholder="https://… (YouTube, MP4, etc.)" className={inputCN} {...form.register("videoUrl")} />
                                {form.formState.errors.videoUrl && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.videoUrl.message}</p>
                                )}
                            </div>

                            {/* Mensaje errores global */}
                            {Object.values(form.formState.errors).length > 0 && (
                                <p className="text-sm text-red-600 sm:col-span-2">
                                    Hay errores en el formulario, revisa los campos.
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* PREVIEW */}
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle>Vista previa</CardTitle>
                        <CardDescription>Así se verá en el catálogo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                            <div className="relative aspect-[16/9] w-full bg-muted">
                                {previewSrc ? (
                                    <img src={previewSrc} alt={form.watch("name") || "Producto"} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Sin imagen</div>
                                )}
                                {!!discountPct && discountPct > 0 && (
                                    <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                    -{discountPct}%
                  </span>
                                )}
                            </div>

                            <div className="space-y-2 p-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="rounded-full">
                                        {catName(form.watch("categoryId"))}
                                    </Badge>
                                    {form.watch("subcategoryId") && (
                                        <Badge variant="outline" className="rounded-full">
                                            {subName(form.watch("subcategoryId"))}
                                        </Badge>
                                    )}
                                    {form.watch("featured") && <Badge className="rounded-full">Destacado</Badge>}
                                </div>

                                <h3 className="line-clamp-2 text-[15px] font-semibold">
                                    {form.watch("name") || "Nombre del producto"}
                                </h3>

                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-xl font-extrabold">{currency(finalPrice || 0)}</span>
                                    {!!discountPct && discountPct > 0 && (
                                        <span className="text-sm text-muted-foreground line-through">
                      {currency(price || 0)}
                    </span>
                                    )}
                                </div>

                                <Button className="mt-2 w-full rounded-xl">Agregar al Carrito</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LISTADO / TABLA */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Productos</h2>
                <div className="flex items-center gap-2">
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por código, nombre o categoría…"
                            className="w-96 rounded-xl bg-background pl-9"
                        />
                        {q && (
                            <button
                                onClick={() => setQ("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:underline"
                            >
                                limpiar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Card className="border-border/40">
                <CardContent className="p-0">
                    <ScrollArea className="max-h-[60vh]">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                                <TableRow>
                                    <TableHead className="w-[64px]">Img</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Subcategoría</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-center">Desc%</TableHead>
                                    <TableHead className="text-center">Destacado</TableHead>
                                    <TableHead className="w-[200px] text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((p) => (
                                    <TableRow key={p.id} className="even:bg-muted/20 hover:bg-muted/40">
                                        <TableCell>
                                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted ring-1 ring-border/40">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{p.code}</TableCell>
                                        <TableCell className="max-w-[280px] truncate">{p.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="rounded-full">
                                                {catName(p.categoryId ?? parentCategoryIdOf(p.subcategoryId))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-full">
                                                {subName(p.subcategoryId)}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">{currency(p.price)}</TableCell>
                                        <TableCell className="text-right">{p.stock ?? 0}</TableCell>
                                        <TableCell className="text-center">{p.discountPct ?? 0}</TableCell>
                                        <TableCell className="text-center">
                                            {p.featured ? (
                                                <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">Sí</Badge>
                                            ) : (
                                                <Badge variant="outline" className="rounded-full">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="w-[200px] text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Editar */}
                                                <Link to={`/admin/products/${p.id}`}>
                                                    <Button size="sm" variant="outline" className="border-border/40">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                </Link>

                                                {/* Eliminar -> abre modal global */}
                                                <Button
                                                    size="sm"
                                                    className="gap-2 border-red-600 bg-red-600 hover:bg-red-700"
                                                    onClick={() => setOpenDeleteId(p.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                                            No hay productos para mostrar.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Modal eliminar */}
                        <AlertDialog
                            open={!!openDeleteId}
                            onOpenChange={(isOpen) => {
                                if (!isOpen) setOpenDeleteId(null);
                            }}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        ¿Seguro que quieres eliminar “{prodToDelete?.name ?? "este producto"}”? Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setOpenDeleteId(null)}>
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={deleteMutation.isPending}
                                        onClick={async () => {
                                            try {
                                                await deleteMutation.mutateAsync(openDeleteId);
                                            } finally {
                                                setOpenDeleteId(null);
                                            }
                                        }}
                                    >
                                        {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Separator />
            <p className="text-center text-xs text-muted-foreground">
                Tip: usa el buscador para filtrar por código, nombre o categoría.
            </p>
        </div>
    );
}
