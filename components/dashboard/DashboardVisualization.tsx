"use client";

import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatNumber, humanizeOrderStatus, toNumber } from "@/lib/utils/dashboardFormat";

type ApiEnvelope<T> = { success: boolean; data: T };

export type DashboardOverview = {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalRestaurants: number;
    completionRate?: string | number;
};

export type DashboardOrderStats = {
    statusBreakdown: Array<{ status: string; count: number; totalAmount: number }>;
};

export type MerchantPerformanceRow = {
    restaurantId: string;
    restaurantName: string;
    totalRevenue: number;
    totalOrders: number;
};

export type DashboardApiBundle = {
    overview: ApiEnvelope<DashboardOverview>;
    revenue?: ApiEnvelope<unknown>; // not used in this viz, but often returned by backend
    orders: ApiEnvelope<DashboardOrderStats>;
    merchants: ApiEnvelope<MerchantPerformanceRow[]>;
};

const STATUS_COLORS: Record<string, string> = {
    completed: "#29b067",
    pending: "#ffcf54",
    confirmed: "#572af8",
    preparing: "#572af8",
    ready: "#572af8",
    processing: "#f05e36",
    cancelled: "#f05e36",
    failed: "#f05e36",
};

function pickColor(key: string, index: number): string {
    const normalized = key.toLowerCase();
    if (STATUS_COLORS[normalized]) return STATUS_COLORS[normalized];
    const palette = ["#572af8", "#29b067", "#ffcf54", "#f05e36", "#380cd3", "#575363"];
    return palette[index % palette.length];
}

function aggregateTopRestaurants(
    rows: MerchantPerformanceRow[],
): Array<{ restaurantName: string; totalRevenue: number }> {
    const map = new Map<string, number>();

    for (const row of rows) {
        const name = String(row.restaurantName ?? "Unknown");
        const revenue = toNumber(row.totalRevenue, 0);
        map.set(name, (map.get(name) ?? 0) + revenue);
    }

    return Array.from(map.entries())
        .map(([restaurantName, totalRevenue]) => ({ restaurantName, totalRevenue }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
}

export default function DashboardVisualization({ data }: { data: DashboardApiBundle }) {
    const overview = data.overview?.data;
    const merchants = Array.isArray(data.merchants?.data) ? data.merchants.data : [];
    const statusBreakdown = Array.isArray(data.orders?.data?.statusBreakdown) ? data.orders.data.statusBreakdown : [];

    const topRestaurants = aggregateTopRestaurants(merchants);

    const donutData = statusBreakdown
        .map((s) => ({
            status: String(s.status ?? "Unknown"),
            label: humanizeOrderStatus(s.status),
            count: toNumber(s.count, 0),
            totalAmount: toNumber(s.totalAmount, 0),
        }))
        .filter((x) => x.count > 0);

    return (
        <div className="space-y-6">
            {/* Overview cards - REMOVED */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Horizontal bar chart */}
                <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top Restaurants (Revenue)</h2>
                        <p className="text-sm text-gray-600">Top 5 by totalRevenue</p>
                    </div>
                    <div className="h-[320px]">
                        {topRestaurants.length === 0 ? (
                            <p className="text-sm text-gray-600">No data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topRestaurants} layout="vertical" margin={{ left: 16, right: 16 }}>
                                    <XAxis type="number" tickFormatter={(v) => formatNumber(v)} stroke="#9ca3af" />
                                    <YAxis type="category" dataKey="restaurantName" width={140} stroke="#9ca3af" />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        labelFormatter={(label) => `Restaurant: ${label}`}
                                    />
                                    <Bar dataKey="totalRevenue" fill="#572af8" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Donut chart */}
                <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Order Status Breakdown</h2>
                        <p className="text-sm text-gray-600">Orders grouped by status</p>
                    </div>
                    <div className="h-[320px]">
                        {donutData.length === 0 ? (
                            <p className="text-sm text-gray-600">No data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const payload = (props as unknown as { payload?: Record<string, unknown> })
                                                ?.payload;
                                            const label =
                                                typeof payload?.label === "string" ? payload.label : undefined;
                                            return [`${formatNumber(value)}`, `${label ?? String(name)}`];
                                        }}
                                        labelFormatter={() => ""}
                                    />
                                    <Legend
                                        formatter={(value) => {
                                            const label = donutData.find((d) => d.status === value)?.label;
                                            return label ?? String(value);
                                        }}
                                    />
                                    <Pie
                                        data={donutData}
                                        dataKey="count"
                                        nameKey="status"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        paddingAngle={2}
                                    >
                                        {donutData.map((entry, idx) => (
                                            <Cell key={entry.status} fill={pickColor(entry.status, idx)} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
