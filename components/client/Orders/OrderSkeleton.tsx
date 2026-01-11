export const OrderSkeleton = () => {
    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {/* Header skeleton */}
            <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    {/* Order ID and Status skeleton */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-7 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                        <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                    </div>
                    {/* Date skeleton */}
                    <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mt-1"></div>
                    <div className="h-3 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mt-1"></div>
                </div>
                <div className="text-right">
                    <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-1 ml-auto"></div>
                    <div className="h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ml-auto"></div>
                </div>
            </div>

            {/* Items skeleton */}
            <div className="p-5 space-y-4">
                {[1, 2].map((item) => (
                    <div key={item} className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0">
                        {/* Image skeleton */}
                        <div className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>

                        {/* Content skeleton */}
                        <div className="flex-grow min-w-0 space-y-2">
                            <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                            <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                            <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                        </div>

                        {/* Buttons skeleton */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <div className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                            <div className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

