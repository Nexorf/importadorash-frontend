// src/pages/AdminCategoriesPage.jsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Trash2, Save, Plus } from "lucide-react";

import {
    useCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
} from "@/services/hooks/categories.queries";
import {
    useCreateSubcategoryMutation,
    useDeleteSubcategoryMutation,
    useSubcategoriesQuery,
    useUpdateSubcategoryMutation,
} from "@/services/hooks/subcategories.queries.js";

/* ================= Constantes de límite ================= */
const MAX_CATEGORIES = 5;

export default function AdminCategoriesPage() {
    // Si tu hook acepta paginación, puedes pasar limit: MAX_CATEGORIES
    const { data: categories = [] } = useCategoriesQuery(/* { page: 1, limit: MAX_CATEGORIES } */);

    const { data: subsData } = useSubcategoriesQuery({ page: 1, limit: 50 });
    const allSubs = subsData?.subcategories ?? [];

    const createCat = useCreateCategoryMutation();
    const updateCat = useUpdateCategoryMutation();
    const deleteCat = useDeleteCategoryMutation();

    const createSub = useCreateSubcategoryMutation();
    const updateSub = useUpdateSubcategoryMutation();
    const deleteSub = useDeleteSubcategoryMutation();

    const [newCat, setNewCat] = useState("");
    const [selectedCat, setSelectedCat] = useState("");
    const subsOfSelected = useMemo(
        () => allSubs.filter((s) => String(s.categoryId) === String(selectedCat)),
        [allSubs, selectedCat]
    );

    const [newSub, setNewSub] = useState("");
    const [catEdits, setCatEdits] = useState({}); // id -> name
    const [subEdits, setSubEdits] = useState({}); // id -> name

    const canCreateCategory = categories.length < MAX_CATEGORIES;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Categorías y Subcategorías</h1>
            <p className="text-sm text-muted-foreground">
                Crea, renombra o elimina categorías y sus subcategorías (máx. {MAX_CATEGORIES} categorías).
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle>Categorías</CardTitle>
                        <CardDescription>Gestiona la lista de categorías.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!newCat.trim()) return;
                                if (!canCreateCategory) {
                                    alert(`No puedes crear más categorías (máx. ${MAX_CATEGORIES}).`);
                                    return;
                                }
                                createCat.mutate({ name: newCat.trim() });
                                setNewCat("");
                            }}
                        >
                            <Input
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                                placeholder="Nueva categoría…"
                                disabled={!canCreateCategory}
                            />
                            <Button type="submit" className="gap-2" disabled={!canCreateCategory}>
                                <Plus className="h-4 w-4" /> Agregar
                            </Button>
                        </form>

                        {!canCreateCategory && (
                            <p className="text-xs text-amber-600">
                                Límite alcanzado: {categories.length}/{MAX_CATEGORIES} categorías creadas. Elimina una para agregar otra.
                            </p>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60%]">Nombre</TableHead>
                                    <TableHead>Seleccionar</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((c) => (
                                    <TableRow key={c.id} className="even:bg-muted/20">
                                        <TableCell>
                                            <Input
                                                value={catEdits[c.id] ?? c.name}
                                                onChange={(e) => setCatEdits((s) => ({ ...s, [c.id]: e.target.value }))}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant={String(selectedCat) === String(c.id) ? "secondary" : "outline"}
                                                onClick={() => setSelectedCat(c.id)}
                                            >
                                                {String(selectedCat) === String(c.id) ? "Seleccionada" : "Seleccionar"}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => updateCat.mutate({ id: c.id, name: catEdits[c.id] ?? c.name })}
                                                className="border-border/40"
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-border/40 text-red-600"
                                                onClick={() => deleteCat.mutate(c.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                                            No hay categorías.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* SUBCATEGORÍAS */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle>Subcategorías</CardTitle>
                        <CardDescription>Primero elige una categoría para gestionar sus subcategorías.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Categoría seleccionada</Label>
                            <div className="rounded-xl border border-border/40 px-3 py-2">
                                {selectedCat
                                    ? categories.find((c) => String(c.id) === String(selectedCat))?.name || "—"
                                    : "Ninguna"}
                            </div>
                        </div>

                        <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!selectedCat || !newSub.trim()) return;
                                createSub.mutate({ name: newSub.trim(), category_id: Number(selectedCat) });
                                setNewSub("");
                            }}
                        >
                            <Input
                                value={newSub}
                                onChange={(e) => setNewSub(e.target.value)}
                                placeholder="Nueva subcategoría…"
                                disabled={!selectedCat}
                            />
                            <Button type="submit" className="gap-2" disabled={!selectedCat}>
                                <Plus className="h-4 w-4" /> Agregar
                            </Button>
                        </form>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subsOfSelected.map((s) => (
                                    <TableRow key={s.id} className="even:bg-muted/20">
                                        <TableCell>
                                            <Input
                                                value={subEdits[s.id] ?? s.name}
                                                onChange={(e) => setSubEdits((st) => ({ ...st, [s.id]: e.target.value }))}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                className="border-border/40"
                                                onClick={() =>
                                                    updateSub.mutate({ id: s.id, name: subEdits[s.id] ?? s.name, category_id: Number(selectedCat) })
                                                }
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-border/40 text-red-600"
                                                onClick={() => deleteSub.mutate(s.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subsOfSelected.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-sm text-muted-foreground py-8">
                                            {selectedCat ? "No hay subcategorías." : "Elige una categoría."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Separator />
            <p className="text-center text-xs text-muted-foreground">
                Tip: selecciona una categoría para ver/editar sus subcategorías.
            </p>
        </div>
    );
}
