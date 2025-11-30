import api from "../axios";
import type { Category, CategoryData } from "@/types";

export const categoryApi = {
    getAllCategories: () => api.get<Category[]>("/category"),
    getCategoryById: (categoryId: string) => api.get<Category>(`/category/${categoryId}`),
    getCategoryByName: (categoryName: string) => api.get<Category>(`/category/search?name=${categoryName}`),
    createCategory: (categoryData: CategoryData) => api.post<Category>("/category", categoryData),
    updateCategory: (categoryId: string, categoryData: CategoryData) =>
        api.put<Category>(`/category/${categoryId}`, categoryData),
    deleteCategory: (categoryId: string) => api.delete(`/category/${categoryId}`),
};
