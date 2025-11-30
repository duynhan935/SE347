# 📱 Hệ Thống Chat - Cách Hoạt Động

## 🎯 Tổng Quan

Hệ thống chat cho phép user và merchant chat với nhau real-time qua WebSocket, với các tính năng:

- Real-time messaging
- Lưu trữ tin nhắn vào database
- Hiển thị danh sách conversations
- Đánh dấu tin nhắn đã đọc
- Pagination cho tin nhắn cũ

---

## 🔄 Flow Hoạt Động

### 1. **Khởi Tạo Trang Chat** (`/chat`)

```
User truy cập /chat
    ↓
ChatPage component load
    ↓
Lấy userId từ useAuthStore
    ↓
Gọi API: GET /api/chat/rooms/{userId}
    ↓
Nhận danh sách ChatRoom[]
    ↓
Truyền vào ChatClient component
```

### 2. **Hiển Thị Danh Sách Chat** (ChatList)

```
ChatClient nhận initialRooms
    ↓
Hiển thị ChatList component
    ↓
Với mỗi room:
  - Lấy partnerId (user1Id hoặc user2Id)
  - Gọi authApi.getUserById() để lấy username
  - Hiển thị: avatar, tên, lastMessage, thời gian
```

### 3. **Chọn Một Conversation**

```
User click vào một room trong ChatList
    ↓
ChatClient.setSelectedRoomId(roomId)
    ↓
useEffect trigger khi selectedRoomId thay đổi
    ↓
Gọi API: GET /api/chat/rooms/{roomId}/messages?page=0
    ↓
Nhận danh sách Message[] (20 tin nhắn gần nhất)
    ↓
Reverse array để hiển thị từ cũ → mới
    ↓
Gọi API: PUT /api/chat/rooms/{roomId}/read/{userId}
    (Đánh dấu tất cả tin nhắn là đã đọc)
```

### 4. **Kết Nối WebSocket**

```
Khi selectedRoomId có giá trị
    ↓
useWebSocket hook được trigger
    ↓
Tạo SockJS connection: http://localhost:8080/ws
    ↓
Tạo STOMP Client
    ↓
Kết nối WebSocket
    ↓
Subscribe vào topic: /topic/room/{roomId}
    ↓
Sẵn sàng nhận tin nhắn real-time
```

### 5. **Gửi Tin Nhắn**

```
User nhập tin nhắn và nhấn Send
    ↓
ChatWindow.handleSend()
    ↓
Gọi ChatClient.handleSendMessage()
    ↓
Gọi useWebSocket.sendMessage()
    ↓
Tạo MessageDTO object:
  {
    roomId: "...",
    senderId: currentUserId,
    receiverId: partnerId,
    content: "Hello"
  }
    ↓
Publish qua WebSocket:
  Destination: /app/chat.sendMessage
  Body: JSON.stringify(messageDTO)
    ↓
Backend nhận tại MessageController.sendMessage()
    ↓
Backend xử lý:
  1. Lưu vào database (Message table)
  2. Cập nhật ChatRoom (lastMessage, lastMessageTime)
  3. Publish lên Redis channel "messages"
    ↓
Redis Subscriber nhận message
    ↓
Forward đến WebSocket clients qua topic: /topic/room/{roomId}
    ↓
Tất cả clients đang subscribe room đó nhận được message
```

### 6. **Nhận Tin Nhắn Real-Time**

```
Backend gửi message qua WebSocket topic
    ↓
useWebSocket hook nhận message
    ↓
Parse JSON → MessageDTO
    ↓
Gọi callback: onMessageReceived(messageDTO)
    ↓
ChatClient xử lý:
  1. Convert MessageDTO → Message
  2. Thêm vào messages state
  3. Cập nhật room.lastMessage trong rooms state
    ↓
ChatWindow re-render với message mới
    ↓
Auto scroll xuống tin nhắn mới nhất
```

---

## 🏗️ Kiến Trúc Component

### Component Hierarchy

```
ChatPage (Client Component)
├── Load rooms từ API
├── Check authentication
└── Render ChatClient

ChatClient (Client Component)
├── State Management:
│   ├── rooms: ChatRoom[]
│   ├── selectedRoomId: string | null
│   ├── messages: Message[]
│   ├── partnerId: string | null
│   └── partnerName: string
├── useWebSocket Hook
│   └── Quản lý WebSocket connection
├── ChatList Component
│   └── Hiển thị danh sách conversations
└── ChatWindow Component
    └── Hiển thị messages và input
```

### Data Flow

```
┌─────────────┐
│   Backend   │
│  (Spring)   │
└──────┬──────┘
       │
       ├── REST API (HTTP)
       │   ├── GET /api/chat/rooms/{userId}
       │   ├── GET /api/chat/rooms/{roomId}/messages
       │   └── PUT /api/chat/rooms/{roomId}/read/{userId}
       │
       └── WebSocket (STOMP)
           ├── Connect: /ws
           ├── Send: /app/chat.sendMessage
           └── Receive: /topic/room/{roomId}
       │
┌──────▼──────┐
│  Frontend   │
│  (Next.js)  │
└──────┬──────┘
       │
       ├── chatApi.ts
       │   └── Wrapper cho REST API calls
       │
       ├── useWebSocket.ts
       │   └── Hook quản lý WebSocket
       │
       └── Components
           ├── ChatPage
           ├── ChatClient
           ├── ChatList
           └── ChatWindow
```

---

## 🔌 WebSocket Connection Details

### Connection Flow

1. **Khi room được chọn:**

      ```typescript
      selectedRoomId = "user1_user2"
      ↓
      useWebSocket hook detect change
      ↓
      Disconnect old connection (nếu có)
      ↓
      Create new SockJS socket
      ↓
      Create STOMP Client
      ↓
      client.activate()
      ↓
      onConnect() callback
      ↓
      Subscribe to /topic/room/{roomId}
      ```

2. **Khi room thay đổi:**

      ```typescript
      selectedRoomId thay đổi
      ↓
      useEffect cleanup: disconnect()
      ↓
      useEffect: connect() với roomId mới
      ```

3. **Khi component unmount:**
      ```typescript
      useEffect cleanup
      ↓
      client.deactivate()
      ↓
      WebSocket closed
      ```

### Message Format

**Gửi đi (MessageDTO):**

```json
{
        "roomId": "user1_user2",
        "senderId": "user1",
        "receiverId": "user2",
        "content": "Hello!",
        "timestamp": "2024-01-01T12:00:00"
}
```

**Nhận về (MessageDTO):**

```json
{
        "roomId": "user1_user2",
        "senderId": "user2",
        "receiverId": "user1",
        "content": "Hi there!",
        "timestamp": "2024-01-01T12:00:01"
}
```

---

## 📊 State Management

### ChatClient State

```typescript
{
  rooms: ChatRoom[]              // Danh sách tất cả conversations
  selectedRoomId: string | null  // Room đang được chọn
  messages: Message[]            // Tin nhắn của room hiện tại
  partnerId: string | null       // ID của người đang chat
  partnerName: string            // Tên của người đang chat
  isLoadingMessages: boolean    // Đang load messages
}
```

### useWebSocket State

```typescript
{
  isConnected: boolean           // WebSocket connection status
  messages: MessageDTO[]         // Messages từ WebSocket (internal)
  clientRef: Client | null       // STOMP client instance
}
```

---

## 🎨 UI Flow

### 1. Trang Chat Trống

```
┌─────────────────────────────┐
│  Messages                    │
│  Chat with merchants...      │
├──────────┬──────────────────┤
│          │                  │
│ ChatList │  Select a        │
│ (Empty)  │  conversation     │
│          │                  │
└──────────┴──────────────────┘
```

### 2. Có Conversations

```
┌──────────┬──────────────────┐
│ ChatList │  ChatWindow      │
├──────────┤                  │
│ Room 1   │  Partner Name    │
│ Room 2 ← │  ────────────────│
│ Room 3   │  [Messages...]   │
│          │  ────────────────│
│          │  [Input field]    │
└──────────┴──────────────────┘
```

### 3. Real-time Update

```
User A gửi message
    ↓
Backend xử lý & broadcast
    ↓
User B nhận message qua WebSocket
    ↓
ChatWindow tự động update
    ↓
Message xuất hiện ngay lập tức
    ↓
Auto scroll to bottom
```

---

## 🔐 Authentication & Security

- **REST API:** Sử dụng JWT token từ `useAuthStore`
- **WebSocket:** Kết nối trực tiếp, backend có thể validate qua token (nếu cần)
- **Authorization:** User chỉ thấy rooms mà họ tham gia

---

## 🚀 Tính Năng Nâng Cao

### 1. **Pagination**

- Load 20 tin nhắn mỗi lần
- Có thể scroll up để load thêm (chưa implement)

### 2. **Unread Count**

- API có sẵn: `/api/chat/rooms/unreadCount/{userId}`
- Có thể hiển thị badge trên ChatList (chưa implement)

### 3. **Mark as Read**

- Tự động đánh dấu đã đọc khi mở room
- API: `PUT /api/chat/rooms/{roomId}/read/{userId}`

### 4. **Start New Chat**

- Utility function: `startChat(userId1, userId2)`
- Tự động tạo room nếu chưa có
- Navigate: `/chat?roomId=xxx`

---

## 🐛 Debugging Tips

### Kiểm tra WebSocket Connection

```javascript
// Mở Browser Console
// Xem logs:
"WebSocket connected";
"Subscribe to /topic/room/{roomId}";
```

### Kiểm tra Message Flow

```javascript
// Backend logs sẽ show:
"Received from Redis: {...}";
"Forwarded to WebSocket topic: /topic/room/{roomId}";
```

### Common Issues

1. **WebSocket không kết nối:**

      - Kiểm tra backend có chạy không
      - Kiểm tra URL: `http://localhost:8080/ws`
      - Kiểm tra CORS settings

2. **Tin nhắn không hiển thị:**

      - Kiểm tra roomId có đúng không
      - Kiểm tra subscription topic
      - Kiểm tra console errors

3. **Duplicate messages:**
      - Code đã có logic check duplicate
      - Nếu vẫn bị, kiểm tra WebSocket reconnect

---

## 📝 Tóm Tắt

**Flow chính:**

1. Load rooms → Hiển thị danh sách
2. Chọn room → Load messages → Kết nối WebSocket
3. Gửi message → WebSocket → Backend → Redis → Broadcast
4. Nhận message → Update UI real-time

**Key Points:**

- REST API cho data cũ (rooms, messages)
- WebSocket cho real-time messaging
- State management trong React hooks
- Auto reconnect khi mất kết nối
- Optimistic UI updates
