import { ChartBar } from "@/constants/icons";

export default function ReportsChart() {
    return (
        <div className="bg-white rounded shadow p-6">
            <div className="font-semibold mb-2">
                <ChartBar size={24} className="inline-block mr-1 mb-1" />
                Reports Chart
            </div>
            <div className="h-48 flex items-center justify-center text-gray-400">[Chart Here]</div>
        </div>
    );
}
