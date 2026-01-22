"use client";

import { Message } from "@/types";
import { ArrowLeft, Loader2, Paperclip, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
    messages: Message[];
    currentUserId: string;
    partnerId: string;
    partnerName: string;
    onSendMessage: (content: string, receiverId: string) => void;
    isConnected: boolean;
    isLoading?: boolean;
    onMarkAsRead?: () => void;
    onBack?: () => void; // For mobile back button
}

export default function ChatWindow({
    messages,
    currentUserId,
    partnerId,
    partnerName,
    onSendMessage,
    isConnected,
    isLoading = false,
    onMarkAsRead,
    onBack,
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialLoadRef = useRef(true);
    const lastMessageCountRef = useRef(0);
    const shouldAutoScrollRef = useRef(true);
    const hasMarkedAsReadRef = useRef(false);

    // Check if user is near bottom of scroll container
    const isNearBottom = () => {
        if (!messagesContainerRef.current) return true;
        const container = messagesContainerRef.current;
        const threshold = 100;
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    // Scroll to bottom helper
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (isLoading) {
            isInitialLoadRef.current = true;
            return;
        }

        // Use filtered and sorted messages for scroll detection
        const filteredMessages = messages.filter((message) => {
            const isFromCurrentUser = message.senderId === currentUserId;
            const isToCurrentUser = message.receiverId === currentUserId;
            const isFromPartner = message.senderId === partnerId;
            const isToPartner = message.receiverId === partnerId;
            return (isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser);
        });

        const messageCount = filteredMessages.length;
        const isNewMessage = messageCount > lastMessageCountRef.current;
        lastMessageCountRef.current = messageCount;

        if (isInitialLoadRef.current && !isLoading && filteredMessages.length > 0) {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    scrollToBottom("auto");
                    isInitialLoadRef.current = false;
                    shouldAutoScrollRef.current = true;
                }, 50);
            });
        } else if (!isLoading && filteredMessages.length > 0 && isNewMessage) {
            if (shouldAutoScrollRef.current || isNearBottom()) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        scrollToBottom("smooth");
                    }, 30);
                });
            }
        }
    }, [messages, isLoading, currentUserId, partnerId]);

    // Mark messages as read
    useEffect(() => {
        if (!isLoading && onMarkAsRead && !hasMarkedAsReadRef.current) {
            const timer = setTimeout(() => {
                onMarkAsRead();
                hasMarkedAsReadRef.current = true;
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading, onMarkAsRead]);

    // Reset hasMarkedAsReadRef when room changes
    useEffect(() => {
        hasMarkedAsReadRef.current = false;
    }, [partnerId]);

    // Track scroll position
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (!isNearBottom()) {
                shouldAutoScrollRef.current = false;
            } else {
                shouldAutoScrollRef.current = true;
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSend = () => {
        const trimmedContent = inputValue.trim();
        if (!trimmedContent || !isConnected) return;

        shouldAutoScrollRef.current = true;
        onSendMessage(trimmedContent, partnerId);
        setInputValue("");
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Filter messages to only show messages between currentUserId and partnerId
    // This prevents showing messages from other conversations
    const filteredMessages = messages.filter((message) => {
        const isFromCurrentUser = message.senderId === currentUserId;
        const isToCurrentUser = message.receiverId === currentUserId;
        const isFromPartner = message.senderId === partnerId;
        const isToPartner = message.receiverId === partnerId;
        
        // Only show messages where:
        // - Current user sent to partner, OR
        // - Partner sent to current user
        return (isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser);
    });

    // Remove duplicate messages based on id, content, senderId, receiverId, and timestamp
    const uniqueMessages = filteredMessages.reduce((acc, message) => {
        const existingIndex = acc.findIndex((m) => {
            const sameId = m.id === message.id;
            const sameContent = m.content === message.content;
            const sameSender = m.senderId === message.senderId;
            const sameReceiver = m.receiverId === message.receiverId;
            const timeDiff = Math.abs(
                new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()
            );
            const sameTime = timeDiff < 1000; // Within 1 second
            
            return sameId || (sameContent && sameSender && sameReceiver && sameTime);
        });
        
        if (existingIndex === -1) {
            acc.push(message);
        }
        
        return acc;
    }, [] as Message[]);

    // Sort messages by timestamp
    const sortedMessages = [...uniqueMessages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header - Sticky Top */}
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back to chat list"
                            title="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        <span>{partnerName.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{partnerName}</h3>
                    </div>

                    {/* Visit Shop Button */}
                    <Link
                        href={`/restaurants?merchantId=${partnerId}`}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#EE4D2D] text-[#EE4D2D] rounded-lg hover:bg-[#EE4D2D]/10 transition-colors whitespace-nowrap"
                    >
                        Visit Shop
                    </Link>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0 scrollbar-hide"
            >
                {isLoading && sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#EE4D2D]" />
                    </div>
                ) : sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {sortedMessages.map((message) => {
                            const isOwnMessage = message.senderId === currentUserId;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${isOwnMessage ? "justify-end items-end" : "justify-start items-start"}`}
                                >
                                    {/* Avatar for received messages */}
                                    {!isOwnMessage && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                            <span>{partnerName.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} flex-shrink-0`}>
                                        <div
                                            className={`max-w-[75%] md:max-w-[65%] min-w-[120px] rounded-lg px-3 py-2 shadow-sm inline-block text-sm md:text-base leading-relaxed whitespace-normal break-words ${
                                                isOwnMessage
                                                    ? "bg-[#EE4D2D] text-white rounded-l-lg rounded-tr-lg"
                                                    : "bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg"
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && sortedMessages.length > 0 && (
                            <div className="flex justify-center py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area - Sticky Bottom */}
            <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    {/* Image/Attachment Button */}
                    <button
                        type="button"
                        className="p-2.5 text-gray-500 hover:text-[#EE4D2D] hover:bg-orange-50 rounded-full transition-colors"
                        title="Send image"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => {
                            if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                onMarkAsRead();
                                hasMarkedAsReadRef.current = true;
                            }
                        }}
                        onClick={() => {
                            if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                onMarkAsRead();
                                hasMarkedAsReadRef.current = true;
                            }
                        }}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/20 focus:border-[#EE4D2D] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    />

                    {/* Send Button */}
                    <button
                        title="Send message"
                        onClick={handleSend}
                        disabled={!isConnected || !inputValue.trim()}
                        className="p-2.5 bg-[#EE4D2D] text-white rounded-full hover:bg-[#EE4D2D]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
