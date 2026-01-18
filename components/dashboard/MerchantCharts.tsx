"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatCurrency, formatNumber, toNumber } from "@/lib/utils/dashboardFormat";

export type MerchantChartOrder = {
    orderId: string;
    finalAmount: number;
    createdAt: string;
    status: string;
};

export type MerchantTopProduct = {
    productName: string;
    totalRevenue: number;
    totalQuantity: number;
};

export type RatingDistribution = Record<"1" | "2" | "3" | "4" | "5", number> | Record<number, number>;

function toDateLabel(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
}

function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return `${text.slice(0, Math.max(0, maxLen - 1))}…`;
}

function buildRevenueTrend(orders: MerchantChartOrder[]): Array<{ date: string; revenue: number }> {
    const map = new Map<string, number>();

    for (const order of orders) {
        const key = toDateLabel(order.createdAt);
        if (!key) continue;
        const revenue = toNumber(order.finalAmount, 0);
        map.set(key, (map.get(key) ?? 0) + revenue);
    }

    const parseKey = (k: string) => {
        const [dd, mm] = k.split("/").map((x) => Number(x));
        return (mm || 0) * 100 + (dd || 0);
    };

    return Array.from(map.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => parseKey(a.date) - parseKey(b.date));
}

function buildTopProducts(
    topProducts: MerchantTopProduct[],
): Array<{ name: string; revenue: number; fullName: string }> {
    return [...topProducts]
        .map((p) => ({
            name: truncate(String(p.productName ?? ""), 18),
            fullName: String(p.productName ?? ""),
            revenue: toNumber(p.totalRevenue, 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

function buildRatingData(ratingDistribution: RatingDistribution): Array<{ stars: number; count: number }> {
    const dist = ratingDistribution as Record<string, unknown>;
    const get = (key: number): number => {
        const v = dist[String(key)] ?? dist[key as unknown as string];
        return toNumber(v, 0);
    };

    return [1, 2, 3, 4, 5].map((stars) => ({ stars, count: get(stars) }));
}

const COLOR_SUCCESS = "#29b067"; // meta-3
const COLOR_PRIMARY = "#572af8"; // primary
const COLOR_DANGER = "#f05e36"; // meta-1
const COLOR_WARNING = "#ffcf54"; // warning

export default function MerchantCharts(props: {
    orders: MerchantChartOrder[];
    topProducts: MerchantTopProduct[];
    ratingDistribution: RatingDistribution;
}) {
    const trend = buildRevenueTrend(props.orders);
    const products = buildTopProducts(props.topProducts);
    const ratings = buildRatingData(props.ratingDistribution);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 2xl:gap-7.5">
            {/* Revenue Trend */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-2">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Revenue Trend</h3>
                    <p className="text-sm text-bodydark">Daily revenue</p>
                </div>

                <div className="h-[320px]">
                    {trend.length === 0 ? (
                        <p className="text-sm text-bodydark">No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="merchantRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLOR_SUCCESS} stopOpacity={0.35} />
                                        <stop offset="95%" stopColor={COLOR_SUCCESS} stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                                <YAxis
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    tickFormatter={(v) => formatNumber(v)}
                                />
                                <Tooltip
                                    formatter={(v) => formatCurrency(v)}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={COLOR_SUCCESS}
                                    strokeWidth={2}
                                    fill="url(#merchantRevenueGradient)"
                                    dot={{ r: 2, stroke: COLOR_SUCCESS, fill: "#fff" }}
                                    activeDot={{ r: 4 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top Products */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Top Products</h3>
                    <p className="text-sm text-bodydark">Top 5 by revenue</p>
                </div>

                <div className="h-[320px]">
                    {products.length === 0 ? (
                        <p className="text-sm text-bodydark">No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={products}
                                layout="vertical"
                                margin={{ left: 16, right: 16, top: 8, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    type="number"
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    tickFormatter={(v) => formatNumber(v)}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(v) => formatCurrency(v)}
                                    labelFormatter={(label, payload) => {
                                        const row = (payload?.[0] as unknown as { payload?: Record<string, unknown> })
                                            ?.payload;
                                        const fullName =
                                            typeof row?.fullName === "string" ? row.fullName : String(label);
                                        return `Product: ${fullName}`;
                                    }}
                                />
                                <Bar dataKey="revenue" fill={COLOR_PRIMARY} radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-3">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Rating Distribution</h3>
                    <p className="text-sm text-bodydark">Count by star rating</p>
                </div>

                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratings} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="stars"
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                tickFormatter={(v) => `${v}★`}
                            />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                formatter={(v) => formatNumber(v)}
                                labelFormatter={(label) => `Rating: ${label}★`}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {ratings.map((r) => (
                                    <Cell key={r.stars} fill={r.stars <= 2 ? COLOR_DANGER : COLOR_WARNING} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
