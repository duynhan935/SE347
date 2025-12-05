"use client";

import BlogComments from "@/components/client/blog/BlogComments";
import RelatedBlogs from "@/components/client/blog/RelatedBlogs";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Blog } from "@/types/blog.type";
import { ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function BlogPostPage() {
        const params = useParams();
        const slug = params?.slug as string;
        const { user, isAuthenticated } = useAuthStore();

        const [blog, setBlog] = useState<Blog | null>(null);
        const [loading, setLoading] = useState(true);
        const [liked, setLiked] = useState(false);
        const [likesCount, setLikesCount] = useState(0);

        useEffect(() => {
                if (slug) {
                        fetchBlog();
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [slug]);

        const fetchBlog = async () => {
                setLoading(true);
                try {
                        const response = await blogApi.getBlogBySlug(slug);
                        setBlog(response.data);
                        setLikesCount(response.data.likesCount || response.data.likes?.length || 0);
                        if (isAuthenticated && user) {
                                setLiked(response.data.likes?.includes(user.id) || false);
                        }
                } catch (error) {
                        console.error("Failed to fetch blog:", error);
                        toast.error("Không thể tải bài viết");
                } finally {
                        setLoading(false);
                }
        };

        const handleLike = async () => {
                if (!isAuthenticated) {
                        toast.error("Vui lòng đăng nhập để thích bài viết");
                        return;
                }

                try {
                        const response = await blogApi.toggleLike(blog!._id);
                        setLiked(response.liked);
                        setLikesCount(response.likesCount);
                        toast.success(response.liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết");
                } catch (error) {
                        console.error("Failed to toggle like:", error);
                        toast.error("Không thể thích bài viết");
                }
        };

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                });
        };

        if (loading) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                                        <p className="mt-4 text-gray-600">Đang tải...</p>
                                </div>
                        </div>
                );
        }

        if (!blog) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center">
                                        <p className="text-gray-600 mb-4">Không tìm thấy bài viết</p>
                                        <Link href="/blog" className="text-brand-purple hover:underline">
                                                Quay lại danh sách blog
                                        </Link>
                                </div>
                        </div>
                );
        }

        return (
                <div className="min-h-screen bg-gray-50">
                        <div className="custom-container py-8">
                                {/* Back Button */}
                                <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-purple mb-6 transition-colors"
                                >
                                        <ArrowLeft className="w-5 h-5" />
                                        <span>Quay lại danh sách blog</span>
                                </Link>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Main Content */}
                                        <div className="lg:col-span-8">
                                                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                                                        {/* Featured Image */}
                                                        {blog.featuredImage?.url && (
                                                                <div className="relative w-full h-96 overflow-hidden">
                                                                        <Image
                                                                                src={blog.featuredImage.url}
                                                                                alt={
                                                                                        blog.featuredImage.alt ||
                                                                                        blog.title
                                                                                }
                                                                                fill
                                                                                className="object-cover"
                                                                        />
                                                                </div>
                                                        )}

                                                        {/* Content */}
                                                        <div className="p-8">
                                                                {/* Title */}
                                                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                                                        {blog.title}
                                                                </h1>

                                                                {/* Meta Info */}
                                                                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                                                        <div className="flex items-center gap-2">
                                                                                {blog.author.avatar ? (
                                                                                        <Image
                                                                                                src={blog.author.avatar}
                                                                                                alt={blog.author.name}
                                                                                                width={40}
                                                                                                height={40}
                                                                                                className="rounded-full"
                                                                                        />
                                                                                ) : (
                                                                                        <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-semibold">
                                                                                                {blog.author.name
                                                                                                        .charAt(0)
                                                                                                        .toUpperCase()}
                                                                                        </div>
                                                                                )}
                                                                                <span className="font-medium text-gray-700">
                                                                                        {blog.author.name}
                                                                                </span>
                                                                        </div>
                                                                        {blog.publishedAt && (
                                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                                        <Calendar className="w-4 h-4" />
                                                                                        <span>
                                                                                                {formatDate(
                                                                                                        blog.publishedAt
                                                                                                )}
                                                                                        </span>
                                                                                </div>
                                                                        )}
                                                                        <div className="flex items-center gap-1 text-gray-500">
                                                                                <Clock className="w-4 h-4" />
                                                                                <span>{blog.readTime} phút đọc</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-gray-500">
                                                                                <Eye className="w-4 h-4" />
                                                                                <span>{blog.views} lượt xem</span>
                                                                        </div>
                                                                </div>

                                                                {/* Tags */}
                                                                {blog.tags && blog.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mb-6">
                                                                                {blog.tags.map((tag, index) => (
                                                                                        <span
                                                                                                key={index}
                                                                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                                                        >
                                                                                                #{tag}
                                                                                        </span>
                                                                                ))}
                                                                        </div>
                                                                )}

                                                                {/* Content */}
                                                                <div
                                                                        className="prose prose-lg max-w-none mb-8"
                                                                        dangerouslySetInnerHTML={{
                                                                                __html: blog.content,
                                                                        }}
                                                                />

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                                                        <button
                                                                                onClick={handleLike}
                                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                                                                        liked
                                                                                                ? "bg-red-100 text-red-600"
                                                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                                }`}
                                                                        >
                                                                                <Heart
                                                                                        className={`w-5 h-5 ${
                                                                                                liked
                                                                                                        ? "fill-current"
                                                                                                        : ""
                                                                                        }`}
                                                                                />
                                                                                <span>{likesCount}</span>
                                                                        </button>
                                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                                                                                <MessageCircle className="w-5 h-5" />
                                                                                <span>{blog.commentsCount || 0}</span>
                                                                        </div>
                                                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                                                <Share2 className="w-5 h-5" />
                                                                                <span>Chia sẻ</span>
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </article>

                                                {/* Comments Section */}
                                                <div className="mt-8">
                                                        <BlogComments blogId={blog._id} />
                                                </div>
                                        </div>

                                        {/* Sidebar */}
                                        <div className="lg:col-span-4">
                                                <div className="sticky top-8 space-y-6">
                                                        {/* Related Blogs */}
                                                        <RelatedBlogs
                                                                currentBlogId={blog._id}
                                                                category={blog.category}
                                                        />
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
