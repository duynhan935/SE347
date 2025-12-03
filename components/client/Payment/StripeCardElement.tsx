"use client";

import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
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

                const cardNumberElement = elements.getElement(CardNumberElement);
                if (!cardNumberElement) {
                        onPaymentError("Không tìm thấy form thẻ tín dụng.");
                        return;
                }

                setIsProcessing(true);

                try {
                        // Confirm payment with Stripe
                        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                                payment_method: {
                                        card: cardNumberElement,
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
                        {/* Card Number */}
                        <div className="space-y-2">
                                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                                        Số thẻ
                                </label>
                                <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-brand-purple focus-within:border-brand-purple transition-all">
                                        <CardNumberElement
                                                id="card-number"
                                                options={{
                                                        ...cardElementOptions,
                                                        placeholder: "1234 5678 9012 3456",
                                                }}
                                        />
                                </div>
                        </div>

                        {/* Expiry Date and CVC */}
                        <div className="grid grid-cols-2 gap-4">
                                {/* Expiry Date */}
                                <div className="space-y-2">
                                        <label
                                                htmlFor="card-expiry"
                                                className="block text-sm font-medium text-gray-700"
                                        >
                                                Ngày hết hạn
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-brand-purple focus-within:border-brand-purple transition-all">
                                                <CardExpiryElement
                                                        id="card-expiry"
                                                        options={{
                                                                ...cardElementOptions,
                                                                placeholder: "MM/YY",
                                                        }}
                                                />
                                        </div>
                                </div>

                                {/* CVC */}
                                <div className="space-y-2">
                                        <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700">
                                                CVC
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-brand-purple focus-within:border-brand-purple transition-all">
                                                <CardCvcElement
                                                        id="card-cvc"
                                                        options={{
                                                                ...cardElementOptions,
                                                                placeholder: "123",
                                                        }}
                                                />
                                        </div>
                                </div>
                        </div>

                        {/* Submit Button */}
                        <button
                                type="submit"
                                disabled={!stripe || isProcessing}
                                className="w-full bg-brand-purple text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                        >
                                {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                        </button>
                </form>
        );
}
