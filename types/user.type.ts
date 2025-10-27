export interface User {
        id: string;
        username: string;
        email: string;
        enabled: boolean;
        role: "ADMIN" | "MERCHANT" | "USER";
        phone?: string | null;
}
