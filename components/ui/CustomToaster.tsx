"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { ToastBar, Toaster, toast } from "react-hot-toast";

export default function CustomToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                className:
                    "rounded-xl border bg-white text-gray-900 shadow-xl dark:bg-gray-900 dark:text-gray-100",
                style: {
                    padding: "12px 14px",
                },
                success: { className: "toast-success border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-950/40" },
                error: { className: "toast-error border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-950/40" },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <div className="flex items-center gap-2 w-full">
                            {t.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : t.type === "error" ? (
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : t.type === "loading" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-300" />
                            ) : (
                                icon
                            )}
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
