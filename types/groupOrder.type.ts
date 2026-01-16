export enum GroupOrderStatus {
    OPEN = "open",
    LOCKED = "locked",
    ORDERED = "ordered",
    CANCELLED = "cancelled",
}

export type GroupOrderPaymentMethod = "cash" | "card" | "wallet" | "split";

export type ParticipantPaymentStatus = "pending" | "paid" | "completed" | "failed";

export interface GroupOrderParticipant {
    userId: string;
    userName: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        customizations?: string;
    }[];
    totalAmount: number;
    paymentStatus: ParticipantPaymentStatus;
    paidAmount: number;
    joinedAt: string;
}

export interface GroupOrder {
    groupOrderId: string;
    shareToken: string;
    creatorId: string;
    creatorName: string;
    restaurantId: string;
    restaurantName: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    participants: GroupOrderParticipant[];
    totalAmount: number;
    totalPaidAmount: number;
    deliveryFee: number;
    tax: number;
    finalAmount: number;
    paymentMethod: GroupOrderPaymentMethod;
    allowIndividualPayment: boolean;
    status: GroupOrderStatus;
    groupNote?: string;
    expiresAt: string;
    finalOrderId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGroupOrderRequest {
    restaurantId: string;
    restaurantName: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    groupNote?: string;
    expiresInHours?: number;
    paymentMethod?: GroupOrderPaymentMethod;
    allowIndividualPayment?: boolean;
}

export interface JoinGroupOrderRequest {
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        customizations?: string;
    }[];
}

export interface GroupOrderPaymentRequest {
    paymentMethod: "cash" | "card" | "wallet";
}

