import { StaticImageData } from "next/image";

export interface ProductSize {
        id: string;
        sizeName: string;
        price: number;
}

export interface Category {
        id: string;
        cateName: string;
}

export interface Product {
        id: string;
        productName: string;
        description: string;
        imageURL: string | null | StaticImageData;
        categoryName: string;
        categoryId: string;
        volume: number;
        available: boolean;
        restaurant: string | null;
        totalReview: number;
        rating: number;
        productSizes: ProductSize[];
}

export interface ProductData {
        productName: string;
        description: string;
        categoryId: string;
        restaurantId: string;
        volume: number;
        available: boolean;
        productSizes: { sizeName: string; price: number }[];
}
