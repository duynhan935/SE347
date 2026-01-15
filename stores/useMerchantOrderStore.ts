"use client";

import { create } from "zustand";

interface MerchantOrderState {
    pendingOrdersCount: number;
    setPendingOrdersCount: (count: number) => void;
    incrementPendingOrdersCount: () => void;
    decrementPendingOrdersCount: () => void;
    resetPendingOrdersCount: () => void;
}

export const useMerchantOrderStore = create<MerchantOrderState>((set) => ({
    pendingOrdersCount: 0,
    setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),
    incrementPendingOrdersCount: () =>
        set((state) => ({ pendingOrdersCount: state.pendingOrdersCount + 1 })),
    decrementPendingOrdersCount: () =>
        set((state) => ({ pendingOrdersCount: Math.max(0, state.pendingOrdersCount - 1) })),
    resetPendingOrdersCount: () => set({ pendingOrdersCount: 0 }),
}));

