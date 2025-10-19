// types/user.type.ts
export interface User {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "USER" | "MERCHANT";
        createdAt: string;
        avatarUrl?: string;
}

// types/order.type.ts
export interface Order {
        id: string;
        customerName: string; // Giả định
        restaurantName: string; // Giả định
        totalPrice: number;
        status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
        createdAt: string;
}
