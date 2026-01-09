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
}

export default function ChatWindow({
        messages,
        currentUserId,
        partnerId,
        partnerName,
        onSendMessage,
        isConnected,
        isLoading = false,
}: ChatWindowProps) {
        const [inputValue, setInputValue] = useState("");
        const messagesEndRef = useRef<HTMLDivElement>(null);
        const messagesContainerRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const isInitialLoadRef = useRef(true);
        const lastMessageCountRef = useRef(0);
        const shouldAutoScrollRef = useRef(true);

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
                        const date = new Date(timestamp);
                        return format(date, "HH:mm");
                } catch {
                        return "";
                }
        };

        return (
                <div className="flex flex-col h-full bg-white">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                {partnerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{partnerName}</h3>
                                                <div className="flex items-center gap-2">
                                                        <div
                                                                className={`w-2 h-2 rounded-full ${
                                                                        isConnected ? "bg-green-500" : "bg-gray-400"
                                                                }`}
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                                {isConnected ? "Online" : "Offline"}
                                                        </span>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* Messages */}
                        <div 
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                                style={{ minHeight: 0 }} // Ensure flex child can shrink
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
                                                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                                                        isOwnMessage
                                                                                                ? "bg-blue-500 text-white rounded-br-none"
                                                                                                : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                                                                                }`}
                                                                        >
                                                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                                                        {message.content}
                                                                                </p>
                                                                                <p
                                                                                        className={`text-xs mt-1 ${
                                                                                                isOwnMessage
                                                                                                        ? "text-blue-100"
                                                                                                        : "text-gray-500"
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

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex items-center gap-2">
                                        <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                                                disabled={!isConnected}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <button
                                        title="Send Message"
                                                onClick={handleSend}
                                                disabled={!isConnected || !inputValue.trim()}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                                <Send className="w-5 h-5" />
                                        </button>
                                </div>
                        </div>
                </div>
        );
}
