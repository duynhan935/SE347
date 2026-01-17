"use client";

import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { BlogCategory, BlogStatus } from "@/types/blog.type";
import { ArrowLeft, Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES: { value: BlogCategory; label: string }[] = [
        { value: "recipe", label: "Recipe" },
        { value: "review", label: "Review" },
        { value: "tips", label: "Tips" },
        { value: "news", label: "News" },
        { value: "health", label: "Health" },
        { value: "other", label: "Other" },
];

const BRAND_ORANGE = "#EE4D2D";

export default function CreateBlogPage() {
        const router = useRouter();
        const { user, isAuthenticated } = useAuthStore();
        
        const [title, setTitle] = useState("");
        const [excerpt, setExcerpt] = useState("");
        const [content, setContent] = useState("");
        const [category, setCategory] = useState<BlogCategory>("other");
        const [tags, setTags] = useState<string[]>([]);
        const [tagInput, setTagInput] = useState("");
        const [featuredImage, setFeaturedImage] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [status, setStatus] = useState<BlogStatus>("draft");
        const [loading, setLoading] = useState(false);

        // Redirect if not authenticated
        useEffect(() => {
                if (!isAuthenticated || !user) {
                        router.push("/login");
                }
        }, [isAuthenticated, user, router]);

        // Don't render if not authenticated
        if (!isAuthenticated || !user) {
                return null;
        }

        const handleAddTag = () => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput("");
                }
        };

        const handleRemoveTag = (tagToRemove: string) => {
                setTags(tags.filter((tag) => tag !== tagToRemove));
        };

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image size must be less than 5MB");
                                return;
                        }
                        setFeaturedImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                }
        };

        const handleRemoveImage = () => {
                setFeaturedImage(null);
                setImagePreview(null);
        };

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                
                if (!title.trim()) {
                        toast.error("Please enter a title");
                        return;
                }
                
                if (!content.trim()) {
                        toast.error("Please enter content");
                        return;
                }

                if (!user?.id || !user?.username) {
                        toast.error("User information is missing");
                        return;
                }

                setLoading(true);
                try {
                        const blogData = {
                                title: title.trim(),
                                content: content.trim(),
                                excerpt: excerpt.trim() || undefined,
                                category,
                                tags: tags.length > 0 ? tags : undefined,
                                status,
                                featuredImage: featuredImage || undefined,
                                author: {
                                        userId: user.id,
                                        name: user.username,
                                        avatar: (typeof user.avatar === "string" ? user.avatar : undefined),
                                },
                        };

                        const response = await blogApi.createBlog(blogData);
                        
                        toast.success("Blog created successfully! 🎉");
                        
                        // If blog is published, redirect to my-blogs with status filter set to "published"
                        // If blog is draft, redirect to my-blogs (draft blogs can't be viewed publicly)
                        if (status === "published") {
                                router.push("/blog/my-blogs?status=published");
                        } else {
                                router.push("/blog/my-blogs");
                        }
                } catch (error: unknown) {
                        console.error("Failed to create blog:", error);
                        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        toast.error(errorMessage || "Failed to create blog. Please try again.");
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="min-h-screen bg-gray-50 py-8">
                        <div className="custom-container max-w-4xl">
                                {/* Header */}
                                <div className="mb-6 flex items-center gap-4">
                                        <Link 
                                                href="/blog"
                                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                                <ArrowLeft className="w-5 h-5" />
                                        </Link>
                                        <div>
                                                <h1 className="text-3xl font-bold text-gray-900">Write New Article</h1>
                                                <p className="text-gray-600 mt-1">Share your food story with the community</p>
                                        </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
                                        {/* Title */}
                                        <div>
                                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        id="title"
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Enter article title..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                                        maxLength={200}
                                                        required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                                        </div>

                                        {/* Excerpt */}
                                        <div>
                                                <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Excerpt
                                                </label>
                                                <textarea
                                                        id="excerpt"
                                                        value={excerpt}
                                                        onChange={(e) => setExcerpt(e.target.value)}
                                                        placeholder="Brief description of your article (optional)..."
                                                        rows={3}
                                                        maxLength={500}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] resize-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">{excerpt.length}/500 characters</p>
                                        </div>

                                        {/* Featured Image */}
                                        <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Featured Image
                                                </label>
                                                {imagePreview ? (
                                                        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                                                                <Image
                                                                        src={imagePreview}
                                                                        alt="Preview"
                                                                        fill
                                                                        className="object-cover"
                                                                />
                                                                <button
                                                                        type="button"
                                                                        onClick={handleRemoveImage}
                                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                                        aria-label="Remove image"
                                                                >
                                                                        <X className="w-4 h-4" />
                                                                </button>
                                                        </div>
                                                ) : (
                                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                                                                        <p className="mb-2 text-sm text-gray-500">
                                                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                                </div>
                                                                <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageChange}
                                                                        className="hidden"
                                                                />
                                                        </label>
                                                )}
                                        </div>

                                        {/* Category & Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Category
                                                        </label>
                                                        <select
                                                                id="category"
                                                                value={category}
                                                                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                                        >
                                                                {CATEGORIES.map((cat) => (
                                                                        <option key={cat.value} value={cat.value}>
                                                                                {cat.label}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                </div>

                                                <div>
                                                        <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Status
                                                        </label>
                                                        <select
                                                                id="status"
                                                                value={status}
                                                                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                                        >
                                                                <option value="draft">Draft</option>
                                                                <option value="published">Published</option>
                                                        </select>
                                                </div>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                                <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Tags
                                                </label>
                                                <div className="flex gap-2 mb-2">
                                                        <input
                                                                id="tags"
                                                                type="text"
                                                                value={tagInput}
                                                                onChange={(e) => setTagInput(e.target.value)}
                                                                onKeyPress={(e) => {
                                                                        if (e.key === "Enter") {
                                                                                e.preventDefault();
                                                                                handleAddTag();
                                                                        }
                                                                }}
                                                                placeholder="Add tags (press Enter)..."
                                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={handleAddTag}
                                                                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                                                style={{ backgroundColor: BRAND_ORANGE }}
                                                        >
                                                                Add
                                                        </button>
                                                </div>
                                                {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                                {tags.map((tag) => (
                                                                        <span
                                                                                key={tag}
                                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                                        >
                                                                                {tag}
                                                                                <button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveTag(tag)}
                                                                                        className="hover:text-red-500"
                                                                                        aria-label={`Remove tag ${tag}`}
                                                                                >
                                                                                        <X className="w-3 h-3" />
                                                                                </button>
                                                                        </span>
                                                                ))}
                                                        </div>
                                                )}
                                        </div>

                                        {/* Content */}
                                        <div>
                                                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Content <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                        id="content"
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                        placeholder="Write your article content here... You can use HTML for formatting."
                                                        rows={20}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] resize-y font-mono text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                        HTML is supported. Use &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, etc.
                                                </p>
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                                                <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        style={{ backgroundColor: BRAND_ORANGE }}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                                        Creating...
                                                                </>
                                                        ) : (
                                                                `Create ${status === "published" ? "and Publish" : "as Draft"}`
                                                        )}
                                                </button>
                                                <Link
                                                        href="/blog"
                                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                                >
                                                        Cancel
                                                </Link>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}

