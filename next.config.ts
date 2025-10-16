import type { NextConfig } from "next";

const nextConfig: NextConfig = {
        images: {
                domains: ["placehold.co"],
                remotePatterns: [
                        {
                                protocol: "https",
                                hostname: "res.cloudinary.com",
                                port: "",
                                pathname: "/**",
                        },
                ],
        },
};

export default nextConfig;
