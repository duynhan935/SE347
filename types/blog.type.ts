export type BlogCategory = "recipe" | "review" | "tips" | "news" | "health" | "other";
export type BlogStatus = "draft" | "published" | "archived";

export interface BlogAuthor {
        userId: string;
        name: string;
        avatar?: string;
}

export interface BlogFeaturedImage {
        url?: string;
        publicId?: string;
        alt?: string;
}

export interface BlogImage {
        url: string;
        publicId?: string;
        alt?: string;
}

export interface BlogSEO {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
}

export interface Blog {
        _id: string;
        title: string;
        slug: string;
        content: string; // Markdown content
        contentHtml?: string; // Parsed HTML from backend (optional)
        excerpt?: string;
        author: BlogAuthor;
        featuredImage?: BlogFeaturedImage;
        images?: BlogImage[];
        category: BlogCategory;
        tags?: string[];
        status: BlogStatus;
        readTime: number;
        views: number;
        likes: string[]; // userIds
        likesCount?: number;
        commentsCount?: number;
        publishedAt?: string;
        createdAt: string;
        updatedAt: string;
        seo?: BlogSEO;
}

export interface BlogCreateRequest {
        title: string;
        content: string;
        excerpt?: string;
        author: BlogAuthor;
        featuredImage?: File;
        images?: File[];
        category?: BlogCategory;
        tags?: string[];
        status?: BlogStatus;
        seo?: BlogSEO;
}

export interface BlogUpdateRequest {
        title?: string;
        content?: string;
        excerpt?: string;
        featuredImage?: File;
        images?: File[];
        category?: BlogCategory;
        tags?: string[];
        status?: BlogStatus;
        seo?: BlogSEO;
        userId?: string;
}

export interface BlogListResponse {
        success: boolean;
        message: string;
        data: Blog[];
        pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
        };
}

export interface BlogDetailResponse {
        success: boolean;
        message: string;
        data: Blog;
}

export interface BlogLikeResponse {
        success: boolean;
        message: string;
        likesCount: number;
        liked: boolean;
}

export interface CommentImage {
        url: string;
        publicId: string;
        width?: number;
        height?: number;
        format?: string;
}

export interface CommentAuthor {
        userId: string;
        name: string;
        avatar?: string;
}

export interface Comment {
        _id: string;
        blogId: string;
        parentId?: string;
        path: string;
        ancestors?: string[];
        author: CommentAuthor;
        content: string;
        images?: CommentImage[];
        likes: string[]; // userIds
        likesCount?: number;
        isDeleted?: boolean;
        createdAt: string;
        updatedAt: string;
}

export interface CommentCreateRequest {
        content: string;
        author: CommentAuthor;
        images?: File[];
}

export interface CommentReplyRequest {
        content: string;
        author: CommentAuthor;
        images?: File[];
}

export interface CommentUpdateRequest {
        content?: string;
        images?: File[];
}

export interface CommentListResponse {
        success: boolean;
        data: Comment[];
        pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
        };
}

export interface CommentResponse {
        success: boolean;
        comment: Comment;
        message?: string;
        likesCount?: number;
        liked?: boolean;
}
