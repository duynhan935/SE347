export type CheckoutSelection = {
    restaurantId: string;
    itemIds: string[];
    createdAt: number;
};

const STORAGE_KEY = "checkout-selection-v1";

export function saveCheckoutSelection(selection: Omit<CheckoutSelection, "createdAt">) {
    if (typeof window === "undefined") return;
    const payload: CheckoutSelection = { ...selection, createdAt: Date.now() };
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // ignore storage errors
    }
}

export function loadCheckoutSelection(): CheckoutSelection | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CheckoutSelection;
        if (!parsed || typeof parsed !== "object") return null;
        if (typeof parsed.restaurantId !== "string" || !Array.isArray(parsed.itemIds)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearCheckoutSelection() {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore storage errors
    }
}


