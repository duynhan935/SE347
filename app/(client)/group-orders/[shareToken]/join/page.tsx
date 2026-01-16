"use client";

import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { GroupOrder, GroupOrderStatus, JoinGroupOrderRequest } from "@/types/groupOrder.type";
import { ArrowLeft, Minus, Plus, ShoppingCart, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SelectedItem {
    productId: string;
    productName: string;
    sizeId: string;
    sizeName: string;
    price: number;
    quantity: number;
    customizations?: string;
}

export default function JoinGroupOrderPage() {
    const params = useParams();
    const shareToken = params?.shareToken as string;
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    
    const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());

    const fetchGroupOrder = async () => {
        try {
            const data = await groupOrderApi.getGroupOrderByToken(shareToken);
            setGroupOrder(data);
            
            // Check if user already joined
            if (user && data.participants.find(p => p.userId === user.id)) {
                // Load existing items
                const participant = data.participants.find(p => p.userId === user.id);
                if (participant) {
                    const itemsMap = new Map<string, SelectedItem>();
                    participant.items.forEach(item => {
                        itemsMap.set(item.productId, {
                            productId: item.productId,
                            productName: item.productName,
                            sizeId: "", // Backend doesn't return sizeId
                            sizeName: "",
                            price: item.price,
                            quantity: item.quantity,
                            customizations: item.customizations,
                        });
                    });
                    setSelectedItems(itemsMap);
                }
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
            console.error("Failed to fetch group order:", error);
            const errorMessage = err.response?.data?.message || err.message || "Không thể tải group order";
            toast.error(errorMessage);
            if (err.response?.status === 404) {
                router.push("/");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        if (!groupOrder?.restaurantId) return;
        try {
            const restaurantResponse = await restaurantApi.getByRestaurantId(groupOrder.restaurantId);
            const restaurant = restaurantResponse.data;
            if (restaurant?.products) {
                setProducts(restaurant.products);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Không thể tải menu");
        }
    };

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated || !user) {
            const currentPath = `/group-orders/${shareToken}/join`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
    }, [isAuthenticated, user, shareToken, router]);

    useEffect(() => {
        if (shareToken && isAuthenticated && user) {
            fetchGroupOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shareToken, isAuthenticated, user]);

    useEffect(() => {
        if (groupOrder?.restaurantId) {
            fetchProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupOrder?.restaurantId]);


    const handleAddItem = (product: Product) => {
        if (!isAuthenticated || !user) {
            toast.error("Vui lòng đăng nhập để tham gia");
            router.push("/login");
            return;
        }

        if (groupOrder?.status !== GroupOrderStatus.OPEN && groupOrder?.status !== GroupOrderStatus.LOCKED) {
            toast.error("Group order này không còn nhận thêm món");
            return;
        }

        const sizes = product.productSizes || [];
        if (sizes.length === 0) {
            toast.error("Món này chưa có size");
            return;
        }

        const defaultSize = sizes[0];
        
        const existing = selectedItems.get(product.id);
        if (existing) {
            // Update quantity
            setSelectedItems(new Map(selectedItems.set(product.id, {
                ...existing,
                quantity: existing.quantity + 1,
            })));
        } else {
            // Add new item
            setSelectedItems(new Map(selectedItems.set(product.id, {
                productId: product.id,
                productName: product.productName,
                sizeId: defaultSize.id,
                sizeName: defaultSize.sizeName,
                price: defaultSize.price,
                quantity: 1,
            })));
        }
    };

    const handleRemoveItem = (productId: string) => {
        const newMap = new Map(selectedItems);
        const item = newMap.get(productId);
        if (item) {
            if (item.quantity > 1) {
                newMap.set(productId, { ...item, quantity: item.quantity - 1 });
            } else {
                newMap.delete(productId);
            }
            setSelectedItems(newMap);
        }
    };


    const handleSubmit = async () => {
        if (!isAuthenticated || !user) {
            toast.error("Vui lòng đăng nhập");
            return;
        }

        if (selectedItems.size === 0) {
            toast.error("Vui lòng chọn ít nhất một món");
            return;
        }

        if (groupOrder?.status !== GroupOrderStatus.OPEN && groupOrder?.status !== GroupOrderStatus.LOCKED) {
            toast.error("Group order này không còn nhận thêm món");
            return;
        }

        setIsSubmitting(true);
        try {
            const items: JoinGroupOrderRequest["items"] = Array.from(selectedItems.values()).map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                customizations: item.customizations,
            }));

            await groupOrderApi.joinGroupOrder(shareToken, { items });
            toast.success("Đã tham gia group order thành công!");
            router.push(`/group-orders/${shareToken}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            console.error("Failed to join group order:", error);
            const errorMessage = err.response?.data?.message || err.message || "Không thể tham gia group order";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = Array.from(selectedItems.values()).reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    // Show loading or redirect message if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-4">
                            <Users className="w-16 h-16 text-gray-400 mx-auto" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để tham gia</h2>
                        <p className="text-gray-600 mb-6">
                            Bạn cần đăng nhập để có thể tham gia group order này và thêm món vào đơn.
                        </p>
                        <Link
                            href={`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`}
                            className="inline-block px-6 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors font-medium"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </main>
        );
    }

    if (!groupOrder) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="text-center">
                        <p className="text-gray-600">Không tìm thấy group order</p>
                        <Link href="/" className="text-[#EE4D2D] hover:underline mt-4 inline-block">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const canJoin = groupOrder.status === GroupOrderStatus.OPEN || groupOrder.status === GroupOrderStatus.LOCKED;
    const isJoined = user && groupOrder.participants.find(p => p.userId === user.id);

    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="custom-container">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={`/group-orders/${shareToken}`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EE4D2D] transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại group order
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isJoined ? "Cập nhật món của bạn" : "Tham gia Group Order"}
                        </h1>
                        <p className="text-gray-600">{groupOrder.restaurantName}</p>
                    </div>

                    {!canJoin && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800">Group order này không còn nhận thêm món</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Menu */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Menu</h2>
                                {products.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Đang tải menu...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {products.map((product) => {
                                            const sizes = product.productSizes || [];
                                            const defaultSize = sizes[0];
                                            const selectedItem = selectedItems.get(product.id);
                                            const imageUrl = getImageUrl(product.imageURL);

                                            return (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                                >
                                                    {/* Image */}
                                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        {imageUrl && imageUrl !== "/placeholder.png" ? (
                                                            <Image
                                                                src={imageUrl}
                                                                alt={product.productName}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                                🍽️
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {product.productName}
                                                        </h3>
                                                        {defaultSize && (
                                                            <p className="text-sm text-[#EE4D2D] font-bold">
                                                                ${defaultSize.price.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    {selectedItem ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleRemoveItem(product.id)}
                                                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                                aria-label="Giảm số lượng"
                                                                title="Giảm số lượng"
                                                            >
                                                                <Minus className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                            <span className="w-10 text-center font-semibold">
                                                                {selectedItem.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleAddItem(product)}
                                                                disabled={!canJoin}
                                                                className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                                aria-label="Tăng số lượng"
                                                                title="Tăng số lượng"
                                                            >
                                                                <Plus className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddItem(product)}
                                                            disabled={!canJoin}
                                                            className="px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Thêm
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Món đã chọn
                                </h2>

                                {selectedItems.size === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Chưa chọn món nào</p>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                            {Array.from(selectedItems.values()).map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ${item.price.toFixed(2)} x {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            aria-label="Xóa món"
                                                            title="Xóa món"
                                                        >
                                                            <X className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-semibold text-gray-900">Tổng:</span>
                                                <span className="text-xl font-bold text-[#EE4D2D]">
                                                    ${totalAmount.toFixed(2)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || !canJoin || selectedItems.size === 0}
                                                className="w-full px-4 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {isSubmitting
                                                    ? "Đang xử lý..."
                                                    : isJoined
                                                    ? "Cập nhật món"
                                                    : "Xác nhận tham gia"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

