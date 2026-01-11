"use client";

import { authApi } from "@/lib/api/authApi";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

function ConfirmPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            setStatus("error");
            setMessage("Invalid confirmation link. No verification code provided.");
            return;
        }

        const confirmAccount = async () => {
            try {
                await authApi.confirmAccount(code);
                setStatus("success");
                setMessage("Your account has been successfully activated! You can now log in.");
                toast.success("Account activated successfully!");
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } catch (error: unknown) {
                setStatus("error");
                const maybeAxiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                const errorMessage =
                    maybeAxiosError.response?.data?.message ||
                    maybeAxiosError.message ||
                    "Failed to activate account. The link may be invalid or expired.";
                setMessage(errorMessage);
                toast.error(errorMessage);
            }
        };

        confirmAccount();
    }, [searchParams, router]);

    return (
        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                {status === "loading" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-spin">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Verifying Your Account</h2>
                        <p className="text-gray-600">Please wait while we activate your account...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
                        <p className="text-gray-700 mb-6">{message}</p>
                        <Link
                            href="/login"
                            className="inline-block w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-gray-700 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                href="/register"
                                className="inline-block w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 transition-colors"
                            >
                                Register Again
                            </Link>
                            <Link
                                href="/login"
                                className="inline-block w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense
            fallback={
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center text-gray-700">
                        Loading...
                    </div>
                </section>
            }
        >
            <ConfirmPageInner />
        </Suspense>
    );
}
