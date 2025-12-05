import type { NextConfig } from "next";

const nextConfig: NextConfig = {
        images: {
                domains: ["placehold.co", "res.cloudinary.com"],
                formats: ["image/avif", "image/webp"],
                deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        },
        // Enable experimental features for better performance
        experimental: {
                // Optimize package imports
                optimizePackageImports: ["lucide-react"],
        },
        // Enable compression
        compress: true,
        // Optimize production builds
        swcMinify: true,
        // Reduce bundle size
        compiler: {
                removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
        },
};

export default nextConfig;
