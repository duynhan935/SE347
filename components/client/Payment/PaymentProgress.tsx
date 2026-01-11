"use client";

interface PaymentProgressProps {
    currentStep: "order" | "payment";
}

export const PaymentProgress = ({ currentStep }: PaymentProgressProps) => {
    const steps = [
        { id: "order", label: "Thông tin đơn hàng", number: 1 },
        { id: "payment", label: "Thanh toán", number: 2 },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                        isCompleted
                                            ? "bg-brand-purple border-brand-purple text-white"
                                            : isActive
                                            ? "bg-brand-purple border-brand-purple text-white ring-4 ring-brand-purple/20"
                                            : "bg-white border-gray-300 text-gray-400"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="font-bold text-sm">{step.number}</span>
                                    )}
                                </div>
                                {/* Step Label */}
                                <span
                                    className={`mt-2 text-xs md:text-sm font-medium text-center ${
                                        isActive || isCompleted ? "text-brand-purple" : "text-gray-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                                        isCompleted ? "bg-brand-purple" : "bg-gray-300"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

