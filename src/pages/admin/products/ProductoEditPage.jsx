// src/pages/ProductoEditPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

/* hooks de datos */
import { useCategoriesQuery } from "@/services/hooks/categories.queries";
import { useSubcategoriesQuery } from "@/services/hooks/subcategories.queries";
import { useProductQuery, useUpdateProductMutation } from "@/services/hooks/products.queries";

/* UI */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, ArrowLeft, Percent, Package, UploadCloud, Video } from "lucide-react";

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
        .refine((f) => !f || f.type?.startsWith?.("image/"), "Debe ser una imagen")
        .refine((f) => !f || f.size <= 5 * 1024 * 1024, "Máx. 5 MB")
        .optional(),
    videoUrl: z.string().url("URL inválida").optional().or(z.literal("")).optional(),
});

const currency = (n) => `$${(Number(n) || 0).toFixed(2)}`;

/** map al backend */
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

const parentIdFromSub = (s) =>
    s?.categoryId ??
    s?.category_id ??
    s?.categoria_id ??
    s?.category?.id ??
    s?.categoria?.id ??
    null;

export default function ProductoEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: categories = [] } = useCategoriesQuery();
    const { data: subsData } = useSubcategoriesQuery({ page: 1, limit: 500 });
    const allSubcategories = useMemo(() => subsData?.subcategories ?? [], [subsData]);

    const { data: detail, isLoading: loadingDetail } = useProductQuery(id, { enabled: !!id });
    const record = detail?.product ?? null;

    const updateMutation = useUpdateProductMutation();

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
        const catId =
            record.categoryId ??
            record.category_id ??
            record.categoria_id ??
            record.category?.id ??
            record.categoria?.id ??
            "";
        const subId = record.subcategoryId ?? record.subcategoria_id ?? record.subcategory?.id ?? "";
        return {
            code: record.sku ?? record.code ?? "",
            name: record.name ?? "",
            description: record.description ?? "",
            categoryId: catId ? String(catId) : "",
            subcategoryId: subId ? String(subId) : "",
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

    // reset cuando llega el detalle
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    // valores observados del form
    const selectedCat = form.watch("categoryId");
    const selectedSub = form.watch("subcategoryId");

    // subcategorías para la categoría elegida
    const subsOfCat = useMemo(() => {
        const sc = String(selectedCat || "");
        return allSubcategories.filter((s) => String(parentIdFromSub(s) || "") === sc);
    }, [allSubcategories, selectedCat]);

    // si el producto trae solo subcategoría, llenar categoría
    useEffect(() => {
        if (!selectedCat && selectedSub) {
            const sub = allSubcategories.find((s) => String(s.id) === String(selectedSub));
            const cid = parentIdFromSub(sub);
            if (cid) form.setValue("categoryId", String(cid), { shouldDirty: false, shouldValidate: false });
        }
    }, [allSubcategories, selectedCat, selectedSub, form]);

    // si cambia categoría y la sub no pertenece, limpiar sub
    useEffect(() => {
        if (!selectedCat || !selectedSub) return;
        if (!subsOfCat.some((s) => String(s.id) === String(selectedSub))) {
            form.setValue("subcategoryId", "", { shouldDirty: true, shouldValidate: true });
        }
    }, [subsOfCat, selectedCat, selectedSub, form]);

    const inputCN = "rounded-xl bg-background";
    const selectTriggerCN =
        "rounded-xl bg-background ring-1 ring-border/50 data-[state=open]:ring-2 data-[state=open]:ring-ring";
    const selectContentCN = "bg-background border border-border/40 rounded-xl shadow-lg";

    // preview imagen
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

    const price = form.watch("price");
    const discountPct = form.watch("discountPct") || 0;
    const finalPrice = Math.max(0, (Number(price) || 0) * (1 - (Number(discountPct) || 0) / 100));

    const catName = (cid, sid) => {
        const byCid = categories.find((c) => String(c.id) === String(cid))?.name;
        if (byCid) return byCid;
        const sub = allSubcategories.find((s) => String(s.id) === String(sid));
        if (sub) {
            const pid = parentIdFromSub(sub);
            return categories.find((c) => String(c.id) === String(pid))?.name || "—";
        }
        return "—";
    };
    const subName = (sid) => allSubcategories.find((s) => String(s.id) === String(sid))?.name || "—";

    const onSubmit = async (data) => {
        const base = toApiPayload(data);
        const imageFile = data.imageFile instanceof File ? data.imageFile : undefined;
        const payload = imageFile ? { ...base, imageFile } : base;

        try {
            await updateMutation.mutateAsync({ id, data: payload });
            navigate("/admin/products");
        } catch (e) {
            console.error(e);
            alert(e?.message || "No se pudo actualizar el producto.");
        }
    };

    if (!id) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Falta el ID del producto.</p>
                <Button asChild variant="outline" className="border-border/40">
                    <Link to="/admin/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>
        );
    }

    if (loadingDetail && !record) {
        return <div className="text-sm text-muted-foreground">Cargando producto…</div>;
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
                    <p className="text-sm text-muted-foreground">Modificá los campos y guardá los cambios.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild className="border-border/40">
                        <Link to="/admin/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        className="gap-2 rounded-xl"
                        disabled={updateMutation.isPending}
                    >
                        <Save className="h-4 w-4" />
                        {updateMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                {/* FORM */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle>Datos del producto</CardTitle>
                        <CardDescription>Campos básicos y de media.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
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
                                <Controller
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value || undefined}
                                            onValueChange={(v) => {
                                                field.onChange(v);
                                                // limpiar sub si no pertenece
                                                const stillValid = subsOfCat.some((s) => String(s.id) === String(form.getValues("subcategoryId")));
                                                if (!stillValid) form.setValue("subcategoryId", "", { shouldDirty: true, shouldValidate: true });
                                            }}
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
                                    )}
                                />
                                {form.formState.errors.categoryId && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoryId.message}</p>
                                )}
                            </div>

                            {/* Subcategoría */}
                            <div>
                                <Label>Subcategoría</Label>
                                <Controller
                                    control={form.control}
                                    name="subcategoryId"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value || undefined}
                                            onValueChange={(v) => {
                                                field.onChange(v);
                                                // asegurar categoría correcta al elegir sub
                                                const sub = allSubcategories.find((s) => String(s.id) === String(v));
                                                const cid = parentIdFromSub(sub);
                                                if (cid && String(cid) !== String(form.getValues("categoryId"))) {
                                                    form.setValue("categoryId", String(cid), { shouldDirty: true, shouldValidate: true });
                                                }
                                            }}
                                            disabled={!selectedCat && !selectedSub}
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
                                    )}
                                />
                                {form.formState.errors.subcategoryId && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.subcategoryId.message}</p>
                                )}
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
                                    <Input
                                        id="discountPct"
                                        type="number"
                                        min="0"
                                        max="100"
                                        className={`${inputCN} pr-10`}
                                        {...form.register("discountPct")}
                                    />
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
                                    onCheckedChange={(v) => form.setValue("featured", v, { shouldDirty: true })}
                                />
                                <Label htmlFor="featured" className="cursor-pointer">
                                    Destacado
                                </Label>
                            </div>

                            {/* Subir imagen */}
                            <div className="sm:col-span-2">
                                <Label htmlFor="imageFile">Subir imagen (opcional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="imageFile"
                                        type="file"
                                        accept="image/*"
                                        className={inputCN}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            form.setValue("imageFile", f, { shouldDirty: true, shouldValidate: true });
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 border-border/40"
                                        onClick={() => form.setValue("imageFile", undefined, { shouldDirty: true })}
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        Quitar archivo
                                    </Button>
                                </div>
                                {form.formState.errors.imageFile && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.imageFile.message}</p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">Si subes un archivo, se usará en lugar de la URL.</p>
                            </div>

                            {/* Video URL */}
                            <div className="sm:col-span-2">
                                <Label htmlFor="videoUrl" className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    Video URL (opcional)
                                </Label>
                                <Input id="videoUrl" placeholder="https://…" className={inputCN} {...form.register("videoUrl")} />
                                {form.formState.errors.videoUrl && (
                                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.videoUrl.message}</p>
                                )}
                            </div>

                            {/* Errores globales */}
                            {Object.values(form.formState.errors).length > 0 && (
                                <p className="text-sm text-red-600 sm:col-span-2">Hay errores en el formulario.</p>
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
                                        {catName(selectedCat, selectedSub)}
                                    </Badge>
                                    {selectedSub && (
                                        <Badge variant="outline" className="rounded-full">
                                            {subName(selectedSub)}
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
                                        <span className="text-sm text-muted-foreground line-through">{currency(price || 0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />
        </div>
    );
}
