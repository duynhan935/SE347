"use client";
import { RestaurantBurger } from "@/constants";
import { StaticImageData } from "next/image";
import { ProductSuggestionCard } from "./ProductSugestionCard";

type SuggestedProduct = {
        id: number;
        name: string;
        category: string;
        image: StaticImageData;
        rating: number;
        reviewCount: number;
        price: number;
};

const fakeSuggestedProducts: SuggestedProduct[] = [
        {
                id: 301,
                name: "Classic Salad",
                category: "Salad",
                image: RestaurantBurger,
                rating: 4.8,
                reviewCount: 110,
                price: 12.5,
        },
        {
                id: 302,
                name: "Avocado Salad",
                category: "Salad",
                image: RestaurantBurger,
                rating: 4.9,
                reviewCount: 139,
                price: 14.0,
        },
        {
                id: 303,
                name: "Greek Salad",
                category: "Salad",
                image: RestaurantBurger,
                rating: 4.7,
                reviewCount: 92,
                price: 13.0,
        },
];

export const PeopleAlsoBought = () => {
        return (
                <div className="mt-16">
                        <div className="flex justify-between items-center mb-6">
                                <div>
                                        <h2 className="text-3xl font-bold">People also bought</h2>
                                        <p className="text-gray-600 mt-1">
                                                Browse our most popular products and make your day more beautiful and
                                                glorious.
                                        </p>
                                </div>
                                <button className=" cursor-pointer font-semibold border px-4 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        Browse All
                                </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {fakeSuggestedProducts.map((product) => (
                                        <ProductSuggestionCard key={product.id} product={product} />
                                ))}
                        </div>
                </div>
        );
};
