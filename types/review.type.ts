export interface Review {
        id: string;
        userId: string;
        reviewId: string;
        reviewType: string;
        title: string;
        content?: string | null;
        rating: number;
        createdAt: string | null;
}
