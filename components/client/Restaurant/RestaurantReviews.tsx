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
            <div className="rounded-2xl border border-brand-purple/10 bg-white/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                    <MessageSquare className="w-7 h-7 text-brand-purple" />
                    Customer Reviews
                </h2>
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                    This restaurant has no reviews yet.
                </div>
            </div>
        );
    }
    const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

    return (
        <div className="rounded-2xl border border-brand-purple/10 bg-white/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                <MessageSquare className="w-7 h-7 text-brand-purple" />
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
                    className="mt-6 w-full rounded-lg border border-brand-purple/20 bg-brand-purple/5 py-2.5 text-center text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple/10"
                >
                    {showAll ? "Show Less" : `View all ${reviews.length} reviews`}
                </button>
            )}
        </div>
    );
}
