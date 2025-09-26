import { Search, Filter, ChevronUp, ChevronDown, Settings, SlidersHorizontal } from "lucide-react";

export default function OrdersPage() {
    return (
        <div className="min-h-screen">
            <h1 className="text-h4 font-semibold mb-6 text-gray-900 ">Orders</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Search and Filter Section */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div></div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                className="border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by id, location, statu"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black" size={16} />
                        </div>
                        <button className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 flex items-center">
                            <Filter size={16} className="text-brand-black" />
                            <ChevronDown size={14} className="ml-1 text-brand-black" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronUp size={14} className="text-gray-400" />
                                        ID
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Customer Name
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Order Time Is Asap
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Order Time
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Ready Time - Date
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Status
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payment</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ChevronDown size={14} className="text-gray-400" />
                                        Order Total
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    <SlidersHorizontal size={14} className="text-brand-black" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={11} className="text-center py-12 text-gray-500 text-sm">
                                    There are no orders available.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
