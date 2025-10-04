// File: app/auth/login/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                console.log("Login submitted", { email, password });
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
                                                        onChange={(e) => setEmail(e.target.value)}
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
                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300"
                                        >
                                                Sign In
                                        </button>
                                </form>

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
