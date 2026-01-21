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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="relative mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {(title || description) && (
                    <div className="mb-4">
                        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>}
                        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
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
