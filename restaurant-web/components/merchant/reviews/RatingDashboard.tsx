import React from "react";
import RatingChart from "./RatingChart";

interface RatingDashboardProps {
    qualityData?: {
        poor: number;
        average: number;
        good: number;
        veryGood: number;
        excellent: number;
    };
    serviceData?: {
        poor: number;
        average: number;
        good: number;
        veryGood: number;
        excellent: number;
    };
    deliveryData?: {
        poor: number;
        average: number;
        good: number;
        veryGood: number;
        excellent: number;
    };
}

export default function RatingDashboard({ qualityData, serviceData, deliveryData }: RatingDashboardProps) {
    qualityData = { poor: 0, average: 0, good: 0, veryGood: 0, excellent: 0 };
    serviceData = { poor: 0, average: 0, good: 0, veryGood: 0, excellent: 0 };
    deliveryData = { poor: 0, average: 0, good: 0, veryGood: 0, excellent: 0 };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <RatingChart title="Quality Rating" data={qualityData} color="#dc2626" />
            <RatingChart title="Service Rating" data={serviceData} color="#dc2626" />
            <RatingChart title="Delivery Rating" data={deliveryData} color="#dc2626" />
        </div>
    );
}
