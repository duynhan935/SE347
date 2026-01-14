/**
 * Role-based redirect utility functions
 */

export type UserRole = "USER" | "MERCHANT" | "ADMIN";

/**
 * Get the default redirect path based on user role
 */
export function getRoleBasedRedirectPath(role: UserRole | string | undefined | null): string {
    if (!role) {
        return "/";
    }

    switch (role.toUpperCase()) {
        case "MERCHANT":
            return "/merchant";
        case "ADMIN":
            return "/admin/dashboard";
        case "USER":
        default:
            return "/";
    }
}

/**
 * Get redirect path after login, considering callback URL
 */
export function getLoginRedirectPath(
    role: UserRole | string | undefined | null,
    callbackUrl?: string | null
): string {
    // If user is MERCHANT or ADMIN, always redirect to their dashboard (ignore callbackUrl)
    if (role === "MERCHANT" || role === "ADMIN") {
        return getRoleBasedRedirectPath(role);
    }

    // For USER, use callbackUrl if provided, otherwise go to home
    if (callbackUrl && role === "USER") {
        // Validate callbackUrl to prevent open redirect vulnerability
        if (typeof window !== "undefined") {
            try {
                const url = new URL(callbackUrl, window.location.origin);
                // Only allow same-origin redirects
                if (url.origin === window.location.origin) {
                    return url.pathname + url.search;
                }
            } catch {
                // Invalid URL, fallback to home
            }
        } else {
            // Server-side: basic validation - only allow relative paths
            if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
                return callbackUrl;
            }
        }
    }

    return "/";
}

/**
 * Check if a path requires specific role access
 */
export function getRequiredRoleForPath(pathname: string): UserRole[] | null {
    if (pathname.startsWith("/merchant")) {
        return ["MERCHANT"];
    }
    if (pathname.startsWith("/admin")) {
        return ["ADMIN"];
    }
    // Client routes (home, search, restaurants, etc.) are accessible by USER
    // But MERCHANT and ADMIN should be redirected away
    return null;
}

/**
 * Check if user should be redirected away from a path based on their role
 */
export function shouldRedirectFromPath(
    pathname: string,
    userRole: UserRole | string | undefined | null
): { shouldRedirect: boolean; redirectTo: string } {
    if (!userRole) {
        return { shouldRedirect: false, redirectTo: "/" };
    }

    const role = userRole.toUpperCase();

    // If user is on home page ("/") and is MERCHANT or ADMIN, redirect to their dashboard
    if (pathname === "/" && (role === "MERCHANT" || role === "ADMIN")) {
        return {
            shouldRedirect: true,
            redirectTo: getRoleBasedRedirectPath(role as UserRole),
        };
    }

    // If MERCHANT tries to access admin routes
    if (pathname.startsWith("/admin") && role === "MERCHANT") {
        return {
            shouldRedirect: true,
            redirectTo: "/merchant",
        };
    }

    // If ADMIN tries to access merchant routes
    if (pathname.startsWith("/merchant") && role === "ADMIN") {
        return {
            shouldRedirect: true,
            redirectTo: "/admin/dashboard",
        };
    }

    // If USER tries to access merchant/admin routes, they'll be blocked by ProtectedRoute
    // No need to redirect here

    return { shouldRedirect: false, redirectTo: "/" };
}

