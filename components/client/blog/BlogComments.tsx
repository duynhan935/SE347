"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Comment } from "@/types/blog.type";
import { Edit2, Heart, Image as ImageIcon, Reply, Send, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BlogCommentsProps {
    blogId: string;
}

export default function BlogComments({ blogId }: BlogCommentsProps) {
    const { user, isAuthenticated } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [commentImages, setCommentImages] = useState<File[]>([]);
    const [replyImages, setReplyImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replyFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchComments();
    }, [blogId, page]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await blogApi.getComments(blogId, { page, limit: 15 });
            setComments(response.data);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            toast.error("Unable to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!isAuthenticated || !user) {
            toast.error("Please login to comment");
            return;
        }

        if (!newComment.trim() && commentImages.length === 0) {
            toast.error("Please enter content or select an image");
            return;
        }

        try {
            await blogApi.createComment(blogId, {
                content: newComment,
                author: {
                    userId: user.id,
                    name: user.username,
                    avatar: undefined,
                },
                images: commentImages,
            });
            toast.success("Comment added");
            setNewComment("");
            setCommentImages([]);
            fetchComments();
        } catch (error) {
            console.error("Failed to create comment:", error);
            toast.error("Unable to add comment");
        }
    };

    const handleReply = async (parentId: string) => {
        if (!isAuthenticated || !user) {
            toast.error("Please login to reply");
            return;
        }

        if (!replyContent.trim() && replyImages.length === 0) {
            toast.error("Please enter content or select an image");
            return;
        }

        try {
            await blogApi.replyComment(blogId, parentId, {
                content: replyContent,
                author: {
                    userId: user.id,
                    name: user.username,
                    avatar: undefined,
                },
                images: replyImages,
            });
            toast.success("Reply posted");
            setReplyingTo(null);
            setReplyContent("");
            setReplyImages([]);
            fetchComments();
        } catch (error) {
            console.error("Failed to reply comment:", error);
            toast.error("Unable to reply to comment");
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!isAuthenticated) {
            toast.error("Please login to like comment");
            return;
        }

        try {
            await blogApi.likeComment(blogId, commentId);
            fetchComments();
        } catch (error) {
            console.error("Failed to like comment:", error);
            toast.error("Unable to like comment");
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) {
            toast.error("Please enter content");
            return;
        }

        try {
            await blogApi.updateComment(blogId, commentId, {
                content: editContent,
            });
            toast.success("Comment updated");
            setEditingComment(null);
            setEditContent("");
            fetchComments();
        } catch (error) {
            console.error("Failed to update comment:", error);
            toast.error("Unable to update comment");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            await blogApi.deleteComment(blogId, commentId);
            toast.success("Comment deleted");
            fetchComments();
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast.error("Unable to delete comment");
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "comment" | "reply") => {
        const files = Array.from(e.target.files || []);
        if (files.length > 6) {
            toast.error("Maximum 6 images");
            return;
        }
        if (type === "comment") {
            setCommentImages(files);
        } else {
            setReplyImages(files);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
        return date.toLocaleDateString("en-US");
    };

    const isLiked = (comment: Comment) => {
        return isAuthenticated && user && comment.likes?.includes(user.id);
    };

    const canEditDelete = (comment: Comment) => {
        return isAuthenticated && user && comment.author.userId === user.id;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

            {/* Comment Form */}
            {isAuthenticated ? (
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple mb-3"
                        rows={4}
                    />
                    {commentImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {commentImages.map((file, index) => (
                                <div key={index} className="relative">
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index}`}
                                        width={100}
                                        height={100}
                                        className="rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => setCommentImages(commentImages.filter((_, i) => i !== index))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            max={6}
                            onChange={(e) => handleImageSelect(e, "comment")}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span>Add Image</span>
                        </button>
                        <button
                            onClick={handleSubmitComment}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90"
                        >
                            <Send className="w-5 h-5" />
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-8 pb-6 border-b border-gray-200 text-center py-8">
                    <p className="text-gray-600 mb-4">Please login to comment</p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No comments yet</div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex gap-4">
                                {/* Avatar */}
                                {comment.author.avatar ? (
                                    <Image
                                        src={comment.author.avatar}
                                        alt={comment.author.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {comment.author.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">{comment.author.name}</span>
                                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                                    </div>

                                    {editingComment === comment._id ? (
                                        <div className="mb-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple mb-2"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditComment(comment._id)}
                                                    className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingComment(null);
                                                        setEditContent("");
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-700 mb-3">{comment.content}</p>
                                            {comment.images && comment.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {comment.images.map((img, index) => (
                                                        <Image
                                                            key={index}
                                                            src={img.url}
                                                            alt={`Comment image ${index}`}
                                                            width={150}
                                                            height={150}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLikeComment(comment._id)}
                                            className={`flex items-center gap-1 text-sm ${
                                                isLiked(comment) ? "text-red-600" : "text-gray-600"
                                            }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked(comment) ? "fill-current" : ""}`} />
                                            <span>{comment.likesCount || comment.likes?.length || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReplyingTo(comment._id);
                                                setReplyContent("");
                                            }}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-purple"
                                        >
                                            <Reply className="w-4 h-4" />
                                            <span>Reply</span>
                                        </button>
                                        {canEditDelete(comment) && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingComment(comment._id);
                                                        setEditContent(comment.content);
                                                    }}
                                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-purple"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Reply Form */}
                                    {replyingTo === comment._id && (
                                        <div className="mt-4 pl-4 border-l-2 border-brand-purple">
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple mb-2"
                                                rows={3}
                                            />
                                            {replyImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {replyImages.map((file, index) => (
                                                        <div key={index} className="relative">
                                                            <Image
                                                                src={URL.createObjectURL(file)}
                                                                alt={`Reply preview ${index}`}
                                                                width={100}
                                                                height={100}
                                                                className="rounded-lg object-cover"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    setReplyImages(
                                                                        replyImages.filter((_, i) => i !== index)
                                                                    )
                                                                }
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    ref={replyFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    max={6}
                                                    onChange={(e) => handleImageSelect(e, "reply")}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => replyFileInputRef.current?.click()}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span>Image</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReply(comment._id)}
                                                    className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 text-sm"
                                                >
                                                    Send
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyContent("");
                                                        setReplyImages([]);
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(newPage) => {
                                setPage(newPage);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            showInfo={false}
                            scrollToTop={true}
                            className="mt-6"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
