"use client";

import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

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
            onPaymentError("Stripe is not ready yet. Please try again.");
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            onPaymentError("Card form not found.");
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
                // Check if PaymentIntent is in terminal state
                if (error.message?.includes("terminal state") || error.message?.includes("cannot be used")) {
                    onPaymentError("Payment Intent has already been used or expired. Please place order again.");
                } else {
                    onPaymentError(error.message || "Payment failed. Please try again.");
                }
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                // Don't show toast here - let the parent component handle it
                // This prevents duplicate success toasts
                onPaymentSuccess();
            } else {
                onPaymentError("Payment was not completed. Please try again.");
                setIsProcessing(false);
            }
        } catch (error: unknown) {
            console.error("Stripe payment error:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred while processing the payment. Please try again.";
            
            // Check if PaymentIntent is in terminal state
            if (errorMessage.includes("terminal state") || errorMessage.includes("cannot be used")) {
                onPaymentError("Payment Intent has already been used or expired. Please place order again.");
            } else {
                onPaymentError(errorMessage);
            }
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
                    Card Number
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-[#EE4D2D] focus-within:border-[#EE4D2D] transition-all">
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
                    <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-[#EE4D2D] focus-within:border-[#EE4D2D] transition-all">
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
                    <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-[#EE4D2D] focus-within:border-[#EE4D2D] transition-all">
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
                className="w-full bg-[#EE4D2D] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#EE4D2D]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
                {isProcessing ? "Processing..." : "Confirm Payment"}
            </button>
        </form>
    );
}
