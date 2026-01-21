"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MerchantRevenueTrendPoint } from "@/types/dashboard.type";
import { formatCurrency, formatNumber, toNumber } from "@/lib/utils/dashboardFormat";

function toDateLabel(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
}

const COLOR_SUCCESS = "#29b067";

export default function RevenueTrendChart({
    points,
    height = 320,
}: {
    points: MerchantRevenueTrendPoint[];
    height?: number;
}) {
    const trend = (Array.isArray(points) ? points : [])
        .map((p) => ({
            date: toDateLabel(String(p.date ?? "")),
            revenue: toNumber(p.totalRevenue, 0),
        }))
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Revenue Trend</h3>
                <p className="text-sm text-bodydark">Daily revenue</p>
            </div>

            <div style={{ height }}>
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
                            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
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
    );
}
