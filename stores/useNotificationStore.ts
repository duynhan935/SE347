"use client";

import { create } from "zustand";

export interface Notification {
        id: string;
        type: "ORDER_ACCEPTED" | "ORDER_REJECTED" | "ORDER_CONFIRMED" | "ORDER_COMPLETED" | "NEW_ORDER";
        title: string;
        message: string;
        orderId?: string;
        restaurantName?: string;
        read: boolean;
        createdAt: Date;
}

interface NotificationStore {
        notifications: Notification[];
        addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
        markAsRead: (id: string) => void;
        markAllAsRead: () => void;
        markOrderNotificationsAsRead: () => void; // Mark only order notifications as read
        removeNotification: (id: string) => void;
        clearAll: () => void;
        unreadCount: () => number;
        orderUnreadCount: () => number; // Count unread order notifications
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
        notifications: [],

        addNotification: (notification) => {
                const newNotification: Notification = {
                        ...notification,
                        id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                        read: false,
                        createdAt: new Date(),
                };

                set((state) => ({
                        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                }));

                // Play sound if available
                if (typeof window !== "undefined" && "Audio" in window) {
                        try {
                                const audio = new Audio("/sounds/notification.mp3");
                                audio.volume = 0.5;
                                audio.play().catch(() => {
                                        // Ignore audio play errors
                                });
                        } catch {
                                // Ignore audio errors
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
}));
