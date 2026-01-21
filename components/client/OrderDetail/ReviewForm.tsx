"use client";

import { reviewApi } from "@/lib/api/reviewApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface ReviewFormProps {
    order: Order;
    onReviewSubmitted?: () => void;
}

interface ProductReview {
    productId: string;
    productName: string;
    rating: number;
    title: string;
    content: string;
}

export default function ReviewForm({ order, onReviewSubmitted }: ReviewFormProps) {
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [restaurantTitle, setRestaurantTitle] = useState("");
    const [restaurantContent, setRestaurantContent] = useState("");
    const [productReviews, setProductReviews] = useState<Record<string, ProductReview>>({});

    // In cart/order, productId can be a composite id: `${baseProductId}--${base64UrlEncode(JSON options)}`
    // Reviews should target the base product id (the restaurant-service expects real product ids).
    const getBaseProductId = (productId: string) => {
        const separatorIndex = productId.indexOf("--");
        return separatorIndex === -1 ? productId : productId.slice(0, separatorIndex);
    };

    const uniqueOrderItems = useMemo(() => {
        const seen = new Set<string>();
        const unique: Order["items"] = [];
        for (const item of order.items) {
            const baseProductId = getBaseProductId(item.productId);
            if (seen.has(baseProductId)) continue;
            seen.add(baseProductId);
            unique.push({ ...item, productId: baseProductId });
        }
        return unique;
    }, [order.items]);

    // Initialize product reviews
    useEffect(() => {
        const initial: Record<string, ProductReview> = {};
        uniqueOrderItems.forEach((item) => {
            if (!initial[item.productId]) {
                initial[item.productId] = {
                    productId: item.productId, // base product id
                    productName: item.productName,
                    rating: 0,
                    title: "",
                    content: "",
                };
            }
        });
        setProductReviews(initial);
    }, [uniqueOrderItems]);

    const updateProductReview = (productId: string, field: keyof ProductReview, value: string | number) => {
        setProductReviews((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
            toast.error("Please login to submit a review");
            return;
        }

        // Validate restaurant review
        if (restaurantRating === 0) {
            toast.error("Please rate the restaurant");
            return;
        }

        if (!restaurantTitle.trim() || !restaurantContent.trim()) {
            toast.error("Please fill in both title and content for restaurant review");
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit restaurant review
            await reviewApi.createReview({
                userId: user.id,
                reviewId: order.restaurantId || order.restaurant?.id || "",
                reviewType: "RESTAURANT",
                title: restaurantTitle.trim(),
                content: restaurantContent.trim(),
                rating: restaurantRating,
            });

            // Submit product reviews (only for products with rating > 0)
            const productReviewsToSubmit = Object.values(productReviews).filter(
                (review) => review.rating > 0 && review.title.trim() && review.content.trim(),
            );

            const productReviewResults = await Promise.allSettled(
                productReviewsToSubmit.map((review) => {
                    return reviewApi.createReview({
                        userId: user.id,
                        reviewId: review.productId,
                        reviewType: "PRODUCT",
                        title: review.title.trim(),
                        content: review.content.trim(),
                        rating: review.rating,
                    });
                }),
            );

            // Check if there were any failures
            const failedReviews = productReviewResults.filter((result) => result.status === "rejected");

            if (failedReviews.length > 0) {
                console.error("Some product reviews failed:", failedReviews);
                // Show warning if some reviews failed, but still show success for restaurant review
                const totalProductReviews = productReviewResults.length - failedReviews.length;
                if (totalProductReviews > 0) {
                    toast.success(
                        `Restaurant review and ${totalProductReviews} product review(s) submitted successfully!`,
                    );
                } else {
                    toast.success("Restaurant review submitted successfully!");
                    toast.error("Unable to review some products (products may have been deleted or no longer exist).");
                }
            } else {
                toast.success("Your review has been submitted successfully!");
            }

            // Reset form
            setRestaurantRating(0);
            setRestaurantTitle("");
            setRestaurantContent("");
            const resetInitial: Record<string, ProductReview> = {};
            uniqueOrderItems.forEach((item) => {
                if (!resetInitial[item.productId]) {
                    resetInitial[item.productId] = {
                        productId: item.productId, // base product id
                        productName: item.productName,
                        rating: 0,
                        title: "",
                        content: "",
                    };
                }
            });
            setProductReviews(resetInitial);

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Unable to submit review. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStarRating = (
        rating: number,
        onRatingChange: (rating: number) => void,
        size: "sm" | "md" | "lg" = "md",
    ) => {
        const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        className={`${starSize} transition-colors ${
                            star <= rating ? "text-yellow-400" : "text-gray-300"
                        } hover:text-yellow-400`}
                        disabled={isSubmitting}
                        title={`${star} star${star > 1 ? "s" : ""}`}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                        <Star className="w-full h-full fill-current" />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Restaurant Review Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Restaurant Review: {order.restaurant?.name || "Restaurant"}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Star Rating <span className="text-red-500">*</span>
                        </label>
                        {renderStarRating(restaurantRating, setRestaurantRating, "lg")}
                    </div>

                    <div>
                        <label htmlFor="restaurant-title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="restaurant-title"
                            type="text"
                            value={restaurantTitle}
                            onChange={(e) => setRestaurantTitle(e.target.value)}
                            placeholder="Enter review title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                            required
                            disabled={isSubmitting}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label htmlFor="restaurant-content" className="block text-sm font-medium text-gray-700 mb-2">
                            Review Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="restaurant-content"
                            value={restaurantContent}
                            onChange={(e) => setRestaurantContent(e.target.value)}
                            placeholder="Share your experience about the restaurant..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            {/* Product Reviews Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Product Reviews (Optional)</h3>
                <p className="text-sm text-gray-500 mb-4">
                    You can review each product in your order. Product reviews are optional.
                </p>

                <div className="space-y-6">
                    {uniqueOrderItems.map((item) => {
                        const review = productReviews[item.productId] || {
                            productId: item.productId,
                            productName: item.productName,
                            rating: 0,
                            title: "",
                            content: "",
                        };

                        return (
                            <div
                                key={item.productId}
                                className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
                            >
                                <h4 className="font-semibold text-gray-900 mb-3">{item.productName}</h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Star Rating
                                        </label>
                                        {renderStarRating(review.rating, (rating) =>
                                            updateProductReview(item.productId, "rating", rating),
                                        )}
                                    </div>

                                    {review.rating > 0 && (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor={`product-title-${item.productId}`}
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Title
                                                </label>
                                                <input
                                                    id={`product-title-${item.productId}`}
                                                    type="text"
                                                    value={review.title}
                                                    onChange={(e) =>
                                                        updateProductReview(item.productId, "title", e.target.value)
                                                    }
                                                    placeholder="Enter review title"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                                    disabled={isSubmitting}
                                                    maxLength={100}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`product-content-${item.productId}`}
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Review Content
                                                </label>
                                                <textarea
                                                    id={`product-content-${item.productId}`}
                                                    value={review.content}
                                                    onChange={(e) =>
                                                        updateProductReview(item.productId, "content", e.target.value)
                                                    }
                                                    placeholder="Share your experience about this product..."
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#EE4D2D] text-white font-semibold rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </form>
    );
}
