/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { categoryApi } from "@/lib/api/categoryApi";
import type { Category, CategoryData } from "@/types";

interface CategoryStore {
    categories: Category[];
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

    // 📦 Lấy tất cả danh mục
    fetchAllCategories: async () => {
        set({ loading: true, error: null });
        try {
            const res = await categoryApi.getAllCategories();
            set({ categories: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải danh mục", loading: false });
        }
    },

    // 🔍 Lấy chi tiết một danh mục theo ID
    fetchCategoryById: async (categoryId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await categoryApi.getCategoryById(categoryId);
            set({ category: res.data, loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải thông tin danh mục", loading: false });
        }
    },

    fetchCategoryByName: async (categoryName: string) => {
        set({ loading: true, error: null });
        try {
            const res = await categoryApi.getCategoryByName(categoryName);
            set({ category: res.data, loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải thông tin danh mục", loading: false });
        }
    },

    // 🆕 Tạo danh mục mới
    createNewCategory: async (categoryData: CategoryData) => {
        set({ loading: true, error: null });
        try {
            const res = await categoryApi.createCategory(categoryData);
            set((state) => ({
                categories: [...state.categories, res.data],
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message || "Không thể tạo danh mục", loading: false });
        }
    },

    // ✏️ Cập nhật danh mục
    updateCategory: async (categoryId: string, categoryData: CategoryData) => {
        set({ loading: true, error: null });
        try {
            const res = await categoryApi.updateCategory(categoryId, categoryData);
            set((state) => ({
                categories: state.categories.map((cat) => (cat.id === categoryId ? res.data : cat)),
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message || "Không thể cập nhật danh mục", loading: false });
        }
    },

    // 🗑️ Xóa danh mục
    deleteCategory: async (categoryId: string) => {
        set({ loading: true, error: null });
        try {
            await categoryApi.deleteCategory(categoryId);
            set((state) => ({
                categories: state.categories.filter((cat) => cat.id !== categoryId),
                loading: false,
            }));
        } catch (err: any) {
            set({ error: err.message || "Không thể xóa danh mục", loading: false });
        }
    },

    // ♻️ Xóa toàn bộ dữ liệu trong store (nếu cần)
    clearCategories: () => {
        set({ categories: [], category: null, error: null });
    },
}));
