"use client";
import { orderApi } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, PaymentStatus } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelector from "../Payment/PaymentMethodSelector";
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
    order,
    onOrderUpdate,
}: {
    status: OrderStatus;
    orderId: string;
    canCancel: boolean;
    orderStatus?: string; // Order status from order object (e.g., "completed", "cancelled")
    order?: Order; // Full order object to access paymentStatus and finalAmount
    onOrderUpdate?: () => void; // Callback to refresh order data after payment
}) => {
    const { user } = useAuthStore();
    const isCancelled = status.restaurantStatus === "Cancel";
    const isCompleted = orderStatus?.toLowerCase() === "completed";
    const router = useRouter();
    
    // Payment states
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    
    // Check if payment is needed
    const paymentStatus = order?.paymentStatus?.toLowerCase() as PaymentStatus | undefined;
    // Only show payment section if paymentStatus exists and is explicitly "pending" or "unpaid"
    // If paymentStatus is "paid", "completed", or "refunded", don't show payment form
    // If paymentStatus is undefined/null, don't show payment form (order might already be paid)
    const isPaid = paymentStatus === "paid" || paymentStatus === "completed" || paymentStatus === "refunded";
    const isUnpaid = paymentStatus === "pending" || paymentStatus === "unpaid";
    const needsPayment = isUnpaid && !isPaid; // Only show if explicitly unpaid and not paid
    const finalAmount = order?.finalAmount || 0;
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

    // Handle payment initiation
    const handleInitiatePayment = async () => {
        if (!user?.id || !order) {
            toast.error("Please login to complete payment");
            return;
        }

        if (needsPayment === false) {
            toast.error("This order is already paid");
            return;
        }

        setIsProcessingCardPayment(true);
        const loadingToast = toast.loading("Preparing payment...");

        try {
            // Calculate total amount (tax is already included in finalAmount from backend)
            const calculatedTotal = finalAmount;

            // Create payment
            const paymentResponse = await paymentApi.createPayment({
                orderId: order.orderId,
                userId: user.id,
                amount: calculatedTotal,
                currency: "USD",
                paymentMethod: "card",
            });

            // Check response structure
            if (!paymentResponse) {
                throw new Error("Payment response is null or undefined");
            }

            // Backend returns: { success: true, message: "...", data: { clientSecret, paymentId, status } }
            const responseData = (paymentResponse as { data?: unknown }).data || paymentResponse;

            if (!responseData || typeof responseData !== "object") {
                throw new Error("Payment response data is missing or invalid");
            }

            const responseDataObj = responseData as Record<string, unknown>;
            const clientSecret = responseDataObj.clientSecret as string | undefined;

            if (!clientSecret) {
                throw new Error("Failed to get payment client secret from backend");
            }

            // Set states to show Stripe form
            setStripeClientSecret(clientSecret);

            // Dismiss loading toast
            toast.dismiss(loadingToast);
        } catch (error: unknown) {
            // Extract error message
            let errorMessage = "Unable to create payment. Please try again.";

            if (error && typeof error === "object") {
                const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
                if (errorObj.response?.data?.message) {
                    errorMessage = errorObj.response.data.message;
                } else if (errorObj.message) {
                    errorMessage = errorObj.message;
                }
            }

            toast.dismiss(loadingToast);
            toast.error(errorMessage, { duration: 5000 });
            setIsProcessingCardPayment(false);
            setStripeClientSecret(null);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = async () => {
        setIsPaymentSuccess(true);
        setIsProcessingCardPayment(false);
        setStripeClientSecret(null);

        toast.success("Payment successful! Your order has been paid.", {
            duration: 3000,
        });

        // Refresh order data to update paymentStatus
        if (onOrderUpdate) {
            onOrderUpdate();
        } else {
            router.refresh();
        }
    };

    // Handle payment error
    const handlePaymentError = (error: string) => {
        if (error.includes("terminal state") || error.includes("terminal") || error.includes("cannot be used")) {
            toast.error("Payment Intent has been used or expired. Please try again.", { duration: 5000 });
            setIsProcessingCardPayment(false);
            setStripeClientSecret(null);
        } else {
            toast.error(error, { duration: 5000 });
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

            {/* Payment Section - Show if payment is needed */}
            {needsPayment && !isCancelled && !isPaymentSuccess && (
                <div className="border rounded-lg p-6 mt-6" data-payment-form>
                    <h3 className="text-lg font-bold mb-4">Complete Payment</h3>
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-[#EE4D2D]">
                                ${finalAmount.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Please complete payment to proceed with your order.
                        </p>
                    </div>
                    
                    {isProcessingCardPayment && stripeClientSecret ? (
                        <PaymentMethodSelector
                            key={stripeClientSecret}
                            stripeClientSecret={stripeClientSecret}
                            isProcessingCardPayment={isProcessingCardPayment}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                    ) : (
                        <button
                            onClick={handleInitiatePayment}
                            disabled={isProcessingCardPayment}
                            className={`w-full font-bold py-3 rounded-md transition-colors ${
                                isProcessingCardPayment
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90"
                            }`}
                        >
                            {isProcessingCardPayment ? "Preparing payment..." : "Pay Now"}
                        </button>
                    )}
                </div>
            )}

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
