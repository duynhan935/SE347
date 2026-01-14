"use client";

import { Review } from "@/types";
import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
        ))}
    </div>
);

export default function RestaurantReviews({ reviews }: { reviews: Review[] }) {
    const [showAll, setShowAll] = useState(false);

    if (!reviews || reviews.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                    <MessageSquare className="w-7 h-7 text-[#EE4D2D]" />
                    Customer Reviews
                </h2>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</p>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                        Be the first to review this restaurant and help others discover great food!
                    </p>
                </div>
            </div>
        );
    }
    const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                <MessageSquare className="w-7 h-7 text-[#EE4D2D]" />
                Customer Reviews
            </h2>
            <div className="space-y-6">
                {visibleReviews.map((review) => (
                    <div
                        key={review.id}
                        className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <p className="min-w-0 truncate font-semibold text-gray-900">{review.title}</p>
                            <RatingStars rating={review.rating} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">&quot;{review.content}&quot;</p>
                    </div>
                ))}
            </div>
            {reviews.length > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-6 w-full rounded-lg border border-[#EE4D2D]/20 bg-[#EE4D2D]/5 py-2.5 text-center text-sm font-semibold text-[#EE4D2D] transition-colors hover:bg-[#EE4D2D]/10"
                >
                    {showAll ? "Show Less" : `View all ${reviews.length} reviews`}
                </button>
            )}
        </div>
    );
}
