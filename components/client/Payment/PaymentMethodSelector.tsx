"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCardElement from "./StripeCardElement";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentMethodSelectorProps {
    stripeClientSecret: string | null;
    isProcessingCardPayment: boolean;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
}

export default function PaymentMethodSelector({
    stripeClientSecret,
    isProcessingCardPayment,
    onPaymentSuccess,
    onPaymentError,
}: PaymentMethodSelectorProps) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
                {/* Credit/Debit Card */}
                <div className="border rounded-lg p-4 bg-white hover:border-brand-purple transition-colors">
                    <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-brand-purple" aria-hidden />
                        <div className="ml-3 block text-sm font-medium text-gray-700 flex-1">
                            Credit/Debit Card (Stripe)
                        </div>
                    </div>

                    <div className="mt-4 ml-7">
                        {!isProcessingCardPayment && !stripeClientSecret && (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="font-medium text-blue-900 mb-1">Thanh toán bằng thẻ tín dụng</p>
                                    <p className="text-blue-700 text-xs">
                                        Nhấn nút &quot;Tạo thanh toán bằng thẻ&quot; bên dưới để tiếp tục. Sau đó bạn sẽ
                                        nhập thông tin thẻ để hoàn tất thanh toán.
                                    </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>✓ Thanh toán an toàn với Stripe</p>
                                    <p>✓ Hỗ trợ Visa, Mastercard, Amex</p>
                                </div>
                            </div>
                        )}

                        {/* Show Stripe form when clientSecret is available */}
                        {isProcessingCardPayment && stripeClientSecret && stripePromise && (
                            <div className="mt-2">
                                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                                    <StripeCardElement
                                        clientSecret={stripeClientSecret}
                                        onPaymentSuccess={onPaymentSuccess}
                                        onPaymentError={onPaymentError}
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
                                <p className="font-medium">⚠️ Stripe chưa được cấu hình</p>
                                <p className="text-xs mt-1">
                                    Vui lòng kiểm tra NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY trong .env.local
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
