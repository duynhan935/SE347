export function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}

export function toRateNumber(value: unknown, fallback = 0): number {
    // API sometimes returns rates as strings: "50.00"
    return toNumber(value, fallback);
}

export function formatCurrency(amount: unknown): string {
    const value = toNumber(amount, 0);
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    } catch {
        return `$${value.toLocaleString("en-US")}`;
    }
}

export function formatNumber(amount: unknown): string {
    const value = toNumber(amount, 0);
    try {
        return new Intl.NumberFormat("en-US").format(value);
    } catch {
        return value.toLocaleString("en-US");
    }
}

export function formatPercent(rate: unknown, decimals = 2): string {
    const value = toRateNumber(rate, 0);
    return `${value.toFixed(decimals)}%`;
}

export function humanizeOrderStatus(status: unknown): string {
    const s = String(status ?? "").toLowerCase();
    const map: Record<string, string> = {
        completed: "Completed",
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        processing: "Processing",
        cancelled: "Canceled",
        failed: "Failed",
        paid: "Paid",
    };
    return map[s] ?? (s ? s : "Unknown");
}
