"use client";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";

type StatusType = "Pending" | "Success" | "Cancel";
type OrderStatus = {
        orderValidate: StatusType;
        orderReceived: StatusType;
        restaurantStatus: StatusType;
        deliveryStatus: StatusType;
        estimatedTime: number;
};
export const OrderStatusSidebar = ({ status }: { status: OrderStatus }) => {
        const isCancelled = status.restaurantStatus === "Cancel";
        const router = useRouter();
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

                        {!isCancelled ? (
                                <>
                                        <div className="border rounded-lg p-6 mt-6 text-center">
                                                <p className="text-gray-600">Your Order Will Come In</p>
                                                <p className="text-4xl font-bold my-2">
                                                        {status.estimatedTime} Minutes
                                                </p>
                                        </div>
                                        <button
                                                className={`cursor-pointer w-full mt-6 font-bold py-3 rounded-md transition-colors ${
                                                        !isCancelled
                                                                ? "bg-yellow-400 text-black hover:bg-yellow-500 pointer-none:cursor-not-allowed"
                                                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                                }`}
                                        >
                                                {isCancelled ? "Cancelled Order" : "Cancel Order"}
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
