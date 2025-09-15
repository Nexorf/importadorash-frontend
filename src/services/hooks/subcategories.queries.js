import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listSubcategories,
    createSubcategory,
    deleteSubcategory,
    updateSubcategory,
} from "@/services/subcategories.service";

const keys = {
    all: ["subcategories"],
    list: (params) => ["subcategories", "list", params],
};

export function useSubcategoriesQuery(params) {
    return useQuery({
        queryKey: keys.list(params),
        queryFn: () => listSubcategories(params),
        keepPreviousData: true,
    });
}

export function useCreateSubcategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSubcategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateSubcategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateSubcategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteSubcategoryMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSubcategory,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
