"use client";

import { useRouter } from "next/navigation";

const OrderDetailNotFound = () => {
        const router = useRouter();

        return (
                <div className="flex flex-col items-center justify-center h-screen">
                        <h1 className="text-2xl font-bold mb-4">Order Detail Not Found</h1>
                        <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                        >
                                Back to Previous Page
                        </button>
                </div>
        );
};

export default OrderDetailNotFound;
