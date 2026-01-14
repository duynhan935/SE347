/* eslint-disable @typescript-eslint/no-explicit-any */
import { categoryApi } from "@/lib/api/categoryApi";
import type { Category, CategoryData } from "@/types";
import { create } from "zustand";

interface CategoryStore {
        categories: Category[] | null;
        category: Category | null;
        loading: boolean;
        error: string | null;

        fetchAllCategories: () => Promise<void>;
        fetchCategoryById: (categoryId: string) => Promise<void>;
        fetchCategoryByName: (categoryName: string) => Promise<void>;
        createNewCategory: (categoryData: CategoryData, imageFile?: File) => Promise<void>;
        updateCategory: (categoryId: string, categoryData: CategoryData, imageFile?: File) => Promise<void>;
        deleteCategory: (categoryId: string) => Promise<void>;
        clearCategories: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
        categories: [],
        category: null,
        loading: false,
        error: null,

        // Fetch all categories
        fetchAllCategories: async () => {
                set({ loading: true, error: null });
                try {
                        const res = await categoryApi.getAllCategories();
                        set({ categories: res.data || [], loading: false });
                } catch (err: any) {
                        set({ error: err.message || "Failed to load categories.", loading: false });
                }
        },

        // Fetch category by ID
        fetchCategoryById: async (categoryId: string) => {
                set({ loading: true, error: null });
                try {
                        const res = await categoryApi.getCategoryById(categoryId);
                        set({ category: res.data, loading: false });
                } catch (err: any) {
                        set({ error: err.message || "Failed to load category.", loading: false });
                }
        },

        fetchCategoryByName: async (categoryName: string) => {
                set({ loading: true, error: null });
                try {
                        const res = await categoryApi.getCategoryByName(categoryName);
                        set({ category: res.data, loading: false });
                } catch (err: any) {
                        set({ error: err.message || "Failed to load category.", loading: false });
                }
        },

        // Create a new category
        createNewCategory: async (categoryData: CategoryData) => {
                set({ loading: true, error: null });
                try {
                        const res = await categoryApi.createCategory(categoryData);
                        set((state) => ({
                                categories: [...(state.categories || []), res.data],
                                loading: false,
                        }));
                } catch (err: any) {
                        set({ error: err.message || "Failed to create category.", loading: false });
                }
        },

        // Update category
        updateCategory: async (categoryId: string, categoryData: CategoryData) => {
                set({ loading: true, error: null });
                try {
                        const res = await categoryApi.updateCategory(categoryId, categoryData);
                        set((state) => ({
                                categories:
                                        state.categories?.map((cat) => (cat.id === categoryId ? res.data : cat)) || [],
                                loading: false,
                        }));
                } catch (err: any) {
                        set({ error: err.message || "Failed to update category.", loading: false });
                }
        },

        // Delete category
        deleteCategory: async (categoryId: string) => {
                set({ loading: true, error: null });
                try {
                        await categoryApi.deleteCategory(categoryId);
                        set((state) => ({
                                categories: state.categories?.filter((cat) => cat.id !== categoryId) || [],
                                loading: false,
                        }));
                } catch (err: any) {
                        set({ error: err.message || "Failed to delete category.", loading: false });
                }
        },

        // Clear store data
        clearCategories: () => {
                set({ categories: [], category: null, error: null });
        },
}));
