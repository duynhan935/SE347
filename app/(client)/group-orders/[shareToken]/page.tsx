"use client";

import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { GroupOrder, GroupOrderStatus } from "@/types/groupOrder.type";
import { Check, Copy, DollarSign, Edit, Lock, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function GroupOrderPage() {
    const params = useParams();
    const shareToken = params?.shareToken as string;
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const confirmAction = useConfirm();

    const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const groupOrderStatusRef = useRef<string | null>(null);

    const fetchGroupOrder = useCallback(async () => {
        if (!shareToken) return;

        setLoading(true);
        try {
            const data = await groupOrderApi.getGroupOrderByToken(shareToken);
            setGroupOrder(data);
            groupOrderStatusRef.current = data.status;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
            console.error("Failed to fetch group order:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unable to load the group order.";
            toast.error(errorMessage);
            if (err.response?.status === 404) {
                router.push("/");
            }
        } finally {
            setLoading(false);
        }
    }, [shareToken, router]);

    useEffect(() => {
        if (shareToken) {
            fetchGroupOrder();
        }
    }, [shareToken, fetchGroupOrder]);

    // Auto-refresh every 5 seconds if group order is open or locked
    useEffect(() => {
        const currentStatus = groupOrder?.status;

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only set up interval if group order exists and is not in final states
        if (
            !currentStatus ||
            currentStatus === GroupOrderStatus.ORDERED ||
            currentStatus === GroupOrderStatus.CANCELLED
        ) {
            return;
        }

        // Set up new interval
        intervalRef.current = setInterval(() => {
            fetchGroupOrder();
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [groupOrder?.status, fetchGroupOrder]);

    const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/group-orders/${shareToken}`;
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copied.");
    };

    const handleLock = async () => {
        if (!isAuthenticated || !user) {
            const currentPath = `/group-orders/${shareToken}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
        setIsProcessing(true);
        try {
            const data = await groupOrderApi.lockGroupOrder(shareToken);
            setGroupOrder(data);
            toast.success("Group order locked.");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err.response?.data?.message || err.message || "Unable to lock the group order.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!isAuthenticated || !user) {
            const currentPath = `/group-orders/${shareToken}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
        setIsProcessing(true);
        try {
            const result = await groupOrderApi.confirmGroupOrder(shareToken);
            setGroupOrder(result.groupOrder);
            toast.success("Group order confirmed.");
            // Redirect to order detail page
            // Backend returns { groupOrder, order } where order has orderId
            const orderId = result.order?.orderId;
            if (orderId) {
                router.push(`/orders/${orderId}`);
            } else {
                // Fallback: redirect to orders list if orderId not found
                console.error("Order ID not found in response:", result);
                toast.error("Order ID not found.");
                router.push("/account/orders");
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err.response?.data?.message || err.message || "Unable to confirm the group order.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!isAuthenticated || !user) {
            const currentPath = `/group-orders/${shareToken}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
        const ok = await confirmAction({
            title: "Cancel group order?",
            description: "This will cancel the group order and cannot be undone.",
            confirmText: "Cancel group order",
            cancelText: "Keep",
            variant: "danger",
        });
        if (!ok) {
            return;
        }
        setIsProcessing(true);
        try {
            await groupOrderApi.cancelGroupOrder(shareToken);
            toast.success("Group order canceled.");
            router.push("/");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err.response?.data?.message || err.message || "Unable to cancel the group order.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveParticipant = async (userId: string, userName: string) => {
        if (!isAuthenticated || !user) {
            const currentPath = `/group-orders/${shareToken}`;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        // Only creator can remove others, anyone can remove themselves
        if (userId !== user.id && user.id !== groupOrder?.creatorId) {
            toast.error("You don't have permission to remove this participant.");
            return;
        }

        const targetLabel = userId === user.id ? "yourself" : userName;
        const ok = await confirmAction({
            title: "Remove participant?",
            description: `Are you sure you want to remove ${targetLabel} from this group order?`,
            confirmText: "Remove",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) {
            return;
        }

        setIsProcessing(true);
        try {
            const data = await groupOrderApi.removeParticipant(shareToken, userId);
            setGroupOrder(data);
            toast.success(userId === user.id ? "You left the group order." : "Participant removed.");
            if (userId === user.id) {
                // Refresh to update UI
                setTimeout(() => {
                    fetchGroupOrder();
                }, 500);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err.response?.data?.message || err.message || "Unable to remove the participant.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!groupOrder) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <p className="text-gray-600">Group order not found.</p>
                            <Link href="/" className="text-[#EE4D2D] hover:underline mt-4 inline-block">
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const isCreator = user?.id === groupOrder.creatorId;
    const currentParticipant = groupOrder.participants.find((p) => p.userId === user?.id);
    const isParticipant = !!currentParticipant;
    const canJoin = !isParticipant && groupOrder.status === GroupOrderStatus.OPEN;
    const canLock = isCreator && groupOrder.status === GroupOrderStatus.OPEN && groupOrder.participants.length > 0;
    const canConfirm =
        isCreator && (groupOrder.status === GroupOrderStatus.OPEN || groupOrder.status === GroupOrderStatus.LOCKED);
    const canCancel =
        isCreator && groupOrder.status !== GroupOrderStatus.ORDERED && groupOrder.status !== GroupOrderStatus.CANCELLED;
    const shareLink = typeof window !== "undefined" ? `${window.location.origin}/group-orders/${shareToken}` : "";

    // Format price
    const formatPrice = (price: number) => {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="custom-container">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{groupOrder.restaurantName}</h1>
                                <p className="text-sm text-gray-600">Group Order ID: {groupOrder.groupOrderId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        groupOrder.status === GroupOrderStatus.OPEN
                                            ? "bg-green-100 text-green-800"
                                            : groupOrder.status === GroupOrderStatus.LOCKED
                                              ? "bg-yellow-100 text-yellow-800"
                                              : groupOrder.status === GroupOrderStatus.ORDERED
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {groupOrder.status === GroupOrderStatus.OPEN
                                        ? "Open"
                                        : groupOrder.status === GroupOrderStatus.LOCKED
                                          ? "Locked"
                                          : groupOrder.status === GroupOrderStatus.ORDERED
                                            ? "Confirmed"
                                            : "Canceled"}
                                </span>
                            </div>
                        </div>

                        {groupOrder.groupNote && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{groupOrder.groupNote}</p>
                            </div>
                        )}

                        {/* Share Link */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <label htmlFor="share-link" className="sr-only">
                                Group order share link
                            </label>
                            <input
                                id="share-link"
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                                aria-label="Group order share link"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copy link"
                            >
                                <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            {canJoin && (
                                <>
                                    {isAuthenticated && user ? (
                                        <Link
                                            href={`/group-orders/${shareToken}/join`}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors"
                                        >
                                            <Users className="w-4 h-4" />
                                            Join
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors"
                                        >
                                            <Users className="w-4 h-4" />
                                            Sign in to join
                                        </Link>
                                    )}
                                </>
                            )}
                            {isAuthenticated && user && (
                                <>
                                    {canLock && (
                                        <button
                                            onClick={handleLock}
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Lock
                                        </button>
                                    )}
                                    {canConfirm && (
                                        <button
                                            onClick={handleConfirm}
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                        >
                                            <Check className="w-4 h-4" />
                                            Confirm
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button
                                            onClick={handleCancel}
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Participants ({groupOrder.participants.length})
                        </h2>
                        <div className="space-y-4">
                            {groupOrder.participants.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No participants yet.</p>
                            ) : (
                                groupOrder.participants.map((participant) => (
                                    <div key={participant.userId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{participant.userName}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {participant.userId === groupOrder.creatorId && (
                                                        <span className="text-xs text-[#EE4D2D]">(Creator)</span>
                                                    )}
                                                    {participant.userId === user?.id && (
                                                        <span className="text-xs text-blue-600">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        ${formatPrice(participant.totalAmount)}
                                                    </p>
                                                    <span
                                                        className={`text-xs ${
                                                            participant.paymentStatus === "paid"
                                                                ? "text-green-600"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {participant.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                                                    </span>
                                                </div>
                                                {/* Actions */}
                                                {(groupOrder.status === GroupOrderStatus.OPEN ||
                                                    groupOrder.status === GroupOrderStatus.LOCKED) && (
                                                    <div className="flex gap-1">
                                                        {/* Edit button - only for current user */}
                                                        {participant.userId === user?.id && (
                                                            <Link
                                                                href={`/group-orders/${shareToken}/join`}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit items"
                                                            >
                                                                <Edit className="w-4 h-4 text-gray-600" />
                                                            </Link>
                                                        )}
                                                        {/* Remove button - for creator or self */}
                                                        {(user?.id === groupOrder.creatorId ||
                                                            participant.userId === user?.id) && (
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveParticipant(
                                                                        participant.userId,
                                                                        participant.userName,
                                                                    )
                                                                }
                                                                disabled={isProcessing}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title={
                                                                    participant.userId === user?.id
                                                                        ? "Leave group order"
                                                                        : "Remove participant"
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {participant.items.length > 0 && (
                                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                                                {participant.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="text-gray-700">
                                                            {item.productName} x{item.quantity}
                                                        </span>
                                                        <span className="text-gray-900">
                                                            ${formatPrice(item.price * item.quantity)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Summary
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Items total:</span>
                                <span>${formatPrice(groupOrder.totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Delivery fee:</span>
                                <span>${formatPrice(groupOrder.deliveryFee)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Tax:</span>
                                <span>${formatPrice(groupOrder.tax)}</span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total:</span>
                                <span>${formatPrice(groupOrder.finalAmount)}</span>
                            </div>
                            {groupOrder.paymentMethod === "split" && (
                                <p className="text-xs text-gray-500 mt-2">Each person pays their own share.</p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                        <p className="text-gray-700">
                            {groupOrder.deliveryAddress.street}, {groupOrder.deliveryAddress.city}
                            {groupOrder.deliveryAddress.state && `, ${groupOrder.deliveryAddress.state}`}
                            {groupOrder.deliveryAddress.zipCode && ` ${groupOrder.deliveryAddress.zipCode}`}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
