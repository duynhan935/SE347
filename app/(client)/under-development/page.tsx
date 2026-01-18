"use client";

import { Construction, Rocket } from "lucide-react";
import Link from "next/link";

export default function UnderDevelopmentPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl opacity-50"></div>
                            <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-full">
                                <Construction className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Under Development
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        We're working hard to bring you this feature. Please check back soon!
                    </p>

                    {/* Info Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <Rocket className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-900 mb-2">What's Coming?</h3>
                                <p className="text-sm text-gray-700">
                                    This page is currently under development. Our team is working on creating an amazing experience for you.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-[#EE4D2D] text-white rounded-lg font-medium hover:bg-[#EE4D2D]/90 transition-colors shadow-md hover:shadow-lg"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-6 text-sm text-gray-500">
                    If you have any questions, feel free to{" "}
                    <Link href="/contact" className="text-[#EE4D2D] hover:underline font-medium">
                        contact us
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}

