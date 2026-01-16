"use client";

export default function LoadingScreen() {
        return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-brand-yellowlight animate-fadeIn">
                        {/* Logo/Brand Animation */}
                        <div className="mb-8">
                                <div className="relative w-20 h-20">
                                        {/* Animated circles */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-24 h-24 border-4 border-brand-purple/20 rounded-full animate-ping"></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 border-4 border-brand-purple/40 rounded-full animate-pulse"></div>
                                        </div>
                                        {/* Main spinner */}
                                        <div className="relative w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                                </div>
                        </div>

                        {/* Loading text with animation */}
                        <div className="text-center space-y-2 animate-fadeInUp">
                                <h3 className="text-xl font-semibold text-brand-black font-roboto-serif">
                                        Loading...
                                </h3>
                                <p className="text-sm text-gray-600 font-manrope">Please wait a moment</p>
                        </div>

                        {/* Progress bar with smooth animation */}
                        <div className="mt-8 w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-brand-purple to-brand-purple/80 rounded-full animate-progress-bar"></div>
                        </div>

                        {/* Dots animation */}
                        <div className="mt-6 flex space-x-2">
                                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce [animation-delay:0s]"></div>
                                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                </div>
        );
}
