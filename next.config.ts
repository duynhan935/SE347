import type { NextConfig } from "next";

const nextConfig: NextConfig = {
        images: {
                domains: ["placehold.co", "res.cloudinary.com"],
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
};

export default nextConfig;
