/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import ReportsLoading from "./Report/ReportsLoading";
import ReportsError from "./Report/ReportsError";
import ReportsLineChart from "./Report/ReportsLineChart";

// Types for the chart data
interface ChartDataPoint {
    date: string;
    customers: number;
    orders: number;
    reservations: number;
    reviews: number;
}

interface ApiResponse {
    success: boolean;
    data: ChartDataPoint[];
    message?: string;
}

// Mock API function - replace this with your actual API call
const fetchReportsData = async (): Promise<ApiResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockData: ChartDataPoint[] = [
        { date: "Aug 30", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 1", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 3", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 5", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 7", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 9", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 11", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 13", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 15", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 17", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 19", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 21", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 23", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 25", customers: 0, orders: 0, reservations: 0, reviews: 0 },
        { date: "Sep 27", customers: 0, orders: 0, reservations: 0, reviews: 0 },
    ];
    return {
        success: true,
        data: mockData,
    };
};

export default function ReportsChart() {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchReportsData();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || "Failed to load chart data");
                }
            } catch (err) {
                setError("Network error occurred while loading data");
                console.error("Chart data loading error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Retry function for error cases
    const handleRetry = () => {
        setError(null);
        setLoading(true);
        const loadData = async () => {
            try {
                const response = await fetchReportsData();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || "Failed to load chart data");
                }
            } catch (err) {
                setError("Network error occurred while loading data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Reports Chart</h3>
            </div>
            {/* Chart Content */}
            <div className="h-80">
                {loading ? (
                    <ReportsLoading />
                ) : error ? (
                    <ReportsError error={error} onRetry={handleRetry} />
                ) : (
                    <ReportsLineChart data={data} />
                )}
            </div>
        </div>
    );
}
