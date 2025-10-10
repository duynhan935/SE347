// File: app/(twofa)/2fa/setup/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

// Giả sử bạn nhận được 2 props này từ Server Component cha
// Trong thực tế, bạn sẽ fetch chúng từ một API route
const MOCK_PROPS = {
        qrCodeDataURL: "https://placehold.co/200x200?text=Scan+Me", // Đây là ảnh QR code
        secretKey: "JBSWY3DPEHPK3PXP", // Đây là chuỗi bí mật
};

export default function Setup2FAPage() {
        const [verificationCode, setVerificationCode] = useState("");

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Gửi verificationCode và secretKey lên server để xác thực
                // Nếu server xác nhận code đúng, kích hoạt 2FA cho user trong database
                console.log("Verifying code:", verificationCode);
                alert(`Submitting code: ${verificationCode}. If correct, 2FA will be enabled.`);
        };

        return (
                <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
                                <p className="text-gray-600 mb-6">
                                        Scan the image below with your authenticator app (e.g., Google Authenticator).
                                </p>

                                {/* Hiển thị QR Code */}
                                <div className="flex justify-center mb-4">
                                        <Image
                                                src={MOCK_PROPS.qrCodeDataURL}
                                                alt="2FA QR Code"
                                                width={200}
                                                height={200}
                                        />
                                </div>

                                <p className="text-gray-600 mb-4">Or enter this code manually:</p>
                                <div className="bg-gray-100 p-3 rounded-md mb-6 font-mono text-lg tracking-widest">
                                        {MOCK_PROPS.secretKey}
                                </div>

                                <form onSubmit={handleSubmit}>
                                        <label
                                                htmlFor="verification-code"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                                Enter the 6-digit code from your app
                                        </label>
                                        <input
                                                type="text"
                                                id="verification-code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-brand-purple"
                                                required
                                        />
                                        <button
                                                type="submit"
                                                className="w-full mt-6 py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90"
                                        >
                                                Verify & Enable
                                        </button>
                                </form>
                        </div>
                </section>
        );
}
