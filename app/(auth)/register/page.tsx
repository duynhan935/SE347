// File: app/auth/register/page.tsx
"use client";

import { MerchantRequestForm } from "@/components/auth/MerchantRequestForm";
import { Eye, EyeOff, X } from "lucide-react";
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
    const [showMerchantForm, setShowMerchantForm] = useState(false);
    const { register, loading, error } = useAuthStore();

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Register as USER only
        const success = await register({ username, email, password, confirmPassword, role: "USER" });
        if (success) {
            // Redirect to verify-email page with email in query params
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
            toast.error(error || "Registration failed. Please try again.");
        }
    };

    const handleRegisterMerchant = () => {
        // Open merchant form - user can fill all info there
        setShowMerchantForm(true);
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-center font-roboto-serif text-brand-black mb-6">Sign Up</h2>

                {/* --- Social Login --- */}
                <div className="space-y-3">
                    <a
                        href={`${BACKEND_ORIGIN}/oauth2/authorization/google`}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <FcGoogle size={22} />
                        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                    </a>
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
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
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
                            className="flex-1 py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegisterMerchant}
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-brand-black text-white font-semibold rounded-md hover:bg-brand-purpledark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Register Merchant
                        </button>
                    </div>
                </form>

                {/* Merchant Request Form Dialog */}
                {showMerchantForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div
                            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Đăng ký Merchant</h3>
                                <button
                                    onClick={() => {
                                        setShowMerchantForm(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close merchant registration form"
                                    title="Close"
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <MerchantRequestForm
                                initialEmail={email}
                                initialUsername={username}
                                onSuccess={() => {
                                    setShowMerchantForm(false);
                                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                                }}
                                onCancel={() => {
                                    setShowMerchantForm(false);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* --- Sign In Link --- */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Have an account?{" "}
                    <Link href="/login" className="font-semibold text-brand-purple hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </section>
    );
}
