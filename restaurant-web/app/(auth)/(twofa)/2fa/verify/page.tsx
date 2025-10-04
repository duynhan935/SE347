// File: app/(twofa)/2fa/verify/page.tsx
"use client";

import { useState } from "react";

export default function Verify2FAPage() {
        const [verificationCode, setVerificationCode] = useState("");

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Gửi code này lên server để xác thực
                // Nếu đúng, server sẽ cấp session đăng nhập và chuyển hướng đến trang dashboard
                console.log("Verifying login code:", verificationCode);
                alert(`Submitting code: ${verificationCode}. If correct, you will be logged in.`);
        };

        return (
                <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                        <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">Two-Factor Verification</h2>
                                <p className="text-gray-600 mb-6">
                                        Open your authenticator app and enter the code to complete login.
                                </p>

                                <form onSubmit={handleSubmit}>
                                        <label htmlFor="verification-code" className="sr-only">
                                                Verification Code
                                        </label>
                                        <input
                                                type="text"
                                                id="verification-code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center text-3xl tracking-[0.5em] focus:ring-2 focus:ring-brand-purple"
                                                placeholder="_ _ _ _ _ _"
                                                required
                                        />
                                        <button
                                                type="submit"
                                                className="w-full mt-6 py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90"
                                        >
                                                Verify
                                        </button>
                                </form>
                        </div>
                </section>
        );
}
