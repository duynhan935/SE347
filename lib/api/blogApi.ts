import {
        Blog,
        BlogCreateRequest,
        BlogDetailResponse,
        BlogLikeResponse,
        BlogListResponse,
        BlogUpdateRequest,
        CommentCreateRequest,
        CommentListResponse,
        CommentReplyRequest,
        CommentResponse,
        CommentUpdateRequest,
} from "@/types/blog.type";
import api from "../axios";

export const blogApi = {
        // Get all blogs with filters
        getBlogs: async (params?: {
                page?: number;
                limit?: number;
                category?: string;
                search?: string;
        }): Promise<BlogListResponse> => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.category) queryParams.append("category", params.category);
                if (params?.search) queryParams.append("search", params.search);

                const response = await api.get<BlogListResponse>(
                        `/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
                );
                return response.data;
        },

        // Get popular blogs
        getPopularBlogs: async (limit: number = 5): Promise<{ success: boolean; data: Blog[] }> => {
                const response = await api.get<{ success: boolean; data: Blog[] }>(`/blogs/popular?limit=${limit}`);
                return response.data;
        },

        // Get blog by ID
        getBlogById: async (blogId: string): Promise<BlogDetailResponse> => {
                const response = await api.get<BlogDetailResponse>(`/blogs/${blogId}`);
                return response.data;
        },

        // Get blog by slug (increments view count)
        getBlogBySlug: async (slug: string): Promise<BlogDetailResponse> => {
                const response = await api.get<BlogDetailResponse>(`/blogs/slug/${slug}`);
                return response.data;
        },

        // Create blog
        createBlog: async (blogData: BlogCreateRequest): Promise<BlogDetailResponse> => {
                const formData = new FormData();
                formData.append("title", blogData.title);
                formData.append("content", blogData.content);
                if (blogData.excerpt) formData.append("excerpt", blogData.excerpt);
                formData.append("author[userId]", blogData.author.userId);
                formData.append("author[name]", blogData.author.name);
                if (blogData.author.avatar) formData.append("author[avatar]", blogData.author.avatar);
                if (blogData.featuredImage) formData.append("featuredImage", blogData.featuredImage);
                if (blogData.category) formData.append("category", blogData.category);
                if (blogData.tags && blogData.tags.length > 0) {
                        formData.append("tags", blogData.tags.join(","));
                }
                if (blogData.status) formData.append("status", blogData.status);
                if (blogData.seo) {
                        if (blogData.seo.metaTitle) formData.append("seo[metaTitle]", blogData.seo.metaTitle);
                        if (blogData.seo.metaDescription)
                                formData.append("seo[metaDescription]", blogData.seo.metaDescription);
                        if (blogData.seo.keywords && blogData.seo.keywords.length > 0) {
                                formData.append("seo[keywords]", blogData.seo.keywords.join(","));
                        }
                }

                const response = await api.post<BlogDetailResponse>("/blogs", formData, {
                        headers: {
                                "Content-Type": "multipart/form-data",
                        },
                });
                return response.data;
        },

        // Update blog
        updateBlog: async (blogId: string, blogData: BlogUpdateRequest): Promise<BlogDetailResponse> => {
                const formData = new FormData();
                if (blogData.title) formData.append("title", blogData.title);
                if (blogData.content) formData.append("content", blogData.content);
                if (blogData.excerpt) formData.append("excerpt", blogData.excerpt);
                if (blogData.featuredImage) formData.append("featuredImage", blogData.featuredImage);
                if (blogData.category) formData.append("category", blogData.category);
                if (blogData.tags && blogData.tags.length > 0) {
                        formData.append("tags", blogData.tags.join(","));
                }
                if (blogData.status) formData.append("status", blogData.status);
                if (blogData.userId) formData.append("userId", blogData.userId);
                if (blogData.seo) {
                        if (blogData.seo.metaTitle) formData.append("seo[metaTitle]", blogData.seo.metaTitle);
                        if (blogData.seo.metaDescription)
                                formData.append("seo[metaDescription]", blogData.seo.metaDescription);
                        if (blogData.seo.keywords && blogData.seo.keywords.length > 0) {
                                formData.append("seo[keywords]", blogData.seo.keywords.join(","));
                        }
                }

                const response = await api.put<BlogDetailResponse>(`/blogs/${blogId}`, formData, {
                        headers: {
                                "Content-Type": "multipart/form-data",
                        },
                });
                return response.data;
        },

        // Delete blog
        deleteBlog: async (blogId: string): Promise<{ success: boolean; message: string }> => {
                const response = await api.delete<{ success: boolean; message: string }>(`/blogs/${blogId}`);
                return response.data;
        },

        // Toggle like blog
        toggleLike: async (blogId: string, userId?: string): Promise<BlogLikeResponse> => {
                const body: { userId?: string } = {};
                if (userId) body.userId = userId;

                const response = await api.post<BlogLikeResponse>(`/blogs/${blogId}/like`, body);
                return response.data;
        },

        // Comments API
        // Get comments for a blog
        getComments: async (
                blogId: string,
                params?: { page?: number; limit?: number }
        ): Promise<CommentListResponse> => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());

                const response = await api.get<CommentListResponse>(
                        `/blogs/${blogId}/comments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
                );
                return response.data;
        },

        // Create comment
        createComment: async (blogId: string, commentData: CommentCreateRequest): Promise<CommentResponse> => {
                const formData = new FormData();
                formData.append("content", commentData.content);
                formData.append("author[userId]", commentData.author.userId);
                formData.append("author[name]", commentData.author.name);
                if (commentData.author.avatar) formData.append("author[avatar]", commentData.author.avatar);
                if (commentData.images && commentData.images.length > 0) {
                        commentData.images.forEach((image) => {
                                formData.append("images", image);
                        });
                }

                const response = await api.post<CommentResponse>(`/blogs/${blogId}/comments`, formData, {
                        headers: {
                                "Content-Type": "multipart/form-data",
                        },
                });
                return response.data;
        },

        // Reply to comment
        replyComment: async (
                blogId: string,
                commentId: string,
                replyData: CommentReplyRequest
        ): Promise<CommentResponse> => {
                const formData = new FormData();
                formData.append("content", replyData.content);
                formData.append("author[userId]", replyData.author.userId);
                formData.append("author[name]", replyData.author.name);
                if (replyData.author.avatar) formData.append("author[avatar]", replyData.author.avatar);
                if (replyData.images && replyData.images.length > 0) {
                        replyData.images.forEach((image) => {
                                formData.append("images", image);
                        });
                }

                const response = await api.post<CommentResponse>(
                        `/blogs/${blogId}/comments/${commentId}/reply`,
                        formData,
                        {
                                headers: {
                                        "Content-Type": "multipart/form-data",
                                },
                        }
                );
                return response.data;
        },

        // Get replies for a comment
        getReplies: async (
                blogId: string,
                commentId: string,
                params?: { page?: number; limit?: number }
        ): Promise<CommentListResponse> => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());

                const response = await api.get<CommentListResponse>(
                        `/blogs/${blogId}/comments/${commentId}/replies${
                                queryParams.toString() ? `?${queryParams.toString()}` : ""
                        }`
                );
                return response.data;
        },

        // Like comment
        likeComment: async (blogId: string, commentId: string): Promise<CommentResponse> => {
                const response = await api.post<CommentResponse>(`/blogs/${blogId}/comments/${commentId}/like`);
                return response.data;
        },

        // Update comment
        updateComment: async (
                blogId: string,
                commentId: string,
                updateData: CommentUpdateRequest
        ): Promise<CommentResponse> => {
                const formData = new FormData();
                if (updateData.content) formData.append("content", updateData.content);
                if (updateData.images && updateData.images.length > 0) {
                        updateData.images.forEach((image) => {
                                formData.append("images", image);
                        });
                }

                const response = await api.put<CommentResponse>(`/blogs/${blogId}/comments/${commentId}`, formData, {
                        headers: {
                                "Content-Type": "multipart/form-data",
                        },
                });
                return response.data;
        },

        // Delete comment
        deleteComment: async (blogId: string, commentId: string): Promise<{ success: boolean; message: string }> => {
                const response = await api.delete<{ success: boolean; message: string }>(
                        `/blogs/${blogId}/comments/${commentId}`
                );
                return response.data;
        },
};
