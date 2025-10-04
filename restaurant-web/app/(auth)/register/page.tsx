// File: app/auth/register/page.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignUpPage() {
        const [firstName, setFirstName] = useState("");
        const [lastName, setLastName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Đây là nơi bạn sẽ xử lý logic đăng ký tài khoản mới
                console.log("Sign up submitted", { firstName, lastName, email, password });
                // Ví dụ: gọi API đăng ký, xử lý lỗi, chuyển hướng người dùng...
        };

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
                                        <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full">
                                                        <label
                                                                htmlFor="firstName"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                First name
                                                        </label>
                                                        <input
                                                                type="text"
                                                                id="firstName"
                                                                value={firstName}
                                                                onChange={(e) => setFirstName(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="John"
                                                        />
                                                </div>
                                                <div className="w-full">
                                                        <label
                                                                htmlFor="lastName"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Last name
                                                        </label>
                                                        <input
                                                                type="text"
                                                                id="lastName"
                                                                value={lastName}
                                                                onChange={(e) => setLastName(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="Doe"
                                                        />
                                                </div>
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

                                        <button
                                                type="submit"
                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300"
                                        >
                                                Sign Up
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
