"use client";
import { orderApi } from "@/lib/api/orderApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { StatusBadge } from "./StatusBadge";

type StatusType = "Pending" | "Success" | "Cancel";
type OrderStatus = {
    orderValidate: StatusType;
    orderReceived: StatusType;
    restaurantStatus: StatusType;
    deliveryStatus: StatusType;
    estimatedTime: number;
};

export const OrderStatusSidebar = ({
    status,
    orderId,
    canCancel,
    orderStatus,
}: {
    status: OrderStatus;
    orderId: string;
    canCancel: boolean;
    orderStatus?: string; // Order status from order object (e.g., "completed", "cancelled")
}) => {
    const isCancelled = status.restaurantStatus === "Cancel";
    const isCompleted = orderStatus?.toLowerCase() === "completed";
    const router = useRouter();
    const handleCancel = async () => {
        if (!canCancel || isCancelled) return;
        const reason = window.prompt("Why are you cancelling this order?", "Changed my mind");
        if (!reason || !reason.trim()) {
            toast.error("Cancellation reason is required");
            return;
        }
        try {
            await orderApi.cancelOrder(orderId, reason.trim());
            toast.success("Order cancelled");
            router.refresh();
        } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Could not cancel order");
        }
    };
    return (
        <div className="w-full lg:sticky lg:top-24">
            <div className="border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Order Status</h2>
                <div className="space-y-3 text-gray-600">
                    <div className="flex justify-between items-center">
                        <span>Order Validate</span>
                        <StatusBadge status={status.orderValidate} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Order Received</span>
                        <StatusBadge status={status.orderReceived} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Restaurant Status</span>
                        <StatusBadge status={status.restaurantStatus} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Delivery Status</span>
                        <StatusBadge status={status.deliveryStatus} />
                    </div>
                </div>
            </div>

            {!isCancelled && !isCompleted ? (
                <>
                    <div className="border rounded-lg p-6 mt-6 text-center">
                        <p className="text-gray-600 mb-2">Your Order Will Come In</p>
                        {status.estimatedTime > 0 ? (
                            <p className="text-4xl font-bold my-2 text-[#EE4D2D]">
                                {status.estimatedTime} {status.estimatedTime === 1 ? "Minute" : "Minutes"}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold my-2 text-gray-500">Calculating...</p>
                        )}
                    </div>
                    <button
                        disabled={!canCancel || isCancelled}
                        onClick={handleCancel}
                        className={`w-full mt-6 font-bold py-3 rounded-md transition-colors ${
                            !canCancel || isCancelled
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-yellow-400 text-black hover:bg-yellow-500"
                        }`}
                    >
                        {isCancelled ? "Cancelled Order" : "Cancel Order"}
                    </button>
                </>
            ) : isCompleted ? (
                <>
                    <div className="border rounded-lg p-6 mt-6 text-center">
                        <p className="text-green-600 text-2xl font-bold">Order Completed!</p>
                        <p className="text-gray-600 mt-2">Thank you for your order</p>
                    </div>
                    <button
                        onClick={() => router.push("/orders", { scroll: false })}
                        className="w-full mt-6 font-bold py-3 rounded-md transition-colors bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                        Back to Order List
                    </button>
                </>
            ) : (
                <>
                    <div className="rounded-lg mt-6 text-center">
                        <p className="text-red-600 text-2xl  rounded-md font-bold line-through ">
                            Your Order Was Cancelled
                        </p>
                    </div>
                    <button
                        className={`cursor-pointer w-full mt-6 font-bold py-3 rounded-md transition-colors  bg-yellow-400 text-black hover:bg-yellow-500 pointer-none:cursor-not-allowed"`}
                        onClick={() => router.push("/orders", { scroll: false })}
                    >
                        Back to Order List
                    </button>
                </>
            )}
        </div>
    );
};
