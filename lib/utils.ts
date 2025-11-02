import { clsx, type ClassValue } from "clsx";
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
