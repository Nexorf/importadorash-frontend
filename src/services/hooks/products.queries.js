import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    listProducts,
    getProductById,
    createProduct,
    deleteProduct,
    deleteProductsBatch, updateProduct,
} from "@/services/product.service";

const keys = {
    all: ["products"],
    list: (params) => ["products", "list", params],
    detail: (id) => ["products", "detail", id],
};

export function useProductsQuery(params) {
    return useQuery({
        queryKey: keys.list(params),
        queryFn: () => listProducts(params),
        keepPreviousData: true,
    });
}

export function useProductQuery(id, { enabled = true } = {}) {
    return useQuery({
        queryKey: keys.detail(id),
        queryFn: () => getProductById(id),
        enabled: !!id && enabled,
    });
}

export function useCreateProductMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteProductMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useDeleteProductsBatchMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProductsBatch,
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}

export function useUpdateProductMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: keys.all });
            if (vars?.id) qc.invalidateQueries({ queryKey: keys.detail(vars.id) });
        },
    });
}

