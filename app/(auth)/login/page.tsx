"use client";

import { Logo } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { decodeJWT } from "@/lib/jwt";
import { getLoginRedirectPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_BACKEND_ORIGIN = "http://localhost:8080";
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN).replace(/\/$/, "");

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const loadingToast = toast.loading("Signing in...");

        try {
            const success = await login({ username: email, password });

            toast.dismiss(loadingToast);

            if (success) {
                toast.success("Login successful! Welcome back! 🎉", { duration: 3000 });
                
                // Get role from token immediately (faster than waiting for fetchProfile)
                const accessToken = useAuthStore.getState().accessToken;
                let userRole: string | null = null;
                
                if (accessToken) {
                    const decodedToken = decodeJWT(accessToken);
                    userRole = decodedToken?.role || null;
                }
                
                // If role not in token, wait for user profile to be fetched
                if (!userRole) {
                    const checkUserAndRedirect = async () => {
                        let attempts = 0;
                        const maxAttempts = 10; // 10 attempts = 1 second max wait
                        
                        while (attempts < maxAttempts) {
                            const currentUser = useAuthStore.getState().user;
                            if (currentUser?.role) {
                                userRole = currentUser.role;
                                break;
                            }
                            // Wait 100ms before checking again
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            attempts++;
                        }
                        
                        const callbackUrl = searchParams.get("redirect");
                        const redirectPath = getLoginRedirectPath(userRole || null, callbackUrl);
                        router.replace(redirectPath);
                    };
                    
                    setTimeout(() => {
                        checkUserAndRedirect();
                    }, 300);
                } else {
                    // Role found in token, redirect immediately
                    const callbackUrl = searchParams.get("redirect");
                    const redirectPath = getLoginRedirectPath(userRole, callbackUrl);
                    setTimeout(() => {
                        router.replace(redirectPath);
                    }, 300);
                }
            } else {
                const errorCode =
                    error?.includes("INACTIVATED_ACCOUNT") ||
                    error?.toLowerCase().includes("not activated") ||
                    error?.toLowerCase().includes("activate");

                if (errorCode) {
                    const pendingRestaurant = localStorage.getItem(`pending_restaurant_${email}`);
                    if (pendingRestaurant) {
                        toast.error(
                            "Your merchant account has not been approved by admin yet. Please wait for admin approval to login.",
                            {
                                duration: 5000,
                            }
                        );
                    } else {
                        toast.error("Your account has not been activated. Please verify your email to continue.", {
                            duration: 4000,
                        });
                        setTimeout(() => {
                            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                        }, 1000);
                    }
                    return;
                }

                toast.error(error || "Login failed. Please check your credentials.", {
                    duration: 4000,
                });
            }
        } catch (err) {
            toast.dismiss(loadingToast);

            const axiosError = err as {
                response?: {
                    status?: number;
                    data?: { errorCode?: string; message?: string };
                };
                message?: string;
            };
            const errorCode = axiosError?.response?.data?.errorCode;
            const errorMessage = axiosError?.response?.data?.message || axiosError?.message || "Login failed";
            const statusCode = axiosError?.response?.status;

            if (
                errorCode === "INACTIVATED_ACCOUNT" ||
                statusCode === 403 ||
                errorMessage.toLowerCase().includes("not activated") ||
                errorMessage.toLowerCase().includes("activate")
            ) {
                const pendingRestaurant = localStorage.getItem(`pending_restaurant_${email}`);
                if (pendingRestaurant) {
                    toast.error(
                        "Your merchant account has not been approved by admin yet. Please wait for admin approval to login.",
                        {
                            duration: 5000,
                        }
                    );
                } else {
                    toast.error("Your account has not been activated. Please verify your email to continue.", {
                        duration: 4000,
                    });
                    setTimeout(() => {
                        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                    }, 1000);
                }
                return;
            }

            if (statusCode === 401) {
                const displayMessage =
                    errorMessage.toLowerCase().includes("bad credentials") ||
                    errorMessage.toLowerCase().includes("invalid") ||
                    errorMessage.toLowerCase().includes("wrong password")
                        ? "Email or password is incorrect. Please try again."
                        : errorMessage.toLowerCase().includes("account") ||
                          errorMessage.toLowerCase().includes("enabled")
                        ? "Your account has not been activated. Please check your email to verify or wait for admin approval."
                        : "Email or password is incorrect. Please try again.";

                toast.error(displayMessage, { duration: 4000 });
                return;
            }

            const displayMessage =
                errorMessage.includes("Network") || errorMessage.includes("timeout")
                    ? "Connection error. Please check your internet connection and try again."
                    : errorMessage;

            toast.error(displayMessage, { duration: 4000 });
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={140} height={46} className="h-10 w-auto" priority />
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Sign In</h2>

                {/* Social Login */}
                <div className="space-y-3">
                    <a
                        href={`${BACKEND_ORIGIN}/oauth2/authorization/google`}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <FcGoogle size={22} />
                        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                    </a>
                </div>

                {/* Separator */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-xs font-medium text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            {/* Forgot password link - hidden until feature is implemented */}
                            {/* <a href="#" className="text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 hover:underline">
                                Forgot password?
                            </a> */}
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                placeholder="••••••••"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#EE4D2D] text-white font-semibold rounded-md hover:bg-[#EE4D2D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4D2D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-[#EE4D2D] hover:text-[#EE4D2D]/80 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </section>
    );
}
