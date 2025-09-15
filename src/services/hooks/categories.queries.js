import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listCategories,
    getCategoryTree,
    createCategory,
    deleteCategory,
    updateCategory, // NUEVO
} from "@/services/categories.service";

const keys = {
    all: ["categories"],
    list: () => ["categories", "list"],
    tree: () => ["categories", "tree"],
};

export function useCategoriesQuery() {
    return useQuery({
        queryKey: keys.list(),
        queryFn: async () => {
            const r = await listCategories();
            return Array.isArray(r?.categories) ? r.categories : [];
        },
    });
}

export function useCategoryTreeQuery() {
    return useQuery({
        queryKey: keys.tree(),
        queryFn: async () => {
            const tree = await getCategoryTree();
            return Array.isArray(tree) ? tree : [];
        },
    });
}

export function useCreateCategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateCategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteCategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
