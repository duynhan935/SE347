/* eslint-disable @typescript-eslint/no-explicit-any */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import ReportsLegend from "./ReportsLegend";
import ReportsTooltip from "./ReportsTooltip";

export default function ReportsLineChart({ data }: { data: any[] }) {
    return (
        <>
            <ReportsLegend />
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} domain={[0, 1]} />
                    <Tooltip content={<ReportsTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#7DD3FC"
                        strokeWidth={2}
                        dot={{ fill: "#7DD3FC", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, stroke: "#7DD3FC", strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#93C5FD"
                        strokeWidth={2}
                        dot={{ fill: "#93C5FD", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, stroke: "#93C5FD", strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="reservations"
                        stroke="#C4B5FD"
                        strokeWidth={2}
                        dot={{ fill: "#C4B5FD", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, stroke: "#C4B5FD", strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="reviews"
                        stroke="#FCD34D"
                        strokeWidth={2}
                        dot={{ fill: "#FCD34D", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, stroke: "#FCD34D", strokeWidth: 2, fill: "#fff" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
}
