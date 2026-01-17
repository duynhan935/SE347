"use client";

import BlogComments from "@/components/client/blog/BlogComments";
import RelatedBlogs from "@/components/client/blog/RelatedBlogs";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Blog, BlogCategory } from "@/types/blog.type";
import { ArrowLeft, Heart, MessageCircle, Share2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CATEGORIES: Record<BlogCategory, string> = {
        recipe: "Recipe",
        review: "Review",
        tips: "Tips",
        news: "News",
        health: "Health",
        other: "Other",
};

export default function BlogPostPage() {
        const params = useParams();
        const slug = params?.slug as string;
        const { user, isAuthenticated } = useAuthStore();

        const [blog, setBlog] = useState<Blog | null>(null);
        const [loading, setLoading] = useState(true);
        const [liked, setLiked] = useState(false);
        const [likesCount, setLikesCount] = useState(0);
        const [allTags, setAllTags] = useState<string[]>([]);

        useEffect(() => {
                if (slug) {
                        fetchBlog();
                        fetchAllTags();
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
                        toast.error("Failed to load blog post");
                } finally {
                        setLoading(false);
                }
        };

        const fetchAllTags = async () => {
                try {
                        // Fetch recent blogs to get tags
                        const response = await blogApi.getBlogs({ page: 1, limit: 50 });
                        const tags = new Set<string>();
                        response.data.forEach((b) => {
                                if (b.tags && b.tags.length > 0) {
                                        b.tags.forEach((tag) => tags.add(tag));
                                }
                        });
                        setAllTags(Array.from(tags).slice(0, 20)); // Limit to 20 tags
                } catch (error) {
                        console.error("Failed to fetch tags:", error);
                }
        };

        const handleLike = async () => {
                if (!isAuthenticated) {
                        toast.error("Please login to like this post");
                        return;
                }

                if (!blog) return;

                // Optimistic update: update UI immediately for better UX
                const previousLiked = liked;
                const previousLikesCount = likesCount;
                const newLiked = !liked;
                const newLikesCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

                // Update UI immediately (Optimistic Update)
                setLiked(newLiked);
                setLikesCount(newLikesCount);

                // Show toast with new state
                toast.success(newLiked ? "Liked post" : "Unliked post");

                try {
                        const response = await blogApi.toggleLike(blog._id);
                        // Sync with server response (ensure we have valid data)
                        if (response && typeof response.liked === 'boolean' && typeof response.likesCount === 'number') {
                                setLiked(response.liked);
                                setLikesCount(response.likesCount);
                        }
                } catch (error) {
                        console.error("Failed to toggle like:", error);
                        // Revert on error
                        setLiked(previousLiked);
                        setLikesCount(previousLikesCount);
                        toast.error("Failed to like post. Please try again.");
                }
        };

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                });
        };

        const handleShare = async () => {
                if (navigator.share && blog) {
                        try {
                                await navigator.share({
                                        title: blog.title,
                                        text: blog.excerpt || "",
                                        url: window.location.href,
                                });
                        } catch {
                                // User cancelled or error
                        }
                } else {
                        // Fallback: Copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                }
        };

        // Get popular tags (most used)
        const popularTags = useMemo(() => {
                return allTags.slice(0, 10);
        }, [allTags]);

        if (loading) {
                return (
                        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                                <div className="text-center">
                                        <div 
                                                className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#EE4D2D]"
                                        ></div>
                                        <p className="mt-6 text-gray-600 text-lg">Loading...</p>
                                </div>
                        </div>
                );
        }

        if (!blog) {
                return (
                        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                                <div className="text-center">
                                        <p className="text-gray-600 mb-4 text-lg">Post not found</p>
                                        <Link 
                                                href="/blog" 
                                                className="inline-flex items-center gap-2 text-[#EE4D2D] hover:underline font-medium"
                                        >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back to list
                                        </Link>
                                </div>
                        </div>
                );
        }

        return (
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                        {/* Main Container - Grid 2 Columns */}
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        {/* Main Content - 8 Columns */}
                                        <article className="lg:col-span-8">
                                                {/* Article Container */}
                                                <div className="space-y-6">
                                                        {/* Compact Header Section */}
                                                        <header>
                                                                {/* Breadcrumb & Meta Row - Gộp 1 dòng */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                        {/* Left: Back Button */}
                                                                        <Link
                                                                                href="/blog"
                                                                                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#EE4D2D] transition-colors"
                                                                        >
                                                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                                                <span>Back</span>
                                                                        </Link>

                                                                        {/* Right: Category Badge */}
                                                                        {blog.category && (
                                                                                <span 
                                                                                        className="inline-block px-3 py-1 bg-[#EE4D2D] text-white text-xs font-semibold rounded-full shadow-sm"
                                                                                >
                                                                                        {CATEGORIES[blog.category] || blog.category}
                                                                                </span>
                                                                        )}
                                                                </div>

                                                                {/* Title - Compact Typography */}
                                                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                                                                        {blog.title}
                                                                </h1>

                                                                {/* Excerpt - Compact */}
                                                                {blog.excerpt && (
                                                                        <p className="text-lg text-gray-600 leading-relaxed mb-4 font-light">
                                                                                {blog.excerpt}
                                                                        </p>
                                                                )}

                                                                {/* Author & Meta Info - Single Line Horizontal */}
                                                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-0 pb-4 border-b border-gray-200">
                                                                        {/* Avatar - Small */}
                                                                        {blog.author?.avatar ? (
                                                                                <Image
                                                                                        src={blog.author.avatar}
                                                                                        alt={blog.author.name || "Author"}
                                                                                        width={32}
                                                                                        height={32}
                                                                                        className="rounded-full object-cover flex-shrink-0"
                                                                                />
                                                                        ) : (
                                                                                <div 
                                                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-[#EE4D2D] flex-shrink-0"
                                                                                >
                                                                                        {blog.author?.name?.charAt(0).toUpperCase() || "?"}
                                                                                </div>
                                                                        )}

                                                                        {/* Author Name */}
                                                                        <span className="font-medium text-gray-700">
                                                                                {blog.author?.name || "Author"}
                                                                        </span>

                                                                        {/* Separator */}
                                                                        <span className="text-gray-300">•</span>

                                                                        {/* Date */}
                                                                        {blog.publishedAt && (
                                                                                <>
                                                                                        <span>{formatDate(blog.publishedAt)}</span>
                                                                                        <span className="text-gray-300">•</span>
                                                                                </>
                                                                        )}

                                                                        {/* Read Time */}
                                                                        <span>{blog.readTime} min read</span>
                                                                </div>
                                                        </header>

                                                        {/* Hero Image - Wide Aspect Ratio */}
                                                        {blog.featuredImage?.url && (
                                                                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl mt-6">
                                                                        <Image
                                                                                src={blog.featuredImage.url}
                                                                                alt={blog.featuredImage.alt || blog.title}
                                                                                fill
                                                                                className="object-cover"
                                                                                priority
                                                                        />
                                                                </div>
                                                        )}

                                                        {/* Tags */}
                                                        {blog.tags && blog.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                        {blog.tags.map((tag, index) => (
                                                                                <span
                                                                                        key={index}
                                                                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors font-medium"
                                                                                >
                                                                                        #{tag}
                                                                                </span>
                                                                        ))}
                                                                </div>
                                                        )}

                                                        {/* Article Content - Typography Focused */}
                                                        <div className="prose prose-lg md:prose-xl max-w-none blog-content">
                                                                {blog.contentHtml ? (
                                                                        <div
                                                                                className="markdown-body"
                                                                                dangerouslySetInnerHTML={{
                                                                                        __html: blog.contentHtml,
                                                                                }}
                                                                        />
                                                                ) : (
                                                                        <div className="markdown-body">
                                                                                <ReactMarkdown
                                                                                        remarkPlugins={[remarkGfm]}
                                                                                >
                                                                                        {blog.content}
                                                                                </ReactMarkdown>
                                                                        </div>
                                                                )}
                                                        </div>

                                                        {/* Content Images Gallery */}
                                                        {blog.images && blog.images.length > 0 && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {blog.images.map((image, index) => (
                                                                                <div 
                                                                                        key={index} 
                                                                                        className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                                                                                >
                                                                                        <Image
                                                                                                src={image.url}
                                                                                                alt={image.alt || `Image ${index + 1}`}
                                                                                                fill
                                                                                                className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                                                        />
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        )}

                                                        {/* Engagement Bar - Clean & Modern */}
                                                        <div className="flex flex-wrap items-center gap-4 pt-6 pb-4 border-t border-gray-200 mt-6">
                                                                <button
                                                                        onClick={handleLike}
                                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border-2 active:scale-125 whitespace-nowrap min-w-fit ${
                                                                                liked
                                                                                        ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                                                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-red-300 hover:text-red-500"
                                                                        }`}
                                                                >
                                                                        <Heart
                                                                                className={`w-5 h-5 flex-shrink-0 transition-all ${
                                                                                        liked
                                                                                                ? "fill-current text-red-600"
                                                                                                : "text-gray-500"
                                                                                }`}
                                                                        />
                                                                        <span className="font-semibold whitespace-nowrap">{likesCount ?? 0}</span>
                                                                </button>
                                                                <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl border-2 border-gray-300 whitespace-nowrap min-w-fit">
                                                                        <MessageCircle className="w-5 h-5 flex-shrink-0" />
                                                                        <span className="font-semibold whitespace-nowrap">{blog.commentsCount || 0}</span>
                                                                </div>
                                                                <button 
                                                                        onClick={handleShare}
                                                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-all font-medium whitespace-nowrap min-w-fit"
                                                                >
                                                                        <Share2 className="w-5 h-5 flex-shrink-0" />
                                                                        <span className="font-semibold whitespace-nowrap">Share</span>
                                                                </button>
                                                        </div>

                                                        {/* Separator - Thin & Subtle */}
                                                        <hr className="border-gray-100 my-6" />

                                                        {/* Comments Section - Flat Style, Tight Spacing */}
                                                        <div id="comments" className="mt-2">
                                                                <BlogComments 
                                                                        blogId={blog._id} 
                                                                        onCommentAdded={() => {
                                                                                // Update comments count immediately
                                                                                setBlog((prev) => {
                                                                                        if (!prev) return prev;
                                                                                        return {
                                                                                                ...prev,
                                                                                                commentsCount: (prev.commentsCount || 0) + 1,
                                                                                        };
                                                                                });
                                                                        }}
                                                                />
                                                        </div>
                                                </div>
                                        </article>

                                        {/* Sidebar - 4 Columns - Sticky */}
                                        <aside className="lg:col-span-4">
                                                <div className="sticky top-24 space-y-8">
                                                        {/* Related Articles */}
                                                        <RelatedBlogs
                                                                currentBlogId={blog._id}
                                                                category={blog.category}
                                                        />

                                                        {/* Trending Tags */}
                                                        {popularTags.length > 0 && (
                                                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                                                        <div className="flex items-center gap-2 mb-6">
                                                                                <Tag className="w-5 h-5 text-[#EE4D2D]" />
                                                                                <h3 className="text-xl font-bold text-gray-900">Trending Tags</h3>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                                {popularTags.map((tag, index) => (
                                                                                        <Link
                                                                                                key={index}
                                                                                                href={`/blog?search=${encodeURIComponent(tag)}`}
                                                                                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#EE4D2D] hover:text-white transition-all font-medium"
                                                                                        >
                                                                                                #{tag}
                                                                                        </Link>
                                                                                ))}
                                                                        </div>
                                                                </div>
                                                        )}
                                                </div>
                                        </aside>
                                </div>
                        </div>
                </div>
        );
}
