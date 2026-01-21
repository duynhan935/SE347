"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { formatCurrency, formatNumber, humanizeOrderStatus, toNumber } from "@/lib/utils/dashboardFormat";

export type StatusBreakdownRow = { status: string; count: number; totalAmount: number };

type BucketKey = "pending" | "completed" | "cancelled";

function bucketForStatus(raw: string): BucketKey {
    const s = String(raw ?? "")
        .trim()
        .toLowerCase();

    if (s === "cancelled" || s === "canceled") return "cancelled";
    if (s === "completed" || s === "delivered") return "completed";

    return "pending";
}

function buildFiltered(rows: StatusBreakdownRow[]) {
    const totals: Record<BucketKey, { status: BucketKey; label: string; count: number; totalAmount: number }> = {
        pending: { status: "pending", label: humanizeOrderStatus("pending"), count: 0, totalAmount: 0 },
        completed: { status: "completed", label: humanizeOrderStatus("completed"), count: 0, totalAmount: 0 },
        cancelled: { status: "cancelled", label: humanizeOrderStatus("cancelled"), count: 0, totalAmount: 0 },
    };

    for (const row of rows) {
        const bucket = bucketForStatus(row.status);
        totals[bucket].count += toNumber(row.count, 0);
        totals[bucket].totalAmount += toNumber(row.totalAmount, 0);
    }

    return [totals.pending, totals.completed, totals.cancelled].filter((x) => x.count > 0);
}

const COLORS: Record<BucketKey, string> = {
    completed: "#29b067",
    pending: "#ffcf54",
    cancelled: "#f05e36",
};

export default function StatusBreakdown({ rows, height = 320 }: { rows: StatusBreakdownRow[]; height?: number }) {
    const data = buildFiltered(Array.isArray(rows) ? rows : []);

    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Order Status Breakdown</h3>
                <p className="text-sm text-bodydark">Showing only: Pending, Completed, Cancelled</p>
            </div>

            <div style={{ height }}>
                {data.length === 0 ? (
                    <p className="text-sm text-bodydark">No data yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                formatter={(value, _name, props) => {
                                    const payload = (props as unknown as { payload?: Record<string, unknown> })
                                        ?.payload;
                                    const label = typeof payload?.label === "string" ? payload.label : undefined;
                                    return [`${formatNumber(value)}`, `${label ?? ""}`];
                                }}
                                labelFormatter={() => ""}
                            />
                            <Legend
                                formatter={(value) => {
                                    const label = data.find((d) => d.status === value)?.label;
                                    return label ?? String(value);
                                }}
                            />
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="status"
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={2}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.status} fill={COLORS[entry.status]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {data.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {data.map((row) => (
                        <div key={row.status} className="rounded-lg border border-stroke p-3 dark:border-strokedark">
                            <div className="text-sm font-semibold text-black dark:text-white">{row.label}</div>
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="text-bodydark">Orders</span>
                                <span className="font-semibold text-black dark:text-white">
                                    {formatNumber(row.count)}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="text-bodydark">Amount</span>
                                <span className="font-semibold text-black dark:text-white">
                                    {formatCurrency(row.totalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
