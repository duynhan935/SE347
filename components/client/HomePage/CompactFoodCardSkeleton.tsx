export const CompactFoodCardSkeleton = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {/* Image skeleton with shimmer effect */}
        <div className="relative w-full aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-t-lg" />

        {/* Content skeleton */}
        <div className="p-3 space-y-2">
            {/* Product name */}
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />

            {/* Restaurant name with icon */}
            <div className="flex items-center gap-1.5">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded flex-1" />
                <div className="h-3 w-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full" />
            </div>

            {/* Rating */}
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24" />

            {/* Price */}
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 pt-1" />
        </div>
    </div>
);

