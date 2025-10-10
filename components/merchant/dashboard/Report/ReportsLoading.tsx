import { Loader2 } from "lucide-react";
export default function ReportsLoading() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-500">Loading chart data...</p>
            </div>
        </div>
    );
}
