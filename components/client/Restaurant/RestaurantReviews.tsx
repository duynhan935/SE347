"use client";
import { type RestaurantDetail } from "@/app/(client)/restaurants/[id]/page";
import { useState } from "react";
import { ReviewCard } from "./ReviewCard";

export default function RestaurantReviews({ reviews }: { reviews: RestaurantDetail["reviews"] }) {
        const [showAllReviews, setShowAllReviews] = useState(false);

        const handleShowAllReviews = () => {
                setShowAllReviews(!showAllReviews);
        };

        const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
        return (
                <section>
                        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

                        <div className="space-y-4">
                                {visibleReviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                ))}
                        </div>

                        <button
                                onClick={handleShowAllReviews}
                                className="w-full mt-6 text-center py-2 px-4 border border-gray-300 rounded-md font-semibold text-sm hover:bg-gray-50 cursor-pointer"
                        >
                                View all reviews
                        </button>
                </section>
        );
}
