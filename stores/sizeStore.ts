/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { sizeApi } from "@/lib/api/sizeApi";
import type { Size, SizeData } from "@/types";

interface SizeStore {
    sizes: Size[];
    size: Size | null;
    loading: boolean;
    error: string | null;

    fetchAllSizes: () => Promise<void>;
    createNewSize: (sizeData: SizeData) => Promise<void>;
    updateSize: (sizeId: string, sizeData: SizeData) => Promise<void>;
    deleteSize: (sizeId: string) => Promise<void>;
    clearSizes: () => void;
}

export const useSizeStore = create<SizeStore>((set, get) => ({
    sizes: [],
    size: null,
    loading: false,
    error: null,

    // 🟦 Lấy tất cả size
    fetchAllSizes: async () => {
        set({ loading: true, error: null });
        try {
            const res = await sizeApi.getAllSizes();
            set({ sizes: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải danh sách kích thước", loading: false });
        }
    },


    // 🟨 Tạo size mới
    createNewSize: async (sizeData: SizeData) => {
        set({ loading: true, error: null });
        try {
            const res = await sizeApi.createSize(sizeData);
            set({
                sizes: [...get().sizes, res.data],
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || "Không thể tạo kích thước mới", loading: false });
        }
    },

    // 🟧 Cập nhật size
    updateSize: async (sizeId: string, sizeData: SizeData) => {
        set({ loading: true, error: null });
        try {
            const res = await sizeApi.updateSize(sizeId, sizeData);
            set({
                sizes: get().sizes.map((s) => (s.id === sizeId ? res.data : s)),
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || "Không thể cập nhật kích thước", loading: false });
        }
    },

    // 🟥 Xóa size
    deleteSize: async (sizeId: string) => {
        set({ loading: true, error: null });
        try {
            await sizeApi.deleteSize(sizeId);
            set({
                sizes: get().sizes.filter((s) => s.id !== sizeId),
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || "Không thể xóa kích thước", loading: false });
        }
    },

    // 🧹 Xóa dữ liệu trong store
    clearSizes: () => {
        set({ sizes: [], size: null });
    },
}));
