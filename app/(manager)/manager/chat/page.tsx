"use client";

import { Send, Search, Clock, CheckCheck, User } from "lucide-react";
import { useState } from "react";

interface ChatRoom {
	id: string;
	customerName: string;
	lastMessage: string;
	unreadCount: number;
	time: string;
	orderId?: string;
}

interface Message {
	id: string;
	sender: "customer" | "manager";
	content: string;
	timestamp: string;
	read: boolean;
}

const mockChatRooms: ChatRoom[] = [
	{
		id: "1",
		customerName: "Nguyễn Văn A",
		lastMessage: "Đơn hàng của tôi đã đến đâu rồi?",
		unreadCount: 2,
		time: "5 phút trước",
		orderId: "#12345",
	},
	{
		id: "2",
		customerName: "Trần Thị B",
		lastMessage: "Cảm ơn nhà hàng!",
		unreadCount: 0,
		time: "1 giờ trước",
		orderId: "#12344",
	},
	{
		id: "3",
		customerName: "Lê Văn C",
		lastMessage: "Tôi muốn thay đổi địa chỉ giao hàng",
		unreadCount: 1,
		time: "2 giờ trước",
		orderId: "#12343",
	},
];

const mockMessages: Message[] = [
	{
		id: "1",
		sender: "customer",
		content: "Xin chào, đơn hàng của tôi đã đến đâu rồi?",
		timestamp: "14:30",
		read: true,
	},
	{
		id: "2",
		sender: "manager",
		content: "Xin chào quý khách! Đơn hàng #12345 của bạn đang được chuẩn bị. Dự kiến sẽ giao trong 20 phút nữa.",
		timestamp: "14:32",
		read: true,
	},
	{
		id: "3",
		sender: "customer",
		content: "Vâng, cảm ơn bạn!",
		timestamp: "14:33",
		read: true,
	},
];

const quickReplies = [
	"Đơn hàng đang được chuẩn bị",
	"Shipper đang trên đường giao hàng",
	"Cảm ơn quý khách đã ủng hộ!",
	"Xin lỗi vì sự bất tiện này",
];

export default function ChatPage() {
	const [selectedRoom, setSelectedRoom] = useState<string>("1");
	const [messageText, setMessageText] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredRooms = mockChatRooms.filter((room) =>
		room.customerName.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="h-[calc(100vh-6rem)] flex gap-4">
			{/* Chat List */}
			<div className="w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
				<div className="p-4 border-b dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tin Nhắn</h2>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm khách hàng..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple focus:border-transparent"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto">
					{filteredRooms.map((room) => (
						<button
							key={room.id}
							onClick={() => setSelectedRoom(room.id)}
							className={`w-full p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
								selectedRoom === room.id ? "bg-brand-purple/5 dark:bg-brand-purple/10" : ""
							}`}
						>
							<div className="flex items-start justify-between mb-1">
								<div className="flex items-center gap-2">
									<div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center">
										<User className="h-5 w-5 text-brand-purple" />
									</div>
									<div>
										<p className="font-medium text-gray-900 dark:text-white">{room.customerName}</p>
										{room.orderId && (
											<p className="text-xs text-gray-500 dark:text-gray-400">{room.orderId}</p>
										)}
									</div>
								</div>
								{room.unreadCount > 0 && (
									<span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
										{room.unreadCount}
									</span>
								)}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 truncate">{room.lastMessage}</p>
							<div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
								<Clock className="h-3 w-3" />
								{room.time}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Chat Window */}
			<div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
				{/* Chat Header */}
				<div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center">
							<User className="h-5 w-5 text-brand-purple" />
						</div>
						<div>
							<p className="font-semibold text-gray-900 dark:text-white">Nguyễn Văn A</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">Đơn hàng #12345</p>
						</div>
					</div>
					<div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-green-500"></div>
						Đang hoạt động
					</div>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{mockMessages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.sender === "manager" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[70%] rounded-lg p-3 ${
									message.sender === "manager"
										? "bg-brand-purple text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
								}`}
							>
								<p className="text-sm">{message.content}</p>
								<div
									className={`flex items-center gap-1 mt-1 text-xs ${
										message.sender === "manager"
											? "text-white/70 justify-end"
											: "text-gray-500 dark:text-gray-400"
									}`}
								>
									<span>{message.timestamp}</span>
									{message.sender === "manager" && <CheckCheck className="h-3 w-3" />}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Quick Replies */}
				<div className="px-4 py-2 border-t dark:border-gray-700">
					<div className="flex flex-wrap gap-2">
						{quickReplies.map((reply, index) => (
							<button
								key={index}
								onClick={() => setMessageText(reply)}
								className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
							>
								{reply}
							</button>
						))}
					</div>
				</div>

				{/* Input */}
				<div className="p-4 border-t dark:border-gray-700">
					<div className="flex gap-2">
						<input
							type="text"
							placeholder="Nhập tin nhắn..."
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === "Enter" && messageText.trim()) {
									// Handle send message
									setMessageText("");
								}
							}}
							className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple focus:border-transparent"
						/>
						<button
							disabled={!messageText.trim()}
							className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
						>
							<Send className="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>

			{/* Customer Info Sidebar */}
			<div className="w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<h3 className="font-semibold text-gray-900 dark:text-white mb-4">Thông Tin Khách Hàng</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-center">
						<div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center">
							<User className="h-10 w-10 text-brand-purple" />
						</div>
					</div>
					<div className="text-center">
						<p className="font-medium text-gray-900 dark:text-white">Nguyễn Văn A</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">Khách hàng thường xuyên</p>
					</div>
					<div className="space-y-2 pt-4 border-t dark:border-gray-700">
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
							<p className="text-sm text-gray-900 dark:text-white">nguyenvana@email.com</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Số điện thoại</p>
							<p className="text-sm text-gray-900 dark:text-white">0912345678</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
							<p className="text-sm font-medium text-brand-purple">24 đơn</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Tổng chi tiêu</p>
							<p className="text-sm font-medium text-brand-purple">4.500.000₫</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
