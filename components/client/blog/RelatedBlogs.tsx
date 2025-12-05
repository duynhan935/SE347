"use client";

import { blogApi } from "@/lib/api/blogApi";
import { Blog, BlogCategory } from "@/types/blog.type";
import { Clock, Eye, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RelatedBlogsProps {
        currentBlogId: string;
        category: BlogCategory;
}

export default function RelatedBlogs({ currentBlogId, category }: RelatedBlogsProps) {
        const [blogs, setBlogs] = useState<Blog[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                fetchRelatedBlogs();
        }, [currentBlogId, category]);

        const fetchRelatedBlogs = async () => {
                setLoading(true);
                try {
                        const response = await blogApi.getBlogs({
                                page: 1,
                                limit: 5,
                                category,
                        });
                        // Filter out current blog
                        const related = response.data.filter((blog) => blog._id !== currentBlogId).slice(0, 4);
                        setBlogs(related);
                } catch (error) {
                        console.error("Failed to fetch related blogs:", error);
                        toast.error("Không thể tải bài viết liên quan");
                } finally {
                        setLoading(false);
                }
        };

        if (loading) {
                return (
                        <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Bài viết liên quan</h3>
                                <div className="text-center py-4">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple"></div>
                                </div>
                        </div>
                );
        }

        if (blogs.length === 0) {
                return null;
        }

        return (
                <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Bài viết liên quan</h3>
                        <div className="space-y-4">
                                {blogs.map((blog) => (
                                        <Link
                                                key={blog._id}
                                                href={`/blog/${blog.slug}`}
                                                className="block group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                        >
                                                <div className="flex gap-3">
                                                        {blog.featuredImage?.url && (
                                                                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                                                                        <Image
                                                                                src={blog.featuredImage.url}
                                                                                alt={blog.title}
                                                                                fill
                                                                                className="object-cover group-hover:scale-105 transition-transform"
                                                                        />
                                                                </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-purple transition-colors mb-1">
                                                                        {blog.title}
                                                                </h4>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                        <div className="flex items-center gap-1">
                                                                                <Eye className="w-3 h-3" />
                                                                                <span>{blog.views}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                                <Heart className="w-3 h-3" />
                                                                                <span>
                                                                                        {blog.likesCount ||
                                                                                                blog.likes?.length ||
                                                                                                0}
                                                                                </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                <span>{blog.readTime} phút</span>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </Link>
                                ))}
                        </div>
                </div>
        );
}
