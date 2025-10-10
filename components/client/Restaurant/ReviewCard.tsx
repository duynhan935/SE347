import { RestaurantDetail } from "@/app/(client)/restaurants/[id]/page";
import { Star } from "lucide-react";

export const ReviewCard = ({ review }: { review: RestaurantDetail["reviews"][0] }) => {
        return (
                <div className="border-b pb-4">
                        <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                        i < review.rating
                                                                ? "text-yellow-500 fill-current"
                                                                : "text-gray-300"
                                                }`}
                                        />
                                ))}
                        </div>
                        <p className="font-semibold text-sm">{review.author}</p>
                        <p className="text-gray-600 mt-1 text-sm">{`"${review.text}"`}</p>
                </div>
        );
};
