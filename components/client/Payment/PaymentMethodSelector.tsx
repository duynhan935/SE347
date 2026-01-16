"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import StripeCardElement from "./StripeCardElement";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
    const [stripeInstance, setStripeInstance] = useState<import("@stripe/stripe-js").Stripe | null>(null);
    const [isLoadingStripe, setIsLoadingStripe] = useState(true);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [paymentIntentError, setPaymentIntentError] = useState<string | null>(null);

    // Reset paymentIntentError when clientSecret changes
    useEffect(() => {
        if (stripeClientSecret) {
            setPaymentIntentError(null);
        }
    }, [stripeClientSecret]);

    useEffect(() => {
        if (!stripePublishableKey) {
            setStripeError("Stripe publishable key is not configured");
            setIsLoadingStripe(false);
            return;
        }

        // Load Stripe
        const loadStripeInstance = async () => {
            try {
                setIsLoadingStripe(true);
                const stripe = await loadStripe(stripePublishableKey);
                if (stripe) {
                    setStripeInstance(stripe);
                    setStripeError(null);
                } else {
                    setStripeError("Failed to load Stripe");
                }
            } catch {
                setStripeError("Failed to initialize Stripe");
            } finally {
                setIsLoadingStripe(false);
            }
        };

        loadStripeInstance();
    }, []);

    return (
        <div>
            {/* Credit/Debit Card Section */}
            <div className="border-2 border-[#EE4D2D] bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded-full bg-[#EE4D2D]" aria-hidden />
                    <div className="flex-grow">
                        <div className="font-semibold text-gray-900">Credit/Debit Card (Stripe)</div>
                        <div className="text-sm text-gray-500">Secure payment with Stripe</div>
                    </div>
                </div>

                {/* Show Stripe form when clientSecret is available */}
                {isProcessingCardPayment && stripeClientSecret ? (
                    <>
                        {stripeError ? (
                            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                <p className="font-medium">⚠️ Stripe Error</p>
                                <p className="text-xs mt-1">{stripeError}</p>
                                <p className="text-xs mt-1">
                                    Please check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
                                </p>
                            </div>
                        ) : isLoadingStripe ? (
                            <div className="mt-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#EE4D2D]"></div>
                                    <p>Loading Stripe...</p>
                                </div>
                            </div>
                        ) : stripeInstance ? (
                            <div className="mt-4">
                                {paymentIntentError ? (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                        <p className="font-medium">⚠️ Payment Intent Error</p>
                                        <p className="text-xs mt-1">{paymentIntentError}</p>
                                        <p className="text-xs mt-2">
                                            This Payment Intent has been used or expired. Please place the order again.
                                        </p>
                                    </div>
                                ) : (
                                    <Elements 
                                        stripe={stripeInstance} 
                                        options={{ clientSecret: stripeClientSecret }}
                                    >
                                        <StripeCardElement
                                            clientSecret={stripeClientSecret}
                                            onPaymentSuccess={onPaymentSuccess}
                                            onPaymentError={(error) => {
                                                if (error?.includes("terminal state") || error?.includes("terminal") || error?.includes("cannot be used")) {
                                                    setPaymentIntentError("Payment Intent is in a terminal state and cannot be used.");
                                                }
                                                onPaymentError(error);
                                            }}
                                        />
                                    </Elements>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                <p className="font-medium">⚠️ Stripe not loaded</p>
                                <p className="text-xs mt-1">Please refresh the page and try again.</p>
                            </div>
                        )}
                    </>
                ) : isProcessingCardPayment && !stripeClientSecret ? (
                    <div className="mt-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#EE4D2D]"></div>
                            <p>Preparing payment form...</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-900 mb-1">Pay with credit card</p>
                            <p className="text-blue-700 text-xs">
                                Click &quot;Place Order&quot; to continue. Then you will enter your card information to complete the payment.
                            </p>
                        </div>
                        <div className="text-xs text-gray-500">
                            <p>✓ Secure payment with Stripe</p>
                            <p>✓ Supports Visa, Mastercard, Amex</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
