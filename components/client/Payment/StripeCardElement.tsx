"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";

interface StripeCardElementProps {
        clientSecret: string;
        onPaymentSuccess: () => void;
        onPaymentError: (error: string) => void;
}

export default function StripeCardElement({ clientSecret, onPaymentSuccess, onPaymentError }: StripeCardElementProps) {
        const stripe = useStripe();
        const elements = useElements();
        const [isProcessing, setIsProcessing] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();

                if (!stripe || !elements) {
                        onPaymentError("Stripe chưa sẵn sàng. Vui lòng thử lại.");
                        return;
                }

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                        onPaymentError("Không tìm thấy form thẻ tín dụng.");
                        return;
                }

                setIsProcessing(true);

                try {
                        // Confirm payment with Stripe
                        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                                payment_method: {
                                        card: cardElement,
                                },
                        });

                        if (error) {
                                onPaymentError(error.message || "Thanh toán thất bại. Vui lòng thử lại.");
                                setIsProcessing(false);
                                return;
                        }

                        if (paymentIntent && paymentIntent.status === "succeeded") {
                                toast.success("Thanh toán thành công!");
                                onPaymentSuccess();
                        } else {
                                onPaymentError("Thanh toán chưa hoàn tất. Vui lòng thử lại.");
                                setIsProcessing(false);
                        }
                } catch (error) {
                        console.error("Stripe payment error:", error);
                        onPaymentError("Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.");
                        setIsProcessing(false);
                }
        };

        const cardElementOptions = {
                style: {
                        base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                        color: "#aab7c4",
                                },
                        },
                        invalid: {
                                color: "#9e2146",
                        },
                },
        };

        return (
                <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                <CardElement options={cardElementOptions} />
                        </div>
                        <button
                                type="submit"
                                disabled={!stripe || isProcessing}
                                className="w-full bg-brand-purple text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                                {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                        </button>
                </form>
        );
}
