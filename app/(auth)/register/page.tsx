// File: app/auth/register/page.tsx
"use client";

import { Logo } from "@/constants";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

const DEFAULT_BACKEND_ORIGIN = "http://localhost:8080";
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN).replace(/\/$/, "");

export default function SignUpPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, loading, error } = useAuthStore();

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const success = await register({ username, email, password, confirmPassword, role: "USER" });
        if (success) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
            toast.error(error || "Registration failed. Please try again.");
        }
    };

    const handleRegisterMerchant = () => {
        router.push("/merchant/register");
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

                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Sign Up</h2>

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

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                            placeholder="johndoe"
                        />
                    </div>

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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-[#EE4D2D] text-white font-semibold rounded-md hover:bg-[#EE4D2D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4D2D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegisterMerchant}
                            disabled={loading}
                            className="flex-1 py-3 px-4 border-2 border-[#EE4D2D] text-[#EE4D2D] font-semibold rounded-md hover:bg-[#EE4D2D]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4D2D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Register Merchant
                        </button>
                    </div>
                </form>


                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Have an account?{" "}
                    <Link href="/login" className="font-semibold text-[#EE4D2D] hover:text-[#EE4D2D]/80 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </section>
    );
}
