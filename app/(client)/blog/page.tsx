"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { Blog, BlogCategory } from "@/types/blog.type";
import { Calendar, Clock, Eye, Heart, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES: { value: BlogCategory | ""; label: string }[] = [
        { value: "", label: "Tất cả" },
        { value: "recipe", label: "Công thức" },
        { value: "review", label: "Đánh giá" },
        { value: "tips", label: "Mẹo vặt" },
        { value: "news", label: "Tin tức" },
        { value: "health", label: "Sức khỏe" },
        { value: "other", label: "Khác" },
];

export default function BlogPage() {
        const [blogs, setBlogs] = useState<Blog[]>([]);
        const [loading, setLoading] = useState(true);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [category, setCategory] = useState<BlogCategory | "">("");
        const [search, setSearch] = useState("");
        const [searchInput, setSearchInput] = useState("");

        const fetchBlogs = async () => {
                setLoading(true);
                try {
                        const response = await blogApi.getBlogs({
                                page,
                                limit: 12,
                                category: category || undefined,
                                search: search || undefined,
                        });
                        setBlogs(response.data);
                        setTotalPages(response.pagination.pages);
                } catch (error) {
                        console.error("Failed to fetch blogs:", error);
                        toast.error("Không thể tải danh sách bài viết");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchBlogs();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [page, category]);

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
                return date.toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                });
        };

        return (
                <div className="min-h-screen bg-gray-50 py-8">
                        <div className="custom-container">
                                {/* Header */}
                                <div className="mb-8">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Ẩm Thực</h1>
                                        <p className="text-gray-600">
                                                Khám phá những bài viết hay về ẩm thực và cuộc sống
                                        </p>
                                </div>

                                {/* Search and Filter */}
                                <div className="mb-8 space-y-4">
                                        {/* Search Bar */}
                                        <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <input
                                                                type="text"
                                                                placeholder="Tìm kiếm bài viết..."
                                                                value={searchInput}
                                                                onChange={(e) => setSearchInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                                        />
                                                </div>
                                                <button
                                                        onClick={handleSearch}
                                                        className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
                                                >
                                                        Tìm kiếm
                                                </button>
                                        </div>

                                        {/* Category Filter */}
                                        <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.map((cat) => (
                                                        <button
                                                                key={cat.value}
                                                                onClick={() => handleCategoryChange(cat.value)}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                                        category === cat.value
                                                                                ? "bg-brand-purple text-white"
                                                                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                                }`}
                                                        >
                                                                {cat.label}
                                                        </button>
                                                ))}
                                        </div>
                                </div>

                                {/* Blog List */}
                                {loading ? (
                                        <div className="text-center py-12">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                                                <p className="mt-4 text-gray-600">Đang tải...</p>
                                        </div>
                                ) : blogs.length === 0 ? (
                                        <div className="text-center py-12">
                                                <p className="text-gray-600">Không tìm thấy bài viết nào</p>
                                        </div>
                                ) : (
                                        <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                                        {blogs.map((blog) => (
                                                                <Link
                                                                        key={blog._id}
                                                                        href={`/blog/${blog.slug}`}
                                                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                                                                >
                                                                        {/* Featured Image */}
                                                                        {blog.featuredImage?.url && (
                                                                                <div className="relative w-full h-48 overflow-hidden">
                                                                                        <Image
                                                                                                src={
                                                                                                        blog
                                                                                                                .featuredImage
                                                                                                                .url
                                                                                                }
                                                                                                alt={
                                                                                                        blog
                                                                                                                .featuredImage
                                                                                                                .alt ||
                                                                                                        blog.title
                                                                                                }
                                                                                                fill
                                                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                                        />
                                                                                </div>
                                                                        )}

                                                                        {/* Content */}
                                                                        <div className="p-6">
                                                                                {/* Category */}
                                                                                <span className="inline-block px-3 py-1 bg-brand-yellowlight text-brand-black text-xs font-semibold rounded-full mb-3">
                                                                                        {CATEGORIES.find(
                                                                                                (c) =>
                                                                                                        c.value ===
                                                                                                        blog.category
                                                                                        )?.label || "Khác"}
                                                                                </span>

                                                                                {/* Title */}
                                                                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors">
                                                                                        {blog.title}
                                                                                </h3>

                                                                                {/* Excerpt */}
                                                                                {blog.excerpt && (
                                                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                                                                {blog.excerpt}
                                                                                        </p>
                                                                                )}

                                                                                {/* Meta Info */}
                                                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                                                        <div className="flex items-center gap-4">
                                                                                                <div className="flex items-center gap-1">
                                                                                                        <Eye className="w-4 h-4" />
                                                                                                        <span>
                                                                                                                {
                                                                                                                        blog.views
                                                                                                                }
                                                                                                        </span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1">
                                                                                                        <Heart className="w-4 h-4" />
                                                                                                        <span>
                                                                                                                {blog.likesCount ||
                                                                                                                        blog
                                                                                                                                .likes
                                                                                                                                ?.length ||
                                                                                                                        0}
                                                                                                        </span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1">
                                                                                                        <MessageCircle className="w-4 h-4" />
                                                                                                        <span>
                                                                                                                {blog.commentsCount ||
                                                                                                                        0}
                                                                                                        </span>
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                                <Clock className="w-4 h-4" />
                                                                                                <span>
                                                                                                        {blog.readTime}{" "}
                                                                                                        phút
                                                                                                </span>
                                                                                        </div>
                                                                                </div>

                                                                                {/* Author and Date */}
                                                                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                                                                        <div className="flex items-center gap-2">
                                                                                                {blog.author.avatar ? (
                                                                                                        <Image
                                                                                                                src={
                                                                                                                        blog
                                                                                                                                .author
                                                                                                                                .avatar
                                                                                                                }
                                                                                                                alt={
                                                                                                                        blog
                                                                                                                                .author
                                                                                                                                .name
                                                                                                                }
                                                                                                                width={
                                                                                                                        32
                                                                                                                }
                                                                                                                height={
                                                                                                                        32
                                                                                                                }
                                                                                                                className="rounded-full"
                                                                                                        />
                                                                                                ) : (
                                                                                                        <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white text-xs font-semibold">
                                                                                                                {blog.author.name
                                                                                                                        .charAt(
                                                                                                                                0
                                                                                                                        )
                                                                                                                        .toUpperCase()}
                                                                                                        </div>
                                                                                                )}
                                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                                        {
                                                                                                                blog
                                                                                                                        .author
                                                                                                                        .name
                                                                                                        }
                                                                                                </span>
                                                                                        </div>
                                                                                        {blog.publishedAt && (
                                                                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                                                        <Calendar className="w-3 h-3" />
                                                                                                        <span>
                                                                                                                {formatDate(
                                                                                                                        blog.publishedAt
                                                                                                                )}
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
                        </div>
                </div>
        );
}
