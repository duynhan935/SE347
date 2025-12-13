"use client";

import { ToastBar, Toaster, toast } from "react-hot-toast";

export default function CustomToaster() {
        return (
                <Toaster
                        position="top-right"
                        toastOptions={{
                                duration: 3000,
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
                                                                className="ml-auto bg-transparent border-none cursor-pointer p-1 text-base text-gray-600 font-bold flex items-center justify-center min-w-[24px] h-6 hover:text-gray-900 transition-colors"
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

