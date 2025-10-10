"use client";
import AddWidgetButton from "@/components/merchant/dashboard/AddWidgetButton";
import AddWidgetModal from "@/components/merchant/dashboard/AddWidgetModal";
import DateRangeSelector from "@/components/merchant/dashboard/DateRangeSelector";
import ReportsChart from "@/components/merchant/dashboard/ReportsChart";
import WidgetList from "@/components/merchant/dashboard/WidgetList";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { useEffect, useState } from "react";

export default function MerchantDashboard() {
    const { restaurant, products, loading, error, fetchRestaurantById } = useRestaurantStore();

    useEffect(() => {
        const merchantId =
            "IfW2T1hCS4oI96wdbRDs52Ax5es0x0vZcOB6jKHdjreHsxVyKJ2RQVwiZS6Y9s5DeSb33lMJ42jc6eh2LxfOId4L1rVnA84Rzsyae1F58iHWNIjkxhaKIBR9ZCzJsf4ffgXoZ2K36bYYp3A60d4pOYYkCHuL3Jhme09oFt4pQHIBQYDuJ8OMqlasSjaLpDp5f5tpAa1Gajjaksv6sezWNWmmZMunJGbDXFUzW8kObjcNRfZETjKRSFx0cEaDYH";
        fetchRestaurantById(merchantId);
    }, [fetchRestaurantById]);

    const [range, setRange] = useState([
        {
            startDate: new Date(2025, 7, 27, 0, 0),
            endDate: new Date(2025, 8, 25, 0, 0),
            key: "selection",
        },
    ]);
    const [openAddWidget, setOpenAddWidget] = useState(false);

    return (
        <div>
            <AddWidgetModal open={openAddWidget} onClose={() => setOpenAddWidget(false)} />
            <div className="mb-4 flex items-center justify-between">
                <AddWidgetButton onClick={() => setOpenAddWidget(true)} />
                <DateRangeSelector range={range} setRange={setRange} />
            </div>
            <WidgetList />
            <ReportsChart />
        </div>
    );
}
