"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [showResendButton, setShowResendButton] = useState(false);
        const [resendingEmail, setResendingEmail] = useState(false);
        const { login, loading, error, resendVerificationEmail } = useAuthStore();
        const router = useRouter();

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                const success = await login({ username: email, password });
                if (success) {
                        toast.success("Login successful!");
                        router.push("/");
                } else {
                        toast.error(error || "Login failed. Please check your credentials.");
                        // Check if the error is about account not being activated
                        if (
                                error?.toLowerCase().includes("not activated") ||
                                error?.toLowerCase().includes("activate")
                        ) {
                                setShowResendButton(true);
                        } else {
                                setShowResendButton(false);
                        }
                }
        };

        const handleResendVerification = async () => {
                if (!email) {
                        toast.error("Please enter your email first");
                        return;
                }
                setResendingEmail(true);
                const success = await resendVerificationEmail(email);
                if (success) {
                        toast.success("Verification email sent! Please check your inbox.");
                        setShowResendButton(false);
                } else {
                        toast.error(error || "Failed to send verification email");
                }
                setResendingEmail(false);
        };

        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4 xl:-mt-10">
                        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                                <h2 className="text-3xl font-bold text-center font-roboto-serif text-brand-black mb-6">
                                        Sign In
                                </h2>

                                {/* --- Social Login --- */}
                                <div className="space-y-3">
                                        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                                <FcGoogle size={22} />
                                                <span className="text-sm font-medium text-gray-700">
                                                        Continue with Google
                                                </span>
                                        </button>
                                </div>

                                {/* --- Separator --- */}
                                <div className="flex items-center my-6">
                                        <div className="flex-grow border-t border-gray-300"></div>
                                        <span className="mx-4 text-xs font-medium text-gray-500">OR</span>
                                        <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                {/* --- Email/Password Form --- */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                                <label
                                                        htmlFor="email"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Email
                                                </label>
                                                <input
                                                        type="email"
                                                        id="email"
                                                        value={email}
                                                        onChange={(e) => {
                                                                setEmail(e.target.value);
                                                                setShowResendButton(false);
                                                        }}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="you@example.com"
                                                />
                                        </div>

                                        <div>
                                                <div className="flex justify-between items-center mb-1">
                                                        <label
                                                                htmlFor="password"
                                                                className="block text-sm font-medium text-gray-700"
                                                        >
                                                                Password
                                                        </label>
                                                        <a
                                                                href="#"
                                                                className="text-sm text-brand-purple hover:underline"
                                                        >
                                                                Forgot password?
                                                        </a>
                                                </div>

                                                <div className="relative">
                                                        <input
                                                                type={showPassword ? "text" : "password"}
                                                                id="password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="••••••••"
                                                        />

                                                        <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                                {showPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>

                                        <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                {loading ? "Signing In..." : "Sign In"}
                                        </button>
                                </form>

                                {/* --- Resend Verification Email Button --- */}
                                {showResendButton && (
                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm text-yellow-800 mb-3">
                                                        Your account is not activated yet. Please check your email or
                                                        click below to resend the verification email.
                                                </p>
                                                <button
                                                        type="button"
                                                        onClick={handleResendVerification}
                                                        disabled={resendingEmail || !email}
                                                        className="w-full py-2 px-4 bg-yellow-600 text-white text-sm font-semibold rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                        {resendingEmail ? "Sending..." : "Resend Verification Email"}
                                                </button>
                                        </div>
                                )}

                                {/* --- Sign Up Link --- */}
                                <p className="mt-6 text-center text-sm text-gray-600">
                                        Don&apos;t have an account?{" "}
                                        <Link
                                                href="/auth/register"
                                                className="font-semibold text-brand-purple hover:underline"
                                        >
                                                Sign Up
                                        </Link>
                                </p>
                        </div>
                </section>
        );
}
