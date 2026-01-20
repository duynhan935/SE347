"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ConfirmOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger";
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return ctx;
}

type ConfirmState = {
    open: boolean;
    options: Required<Pick<ConfirmOptions, "title" | "description" | "confirmText" | "cancelText" | "variant">>;
};

const defaultOptions: ConfirmState["options"] = {
    title: "Confirm action",
    description: "Are you sure you want to continue?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
};

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ConfirmState>({ open: false, options: defaultOptions });
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFn>((options) => {
        const merged = {
            ...defaultOptions,
            ...options,
        };

        setState({ open: true, options: merged });

        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const close = useCallback((value: boolean) => {
        setState((prev) => ({ ...prev, open: false }));
        const resolver = resolverRef.current;
        resolverRef.current = null;
        resolver?.(value);
    }, []);

    const ctxValue = useMemo(() => confirm, [confirm]);

    const isDanger = state.options.variant === "danger";

    return (
        <ConfirmContext.Provider value={ctxValue}>
            {children}
            <Dialog.Root open={state.open} onOpenChange={(open) => !open && close(false)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
                    <Dialog.Content
                        className="fixed left-1/2 top-1/2 z-[61] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl outline-none dark:border-gray-700 dark:bg-gray-900"
                        aria-describedby={undefined}
                    >
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {state.options.title}
                        </Dialog.Title>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{state.options.description}</div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => close(false)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                {state.options.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => close(true)}
                                className={
                                    isDanger
                                        ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                        : "rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-brand-yellow/90"
                                }
                            >
                                {state.options.confirmText}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </ConfirmContext.Provider>
    );
}
