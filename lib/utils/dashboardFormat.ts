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

export function formatVnd(amount: unknown): string {
    const value = toNumber(amount, 0);
    try {
        return `${new Intl.NumberFormat("vi-VN").format(value)}₫`;
    } catch {
        return `${value.toLocaleString()}₫`;
    }
}

export function formatNumber(amount: unknown): string {
    const value = toNumber(amount, 0);
    try {
        return new Intl.NumberFormat("vi-VN").format(value);
    } catch {
        return value.toLocaleString();
    }
}

export function formatPercent(rate: unknown, decimals = 2): string {
    const value = toRateNumber(rate, 0);
    return `${value.toFixed(decimals)}%`;
}

export function humanizeOrderStatus(status: unknown): string {
    const s = String(status ?? "").toLowerCase();
    const map: Record<string, string> = {
        completed: "Hoàn thành",
        pending: "Chờ xử lý",
        confirmed: "Đã xác nhận",
        preparing: "Đang chuẩn bị",
        ready: "Sẵn sàng",
        processing: "Đang xử lý",
        cancelled: "Đã huỷ",
        failed: "Thất bại",
        paid: "Đã thanh toán",
    };
    return map[s] ?? (s ? s : "Unknown");
}
