import type {
    AdminMerchantPerformance,
    AdminOrderStatistics,
    AdminRevenueByMerchant,
    AdminSystemOverview,
} from "@/types/dashboard.type";

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}

function toString(value: unknown, fallback = ""): string {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
}

export type DashboardBreakdownRow = { name: string; count: number; amount: number };

export function adaptAdminSystemOverviewToViewModel(raw: AdminSystemOverview | unknown): {
    activeUsers: number;
    activeMerchants: number;
    totalRestaurants: number;
    activeRestaurants: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    completionRate: number | string;
} {
    const obj = (raw ?? {}) as Partial<Record<string, unknown>>;

    const totalUsers = toNumber(obj.totalUsers ?? obj.activeUsers);
    const totalMerchants = toNumber(obj.totalMerchants ?? obj.activeMerchants);
    const totalRestaurants = toNumber(obj.totalRestaurants);

    // Backend only returns totals; treat totals as active counts for display.
    const activeRestaurants = toNumber(obj.activeRestaurants, totalRestaurants);

    return {
        activeUsers: totalUsers,
        activeMerchants: totalMerchants,
        totalRestaurants,
        activeRestaurants,
        totalRevenue: toNumber(obj.totalRevenue),
        totalOrders: toNumber(obj.totalOrders),
        averageOrderValue: toNumber(obj.averageOrderValue),
        completionRate: (obj.completionRate as number | string) ?? 0,
    };
}

export function adaptAdminOrderStatisticsToViewModel(raw: AdminOrderStatistics | unknown): {
    statusBreakdown: DashboardBreakdownRow[];
    paymentBreakdown: DashboardBreakdownRow[];
} {
    const obj = (raw ?? {}) as Partial<Record<string, unknown>>;

    const statusBreakdown = Array.isArray(obj.statusBreakdown)
        ? (obj.statusBreakdown as Array<Partial<Record<string, unknown>>>).map((row) => ({
              name: toString(row.status ?? row.name ?? row._id, "Unknown"),
              count: toNumber(row.count),
              amount: toNumber(row.totalAmount ?? row.amount),
          }))
        : [];

    const paymentBreakdown = Array.isArray(obj.paymentBreakdown)
        ? (obj.paymentBreakdown as Array<Partial<Record<string, unknown>>>).map((row) => ({
              name: toString(row.paymentStatus ?? row.status ?? row.name ?? row._id, "Unknown"),
              count: toNumber(row.count),
              amount: toNumber(row.totalAmount ?? row.amount),
          }))
        : [];

    return { statusBreakdown, paymentBreakdown };
}

export type AdminMerchantPerformanceRowVM = {
    merchantId: string;
    restaurantName: string;
    revenue: number;
    orders: number;
    completionRate: number | string;
};

export function adaptAdminMerchantsPerformanceToViewModel(
    raw: AdminMerchantPerformance[] | unknown,
): AdminMerchantPerformanceRowVM[] {
    if (!Array.isArray(raw)) return [];

    return (raw as Array<Partial<Record<string, unknown>>>).map((row) => ({
        merchantId: toString(row.merchantId, ""),
        restaurantName: toString(row.restaurantName, "Unknown"),
        revenue: toNumber(row.totalRevenue ?? row.revenue),
        orders: toNumber(row.totalOrders ?? row.orders),
        completionRate: (row.completionRate as number | string) ?? 0,
    }));
}

export type AdminRevenueByMerchantRowVM = {
    merchantId: string;
    revenue: number;
    orders: number;
    aov: number;
};

export function adaptAdminRevenueByMerchantToViewModel(
    raw: AdminRevenueByMerchant[] | unknown,
): AdminRevenueByMerchantRowVM[] {
    if (!Array.isArray(raw)) return [];

    return (raw as Array<Partial<Record<string, unknown>>>).map((row) => ({
        merchantId: toString(row.merchantId, ""),
        revenue: toNumber(row.totalRevenue ?? row.revenue),
        orders: toNumber(row.totalOrders ?? row.orders),
        aov: toNumber(row.averageOrderValue ?? row.aov),
    }));
}
