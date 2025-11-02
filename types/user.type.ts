export interface User {
        id: string;
        username: string;
        email: string;
        enabled: boolean;
        role: "ADMIN" | "MERCHANT" | "USER";
        phone?: string | null;
}

export interface Address {
        id: string;
        location: string;
        longitude: number;
        latitude: number;
}

export interface UserUpdateAfterLogin {
        phone: string;
        defaultAddress: string;
        longitude: number;
        latitude: number;
}
