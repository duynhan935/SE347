import type { Product } from "./product.type";
import type { Category } from "./category.type";

export interface RestaurantData {
        resName: string;
        address: string;
        longitude: number;
        latitude: number;
        rating?: number;
        openingTime: string;
        closingTime: string;
        phone: string;
        merchantId: string;
}

export interface Restaurant {
        id: string;
        resName: string;
        address: string;
        longitude: number;
        latitude: number;
        rating: number;
        openingTime: string;
        closingTime: string;
        phone: string;
        imageURL: string | null | StaticImageData;
        merchantId: string;
        enabled: boolean;
        totalReview: number;
        distance: number;
        duration: number;
        products: Product[];
        cate: Category[];
        reviews: Review[];
}
