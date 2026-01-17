"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Blog, BlogCategory } from "@/types/blog.type";
import { ArrowRight, Calendar, Clock, Eye, FileText, Heart, Plus, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES: { value: BlogCategory | ""; label: string; icon: string }[] = [
        { value: "", label: "All", icon: "📚" },
        { value: "recipe", label: "Recipe", icon: "👨‍🍳" },
        { value: "review", label: "Review", icon: "⭐" },
        { value: "tips", label: "Tips", icon: "💡" },
        { value: "news", label: "News", icon: "📰" },
        { value: "health", label: "Health", icon: "💚" },
        { value: "other", label: "Other", icon: "📝" },
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
                        const response = await blogApi.getBlogs({
                                page,
                                limit: 12,
                                category: category || undefined,
                                search: search || undefined,
                        });
                        // Sort blogs by publishedAt or createdAt (newest first)
                        const sortedBlogs = [...(response.data || [])].sort((a, b) => {
                                const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
                                const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
                                return dateB - dateA;
                        });
                        setBlogs(sortedBlogs);
                        setTotalPages(response.pagination.pages);
                } catch (error) {
                        console.error("Failed to fetch blogs:", error);
                        toast.error("Failed to load blog posts");
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
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                        {/* Main Container - Fixed Centered Layout */}
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
                                {/* Header Section */}
                                <div className="mb-10">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                                                <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                                <div 
                                                                        className="w-1 h-10 rounded-full"
                                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                                ></div>
                                                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                                                                        Food Magazine
                                                                </h1>
                                                        </div>
                                                        <p className="text-lg text-gray-600 max-w-2xl">
                                                                Discover great articles about food, recipes and cooking tips
                                                        </p>
                                                </div>
                                                {isAuthenticated && (
                                                        <div className="flex gap-3">
                                                                <Link
                                                                        href="/blog/my-blogs"
                                                                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-all font-medium shadow-sm"
                                                                >
                                                                        <FileText className="w-4 h-4" />
                                                                        My Posts
                                                                </Link>
                                                                <Link
                                                                        href="/blog/create"
                                                                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                                >
                                                                        <Plus className="w-4 h-4" />
                                                                        Write Post
                                                                </Link>
                                                        </div>
                                                )}
                                        </div>

                                        {/* Search Bar */}
                                        <div className="mb-6">
                                                <div className="flex gap-3">
                                                        <div className="flex-1 relative">
                                                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                                <input
                                                                        type="text"
                                                                        placeholder="Search posts..."
                                                                        value={searchInput}
                                                                        onChange={(e) => setSearchInput(e.target.value)}
                                                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                                                                        style={{ 
                                                                                "--tw-ring-color": BRAND_ORANGE,
                                                                                focusRingColor: BRAND_ORANGE 
                                                                        } as React.CSSProperties}
                                                                />
                                                        </div>
                                                        <button
                                                                onClick={handleSearch}
                                                                className="px-6 py-3.5 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                        >
                                                                Search
                                                        </button>
                                                </div>
                                        </div>

                                        {/* Category Filter - Sticky on scroll */}
                                        <div className="flex flex-wrap gap-3">
                                                {CATEGORIES.map((cat) => (
                                                        <button
                                                                key={cat.value}
                                                                onClick={() => handleCategoryChange(cat.value)}
                                                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                                        category === cat.value
                                                                                ? "text-white shadow-lg"
                                                                                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"
                                                                }`}
                                                                style={category === cat.value ? { backgroundColor: BRAND_ORANGE } : undefined}
                                                        >
                                                                <span className="mr-2">{cat.icon}</span>
                                                                {cat.label}
                                                        </button>
                                                ))}
                                        </div>
                                </div>

                                {/* Loading State */}
                                {loading ? (
                                        <div className="text-center py-20">
                                                <div 
                                                        className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#EE4D2D]"
                                                ></div>
                                                <p className="mt-6 text-gray-600 text-lg">Loading...</p>
                                        </div>
                                ) : blogs.length === 0 ? (
                                        <div className="text-center py-20">
                                                <div className="text-6xl mb-4">📝</div>
                                                <p className="text-gray-600 text-lg">No posts found</p>
                                        </div>
                                ) : (
                                        <>
                                                {/* Hero Section - Featured Post */}
                                                {featuredBlog && featuredBlog.featuredImage?.url && (
                                                        <div className="mb-12">
                                                                <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                                                                        <Link href={`/blog/${featuredBlog.slug}`}>
                                                                                <Image
                                                                                        src={featuredBlog.featuredImage.url}
                                                                                        alt={featuredBlog.featuredImage.alt || featuredBlog.title}
                                                                                        fill
                                                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                                        priority
                                                                                />
                                                                                {/* Gradient Overlay */}
                                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                                                                                
                                                                                {/* Content Overlay */}
                                                                                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                                                                                        <div className="max-w-4xl space-y-4">
                                                                                                {/* Badge */}
                                                                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                                                                                                        <TrendingUp className="w-4 h-4" />
                                                                                                        Featured Post
                                                                                                </div>
                                                                                                
                                                                                                {/* Category */}
                                                                                                <div className="inline-block px-4 py-2 bg-[#EE4D2D] text-white text-sm font-semibold rounded-full shadow-lg">
                                                                                                        {CATEGORIES.find(c => c.value === featuredBlog.category)?.label || "Other"}
                                                                                                </div>

                                                                                                {/* Title */}
                                                                                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight line-clamp-2 group-hover:opacity-90 transition-opacity">
                                                                                                        {featuredBlog.title}
                                                                                                </h2>

                                                                                                {/* Excerpt */}
                                                                                                {featuredBlog.excerpt && (
                                                                                                        <p className="text-white/90 text-lg md:text-xl line-clamp-2 max-w-3xl">
                                                                                                                {featuredBlog.excerpt}
                                                                                                        </p>
                                                                                                )}

                                                                                                {/* Meta Info */}
                                                                                                <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm md:text-base pt-2">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                                <Eye className="w-5 h-5" />
                                                                                                                <span className="font-medium">{featuredBlog.views} views</span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-2">
                                                                                                                <Clock className="w-5 h-5" />
                                                                                                                <span className="font-medium">{featuredBlog.readTime} min read</span>
                                                                                                        </div>
                                                                                                        {featuredBlog.publishedAt && (
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                        <Calendar className="w-5 h-5" />
                                                                                                                        <span className="font-medium">{formatDate(featuredBlog.publishedAt)}</span>
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>

                                                                                                {/* CTA Button */}
                                                                                                <div className="pt-4">
                                                                                                        <div className="inline-flex items-center gap-2 px-8 py-4 bg-[#EE4D2D] text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:translate-x-2 shadow-xl">
                                                                                                                Read Now
                                                                                                                <ArrowRight className="w-5 h-5" />
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        </Link>
                                                                </div>
                                                        </div>
                                                )}

                                                {/* Regular Blog Grid */}
                                                {regularBlogs.length > 0 && (
                                                        <>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                                                                        {regularBlogs.map((blog) => (
                                                                                <Link
                                                                                        key={blog._id}
                                                                                        href={`/blog/${blog.slug}`}
                                                                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col border border-gray-100"
                                                                                >
                                                                                        {/* Thumbnail Image */}
                                                                                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
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
                                                                                                                style={{ backgroundColor: BRAND_ORANGE + "15" }}
                                                                                                        >
                                                                                                                <span className="text-5xl">🍽️</span>
                                                                                                        </div>
                                                                                                )}
                                                                                                {/* Category Badge on Image */}
                                                                                                <div className="absolute top-4 left-4">
                                                                                                        <span 
                                                                                                                className="px-3 py-1.5 text-white text-xs font-bold rounded-full backdrop-blur-md shadow-lg"
                                                                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                                                                        >
                                                                                                                {CATEGORIES.find(c => c.value === blog.category)?.label || "Other"}
                                                                                                        </span>
                                                                                                </div>
                                                                                        </div>

                                                                                        {/* Content */}
                                                                                        <div className="p-6 flex-1 flex flex-col">
                                                                                                {/* Title */}
                                                                                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#EE4D2D] transition-colors">
                                                                                                        {blog.title}
                                                                                                </h3>

                                                                                                {/* Excerpt */}
                                                                                                {blog.excerpt && (
                                                                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                                                                                                {blog.excerpt}
                                                                                                        </p>
                                                                                                )}

                                                                                                {/* Meta Info */}
                                                                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-2 border-t border-gray-100">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Eye className="w-4 h-4" />
                                                                                                                        <span>{blog.views}</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Heart className="w-4 h-4 text-red-500" />
                                                                                                                        <span>{blog.likesCount || blog.likes?.length || 0}</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                        <Clock className="w-4 h-4" />
                                                                                                                        <span>{blog.readTime} min</span>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>

                                                                                                {/* Author and Date */}
                                                                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                                {blog.author?.avatar ? (
                                                                                                                        <Image
                                                                                                                                src={blog.author.avatar}
                                                                                                                                alt={blog.author?.name || "Author"}
                                                                                                                                width={36}
                                                                                                                                height={36}
                                                                                                                                className="rounded-full object-cover"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <div 
                                                                                                                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                                                                                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                                                                                        >
                                                                                                                                {blog.author?.name?.charAt(0).toUpperCase() || "?"}
                                                                                                                        </div>
                                                                                                                )}
                                                                                                                <div className="flex flex-col">
                                                                                                                        <span className="text-sm font-semibold text-gray-700">
                                                                                                                                {blog.author?.name || "Author"}
                                                                                                                        </span>
                                                                                                                        {blog.publishedAt && (
                                                                                                                                <span className="text-xs text-gray-500">
                                                                                                                                        {formatDate(blog.publishedAt)}
                                                                                                                                </span>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        </div>
                                                                                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#EE4D2D] group-hover:translate-x-1 transition-all" />
                                                                                                </div>
                                                                                        </div>
                                                                                </Link>
                                                                        ))}
                                                                </div>

                                                                {/* Pagination */}
                                                                {totalPages > 1 && (
                                                                        <div className="flex justify-center">
                                                                                <Pagination
                                                                                        currentPage={page}
                                                                                        totalPages={totalPages}
                                                                                        onPageChange={(newPage) => {
                                                                                                setPage(newPage);
                                                                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                                                                        }}
                                                                                        showInfo={true}
                                                                                        scrollToTop={true}
                                                                                />
                                                                        </div>
                                                                )}
                                                        </>
                                                )}
                                        </>
                                )}
                        </div>
                </div>
        );
}
