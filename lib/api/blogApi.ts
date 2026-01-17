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
                authorId?: string;
                status?: string;
        }): Promise<BlogListResponse> => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.category) queryParams.append("category", params.category);
                if (params?.search) queryParams.append("search", params.search);
                if (params?.authorId) queryParams.append("authorId", params.authorId);
                if (params?.status) queryParams.append("status", params.status);

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
                // Always use FormData because backend route uses multer middleware
                const formData = new FormData();
                
                // Always append required fields (even if empty, to ensure req.body is not empty)
                formData.append("title", blogData.title || "");
                formData.append("content", blogData.content || "");
                formData.append("author[userId]", blogData.author.userId || "");
                formData.append("author[name]", blogData.author.name || "");
                
                // Optional fields
                if (blogData.excerpt) {
                        formData.append("excerpt", blogData.excerpt);
                }
                if (blogData.author.avatar) {
                        formData.append("author[avatar]", blogData.author.avatar);
                }
                if (blogData.featuredImage) {
                        formData.append("featuredImage", blogData.featuredImage);
                }
                // Append multiple images
                if (blogData.images && blogData.images.length > 0) {
                        blogData.images.forEach((image) => {
                                formData.append("images", image);
                        });
                }
                if (blogData.category) {
                        formData.append("category", blogData.category);
                }
                if (blogData.tags && blogData.tags.length > 0) {
                        formData.append("tags", blogData.tags.join(","));
                }
                if (blogData.status) {
                        formData.append("status", blogData.status);
                }
                if (blogData.seo) {
                        if (blogData.seo.metaTitle) {
                                formData.append("seo[metaTitle]", blogData.seo.metaTitle);
                        }
                        if (blogData.seo.metaDescription) {
                                formData.append("seo[metaDescription]", blogData.seo.metaDescription);
                        }
                        if (blogData.seo.keywords && blogData.seo.keywords.length > 0) {
                                formData.append("seo[keywords]", blogData.seo.keywords.join(","));
                        }
                }

                // Debug: Log FormData entries
                console.log("FormData entries:");
                for (const [key, value] of formData.entries()) {
                        console.log(key, ":", value instanceof File ? `File: ${value.name}` : value);
                }

                // DON'T set Content-Type header manually - let browser set it with boundary automatically
                const response = await api.post<BlogDetailResponse>("/blogs", formData);
                return response.data;
        },

        // Update blog
        updateBlog: async (blogId: string, blogData: BlogUpdateRequest): Promise<BlogDetailResponse> => {
                // If there's no featuredImage and no images, send as JSON (backend supports both)
                // If there's featuredImage or images, use FormData
                if (!blogData.featuredImage && (!blogData.images || blogData.images.length === 0)) {
                        // Send as JSON when no file
                        const jsonData: Record<string, unknown> = {};

                        if (blogData.title) jsonData.title = blogData.title;
                        if (blogData.content) jsonData.content = blogData.content;
                        if (blogData.excerpt) jsonData.excerpt = blogData.excerpt;
                        if (blogData.category) jsonData.category = blogData.category;
                        if (blogData.tags && blogData.tags.length > 0) jsonData.tags = blogData.tags;
                        if (blogData.status) jsonData.status = blogData.status;
                        if (blogData.userId) jsonData.userId = blogData.userId;
                        if (blogData.seo) jsonData.seo = blogData.seo;

                        const response = await api.put<BlogDetailResponse>(`/blogs/${blogId}`, jsonData, {
                                headers: {
                                        "Content-Type": "application/json",
                                },
                        });
                        return response.data;
                } else {
                        // Use FormData when there's a file
                        const formData = new FormData();
                        if (blogData.title) formData.append("title", blogData.title);
                        if (blogData.content) formData.append("content", blogData.content);
                        if (blogData.excerpt) formData.append("excerpt", blogData.excerpt);
                        if (blogData.featuredImage) {
                                formData.append("featuredImage", blogData.featuredImage);
                        }
                        // Append multiple images
                        if (blogData.images && blogData.images.length > 0) {
                                blogData.images.forEach((image) => {
                                        formData.append("images", image);
                                });
                        }
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

                        // DON'T set Content-Type header manually - let browser set it with boundary automatically
                        const response = await api.put<BlogDetailResponse>(`/blogs/${blogId}`, formData);
                        return response.data;
                }
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

        // Upload image for editor
        uploadEditorImage: async (imageFile: File): Promise<{ success: boolean; data: { url: string; publicId: string } }> => {
                const formData = new FormData();
                formData.append("image", imageFile);

                const response = await api.post<{ success: boolean; data: { url: string; publicId: string } }>(
                        "/blogs/upload/editor-image",
                        formData
                );
                return response.data;
        },
};
