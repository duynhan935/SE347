"use client";

import { ToastBar, Toaster, toast } from "react-hot-toast";

export default function CustomToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                className:
                    "rounded-xl border border-orange-200/70 bg-white text-gray-900 shadow-xl dark:border-orange-500/30 dark:bg-gray-900 dark:text-gray-100",
                style: {
                    padding: "12px 14px",
                },
                success: {
                    iconTheme: {
                        primary: "#EE4D2D",
                        secondary: "#ffffff",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#ffffff",
                    },
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <div className="flex items-center gap-2 w-full">
                            {icon}
                            {message}
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="ml-auto bg-transparent border-none cursor-pointer p-1 text-base text-gray-600 font-bold flex items-center justify-center min-w-[24px] h-6 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                                aria-label="Close toast"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}
