import type { Restaurant } from "@/types";

export interface ManagerCredentials {
    username: string;
    email: string;
    password: string;
}

// Hàm sinh thông tin tài khoản manager dựa trên dữ liệu restaurant (deterministic)
export function generateManagerCredentials(restaurant: Restaurant): ManagerCredentials {
    const base =
        restaurant.slug ||
        restaurant.resName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "")
            .slice(0, 12) ||
        "manager";

    const username = `${base}_manager`;
    const email = `${base}.manager@gmail.com`;

    const idPart = restaurant.id.slice(0, 4);
    const merchantPart = restaurant.merchantId.slice(0, 4);
    const password = `Mgr${idPart}${merchantPart}!`;

    return { username, email, password };
}


