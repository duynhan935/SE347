import { AlertCircle } from "lucide-react";
export default function ReportsError({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-500 mb-3">{error}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}
