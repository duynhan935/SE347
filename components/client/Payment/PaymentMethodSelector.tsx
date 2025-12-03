"use client";

import type { CreateOrderRequest } from "@/lib/api/orderApi";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import StripeCardElement from "./StripeCardElement";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentMethodSelectorProps {
        paymentMethod: CreateOrderRequest["paymentMethod"];
        onPaymentMethodChange: (method: CreateOrderRequest["paymentMethod"]) => void;
        stripeClientSecret: string | null;
        isProcessingCardPayment: boolean;
        onPaymentSuccess: () => void;
        onPaymentError: (error: string) => void;
}

export default function PaymentMethodSelector({
        paymentMethod,
        onPaymentMethodChange,
        stripeClientSecret,
        isProcessingCardPayment,
        onPaymentSuccess,
        onPaymentError,
}: PaymentMethodSelectorProps) {
        const [showCardForm, setShowCardForm] = useState(false);

        const handlePaymentMethodChange = (method: CreateOrderRequest["paymentMethod"]) => {
                onPaymentMethodChange(method);
                // Show card form immediately when card is selected
                if (method === "card") {
                        setShowCardForm(true);
                } else {
                        setShowCardForm(false);
                }
        };

        return (
                <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                        <div className="space-y-4">
                                {/* Cash on Delivery */}
                                <div className="border rounded-lg p-4 bg-white hover:border-brand-purple transition-colors">
                                        <div className="flex items-center">
                                                <input
                                                        type="radio"
                                                        id="cash"
                                                        name="paymentMethod"
                                                        value="cash"
                                                        checked={paymentMethod === "cash"}
                                                        onChange={(e) =>
                                                                handlePaymentMethodChange(
                                                                        e.target
                                                                                .value as CreateOrderRequest["paymentMethod"]
                                                                )
                                                        }
                                                        disabled={isProcessingCardPayment}
                                                        className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700 cursor-pointer"
                                                />
                                                <label
                                                        htmlFor="cash"
                                                        className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                                >
                                                        Cash on Delivery
                                                </label>
                                        </div>
                                        {paymentMethod === "cash" && (
                                                <div className="mt-3 ml-7 text-sm text-gray-600">
                                                        <p>Thanh toán khi nhận hàng</p>
                                                </div>
                                        )}
                                </div>

                                {/* Credit/Debit Card */}
                                <div className="border rounded-lg p-4 bg-white hover:border-brand-purple transition-colors">
                                        <div className="flex items-center">
                                                <input
                                                        type="radio"
                                                        id="card"
                                                        name="paymentMethod"
                                                        value="card"
                                                        checked={paymentMethod === "card"}
                                                        onChange={(e) =>
                                                                handlePaymentMethodChange(
                                                                        e.target
                                                                                .value as CreateOrderRequest["paymentMethod"]
                                                                )
                                                        }
                                                        disabled={isProcessingCardPayment}
                                                        className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700 cursor-pointer"
                                                />
                                                <label
                                                        htmlFor="card"
                                                        className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                                >
                                                        Credit/Debit Card
                                                </label>
                                        </div>

                                        {/* Show card form when card is selected */}
                                        {paymentMethod === "card" && (
                                                <div className="mt-4 ml-7">
                                                        {!isProcessingCardPayment && !stripeClientSecret && (
                                                                <div className="space-y-3">
                                                                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                                                <p className="font-medium text-blue-900 mb-1">
                                                                                        💳 Thanh toán bằng thẻ tín dụng
                                                                                </p>
                                                                                <p className="text-blue-700 text-xs">
                                                                                        Nhấn nút "Tạo thanh toán bằng
                                                                                        thẻ" bên dưới để tiếp tục. Sau
                                                                                        đó bạn sẽ nhập thông tin thẻ để
                                                                                        hoàn tất thanh toán.
                                                                                </p>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                                <p>✓ Thanh toán an toàn với Stripe</p>
                                                                                <p>✓ Hỗ trợ Visa, Mastercard, Amex</p>
                                                                        </div>
                                                                </div>
                                                        )}

                                                        {/* Show Stripe form when clientSecret is available */}
                                                        {isProcessingCardPayment &&
                                                                stripeClientSecret &&
                                                                stripePromise && (
                                                                        <div className="mt-2">
                                                                                <Elements
                                                                                        stripe={stripePromise}
                                                                                        options={{
                                                                                                clientSecret:
                                                                                                        stripeClientSecret,
                                                                                        }}
                                                                                >
                                                                                        <StripeCardElement
                                                                                                clientSecret={
                                                                                                        stripeClientSecret
                                                                                                }
                                                                                                onPaymentSuccess={
                                                                                                        onPaymentSuccess
                                                                                                }
                                                                                                onPaymentError={
                                                                                                        onPaymentError
                                                                                                }
                                                                                        />
                                                                                </Elements>
                                                                        </div>
                                                                )}

                                                        {/* Loading state */}
                                                        {isProcessingCardPayment && !stripeClientSecret && (
                                                                <div className="mt-2 text-sm text-gray-600">
                                                                        <div className="flex items-center space-x-2">
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-purple"></div>
                                                                                <p>Đang tải form thanh toán...</p>
                                                                        </div>
                                                                </div>
                                                        )}

                                                        {/* Stripe not configured */}
                                                        {isProcessingCardPayment && !stripePromise && (
                                                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                                                        <p className="font-medium">
                                                                                ⚠️ Stripe chưa được cấu hình
                                                                        </p>
                                                                        <p className="text-xs mt-1">
                                                                                Vui lòng kiểm tra
                                                                                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY trong
                                                                                .env.local
                                                                        </p>
                                                                </div>
                                                        )}
                                                </div>
                                        )}
                                </div>

                                {/* E-Wallet */}
                                <div className="border rounded-lg p-4 bg-white hover:border-brand-purple transition-colors">
                                        <div className="flex items-center">
                                                <input
                                                        type="radio"
                                                        id="wallet"
                                                        name="paymentMethod"
                                                        value="wallet"
                                                        checked={paymentMethod === "wallet"}
                                                        onChange={(e) =>
                                                                handlePaymentMethodChange(
                                                                        e.target
                                                                                .value as CreateOrderRequest["paymentMethod"]
                                                                )
                                                        }
                                                        disabled={isProcessingCardPayment}
                                                        className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700 cursor-pointer"
                                                />
                                                <label
                                                        htmlFor="wallet"
                                                        className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                                >
                                                        E-Wallet
                                                </label>
                                        </div>
                                        {paymentMethod === "wallet" && (
                                                <div className="mt-3 ml-7 text-sm text-gray-600">
                                                        <p>Thanh toán qua ví điện tử</p>
                                                </div>
                                        )}
                                </div>
                        </div>
                </div>
        );
}
