"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { decodeJWT } from "@/lib/jwt";
import { getLoginRedirectPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function LoginSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleOAuthLogin } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple calls using ref
        if (hasProcessed.current) return;

        const token = searchParams.get("token");

        if (!token) {
            setError("No token received. Please try logging in again.");
            setLoading(false);
            toast.error("No token received. Please try logging in again.");
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.replace("/login");
            }, 3000);
            return;
        }

        // Mark as processed immediately to prevent re-renders
        hasProcessed.current = true;

        // Clean up URL by removing token parameter immediately to prevent re-renders
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState({}, "", url.pathname);
        }

        // Handle OAuth login with token
        const processOAuthLogin = async () => {
            try {
                setLoading(true);

                const success = await handleOAuthLogin(token);

                if (success) {
                    toast.success("Login successful! Welcome back! 🎉", { duration: 2000 });
                    
                    // Get role from token or user profile for OAuth redirect
                    const accessToken = useAuthStore.getState().accessToken;
                    let userRole: string | null = null;
                    
                    if (accessToken) {
                        const decodedToken = decodeJWT(accessToken);
                        userRole = decodedToken?.role || null;
                    }
                    
                    // If role not in token, wait for user profile
                    if (!userRole) {
                        const checkUserAndRedirect = async () => {
                            let attempts = 0;
                            const maxAttempts = 10;
                            
                            while (attempts < maxAttempts) {
                                const currentUser = useAuthStore.getState().user;
                                if (currentUser?.role) {
                                    userRole = currentUser.role;
                                    break;
                                }
                                await new Promise((resolve) => setTimeout(resolve, 100));
                                attempts++;
                            }
                            
                            const redirectPath = getLoginRedirectPath(userRole || null, null);
                            router.replace(redirectPath);
                        };
                        
                        setTimeout(() => {
                            checkUserAndRedirect();
                        }, 500);
                    } else {
                        // Role found, redirect immediately
                        const redirectPath = getLoginRedirectPath(userRole, null);
                        setTimeout(() => {
                            router.replace(redirectPath);
                        }, 500);
                    }
                } else {
                    setError("Failed to complete login. Please try again.");
                    toast.error("Failed to complete login. Please try again.", { duration: 3000 });
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.replace("/login");
                    }, 3000);
                }
            } catch (err) {
                console.error("OAuth login error:", err);
                setError("An error occurred during login. Please try again.");
                toast.error("An error occurred during login. Please try again.", { duration: 3000 });
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.replace("/login");
                }, 3000);
            } finally {
                setLoading(false);
            }
        };

        processOAuthLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Completing Login...</h2>
                        <p className="text-gray-600">Please wait while we sign you in.</p>
                    </>
                ) : error ? (
                    <>
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Login Failed</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </>
                ) : (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Login Successful!</h2>
                        <p className="text-gray-600">Redirecting to home page...</p>
                    </>
                )}
            </div>
        </section>
    );
}

export default function LoginSuccessPage() {
    return (
        <Suspense fallback={<GlobalLoader label="Loading" sublabel="Signing you in" />}>
            <LoginSuccessContent />
        </Suspense>
    );
}
