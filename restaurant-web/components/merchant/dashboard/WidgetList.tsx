export default function WidgetList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                <span className="text-4xl mb-2">📈</span>
                <div className="text-2xl font-bold">£0.00</div>
                <div className="text-gray-500">Total Lost Sales</div>
            </div>
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                <span className="text-4xl mb-2">💳</span>
                <div className="text-2xl font-bold">£0.00</div>
                <div className="text-gray-500">Total Cash Payments</div>
            </div>
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                <span className="text-4xl mb-2">📊</span>
                <div className="text-2xl font-bold">£0.00</div>
                <div className="text-gray-500">Total Sales</div>
            </div>
        </div>
    );
}
