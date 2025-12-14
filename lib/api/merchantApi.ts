import api from "../axios";
import { Merchant } from "@/types";
import { restaurantApi } from "./restaurantApi";
import { productApi } from "./productApi";
import { orderApi } from "./orderApi";

type UserResponse = {
    id: string;
    username: string;
    email: string;
    enabled: boolean;
    role: string;
    phone?: string | null;
    slug?: string;
};

const toMerchant = (u: UserResponse): Merchant => {
    const status: Merchant["status"] = u.enabled ? "APPROVED" : "PENDING";
    return {
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone ?? undefined,
        enabled: u.enabled,
        role: "MERCHANT",
        status,
        totalRestaurants: 0,
        totalRevenue: 0,
    };
};

export interface MerchantStats {
    totalRestaurants: number;
    totalRevenue: number;
    totalOrders: number;
    activeRestaurants: number;
    totalProducts?: number;
    currentMonthRevenue?: number;
    previousMonthRevenue?: number;
    revenueGrowthPercent?: number;
}

export const merchantApi = {
    // Get all merchants (Admin only)
    getAllMerchants: async () => {
        const response = await api.get<UserResponse[]>("/users");
        const users = Array.isArray(response.data) ? response.data : [];
        return users.filter((u) => u?.role === "MERCHANT").map(toMerchant);
    },

    // Get merchant by ID
    getMerchantById: async (merchantId: string) => {
        const response = await api.get<UserResponse>(`/users/admin/${merchantId}`);
        const user = response.data;
        if (!user || user.role !== "MERCHANT") return undefined;
        return toMerchant(user);
    },

    // Approve merchant (Admin only)
    approveMerchant: async (merchantId: string) => {
        const response = await api.put(`/users/approvement/${merchantId}`);
        return response.data;
    },

    // Reject merchant (Admin only)
    rejectMerchant: async (merchantId: string, reason: string) => {
        const response = await api.delete(`/users/rejection/${merchantId}`, { data: { reason } });
        return response.data;
    },

    // Get merchant stats
    getMerchantStats: async (merchantId: string): Promise<MerchantStats> => {
        const restaurantsRes = await restaurantApi.getRestaurantByMerchantId(merchantId);
        const restaurants = Array.isArray(restaurantsRes.data)
            ? restaurantsRes.data
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((restaurantsRes.data as any)?.data ?? []);

        const totalRestaurants = Array.isArray(restaurants) ? restaurants.length : 0;
        const activeRestaurants = Array.isArray(restaurants)
            ? restaurants.filter((r: any) => r?.enabled === true).length
            : 0;

        // Count products across all restaurants
        const productCounts = await Promise.all(
            (Array.isArray(restaurants) ? restaurants : [])
                .filter((r: any) => r?.id)
                .map(async (r: any) => {
                    try {
                        const productsRes = await productApi.getProductsByRestaurantId(r.id);
                        return Array.isArray(productsRes.data) ? productsRes.data.length : 0;
                    } catch {
                        return 0;
                    }
                })
        );
        const totalProducts = productCounts.reduce((sum, n) => sum + n, 0);

        // Orders + revenue
        const orders = await orderApi.getOrdersByMerchant(merchantId);
        const totalOrders = Array.isArray(orders) ? orders.length : 0;

        const totalRevenue = (Array.isArray(orders) ? orders : []).reduce((sum, o: any) => {
            const status = (o?.status ?? "").toString();
            const paymentStatus = (o?.paymentStatus ?? "").toString();
            if (status !== "completed") return sum;
            if (paymentStatus !== "paid" && paymentStatus !== "completed") return sum;
            const amount = typeof o?.finalAmount === "number" ? o.finalAmount : typeof o?.totalAmount === "number" ? o.totalAmount : 0;
            return sum + amount;
        }, 0);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousMonthDate.getMonth();
        const previousYear = previousMonthDate.getFullYear();

        const monthRevenue = (year: number, month: number) =>
            (Array.isArray(orders) ? orders : []).reduce((sum, o: any) => {
                const createdAt = o?.createdAt ? new Date(o.createdAt) : null;
                if (!createdAt || Number.isNaN(createdAt.getTime())) return sum;
                if (createdAt.getFullYear() !== year || createdAt.getMonth() !== month) return sum;
                const status = (o?.status ?? "").toString();
                const paymentStatus = (o?.paymentStatus ?? "").toString();
                if (status !== "completed") return sum;
                if (paymentStatus !== "paid" && paymentStatus !== "completed") return sum;
                const amount = typeof o?.finalAmount === "number" ? o.finalAmount : typeof o?.totalAmount === "number" ? o.totalAmount : 0;
                return sum + amount;
            }, 0);

        const currentMonthRevenue = monthRevenue(currentYear, currentMonth);
        const previousMonthRevenue = monthRevenue(previousYear, previousMonth);
        const revenueGrowthPercent =
            previousMonthRevenue > 0
                ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
                : currentMonthRevenue > 0
                  ? 100
                  : 0;

        return {
            totalRestaurants,
            activeRestaurants,
            totalProducts,
            totalOrders,
            totalRevenue,
            currentMonthRevenue,
            previousMonthRevenue,
            revenueGrowthPercent,
        };
    },
};
