"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
    id: string;
    type:
        | "ORDER_ACCEPTED"
        | "ORDER_REJECTED"
        | "ORDER_CONFIRMED"
        | "ORDER_COMPLETED"
        | "NEW_ORDER"
        | "MERCHANT_NEW_ORDER"
        | "ADMIN_MERCHANT_REQUEST"
        | "MESSAGE_RECEIVED";
    title: string;
    message: string;
    orderId?: string;
    restaurantName?: string;
    merchantId?: string;
    merchantName?: string;
    roomId?: string;
    senderId?: string;
    senderName?: string;
    read: boolean;
    createdAt: Date;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markOrderNotificationsAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    unreadCount: () => number;
    orderUnreadCount: () => number;
    initializeFromOrders: (orders: Array<{ orderId: string; status: string; restaurant?: { name?: string } }>) => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    read: false,
                    createdAt: new Date(),
                };

                set((state) => {
                    // Check if notification already exists (prevent duplicates)
                    const exists = state.notifications.some(
                        (n) => n.orderId === newNotification.orderId && n.type === newNotification.type
                    );
                    if (exists) {
                        return state;
                    }

                    return {
                        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                    };
                });

                // Play notification sound using Web Audio API (no file needed)
                if (typeof window !== "undefined" && "AudioContext" in window) {
                    try {
                        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                        if (!AudioCtx) return;

                        const audioContext = new AudioCtx();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();

                        oscillator.type = "sine";
                        oscillator.frequency.value = 880; // A5 note
                        gainNode.gain.value = 0.1; // Lower volume for notifications

                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);

                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.15);

                        // Clean up audio context after sound plays
                        setTimeout(() => {
                            audioContext.close().catch(() => {
                                // Ignore cleanup errors
                            });
                        }, 200);
                    } catch {
                        // Ignore audio errors (may be blocked by browser policy)
                    }
                }
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((notif) =>
                        notif.id === id ? { ...notif, read: true } : notif
                    ),
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
                }));
            },

            markOrderNotificationsAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((notif) =>
                        !notif.read && (notif.type === "ORDER_ACCEPTED" || notif.type === "ORDER_REJECTED")
                            ? { ...notif, read: true }
                            : notif
                    ),
                }));
            },

            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((notif) => notif.id !== id),
                }));
            },

            clearAll: () => {
                set({ notifications: [] });
            },

            unreadCount: () => {
                return get().notifications.filter((notif) => !notif.read).length;
            },

            orderUnreadCount: () => {
                return get().notifications.filter(
                    (notif) => !notif.read && (notif.type === "ORDER_ACCEPTED" || notif.type === "ORDER_REJECTED")
                ).length;
            },

            // Initialize notifications from order history
            initializeFromOrders: (orders) => {
                const existingNotifications = get().notifications;
                const existingOrderIds = new Set(
                    existingNotifications.map((n) => `${n.orderId}-${n.type}`)
                );

                const newNotifications: Notification[] = [];

                orders.forEach((order) => {
                    // Create notification for confirmed orders
                    if (order.status === "confirmed" || order.status === "preparing") {
                        const key = `${order.orderId}-ORDER_ACCEPTED`;
                        if (!existingOrderIds.has(key)) {
                            newNotifications.push({
                                id: `notif-init-${order.orderId}-accepted`,
                                type: "ORDER_ACCEPTED",
                                title: "Order Confirmed",
                                message: `Order ${order.orderId} has been confirmed and is being prepared.`,
                                orderId: order.orderId,
                                restaurantName: order.restaurant?.name,
                                read: false,
                                createdAt: new Date(),
                            });
                        }
                    }

                    // Create notification for cancelled orders
                    if (order.status === "cancelled") {
                        const key = `${order.orderId}-ORDER_REJECTED`;
                        if (!existingOrderIds.has(key)) {
                            newNotifications.push({
                                id: `notif-init-${order.orderId}-rejected`,
                                type: "ORDER_REJECTED",
                                title: "Order Cancelled",
                                message: `Order ${order.orderId} has been cancelled.`,
                                orderId: order.orderId,
                                restaurantName: order.restaurant?.name,
                                read: false,
                                createdAt: new Date(),
                            });
                        }
                    }

                    // Create notification for completed orders
                    if (order.status === "completed") {
                        const key = `${order.orderId}-ORDER_COMPLETED`;
                        if (!existingOrderIds.has(key)) {
                            newNotifications.push({
                                id: `notif-init-${order.orderId}-completed`,
                                type: "ORDER_COMPLETED",
                            title: "Order Completed",
                            message: `Order ${order.orderId} has been delivered successfully.`,
                                orderId: order.orderId,
                                restaurantName: order.restaurant?.name,
                                read: false,
                                createdAt: new Date(),
                            });
                        }
                    }
                });

                if (newNotifications.length > 0) {
                    set((state) => ({
                        notifications: [...newNotifications, ...state.notifications].slice(0, 50),
                    }));
                }
            },
        }),
        {
            name: "notification-storage",
            // Custom serialization for Date objects
            partialize: (state) => ({
                notifications: state.notifications.map((n) => ({
                    ...n,
                    createdAt: n.createdAt.toISOString(),
                })),
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.notifications = state.notifications.map((n: Notification & { createdAt: string | Date }) => ({
                        ...n,
                        createdAt: typeof n.createdAt === "string" ? new Date(n.createdAt) : n.createdAt,
                    }));
                }
            },
        }
    )
);
