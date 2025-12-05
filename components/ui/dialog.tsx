"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface DialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        title?: string;
        description?: string;
        children: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
        if (!open) return null;

        return (
                <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => onOpenChange(false)}
                >
                        <div
                                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                        >
                                {(title || description) && (
                                        <div className="mb-4">
                                                {title && (
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                                {title}
                                                        </h3>
                                                )}
                                                {description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {description}
                                                        </p>
                                                )}
                                        </div>
                                )}
                                <button
                                        onClick={() => onOpenChange(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                        <X className="w-5 h-5" />
                                </button>
                                {children}
                        </div>
                </div>
        );
}

export function DialogContent({ children }: { children: ReactNode }) {
        return <div>{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
        return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
        return <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h3>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
        return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
        return <div className="flex gap-3 justify-end mt-4">{children}</div>;
}
