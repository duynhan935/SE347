"use client";

import React from "react";

interface PaymentProgressProps {
    currentStep: "order" | "payment";
}

export const PaymentProgress = ({ currentStep }: PaymentProgressProps) => {
    const steps = [
        { id: "order", label: "Thông tin đơn hàng", number: 1 },
        { id: "payment", label: "Thanh toán", number: 2 },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
    const progressPercent =
        steps.length <= 1 ? 0 : Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100));

    return (
        <div className="mb-8 rounded-2xl border border-brand-purple/10 bg-white/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-gray-900">Checkout</h2>
                <p className="text-sm font-medium text-gray-500">
                    Step {Math.max(1, currentStepIndex + 1)} / {steps.length}
                </p>
            </div>

            {/* Progress Bar with Step Indicators */}
            <div className="mb-6">
                <div className="relative px-3">
                    {/* Progress Bar Background */}
                    <div className="h-2 overflow-hidden rounded-full bg-gradient-to-r from-brand-purple/10 to-violet-500/10">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-purple to-violet-500 transition-[width] duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Step Circle Indicators */}
                    <div className="absolute inset-0 flex items-center justify-between px-0">
                        {steps.map((step, index) => {
                            const isActive = index === currentStepIndex;
                            const isCompleted = index < currentStepIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={
                                        "grid h-8 w-8 place-items-center rounded-full border-2 transition-all duration-300 " +
                                        (isCompleted
                                            ? "border-brand-purple bg-brand-purple text-white shadow-md"
                                            : isActive
                                            ? "border-brand-purple bg-white text-brand-purple shadow-[0_0_0_6px_rgba(124,58,237,0.10)]"
                                            : "border-gray-300 bg-white text-gray-400")
                                    }
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    {isCompleted ? (
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M20 6L9 17l-5-5"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="text-xs font-bold">{step.number}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step Labels */}
            <div className="grid grid-cols-2 gap-4 px-1">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className={
                                "text-center transition-all duration-300 " + (index === 0 ? "text-left" : "text-right")
                            }
                        >
                            <p
                                className={
                                    "text-sm font-semibold transition-colors " +
                                    (isActive || isCompleted ? "text-brand-purple" : "text-gray-400")
                                }
                            >
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Demo Component
export default function Demo() {
    const [currentStep, setCurrentStep] = React.useState<"order" | "payment">("order");

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="mx-auto max-w-2xl">
                <PaymentProgress currentStep={currentStep} />

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={() => setCurrentStep("order")}
                        className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:shadow-lg"
                    >
                        Step 1: Order
                    </button>
                    <button
                        onClick={() => setCurrentStep("payment")}
                        className="rounded-lg bg-brand-purple px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-violet-600 hover:shadow-lg"
                    >
                        Step 2: Payment
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .text-brand-purple {
                    color: rgb(124, 58, 237);
                }
                .bg-brand-purple {
                    background-color: rgb(124, 58, 237);
                }
                .border-brand-purple {
                    border-color: rgb(124, 58, 237);
                }
                .from-brand-purple {
                    --tw-gradient-from: rgb(124, 58, 237);
                }
            `}</style>
        </div>
    );
}
