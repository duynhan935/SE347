"use client";

import { OrderStatus } from "@/types/order.type";
import { CheckCircle2, Circle } from "lucide-react";

interface OrderTrackingTimelineProps {
    status: OrderStatus;
}

const steps = [
    { key: OrderStatus.PENDING, label: "Placed" },
    { key: OrderStatus.CONFIRMED, label: "Preparing" },
    { key: OrderStatus.READY, label: "Delivering" },
    { key: OrderStatus.COMPLETED, label: "Completed" },
];

export default function OrderTrackingTimeline({ status }: OrderTrackingTimelineProps) {
    const getStepIndex = (currentStatus: OrderStatus): number => {
        switch (currentStatus) {
            case OrderStatus.PENDING:
                return 0;
            case OrderStatus.CONFIRMED:
            case OrderStatus.PREPARING:
                return 1;
            case OrderStatus.READY:
                return 2;
            case OrderStatus.COMPLETED:
                return 3;
            case OrderStatus.CANCELLED:
                return -1; // Cancelled orders don't show timeline
            default:
                return 0;
        }
    };

    const currentStepIndex = getStepIndex(status);

    if (currentStepIndex === -1) {
        return null; // Don't show timeline for cancelled orders
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <h3 className="text-lg font-bold mb-6 text-gray-900">Order Status</h3>
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                    <div
                        className="h-full bg-[#EE4D2D] transition-all duration-500"
                        style={{ width: currentStepIndex === 0 ? "0%" : currentStepIndex === steps.length - 1 ? "100%" : `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isCompleted
                                        ? "bg-[#EE4D2D] border-[#EE4D2D] text-white"
                                        : "bg-white border-gray-300 text-gray-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <Circle className="w-6 h-6" />
                                )}
                            </div>
                            <span
                                className={`mt-2 text-xs font-semibold text-center ${
                                    isCurrent ? "text-[#EE4D2D]" : isCompleted ? "text-gray-700" : "text-gray-400"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

