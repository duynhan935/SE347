"use client";

import { Review } from "@/types";
import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

const RatingStars = ({ rating }: { rating: number }) => (
        <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                        <Star
                                key={i}
                                className={`w-4 h-4 ${
                                        i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                }`}
                        />
                ))}
        </div>
);

export default function RestaurantReviews({ reviews }: { reviews: Review[] }) {
        const [showAll, setShowAll] = useState(false);

        if (!reviews || reviews.length === 0) {
                return (
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold font-roboto-serif mb-6 flex items-center gap-3">
                                        <MessageSquare className="w-7 h-7 text-brand-purple" />
                                        Customer Reviews
                                </h2>
                                <p className="text-gray-500 italic">This restaurant has no reviews yet.</p>
                        </div>
                );
        }
        const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

        return (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold font-roboto-serif mb-6 flex items-center gap-3">
                                <MessageSquare className="w-7 h-7 text-brand-purple" />
                                Customer Reviews
                        </h2>
                        <div className="space-y-6">
                                {visibleReviews.map((review) => (
                                        <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                        <p className="font-semibold">{review.title}</p>
                                                        <RatingStars rating={review.rating} />
                                                </div>
                                                <p className="mt-3 text-gray-600 italic">
                                                        &quot;{review.content}&quot;
                                                </p>
                                        </div>
                                ))}
                        </div>
                        {reviews.length > 3 && (
                                <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="w-full mt-6 text-center py-2 px-4 border rounded-md font-semibold text-sm hover:bg-gray-50"
                                >
                                        {showAll ? "Show Less" : `View all ${reviews.length} reviews`}
                                </button>
                        )}
                </div>
        );
}
