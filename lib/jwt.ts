/**
 * Utility functions for decoding JWT tokens
 */

export interface DecodedToken {
        sub: string; // subject (username/email)
        role: string;
        iat: number; // issued at
        exp: number; // expiration
}

/**
 * Decode JWT token without verification
 * Note: This is only for client-side reading. Always verify tokens on the server.
 */
export function decodeJWT(token: string): DecodedToken | null {
        try {
                const base64Url = token.split(".")[1];
                if (!base64Url) {
                        return null;
                }
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                        atob(base64)
                                .split("")
                                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                                .join("")
                );
                console.log(JSON.parse(jsonPayload));
                return JSON.parse(jsonPayload);
        } catch (error) {
                console.error("Failed to decode JWT:", error);
                return null;
        }
}

/**
 * Get the username/email from a JWT token
 */
export function getUsernameFromToken(token: string): string | null {
        const decoded = decodeJWT(token);
        console.log(decodeJWT);
        return decoded?.sub || null;
}
