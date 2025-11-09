"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
        const searchParams = useSearchParams();
        const [email, setEmail] = useState("");
        const [resendingEmail, setResendingEmail] = useState(false);
        const { resendVerificationEmail, loading } = useAuthStore();

        useEffect(() => {
                // Get email from query params if available
                const emailParam = searchParams.get("email");
                if (emailParam) {
                        setEmail(emailParam);
                }
        }, [searchParams]);

        const handleResendVerification = async () => {
                if (!email.trim()) {
                        toast.error("Please enter your email address");
                        return;
                }

                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                        toast.error("Please enter a valid email address");
                        return;
                }

                setResendingEmail(true);
                try {
                        const success = await resendVerificationEmail(email.trim());
                        if (success) {
                                toast.success("Verification email sent! Please check your inbox.");
                        } else {
                                // Get error from store to show detailed message
                                const { error } = useAuthStore.getState();
                                const errorMessage = error || "Failed to send verification email. Please try again.";
                                toast.error(errorMessage);
                        }
                } catch (err) {
                        console.error("Error resending verification email:", err);
                        // Get error from store if available
                        const { error } = useAuthStore.getState();
                        const errorMessage =
                                error ||
                                (err instanceof Error
                                        ? err.message
                                        : "Failed to send verification email. Please try again.");
                        toast.error(errorMessage);
                } finally {
                        setResendingEmail(false);
                }
        };

        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
                        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                                <div className="text-center mb-6">
                                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                <Mail className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-center font-roboto-serif text-brand-black mb-2">
                                                Verify Your Email
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                                We need to verify your email address before you can access your account.
                                        </p>
                                </div>

                                <div className="space-y-6">
                                        {/* Email Input */}
                                        <div>
                                                <label
                                                        htmlFor="email"
                                                        className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                        Email Address
                                                </label>
                                                <input
                                                        type="email"
                                                        id="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="you@example.com"
                                                        disabled={resendingEmail || loading}
                                                />
                                                <p className="mt-2 text-xs text-gray-500">
                                                        Enter the email address you used to register
                                                </p>
                                        </div>

                                        {/* Instructions */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                                        What to do next:
                                                </h3>
                                                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                                        <li>Check your email inbox (and spam folder)</li>
                                                        <li>Click on the verification link in the email</li>
                                                        <li>Return here and log in to your account</li>
                                                </ol>
                                        </div>

                                        {/* Resend Button */}
                                        <button
                                                onClick={handleResendVerification}
                                                disabled={resendingEmail || loading || !email.trim()}
                                                className="w-full py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                        >
                                                {resendingEmail || loading ? (
                                                        <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Sending...
                                                        </>
                                                ) : (
                                                        <>
                                                                <Mail className="w-5 h-5" />
                                                                Resend Verification Email
                                                        </>
                                                )}
                                        </button>

                                        {/* Back to Login */}
                                        <Link
                                                href="/login"
                                                className="block w-full text-center py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-all duration-300"
                                        >
                                                Back to Login
                                        </Link>

                                        {/* Help Text */}
                                        <p className="text-center text-sm text-gray-500">
                                                Already verified?{" "}
                                                <Link
                                                        href="/login"
                                                        className="text-brand-purple hover:underline font-semibold"
                                                >
                                                        Log in here
                                                </Link>
                                        </p>
                                </div>
                        </div>
                </section>
        );
}
