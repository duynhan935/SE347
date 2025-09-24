/* eslint-disable @typescript-eslint/no-explicit-any */
// File: app/restaurants/page.tsx
import burgerImage from "@/assets/Restaurant/Burger.png"; // Ví dụ import ảnh
import RestaurantsContainer from "@/components/client/restaurants/RestaurantsContainer";
import { StaticImageData } from "next/image";

// --- Kiểu dữ liệu và Hàm Fetch ---
export type Restaurant = {
        id: number;
        name: string;
        image: StaticImageData;
        deliveryFee: string;
        deliveryTime: number;
        foodType: string;
        rating: number;
        reviewCount: number;
};

async function fetchRestaurants(searchParams: any) {
        console.log("Fetching restaurants with filters:", searchParams);
        // Đây là nơi bạn sẽ gọi API dựa trên searchParams
        const fakeData: Restaurant[] = [
                {
                        id: 1,
                        name: "The Burger Cafe",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 20,
                        foodType: "Burger",
                        rating: 4.6,
                        reviewCount: 2200,
                },
                {
                        id: 2,
                        name: "The Pizza Hut",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 20,
                        foodType: "Pizza",
                        rating: 4.6,
                        reviewCount: 2200,
                },
                {
                        id: 3,
                        name: "Caprese Sandwich Hub",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 20,
                        foodType: "Fast Food",
                        rating: 4.6,
                        reviewCount: 2200,
                },
                {
                        id: 4,
                        name: "The Wings Cafe",
                        image: burgerImage,
                        deliveryFee: "$1.99",
                        deliveryTime: 30,
                        foodType: "Fast Food",
                        rating: 4.8,
                        reviewCount: 1800,
                },
                {
                        id: 5,
                        name: "The Coffee Express",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 15,
                        foodType: "Coffee & Tea",
                        rating: 4.9,
                        reviewCount: 3100,
                },
                {
                        id: 6,
                        name: "The Biryani House",
                        image: burgerImage,
                        deliveryFee: "$2.49",
                        deliveryTime: 40,
                        foodType: "Indian",
                        rating: 4.5,
                        reviewCount: 980,
                },
                {
                        id: 7,
                        name: "Noodle & Co.",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 25,
                        foodType: "Thai",
                        rating: 4.7,
                        reviewCount: 1500,
                },
                {
                        id: 8,
                        name: "Taco Tuesday",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 20,
                        foodType: "Mexican",
                        rating: 4.6,
                        reviewCount: 1250,
                },
                {
                        id: 9,
                        name: "Sushi Central",
                        image: burgerImage,
                        deliveryFee: "$3.00",
                        deliveryTime: 35,
                        foodType: "Japanese",
                        rating: 4.9,
                        reviewCount: 2500,
                },
                {
                        id: 10,
                        name: "Another Burger Place",
                        image: burgerImage,
                        deliveryFee: "$1.00",
                        deliveryTime: 22,
                        foodType: "Burger",
                        rating: 4.5,
                        reviewCount: 1200,
                },
                {
                        id: 11,
                        name: "Extra Pizza",
                        image: burgerImage,
                        deliveryFee: "$0",
                        deliveryTime: 25,
                        foodType: "Pizza",
                        rating: 4.7,
                        reviewCount: 3300,
                },
                {
                        id: 12,
                        name: "Super Sushi",
                        image: burgerImage,
                        deliveryFee: "$2.50",
                        deliveryTime: 30,
                        foodType: "Japanese",
                        rating: 4.8,
                        reviewCount: 4500,
                },
        ];
        // API thực tế sẽ trả về tổng số lượng kết quả
        return { restaurants: fakeData, totalCount: 120 };
}

export default async function RestaurantsPage({
        searchParams,
}: {
        searchParams: { [key: string]: string | string[] | undefined };
}) {
        const { restaurants, totalCount } = await fetchRestaurants(searchParams);

        return (
                <section className="lg:mt-[55px]">
                        <RestaurantsContainer initialData={restaurants} totalResults={totalCount} />
                </section>
        );
}
