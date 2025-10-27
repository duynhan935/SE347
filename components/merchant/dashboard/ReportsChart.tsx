// File: components/merchant/dashboard/ReportsChart.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, BarChart3, Building, RotateCcw } from "lucide-react"; // Added Icons
import { useEffect, useState } from "react";
// Giả định các component con này tồn tại và hoạt động đúng
import ReportsError from "./Report/ReportsError";
import ReportsLineChart from "./Report/ReportsLineChart";
import ReportsLoading from "./Report/ReportsLoading";

// Định nghĩa kiểu dữ liệu cho một điểm trên biểu đồ
interface ChartDataPoint {
        date: string; // Nên dùng định dạng nhất quán như 'YYYY-MM-DD' hoặc 'MMM dd'
        // Thêm các chỉ số bạn muốn hiển thị
        customers?: number; // Ví dụ
        orders?: number;
        reservations?: number; // Ví dụ
        reviews?: number;
        revenue?: number; // Ví dụ
        // ... các chỉ số khác
}

// Định nghĩa kiểu dữ liệu trả về từ API (ví dụ)
interface ApiResponse {
        success: boolean;
        data: ChartDataPoint[];
        message?: string;
}

// --- MOCK API - BẠN CẦN THAY BẰNG API THỰC TẾ ---
const fetchReportsData = async (restaurantId: string, startDate: Date, endDate: Date): Promise<ApiResponse> => {
        console.log(
                `API CALL (mock): Fetching reports for ${restaurantId} from ${
                        startDate.toISOString().split("T")[0]
                } to ${endDate.toISOString().split("T")[0]}`
        );
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Giả lập độ trễ mạng

        // --- THAY THẾ BẰNG LOGIC GỌI API THỰC TẾ ---
        // Ví dụ:
        // try {
        //   const response = await fetch(`/api/your-reports-endpoint?restaurantId=${restaurantId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        //   if (!response.ok) {
        //     throw new Error(`API Error: ${response.statusText}`);
        //   }
        //   const result: ApiResponse = await response.json();
        //   return result;
        // } catch (error) {
        //   console.error("API Fetch Error:", error);
        //   return { success: false, data: [], message: (error as Error).message || "Failed to fetch data" };
        // }
        // --- KẾT THÚC API THỰC TẾ ---

        // Tạo dữ liệu mock dựa trên khoảng ngày
        const mockData: ChartDataPoint[] = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        // Đảm bảo vòng lặp không bị vô hạn và xử lý ngày cuối
        let safeGuard = 0;
        const maxDays = 100; // Giới hạn số ngày để tránh treo trình duyệt nếu range quá lớn

        while (currentDate <= end && safeGuard < maxDays) {
                mockData.push({
                        date: format(currentDate, "MMM dd"), // Format ngày hiển thị trục X
                        orders: Math.floor(Math.random() * 15) + 3, // Random số liệu
                        revenue: Math.floor(Math.random() * 400) + 75,
                        reviews: Math.floor(Math.random() * 4),
                });
                currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày
                safeGuard++;
        }
        if (safeGuard >= maxDays) {
                console.warn("Date range too large for mock data generation, limited to 100 days.");
        }

        // Thi thoảng giả lập lỗi API
        // if (Math.random() < 0.15) {
        //     return { success: false, data: [], message: "Simulated random API error." };
        // }

        return { success: true, data: mockData };
};
// --- HẾT MOCK API ---

// Định nghĩa kiểu cho props
interface DateRangeItem {
        startDate: Date;
        endDate: Date;
        key: string;
}
interface ReportsChartProps {
        restaurantId: string | null; // ID nhà hàng có thể null
        range: DateRangeItem[]; // Mảng chứa object range
}

// Import date-fns format function if not already imported
import { format } from "date-fns";

export default function ReportsChart({ restaurantId, range }: ReportsChartProps) {
        const [data, setData] = useState<ChartDataPoint[]>([]);
        const [loading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        // Lấy ngày bắt đầu/kết thúc từ prop range
        // Cung cấp giá trị mặc định an toàn nếu range không hợp lệ
        const safeStartDate = range?.[0]?.startDate instanceof Date ? range[0].startDate : new Date();
        const safeEndDate = range?.[0]?.endDate instanceof Date ? range[0].endDate : new Date();

        // Hàm fetch data
        const loadData = async () => {
                // Chỉ fetch nếu có restaurantId
                if (!restaurantId) {
                        setData([]); // Xóa data cũ
                        setLoading(false);
                        setError(null);
                        console.log("ReportsChart: No restaurantId provided, skipping fetch.");
                        return;
                }

                console.log("ReportsChart: Starting data fetch for", restaurantId);
                setLoading(true);
                setError(null);
                try {
                        // Gọi API với ID và ngày tháng đã chuẩn hóa
                        const response = await fetchReportsData(restaurantId, safeStartDate, safeEndDate);
                        if (response.success) {
                                setData(response.data);
                                console.log("ReportsChart: Data fetched successfully.");
                        } else {
                                setError(response.message || "Failed to load chart data");
                                setData([]); // Xóa data cũ khi có lỗi
                                console.error("ReportsChart: API error -", response.message);
                        }
                } catch (err) {
                        const errorMessage = "A network or unexpected error occurred.";
                        setError(errorMessage);
                        setData([]); // Xóa data cũ khi có lỗi
                        console.error("ReportsChart: Fetch exception -", err);
                } finally {
                        setLoading(false);
                        console.log("ReportsChart: Data fetch finished.");
                }
        };

        // useEffect để gọi loadData khi restaurantId hoặc range thay đổi
        useEffect(() => {
                loadData();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [restaurantId, safeStartDate.toISOString(), safeEndDate.toISOString()]); // Dùng ISOString để tránh re-render vô hạn do object Date

        // Hàm retry
        const handleRetry = () => {
                console.log("ReportsChart: Retrying data fetch...");
                loadData(); // Gọi lại hàm loadData
        };

        return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        {" "}
                        {/* Responsive padding */}
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                {" "}
                                {/* Responsive margin */}
                                <div className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                                Reports Overview
                                        </h3>{" "}
                                        {/* Responsive text size */}
                                </div>
                                {/* Nút Refresh (chỉ hiển thị khi không loading) */}
                                {!loading && (
                                        <button
                                                onClick={handleRetry}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                                title="Refresh Data"
                                                disabled={loading || !restaurantId} // Disable nếu đang load hoặc chưa chọn nhà hàng
                                        >
                                                <RotateCcw size={16} />
                                        </button>
                                )}
                        </div>
                        {/* Chart Content Area */}
                        <div className="h-72 sm:h-80">
                                {" "}
                                {/* Responsive height */}
                                {!restaurantId ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
                                                <Building size={32} className="mb-2" />
                                                Select a restaurant to view reports.
                                        </div>
                                ) : loading ? (
                                        <ReportsLoading /> // Component loading của bạn
                                ) : error ? (
                                        <ReportsError error={error} onRetry={handleRetry} /> // Component lỗi của bạn
                                ) : data.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
                                                <AlertTriangle size={32} className="mb-2" />
                                                No report data available for the selected period.
                                        </div>
                                ) : (
                                        <ReportsLineChart data={data} />
                                )}
                        </div>
                </div>
        );
}
