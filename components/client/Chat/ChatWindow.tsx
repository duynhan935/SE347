"use client";

import { Message } from "@/types";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
        messages: Message[];
        currentUserId: string;
        partnerId: string;
        partnerName: string;
        onSendMessage: (content: string, receiverId: string) => void;
        isConnected: boolean;
        isLoading?: boolean;
        onMarkAsRead?: () => void; // Callback to mark messages as read
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
                const threshold = 100; // 100px from bottom
                return (
                        container.scrollHeight - container.scrollTop - container.clientHeight <
                        threshold
                );
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

        // Scroll to bottom when messages change, but only if user is near bottom or it's initial load
        useEffect(() => {
                // Don't scroll during initial load
                if (isLoading) {
                        isInitialLoadRef.current = true;
                        return;
                }

                const messageCount = messages.length;
                const isNewMessage = messageCount > lastMessageCountRef.current;
                lastMessageCountRef.current = messageCount;

                // After loading completes, scroll to bottom
                if (isInitialLoadRef.current && !isLoading && messages.length > 0) {
                        // Use requestAnimationFrame for smoother initial scroll
                        requestAnimationFrame(() => {
                                setTimeout(() => {
                                        scrollToBottom("auto");
                                        isInitialLoadRef.current = false;
                                        shouldAutoScrollRef.current = true;
                                }, 50);
                        });
                } else if (!isLoading && messages.length > 0 && isNewMessage) {
                        // Only scroll if user is near bottom (reading new messages) or if we should auto-scroll
                        if (shouldAutoScrollRef.current || isNearBottom()) {
                                // Use requestAnimationFrame for smoother scroll
                                requestAnimationFrame(() => {
                                        setTimeout(() => {
                                                scrollToBottom("smooth");
                                        }, 30);
                                });
                        }
                }
        }, [messages, isLoading]);

        // Mark messages as read when user interacts with chat window (click input, focus, etc.)
        useEffect(() => {
                if (!isLoading && onMarkAsRead && !hasMarkedAsReadRef.current) {
                        // Mark as read when component is ready (after loading)
                        const timer = setTimeout(() => {
                                onMarkAsRead();
                                hasMarkedAsReadRef.current = true;
                        }, 300); // Small delay to ensure everything is loaded

                        return () => clearTimeout(timer);
                }
        }, [isLoading, onMarkAsRead]);

        // Reset hasMarkedAsReadRef when room changes (detected by partnerId change)
        useEffect(() => {
                hasMarkedAsReadRef.current = false;
        }, [partnerId]);

        // Track scroll position to determine if user scrolled up
        useEffect(() => {
                const container = messagesContainerRef.current;
                if (!container) return;

                const handleScroll = () => {
                        // If user scrolls up, disable auto-scroll
                        if (!isNearBottom()) {
                                shouldAutoScrollRef.current = false;
                        } else {
                                // If user scrolls back to bottom, enable auto-scroll
                                shouldAutoScrollRef.current = true;
                        }
                };

                container.addEventListener("scroll", handleScroll);
                return () => container.removeEventListener("scroll", handleScroll);
        }, []);

        const handleSend = () => {
                const trimmedContent = inputValue.trim();
                if (!trimmedContent || !isConnected) return;

                // Force auto-scroll when user sends a message
                // The useEffect will handle scrolling when messages update
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

        const formatMessageTime = (timestamp: string) => {
                try {
                        // Backend sends timestamp without timezone (LocalDateTime from Java)
                        // Timestamp format: "2026-01-11T12:21:59" (no timezone)
                        // Backend stores in UTC, so we need to parse it as UTC
                        // If timestamp doesn't have timezone indicator, append 'Z' to treat as UTC
                        let timestampToParse = timestamp.trim();
                        
                        // Check if timestamp already has timezone (ends with Z, +, or -)
                        if (!timestampToParse.endsWith('Z') && 
                            !timestampToParse.match(/[+-]\d{2}:\d{2}$/) && 
                            !timestampToParse.match(/[+-]\d{4}$/)) {
                                // Append 'Z' to treat as UTC
                                timestampToParse = timestampToParse + 'Z';
                        }
                        
                        const date = new Date(timestampToParse);
                        const formatted = format(date, "HH:mm");
                        return formatted;
                } catch (error) {
                        console.error("⏰ formatMessageTime - Error:", error, "timestamp:", timestamp);
                        return "";
                }
        };

        return (
                <div className="flex flex-col h-full bg-white">
                        {/* Header - Improved design */}
                        <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {partnerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 text-lg">{partnerName}</h3>
                                                {isConnected && (
                                                        <p className="text-xs text-green-500 font-medium">Online</p>
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* Messages */}
                        <div 
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0"
                        >
                                {isLoading && messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full min-h-[400px]">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        </div>
                                ) : messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
                                                <p>No messages yet. Start the conversation!</p>
                                        </div>
                                ) : (
                                        <>
                                                {messages.map((message) => {
                                                        const isOwnMessage = message.senderId === currentUserId;
                                                        return (
                                                                <div
                                                                        key={message.id}
                                                                        className={`flex ${
                                                                                isOwnMessage ? "justify-end" : "justify-start"
                                                                        }`}
                                                                >
                                                                        <div
                                                                                className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm ${
                                                                                        isOwnMessage
                                                                                                ? "bg-brand-purple text-white rounded-br-md"
                                                                                                : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                                                                                }`}
                                                                        >
                                                                                <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                                                                                        {message.content}
                                                                                </p>
                                                                                <p
                                                                                        className={`text-xs mt-2 ${
                                                                                                isOwnMessage
                                                                                                        ? "text-purple-100"
                                                                                                        : "text-gray-400"
                                                                                        }`}
                                                                                >
                                                                                        {formatMessageTime(message.timestamp)}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        );
                                                })}
                                                {isLoading && messages.length > 0 && (
                                                        <div className="flex justify-center py-2">
                                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                        </div>
                                                )}
                                                <div ref={messagesEndRef} />
                                        </>
                                )}
                        </div>

                        {/* Input - Improved design */}
                        <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                        <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                onFocus={() => {
                                                        // Mark as read when user clicks/focuses on input
                                                        if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                                                onMarkAsRead();
                                                                hasMarkedAsReadRef.current = true;
                                                        }
                                                }}
                                                onClick={() => {
                                                        // Mark as read when user clicks on input
                                                        if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                                                onMarkAsRead();
                                                                hasMarkedAsReadRef.current = true;
                                                        }
                                                }}
                                                placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                                                disabled={!isConnected}
                                                className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                                        />
                                        <button
                                                title="Gửi tin nhắn"
                                                onClick={handleSend}
                                                disabled={!isConnected || !inputValue.trim()}
                                                className="p-3 bg-brand-purple text-white rounded-full hover:bg-brand-purple/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100"
                                        >
                                                <Send className="w-5 h-5" />
                                        </button>
                                </div>
                        </div>
                </div>
        );
}
