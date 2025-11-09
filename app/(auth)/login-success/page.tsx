"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

function LoginSuccessContent() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const { handleOAuthLogin } = useAuthStore();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
                const token = searchParams.get("token");

                if (!token) {
                        setError("No token received. Please try logging in again.");
                        setLoading(false);
                        toast.error("No token received. Please try logging in again.");
                        // Redirect to login after 3 seconds
                        setTimeout(() => {
                                router.push("/login");
                        }, 3000);
                        return;
                }

                // Handle OAuth login with token
                const processOAuthLogin = async () => {
                        try {
                                setLoading(true);
                                const success = await handleOAuthLogin(token);

                                if (success) {
                                        toast.success("Login successful! Redirecting...");
                                        // Redirect to home page
                                        router.push("/");
                                } else {
                                        setError("Failed to complete login. Please try again.");
                                        toast.error("Failed to complete login. Please try again.");
                                        // Redirect to login after 3 seconds
                                        setTimeout(() => {
                                                router.push("/login");
                                        }, 3000);
                                }
                        } catch (err) {
                                console.error("OAuth login error:", err);
                                setError("An error occurred during login. Please try again.");
                                toast.error("An error occurred during login. Please try again.");
                                // Redirect to login after 3 seconds
                                setTimeout(() => {
                                        router.push("/login");
                                }, 3000);
                        } finally {
                                setLoading(false);
                        }
                };

                processOAuthLogin();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [searchParams]);

        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                                {loading ? (
                                        <>
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                                                <h2 className="text-2xl font-bold text-brand-black mb-2">
                                                        Completing Login...
                                                </h2>
                                                <p className="text-gray-600">Please wait while we sign you in.</p>
                                        </>
                                ) : error ? (
                                        <>
                                                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                                                <h2 className="text-2xl font-bold text-brand-black mb-2">
                                                        Login Failed
                                                </h2>
                                                <p className="text-gray-600 mb-4">{error}</p>
                                                <p className="text-sm text-gray-500">Redirecting to login page...</p>
                                        </>
                                ) : (
                                        <>
                                                <div className="text-green-500 text-5xl mb-4">✓</div>
                                                <h2 className="text-2xl font-bold text-brand-black mb-2">
                                                        Login Successful!
                                                </h2>
                                                <p className="text-gray-600">Redirecting to home page...</p>
                                        </>
                                )}
                        </div>
                </section>
        );
}

export default function LoginSuccessPage() {
        return (
                <Suspense
                        fallback={
                                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                                        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                                                <h2 className="text-2xl font-bold text-brand-black mb-2">Loading...</h2>
                                                <p className="text-gray-600">Please wait...</p>
                                        </div>
                                </section>
                        }
                >
                        <LoginSuccessContent />
                </Suspense>
        );
}
