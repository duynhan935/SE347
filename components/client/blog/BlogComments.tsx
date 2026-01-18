"use client";

import Pagination from "@/components/client/Pagination";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Comment, CommentListResponse } from "@/types/blog.type";
import { ChevronDown, ChevronUp, Heart, Image as ImageIcon, Send, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BlogCommentsProps {
    blogId: string;
    onCommentAdded?: () => void; // Callback when a new comment is added
}

export default function BlogComments({ blogId, onCommentAdded }: BlogCommentsProps) {
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
    const [replies, setReplies] = useState<Record<string, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(true); // Toggle for showing/hiding comments
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replyFileInputRef = useRef<HTMLInputElement>(null);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await blogApi.getComments(blogId, { page, limit: 15 });
            // Handle response structure: response.data or response.comments (API might return either)
            const responseWithComments = response as CommentListResponse & { comments?: Comment[] };
            const commentsData = response.data || responseWithComments.comments || [];
            setComments(Array.isArray(commentsData) ? commentsData : []);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            toast.error("Failed to load comments");
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [blogId, page]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

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
            // Notify parent component to update comments count
            if (onCommentAdded) {
                onCommentAdded();
            }
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
                    avatar: typeof user.avatar === "string" ? user.avatar : undefined,
                },
                images: replyImages,
            });
            toast.success("Reply posted");
            setReplyingTo(null);
            setReplyContent("");
            setReplyImages([]);
            // Refresh replies for this comment
            fetchReplies(parentId);
            // Refresh comments list to update count
            fetchComments();
            // Notify parent component to update comments count
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error) {
            console.error("Failed to reply comment:", error);
            toast.error("Unable to reply to comment");
        }
    };

    const fetchReplies = async (commentId: string) => {
        if (loadingReplies[commentId]) return;

        setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
        try {
            const response = await blogApi.getReplies(blogId, commentId);
            setReplies((prev) => ({ ...prev, [commentId]: response.data || [] }));
            setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
        } catch (error) {
            console.error("Failed to fetch replies:", error);
        } finally {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleReplies = (commentId: string) => {
        const isExpanded = expandedReplies[commentId];
        if (!isExpanded && !replies[commentId]) {
            fetchReplies(commentId);
        } else {
            setExpandedReplies((prev) => ({ ...prev, [commentId]: !isExpanded }));
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
        <div>
            {/* Header with Toggle Button */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Comments ({comments?.length || 0})</h3>
                <button
                    onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#EE4D2D] hover:bg-gray-50 rounded-lg transition-all"
                    aria-label={isCommentsExpanded ? "Hide comments" : "Show comments"}
                >
                    <span className="font-medium">{isCommentsExpanded ? "Hide" : "Show"}</span>
                    {isCommentsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Comments List - Render First (Facebook Style) - Conditionally Rendered */}
            {isCommentsExpanded && (
                <>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#EE4D2D]"></div>
                            <p className="mt-4 text-sm text-gray-500">Loading comments...</p>
                        </div>
                    ) : !Array.isArray(comments) || comments.length === 0 ? (
                        <div className="text-center py-8 border-t border-gray-200 mt-8 pt-8">
                            <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3 animate-fadeIn">
                                    {/* Avatar - Left */}
                                    <div className="flex-shrink-0">
                                        {comment.author.avatar ? (
                                            <Image
                                                src={comment.author.avatar}
                                                alt={comment.author.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#EE4D2D] flex items-center justify-center text-white font-bold text-sm">
                                                {comment.author.name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Bubble - Facebook Style */}
                                    <div className="flex-1 min-w-0">
                                        {/* Comment Bubble - Gray Background */}
                                        <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-none">
                                            {/* Name inside bubble */}
                                            <span className="font-semibold text-sm text-gray-900 mr-2">
                                                {comment.author.name || "User"}
                                            </span>

                                            {/* Content */}
                                            {editingComment === comment._id ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] mb-2"
                                                        rows={3}
                                                        aria-label="Edit comment"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditComment(comment._id)}
                                                            className="px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#c43e24] text-sm"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingComment(null);
                                                                setEditContent("");
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line mt-1">
                                                        {comment.content}
                                                    </p>
                                                    {comment.images && comment.images.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {comment.images.map((img, index) => (
                                                                <Image
                                                                    key={index}
                                                                    src={img.url}
                                                                    alt={`Comment image ${index}`}
                                                                    width={120}
                                                                    height={120}
                                                                    className="rounded-lg object-cover border border-gray-200"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Actions - Outside Bubble (Below) */}
                                        <div className="flex items-center gap-3 mt-1 ml-1">
                                            <button
                                                onClick={() => handleLikeComment(comment._id)}
                                                className={`flex items-center gap-1 text-xs font-medium ${
                                                    isLiked(comment)
                                                        ? "text-red-600 hover:text-red-700"
                                                        : "text-gray-500 hover:text-[#EE4D2D]"
                                                } transition-colors`}
                                            >
                                                <Heart
                                                    className={`w-3.5 h-3.5 ${isLiked(comment) ? "fill-current" : ""}`}
                                                />
                                                <span>{comment.likesCount || comment.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(comment._id);
                                                    setReplyContent("");
                                                    // Auto-expand replies when replying
                                                    if (!expandedReplies[comment._id] && !replies[comment._id]) {
                                                        fetchReplies(comment._id);
                                                    }
                                                }}
                                                className="text-xs text-gray-500 hover:text-[#EE4D2D] font-medium transition-colors"
                                            >
                                                Reply
                                            </button>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                            {replies[comment._id] &&
                                                replies[comment._id].length > 0 &&
                                                !expandedReplies[comment._id] && (
                                                    <button
                                                        onClick={() => toggleReplies(comment._id)}
                                                        className="text-xs text-gray-500 hover:text-[#EE4D2D] font-medium transition-colors"
                                                    >
                                                        View {replies[comment._id].length} replies
                                                    </button>
                                                )}
                                            {canEditDelete(comment) && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingComment(comment._id);
                                                            setEditContent(comment.content);
                                                        }}
                                                        className="text-xs text-gray-500 hover:text-[#EE4D2D] font-medium transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Replies Section - Facebook Style */}
                                        {replies[comment._id] &&
                                            replies[comment._id].length > 0 &&
                                            expandedReplies[comment._id] && (
                                                <div className="mt-3 ml-12 space-y-3">
                                                    {replies[comment._id].map((reply) => (
                                                        <div key={reply._id} className="flex gap-3">
                                                            {reply.author.avatar ? (
                                                                <Image
                                                                    src={reply.author.avatar}
                                                                    alt={reply.author.name}
                                                                    width={32}
                                                                    height={32}
                                                                    className="rounded-full flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-[#EE4D2D] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                                    {reply.author.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-none">
                                                                    <span className="font-semibold text-sm text-gray-900 mr-2">
                                                                        {reply.author.name}
                                                                    </span>
                                                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line mt-1">
                                                                        {reply.content}
                                                                    </p>
                                                                    {reply.images && reply.images.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                            {reply.images.map((img, index) => (
                                                                                <Image
                                                                                    key={index}
                                                                                    src={img.url}
                                                                                    alt={`Reply image ${index}`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className="rounded-lg object-cover border border-gray-200"
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 ml-1">
                                                                    <button
                                                                        onClick={() => handleLikeComment(reply._id)}
                                                                        className={`flex items-center gap-1 text-xs font-medium ${
                                                                            isLiked(reply)
                                                                                ? "text-red-600 hover:text-red-700"
                                                                                : "text-gray-500 hover:text-[#EE4D2D]"
                                                                        } transition-colors`}
                                                                    >
                                                                        <Heart
                                                                            className={`w-3.5 h-3.5 ${isLiked(reply) ? "fill-current" : ""}`}
                                                                        />
                                                                        <span>
                                                                            {reply.likesCount ||
                                                                                reply.likes?.length ||
                                                                                0}
                                                                        </span>
                                                                    </button>
                                                                    <span className="text-xs text-gray-400">
                                                                        {formatDate(reply.createdAt)}
                                                                    </span>
                                                                    {canEditDelete(reply) && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingComment(reply._id);
                                                                                    setEditContent(reply.content);
                                                                                }}
                                                                                className="text-xs text-gray-500 hover:text-[#EE4D2D] font-medium transition-colors"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeleteComment(reply._id)
                                                                                }
                                                                                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        {/* Show/Hide Replies Button */}
                                        {replies[comment._id] && replies[comment._id].length > 0 && (
                                            <button
                                                onClick={() => toggleReplies(comment._id)}
                                                className="mt-2 ml-12 text-xs text-gray-500 hover:text-[#EE4D2D] transition-colors font-medium"
                                            >
                                                {expandedReplies[comment._id]
                                                    ? "Hide replies"
                                                    : `View ${replies[comment._id].length} replies`}
                                            </button>
                                        )}

                                        {/* Reply Form - Facebook Style */}
                                        {replyingTo === comment._id && (
                                            <div className="mt-3 ml-12 flex gap-3">
                                                {/* Avatar */}
                                                {user?.avatar ? (
                                                    <Image
                                                        src={typeof user.avatar === "string" ? user.avatar : ""}
                                                        alt={user.username || "User"}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#EE4D2D] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                        {user?.username?.charAt(0).toUpperCase() || "?"}
                                                    </div>
                                                )}
                                                {/* Input */}
                                                <div className="flex-1 space-y-2">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className="w-full p-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:bg-white transition-all resize-none"
                                                        rows={2}
                                                    />
                                                    {replyImages.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {replyImages.map((file, index) => (
                                                                <div key={index} className="relative">
                                                                    <Image
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`Reply preview ${index}`}
                                                                        width={80}
                                                                        height={80}
                                                                        className="rounded-lg object-cover border border-gray-300"
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            setReplyImages(
                                                                                replyImages.filter(
                                                                                    (_, i) => i !== index,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                        aria-label="Remove reply image"
                                                                    >
                                                                        <X className="w-3 h-3" />
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
                                                            aria-label="Upload reply images"
                                                        />
                                                        <button
                                                            onClick={() => replyFileInputRef.current?.click()}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#EE4D2D] transition-all"
                                                        >
                                                            <ImageIcon className="w-3.5 h-3.5" />
                                                            <span>Image</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(comment._id)}
                                                            disabled={!replyContent.trim() && replyImages.length === 0}
                                                            className="px-4 py-1.5 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#c43e24] transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Send
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(null);
                                                                setReplyContent("");
                                                                setReplyImages([]);
                                                            }}
                                                            className="px-4 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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

                    {/* Comment Form - Render Last (Facebook Style) */}
                    {isAuthenticated ? (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex gap-3 items-start">
                                {/* Avatar - Left */}
                                {user?.avatar ? (
                                    <Image
                                        src={typeof user.avatar === "string" ? user.avatar : ""}
                                        alt={user.username || "User"}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#EE4D2D] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {user?.username?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                )}

                                {/* Input - Right */}
                                <div className="flex-1 space-y-3">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onFocus={() => setIsCommentFocused(true)}
                                        onBlur={() => {
                                            // Delay to allow button click
                                            setTimeout(() => {
                                                if (!newComment.trim() && commentImages.length === 0) {
                                                    setIsCommentFocused(false);
                                                }
                                            }, 200);
                                        }}
                                        placeholder="Write a comment..."
                                        className="w-full p-3 bg-gray-100 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:bg-white transition-all resize-none"
                                        rows={3}
                                    />
                                    {commentImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {commentImages.map((file, index) => (
                                                <div key={index} className="relative">
                                                    <Image
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index}`}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-lg object-cover border border-gray-300"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setCommentImages(
                                                                commentImages.filter((_, i) => i !== index),
                                                            )
                                                        }
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                        aria-label="Remove image"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Action Buttons - Show when focused or has content */}
                                    {(isCommentFocused || newComment.trim() || commentImages.length > 0) && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                max={6}
                                                onChange={(e) => handleImageSelect(e, "comment")}
                                                className="hidden"
                                                aria-label="Upload comment images"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#EE4D2D] transition-all"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">Image</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleSubmitComment();
                                                    setIsCommentFocused(false);
                                                }}
                                                disabled={!newComment.trim() && commentImages.length === 0}
                                                className="flex items-center gap-2 px-6 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#c43e24] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span className="text-sm font-semibold">Send</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center py-8">
                            <p className="text-gray-600 mb-4">Please login to comment</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
