// File: app/(twofa)/2fa/setup/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Setup2FAPage() {
    const [verificationCode, setVerificationCode] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Send verificationCode and secretKey to server for verification
        // If server confirms code is correct, activate 2FA for user in database
        console.log("Verifying code:", verificationCode);
        alert(`Submitting code: ${verificationCode}. If correct, 2FA will be enabled.`);
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
                <p className="text-gray-600 mb-6">
                    Two-factor authentication is not available yet in this project (backend endpoints are missing).
                </p>

                <div className="bg-gray-100 p-4 rounded-md mb-6 text-left">
                    <p className="text-sm text-gray-700 font-medium">What will be supported later</p>
                    <ul className="text-sm text-gray-600 list-disc pl-5 mt-2 space-y-1">
                        <li>Generate a TOTP secret + QR code</li>
                        <li>Verify the 6-digit code</li>
                        <li>Enable/disable 2FA on your account</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter the 6-digit code from your app
                    </label>
                    <input
                        type="text"
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled
                        className="w-full mt-6 py-3 px-4 bg-gray-300 text-white font-semibold rounded-md cursor-not-allowed"
                    >
                        Verify & Enable
                    </button>

                    <Link href="/" className="inline-block mt-4 text-sm text-brand-purple hover:text-brand-purple/90">
                        Back to home
                    </Link>
                </form>
            </div>
        </section>
    );
}
