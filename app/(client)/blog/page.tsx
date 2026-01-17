"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Blog, BlogCategory } from "@/types/blog.type";
import { ArrowRight, Calendar, Clock, Eye, FileText, Heart, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES: { value: BlogCategory | ""; label: string }[] = [
        { value: "", label: "All" },
        { value: "recipe", label: "Recipe" },
        { value: "review", label: "Review" },
        { value: "tips", label: "Tips" },
        { value: "news", label: "News" },
        { value: "health", label: "Health" },
        { value: "other", label: "Other" },
];

// Brand Orange Color
const BRAND_ORANGE = "#EE4D2D";

export default function BlogPage() {
        const { isAuthenticated } = useAuthStore();
        const [blogs, setBlogs] = useState<Blog[]>([]);
        const [loading, setLoading] = useState(true);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [category, setCategory] = useState<BlogCategory | "">("");
        const [search, setSearch] = useState("");
        const [searchInput, setSearchInput] = useState("");

        // Get featured blog (first blog with featured image or most viewed)
        const featuredBlog = useMemo(() => {
                if (blogs.length === 0) return null;
                const withImage = blogs.find(b => b.featuredImage?.url);
                return withImage || blogs[0];
        }, [blogs]);

        // Get regular blogs (excluding featured)
        const regularBlogs = useMemo(() => {
                if (!featuredBlog) return blogs;
                return blogs.filter(b => b._id !== featuredBlog._id);
        }, [blogs, featuredBlog]);

        const fetchBlogs = async () => {
                setLoading(true);
                try {
                        // Add timestamp to prevent caching issues
                        const response = await blogApi.getBlogs({
                                page,
                                limit: 12,
                                category: category || undefined,
                                search: search || undefined,
                        });
                        // Sort blogs by publishedAt or createdAt (newest first) to ensure latest blogs appear first
                        const sortedBlogs = [...(response.data || [])].sort((a, b) => {
                                const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
                                const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
                                return dateB - dateA; // Newest first
                        });
                        setBlogs(sortedBlogs);
                        setTotalPages(response.pagination.pages);
                } catch (error) {
                        console.error("Failed to fetch blogs:", error);
                        toast.error("Unable to load articles list");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchBlogs();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [page, category, search]);

        const handleSearch = () => {
                setSearch(searchInput);
                setPage(1);
        };

        const handleCategoryChange = (cat: BlogCategory | "") => {
                setCategory(cat);
                setPage(1);
        };

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                });
        };

        return (
                <div className="min-h-screen bg-gray-50">
                        <div className="custom-container py-8">
                                {/* Header */}
                                <div className="mb-8 flex items-center justify-between">
                                        <div>
                                                <h1 className="text-4xl font-bold text-gray-900 mb-2">Food Blog</h1>
                                                <p className="text-gray-600">
                                                        Discover great articles about food and life
                                                </p>
                                        </div>
                                        {isAuthenticated && (
                                                <div className="flex gap-3">
                                                        <Link
                                                                href="/blog/my-blogs"
                                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                        >
                                                                <FileText className="w-4 h-4" />
                                                                My Blogs
                                                        </Link>
                                                        <Link
                                                                href="/blog/create"
                                                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                        >
                                                                <Plus className="w-4 h-4" />
                                                                Create Article
                                                        </Link>
                                                </div>
                                        )}
                                </div>

                                {/* Search and Filter */}
                                <div className="mb-8 space-y-4">
                                        {/* Search Bar */}
                                        <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <input
                                                                type="text"
                                                                placeholder="Search articles..."
                                                                value={searchInput}
                                                                onChange={(e) => setSearchInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                                                style={{ "--tw-ring-color": BRAND_ORANGE } as React.CSSProperties}
                                                        />
                                                </div>
                                                <button
                                                        onClick={handleSearch}
                                                        className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                >
                                                        Search
                                                </button>
                                        </div>

                                        {/* Category Filter */}
                                        <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.map((cat) => (
                                                        <button
                                                                key={cat.value}
                                                                onClick={() => handleCategoryChange(cat.value)}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                                        category === cat.value
                                                                                ? "text-white shadow-md"
                                                                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                                }`}
                                                                style={category === cat.value ? { backgroundColor: BRAND_ORANGE } : undefined}
                                                        >
                                                                {cat.label}
                                                        </button>
                                                ))}
                                        </div>
                                </div>

                                {/* Loading State */}
                                {loading ? (
                                        <div className="text-center py-12">
                                                <div 
                                                        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                                                        style={{ borderBottomColor: BRAND_ORANGE }}
                                                ></div>
                                                <p className="mt-4 text-gray-600">Loading...</p>
                                        </div>
                                ) : blogs.length === 0 ? (
                                        <div className="text-center py-12">
                                                <p className="text-gray-600">No articles found</p>
                                        </div>
                                ) : (
                                        <>
                                                {/* Hero Section - Featured Post */}
                                                {featuredBlog && featuredBlog.featuredImage?.url && (
                                                        <div className="mb-12">
                                                                <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                                                                        <Image
                                                                                src={featuredBlog.featuredImage.url}
                                                                                alt={featuredBlog.featuredImage.alt || featuredBlog.title}
                                                                                fill
                                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                                priority
                                                                        />
                                                                        {/* Gradient Overlay */}
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                                                        
                                                                        {/* Content Overlay */}
                                                                        <div className="absolute inset-0 flex items-end p-8 md:p-12">
                                                                                <div className="max-w-3xl">
                                                                                        {/* Badge */}
                                                                                        <div className="mb-4">
                                                                                                <span 
                                                                                                        className="inline-block px-4 py-2 text-white text-sm font-semibold rounded-full backdrop-blur-sm"
                                                                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                                                                >
                                                                                                        ✨ Bài viết nổi bật tuần này
                                                                                                </span>
                                                                                        </div>
                                                                                        
                                                                                        {/* Category */}
                                                                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-4">
                                                                                                {CATEGORIES.find(c => c.value === featuredBlog.category)?.label || "Other"}
                                                                                        </span>

                                                                                        {/* Title */}
                                                                                        <Link href={`/blog/${featuredBlog.slug}`}>
                                                                                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 line-clamp-2 group-hover:opacity-90 transition-opacity">
                                                                                                        {featuredBlog.title}
                                                                                                </h2>
                                                                                        </Link>

                                                                                        {/* Excerpt */}
                                                                                        {featuredBlog.excerpt && (
                                                                                                <p className="text-white/90 text-lg mb-6 line-clamp-2">
                                                                                                        {featuredBlog.excerpt}
                                                                                                </p>
                                                                                        )}

                                                                                        {/* Meta Info */}
                                                                                        <div className="flex items-center gap-6 text-white/80 text-sm mb-6">
                                                                                                <div className="flex items-center gap-1">
                                                                                                        <Eye className="w-4 h-4" />
                                                                                                        <span>{featuredBlog.views}</span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1">
                                                                                                        <Clock className="w-4 h-4" />
                                                                                                        <span>{featuredBlog.readTime} min</span>
                                                                                                </div>
                                                                                                {featuredBlog.publishedAt && (
                                                                                                        <div className="flex items-center gap-1">
                                                                                                                <Calendar className="w-4 h-4" />
                                                                                                                <span>{formatDate(featuredBlog.publishedAt)}</span>
                                                                                                        </div>
                                                                                                )}
                                                                                        </div>

                                                                                        {/* CTA Button */}
                                                                                        <Link
                                                                                                href={`/blog/${featuredBlog.slug}`}
                                                                                                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:translate-x-1"
                                                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                                                        >
                                                                                                Đọc ngay
                                                                                                <ArrowRight className="w-5 h-5" />
                                                                                        </Link>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                )}

                                                {/* Regular Blog Grid */}
                                                {regularBlogs.length > 0 && (
                                                        <>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                                                        {regularBlogs.map((blog) => (
                                                                                <Link
                                                                                        key={blog._id}
                                                                                        href={`/blog/${blog.slug}`}
                                                                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col"
                                                                                >
                                                                                        {/* Thumbnail Image - 50% height */}
                                                                                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                                                                                                {blog.featuredImage?.url ? (
                                                                                                        <Image
                                                                                                                src={blog.featuredImage.url}
                                                                                                                alt={blog.featuredImage.alt || blog.title}
                                                                                                                fill
                                                                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                                        />
                                                                                                ) : (
                                                                                                        <div 
                                                                                                                className="w-full h-full flex items-center justify-center"
                                                                                                                style={{ backgroundColor: BRAND_ORANGE + "20" }}
                                                                                                        >
                                                                                                                <span className="text-4xl">🍽️</span>
                                                                                                        </div>
                                                                                                )}
                                                                                                {/* Category Badge on Image */}
                                                                                                <div className="absolute top-3 left-3">
                                                                                                        <span 
                                                                                                                className="px-3 py-1 text-white text-xs font-semibold rounded-full backdrop-blur-sm"
                                                                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                                                                        >
                                                                                                                {CATEGORIES.find(c => c.value === blog.category)?.label || "Other"}
                                                                                                        </span>
                                                                                                </div>
                                                                                        </div>

                                                                                        {/* Content */}
                                                                                        <div className="p-6 flex-1 flex flex-col">
                                                                                                {/* Title */}
                                                                                                <h3 
                                                                                                        className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity"
                                                                                                        style={{ 
                                                                                                                color: "inherit",
                                                                                                        }}
                                                                                                >
                                                                                                        {blog.title}
                                                                                                </h3>

                                                                                                {/* Excerpt */}
                                                                                                {blog.excerpt && (
                                                                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                                                                                                {blog.excerpt}
                                                                                                        </p>
                                                                                                )}

                                                                                                {/* Meta Info */}
                                                                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Eye className="w-4 h-4" />
                                                                                                                        <span>{blog.views}</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Heart className="w-4 h-4" />
                                                                                                                        <span>{blog.likesCount || blog.likes?.length || 0}</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Clock className="w-4 h-4" />
                                                                                                                        <span>{blog.readTime} min</span>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>

                                                                                                {/* Author and Date */}
                                                                                                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                                {blog.author?.avatar ? (
                                                                                                                        <Image
                                                                                                                                src={blog.author.avatar}
                                                                                                                                alt={blog.author?.name || "Author"}
                                                                                                                                width={32}
                                                                                                                                height={32}
                                                                                                                                className="rounded-full"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <div 
                                                                                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                                                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                                                                                        >
                                                                                                                                {blog.author?.name?.charAt(0).toUpperCase() || "?"}
                                                                                                                        </div>
                                                                                                                )}
                                                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                                                        {blog.author?.name || "Unknown Author"}
                                                                                                                </span>
                                                                                                        </div>
                                                                                                        {blog.publishedAt && (
                                                                                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                                                                        <Calendar className="w-3 h-3" />
                                                                                                                        <span className="hidden sm:inline">
                                                                                                                                {formatDate(blog.publishedAt)}
                                                                                                                        </span>
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        </div>
                                                                                </Link>
                                                                        ))}
                                                                </div>

                                                                {/* Pagination */}
                                                                {totalPages > 1 && (
                                                                        <Pagination
                                                                                currentPage={page}
                                                                                totalPages={totalPages}
                                                                                onPageChange={(newPage) => {
                                                                                        setPage(newPage);
                                                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                                                }}
                                                                                showInfo={true}
                                                                                scrollToTop={true}
                                                                                className="mt-8"
                                                                        />
                                                                )}
                                                        </>
                                                )}
                                        </>
                                )}
                        </div>
                </div>
        );
}
