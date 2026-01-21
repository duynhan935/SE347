import { clsx, type ClassValue } from "clsx";
import { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs));
}

interface JWTDecodedPayload {
        sub?: string;
        username?: string;
        role?: string;
        exp?: number;
        iat?: number;
        [key: string]: unknown;
}

/**
 * Decodes a JWT token and returns the payload
 */
export function decodeJWT(token: string): JWTDecodedPayload | null {
        try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                        atob(base64)
                                .split("")
                                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                                .join("")
                );
                return JSON.parse(jsonPayload) as JWTDecodedPayload;
        } catch (error) {
                console.error("Failed to decode JWT:", error);
                return null;
        }
}

/**
 * Extracts username from JWT token
 */
export function getUsernameFromToken(token: string): string | null {
        const decoded = decodeJWT(token);
        return decoded?.sub || decoded?.username || null;
}

/**
 * Extracts image URL string from imageURL (handles string, StaticImageData, or null)
 * This ensures we use the same image source that's being displayed
 * Also handles localhost URLs in production by converting to relative paths
 */
export function getImageUrl(imageURL: string | null | StaticImageData, fallback: string = "/placeholder.png"): string {
        if (!imageURL) {
                return fallback;
        }
        
        let urlString: string;
        
        if (typeof imageURL === "string") {
                urlString = imageURL || fallback;
        } else if (typeof imageURL === "object" && "src" in imageURL) {
                // StaticImageData has a 'src' property
                urlString = imageURL.src || fallback;
        } else {
                return fallback;
        }
        
        // If URL is empty or just whitespace, return fallback
        if (!urlString || urlString.trim() === "") {
                return fallback;
        }
        
        // Handle localhost URLs in production - convert to relative path if it's a placeholder
        // This fixes issues when backend returns localhost URLs in production
        if (typeof window !== "undefined") {
                // Check if URL contains localhost (development URL)
                const localhostPattern = /^https?:\/\/localhost(:\d+)?/i;
                if (localhostPattern.test(urlString)) {
                        // If it's a placeholder path, convert to relative
                        if (urlString.includes("/placeholder") || urlString.includes("placeholder.png")) {
                                return fallback;
                        }
                        // For other localhost URLs, try to extract the path
                        try {
                                const url = new URL(urlString);
                                // Return relative path if it's a valid path
                                if (url.pathname && url.pathname !== "/") {
                                        return url.pathname;
                                }
                        } catch {
                                // Invalid URL, return fallback
                                return fallback;
                        }
                }
        }
        
        // Return the URL as-is if it's a valid external URL or relative path
        return urlString;
}
