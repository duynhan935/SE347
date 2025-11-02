// File: app/auth/register/page.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

export default function SignUpPage() {
        const [username, setUsername] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [role, setRole] = useState("USER");
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [registrationSuccess, setRegistrationSuccess] = useState(false);
        const [resendingEmail, setResendingEmail] = useState(false);
        const { register, loading, error, resendVerificationEmail } = useAuthStore();

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (password !== confirmPassword) {
                        toast.error("Passwords do not match");
                        return;
                }

                const success = await register({ username, email, password, confirmPassword, role });
                if (success) {
                        setRegistrationSuccess(true);
                } else {
                        toast.error(error || "Registration failed. Please try again.");
                }
        };

        const handleResendVerification = async () => {
                setResendingEmail(true);
                const success = await resendVerificationEmail(email);
                if (success) {
                        toast.success("Verification email sent! Please check your inbox.");
                } else {
                        toast.error(error || "Failed to send verification email");
                }
                setResendingEmail(false);
        };

        // Show success screen if registration was successful
        if (registrationSuccess) {
                return (
                        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                                        <h2 className="text-3xl font-bold text-center font-roboto-serif text-brand-black mb-6">
                                                Check Your Email
                                        </h2>

                                        <div className="space-y-4">
                                                <div className="text-center">
                                                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                                <svg
                                                                        className="w-8 h-8 text-green-600"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                >
                                                                        <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                                        />
                                                                </svg>
                                                        </div>
                                                        <p className="text-gray-700 mb-4">
                                                                We&apos;ve sent a verification link to:
                                                        </p>
                                                        <p className="font-semibold text-brand-purple">{email}</p>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                                                        <p className="text-sm text-blue-800">
                                                                Please check your inbox and click on the verification
                                                                link to activate your account.
                                                        </p>
                                                </div>

                                                <div className="space-y-3">
                                                        <button
                                                                onClick={handleResendVerification}
                                                                disabled={resendingEmail}
                                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                                {resendingEmail
                                                                        ? "Sending..."
                                                                        : "Resend Verification Email"}
                                                        </button>

                                                        <Link
                                                                href="/auth/login"
                                                                className="block w-full text-center py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-all duration-300"
                                                        >
                                                                Back to Login
                                                        </Link>
                                                </div>

                                                <p className="text-center text-sm text-gray-500 mt-4">
                                                        Didn&apos;t receive the email? Check your spam folder or click{" "}
                                                        <button
                                                                onClick={handleResendVerification}
                                                                disabled={resendingEmail}
                                                                className="text-brand-purple hover:underline font-semibold"
                                                        >
                                                                here
                                                        </button>{" "}
                                                        to resend.
                                                </p>
                                        </div>
                                </div>
                        </section>
                );
        }

        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                                <h2 className="text-3xl font-bold text-center font-roboto-serif text-brand-black mb-6">
                                        Sign Up
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

                                {/* --- Sign Up Form --- */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                                <label
                                                        htmlFor="username"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Username
                                                </label>
                                                <input
                                                        type="text"
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="johndoe"
                                                />
                                        </div>

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
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="you@example.com"
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="password"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Password
                                                </label>
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

                                        <div>
                                                <label
                                                        htmlFor="confirmPassword"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Confirm Password
                                                </label>
                                                <div className="relative">
                                                        <input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                id="confirmPassword"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="••••••••"
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={() =>
                                                                        setShowConfirmPassword(!showConfirmPassword)
                                                                }
                                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                                {showConfirmPassword ? (
                                                                        <EyeOff size={20} />
                                                                ) : (
                                                                        <Eye size={20} />
                                                                )}
                                                        </button>
                                                </div>
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="role"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Account Type
                                                </label>
                                                <select
                                                        id="role"
                                                        value={role}
                                                        onChange={(e) => setRole(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                >
                                                        <option value="USER">Customer</option>
                                                        <option value="MERCHANT">Merchant</option>
                                                </select>
                                        </div>

                                        <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                {loading ? "Signing Up..." : "Sign Up"}
                                        </button>
                                </form>

                                {/* --- Sign In Link --- */}
                                <p className="mt-6 text-center text-sm text-gray-600">
                                        Have an account?{" "}
                                        <Link
                                                href="/auth/login"
                                                className="font-semibold text-brand-purple hover:underline"
                                        >
                                                Sign In
                                        </Link>
                                </p>
                        </div>
                </section>
        );
}
