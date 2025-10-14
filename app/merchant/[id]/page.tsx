"use client";

import DateRangeSelector from "@/components/merchant/dashboard/DateRangeSelector";
import ReportsChart from "@/components/merchant/dashboard/ReportsChart";
import WidgetList from "@/components/merchant/dashboard/WidgetList";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Star, CheckCircle, XCircle } from "lucide-react";

export default function MerchantDashboard() {
    const { restaurant, loading, error, fetchRestaurantById } = useRestaurantStore();

    useEffect(() => {
        const merchantId = "testresid";
        fetchRestaurantById(merchantId);
    }, [fetchRestaurantById]);

    const [range, setRange] = useState([
        {
            startDate: new Date(2025, 7, 27, 0, 0),
            endDate: new Date(2025, 8, 25, 0, 0),
            key: "selection",
        },
    ]);

    if (loading) return <p>Đang tải thông tin nhà hàng...</p>;
    if (error) return <p>Đã xảy ra lỗi khi tải thông tin nhà hàng.</p>;

    return (
        <div className="space-y-6">
            {/* Header: Thông tin nhà hàng */}
            {restaurant && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center justify-between">
                            {restaurant.resName}
                            {restaurant.enabled ? (
                                <Badge className="bg-green-500 flex items-center gap-1">
                                    <CheckCircle size={14} /> Đang hoạt động
                                </Badge>
                            ) : (
                                <Badge className="bg-red-500 flex items-center gap-1">
                                    <XCircle size={14} /> Tạm ngưng
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-500" />
                            <span>{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-500" />
                            <span>{restaurant.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-500" />
                            <span>
                                {restaurant.openingTime} - {restaurant.closingTime}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-500" />
                            <span>
                                {restaurant.rating} ⭐ ({restaurant.totalReview} đánh giá)
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
            <WidgetList />
            <div className="mb-4 flex items-center justify-between">
                <div></div>
                <DateRangeSelector range={range} setRange={setRange} />
            </div>
            <ReportsChart />
        </div>
    );
}
