"use client";
import AddWidgetButton from "@/components/merchant/dashboard/AddWidgetButton";
import AddWidgetModal from "@/components/merchant/dashboard/AddWidgetModal";
import DateRangeSelector from "@/components/merchant/dashboard/DateRangeSelector";
import ReportsChart from "@/components/merchant/dashboard/ReportsChart";
import WidgetList from "@/components/merchant/dashboard/WidgetList";
import { useState } from "react";

export default function MerchantDashboard() {
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
