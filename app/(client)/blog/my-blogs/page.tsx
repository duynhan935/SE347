"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Blog, BlogCategory, BlogStatus } from "@/types/blog.type";
import { ArrowLeft, Calendar, Clock, Edit2, Eye, Heart, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const STATUS_LABELS: Record<BlogStatus, { label: string; color: string }> = {
        draft: { label: "Draft", color: "#6B7280" }, // gray-500
        published: { label: "Published", color: "#10B981" }, // green-500
        archived: { label: "Archived", color: "#F59E0B" }, // yellow-500
};

const BRAND_ORANGE = "#EE4D2D";

export default function MyBlogsPage() {
        const router = useRouter();
        const { user, isAuthenticated } = useAuthStore();
        
        const [blogs, setBlogs] = useState<Blog[]>([]);
        const [loading, setLoading] = useState(true);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [category, setCategory] = useState<BlogCategory | "">("");
        const [status, setStatus] = useState<BlogStatus | "">("");
        const [search, setSearch] = useState("");
        const [searchInput, setSearchInput] = useState("");
        const [deletingId, setDeletingId] = useState<string | null>(null);

        // Redirect if not authenticated
        useEffect(() => {
                if (!isAuthenticated || !user) {
                        router.push("/login");
                }
        }, [isAuthenticated, user, router]);

        // Read status from URL query params on mount
        useEffect(() => {
                if (typeof window !== "undefined") {
                        const params = new URLSearchParams(window.location.search);
                        const statusParam = params.get("status");
                        if (statusParam && (statusParam === "draft" || statusParam === "published" || statusParam === "archived")) {
                                setStatus(statusParam as BlogStatus);
                        }
                }
        }, []);

        const fetchMyBlogs = async () => {
                if (!user?.id) return;
                
                setLoading(true);
                try {
                        const params: {
                                page: number;
                                limit: number;
                                authorId: string;
                                category?: string;
                                search?: string;
                                status?: string;
                        } = {
                                page,
                                limit: 12,
                                authorId: user.id,
                        };
                        
                        if (category) params.category = category;
                        if (search) params.search = search;
                        
                        // When status is empty (All), try sending "all" to backend
                        // If backend doesn't support "all", it might still work or we need backend fix
                        // Alternative: When status is "", we make 3 separate calls (draft, published, archived) and combine
                        // For now, let's try sending empty string or special value
                        if (status) {
                                params.status = status;
                        } else {
                                // When "All" is selected, try to get all statuses
                                // Since backend defaults to 'published' when status is undefined,
                                // we need a workaround. Let's try "all" or make multiple calls
                                // For simplicity, we'll make 3 API calls and combine results
                                const [draftRes, publishedRes, archivedRes] = await Promise.all([
                                        blogApi.getBlogs({ ...params, status: "draft", page: 1, limit: 1000 }),
                                        blogApi.getBlogs({ ...params, status: "published", page: 1, limit: 1000 }),
                                        blogApi.getBlogs({ ...params, status: "archived", page: 1, limit: 1000 }),
                                ]);
                                
                                const allBlogs = [
                                        ...(draftRes.data || []),
                                        ...(publishedRes.data || []),
                                        ...(archivedRes.data || []),
                                ];
                                
                                // Sort by createdAt descending
                                allBlogs.sort((a, b) => {
                                        const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
                                        const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
                                        return dateB - dateA;
                                });
                                
                                // Apply pagination manually
                                const startIndex = (page - 1) * 12;
                                const endIndex = startIndex + 12;
                                const paginatedBlogs = allBlogs.slice(startIndex, endIndex);
                                
                                setBlogs(paginatedBlogs);
                                setTotalPages(Math.ceil(allBlogs.length / 12));
                                setLoading(false);
                                return;
                        }
                        
                        const response = await blogApi.getBlogs(params);
                        setBlogs(response.data || []);
                        setTotalPages(response.pagination?.pages || 1);
                } catch (error) {
                        console.error("Failed to fetch blogs:", error);
                        toast.error("Unable to load your articles");
                        setBlogs([]);
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                if (user?.id) {
                        fetchMyBlogs();
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [page, category, status, search, user?.id]);

        const handleSearch = () => {
                setSearch(searchInput);
                setPage(1);
        };

        const handleCategoryChange = (cat: BlogCategory | "") => {
                setCategory(cat);
                setPage(1);
        };

        const handleStatusChange = (stat: BlogStatus | "") => {
                setStatus(stat);
                setPage(1);
        };

        const handleDelete = async (blogId: string, title: string) => {
                if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
                        return;
                }

                setDeletingId(blogId);
                try {
                        await blogApi.deleteBlog(blogId);
                        toast.success("Blog deleted successfully");
                        fetchMyBlogs();
                } catch (error: unknown) {
                        console.error("Failed to delete blog:", error);
                        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        toast.error(errorMessage || "Failed to delete blog");
                } finally {
                        setDeletingId(null);
                }
        };

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                });
        };

        if (!isAuthenticated || !user) {
                return null;
        }

        return (
                <div className="min-h-screen bg-gray-50 py-8">
                        <div className="custom-container">
                                {/* Header */}
                                <div className="mb-8">
                                        <div className="mb-4">
                                                <Link
                                                        href="/blog"
                                                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                                                >
                                                        <ArrowLeft className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Back to All Blogs</span>
                                                </Link>
                                        </div>
                                        <div className="flex items-center justify-between">
                                                <div>
                                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Articles</h1>
                                                        <p className="text-gray-600">Manage your blog posts</p>
                                                </div>
                                                <Link
                                                        href="/blog/create"
                                                        className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                >
                                                        <Plus className="w-5 h-5" />
                                                        New Article
                                                </Link>
                                        </div>
                                </div>

                                {/* Filters */}
                                <div className="mb-8 space-y-4">
                                        {/* Search Bar */}
                                        <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <input
                                                                type="text"
                                                                placeholder="Search your articles..."
                                                                value={searchInput}
                                                                onChange={(e) => setSearchInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
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

                                        {/* Category & Status Filters */}
                                        <div className="flex flex-wrap gap-3">
                                                <div>
                                                        <span className="text-sm font-medium text-gray-700 mr-2">Category:</span>
                                                        {CATEGORIES.map((cat) => (
                                                                <button
                                                                        key={cat.value}
                                                                        onClick={() => handleCategoryChange(cat.value)}
                                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all mr-2 ${
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

                                        <div className="flex flex-wrap gap-3">
                                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                                <button
                                                        onClick={() => handleStatusChange("")}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                                status === ""
                                                                        ? "bg-gray-700 text-white"
                                                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                        }`}
                                                >
                                                        All
                                                </button>
                                                {Object.entries(STATUS_LABELS).map(([value, { label, color }]) => (
                                                        <button
                                                                key={value}
                                                                onClick={() => handleStatusChange(value as BlogStatus)}
                                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                                        status === value
                                                                                ? "text-white"
                                                                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                                }`}
                                                                style={status === value ? { backgroundColor: color } : undefined}
                                                        >
                                                                {label}
                                                        </button>
                                                ))}
                                        </div>
                                </div>

                                {/* Blog List */}
                                {loading ? (
                                        <div className="text-center py-12">
                                                <div 
                                                        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                                                        style={{ borderBottomColor: BRAND_ORANGE }}
                                                ></div>
                                                <p className="mt-4 text-gray-600">Loading...</p>
                                        </div>
                                ) : blogs.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                                                <p className="text-gray-600 mb-4">No articles found</p>
                                                <Link
                                                        href="/blog/create"
                                                        className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                >
                                                        <Plus className="w-5 h-5" />
                                                        Create Your First Article
                                                </Link>
                                        </div>
                                ) : (
                                        <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                                        {blogs.map((blog) => (
                                                                <div
                                                                        key={blog._id}
                                                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                                                                >
                                                                        {/* Thumbnail Image */}
                                                                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                                                                                {blog.featuredImage?.url ? (
                                                                                        <Image
                                                                                                src={blog.featuredImage.url}
                                                                                                alt={blog.featuredImage.alt || blog.title}
                                                                                                fill
                                                                                                className="object-cover"
                                                                                        />
                                                                                ) : (
                                                                                        <div 
                                                                                                className="w-full h-full flex items-center justify-center"
                                                                                                style={{ backgroundColor: BRAND_ORANGE + "20" }}
                                                                                        >
                                                                                                <span className="text-4xl">🍽️</span>
                                                                                        </div>
                                                                                )}
                                                                                {/* Status Badge */}
                                                                                <div className="absolute top-3 right-3">
                                                                                        <span 
                                                                                                className="px-3 py-1 text-white text-xs font-semibold rounded-full"
                                                                                                style={{ backgroundColor: STATUS_LABELS[blog.status].color }}
                                                                                        >
                                                                                                {STATUS_LABELS[blog.status].label}
                                                                                        </span>
                                                                                </div>
                                                                        </div>

                                                                        {/* Content */}
                                                                        <div className="p-6 flex-1 flex flex-col">
                                                                                {/* Category */}
                                                                                <span 
                                                                                        className="inline-block px-3 py-1 text-white text-xs font-semibold rounded-full mb-3 w-fit"
                                                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                                                >
                                                                                        {CATEGORIES.find(c => c.value === blog.category)?.label || "Other"}
                                                                                </span>

                                                                                {/* Title */}
                                                                                <Link href={`/blog/${blog.slug}`}>
                                                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:opacity-70 transition-opacity">
                                                                                                {blog.title}
                                                                                        </h3>
                                                                                </Link>

                                                                                {/* Meta Info */}
                                                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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

                                                                                {/* Date */}
                                                                                {blog.publishedAt && (
                                                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                                                                                                <Calendar className="w-3 h-3" />
                                                                                                <span>{formatDate(blog.publishedAt)}</span>
                                                                                        </div>
                                                                                )}

                                                                                {/* Action Buttons */}
                                                                                <div className="mt-auto pt-4 border-t border-gray-200 flex items-center gap-2">
                                                                                        <Link
                                                                                                href={`/blog/edit/${blog._id}`}
                                                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                                                        >
                                                                                                <Edit2 className="w-4 h-4" />
                                                                                                Edit
                                                                                        </Link>
                                                                                        <button
                                                                                                onClick={() => handleDelete(blog._id, blog.title)}
                                                                                                disabled={deletingId === blog._id}
                                                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                                {deletingId === blog._id ? "Deleting..." : "Delete"}
                                                                                        </button>
                                                                                </div>
                                                                        </div>
                                                                </div>
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

