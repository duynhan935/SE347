# RestaurantWeb 🍽️

A modern, multi-role restaurant ordering web app built with Next.js (App Router) — featuring a customer storefront, real-time chat and notifications, Stripe card payments, and dedicated dashboards for merchants and admins.

## 1) Title & Description

**RestaurantWeb** is a full-featured front-end for a food ordering platform. It supports browsing restaurants and food, managing carts and checkout, paying by card via Stripe, tracking orders, and enabling real-time communication between customers and restaurants.

## 2) Introduction

Online food ordering experiences often split into separate apps for customers, merchants, and administrators. This project brings those experiences into a single, cohesive Next.js application with role-aware routing, shared UI primitives, and real-time events (chat, order updates, notifications).

The app is designed to work with a backend gateway (REST + SSE + WebSockets) and can be configured for local development or containerized environments.

## 3) Key Features

- 🛍️ **Customer storefront**: browse restaurants/foods, search, view details, and manage a shopping cart.
- 💳 **Stripe card checkout**: card payment flow powered by Stripe Elements.
- 📦 **Orders**: create orders, view order history, and see status updates.
- 🔔 **Real-time notifications**: Server-Sent Events (SSE) for order and wallet/payout notifications.
- 💬 **Real-time chat**: SockJS/STOMP-based chat between customers and restaurants/merchants.
- 🧑‍🍳 **Merchant dashboard**: manage restaurant operations (orders, products, messages, wallet, reports).
- 🛡️ **Admin area**: admin route group with management UI (users/restaurants/products/orders, etc.).
- 🔐 **Authentication**: JWT access tokens with automatic refresh handling via Axios interceptors.
- 🎨 **Component system**: Tailwind CSS + shadcn/ui + Radix primitives.

## 4) Overall Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling/UI**: Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- **State**: Zustand stores (auth, cart, chat, location, products, notifications, etc.)
- **Networking**: Axios (with credentials + auth refresh), Next.js Route Handlers for small proxy endpoints
- **Real-time**:
    - SSE (EventSource) for notifications
    - WebSockets via SockJS + STOMP for chat and order status streams
    - socket.io-client for order notification channels
- **Payments**: Stripe Elements (`@stripe/react-stripe-js`, `@stripe/stripe-js`)



## 5) Installation

### Prerequisites

- Node.js **18.18+** (or Node.js 20+ recommended)
- npm (comes with Node.js)

### Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create your local env file:

    ```bash
    copy .env.example .env.local
    ```

3. Update `.env.local` values (see the template below).

## 6) Running the Project

### Development

```bash
npm run dev
```

The dev server uses Turbopack (`next dev --turbopack`).

### Production

```bash
npm run build
npm run start
```

### Validate (typecheck + lint + build)

```bash
npm run validate
```

## 7) Environment Configuration

Create `.env.local` in the project root.

```bash
# -----------------------------
# Public runtime configuration
# -----------------------------

# Base URL for REST API calls.
# Expected format: http(s)://host:port/api
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Backend origin (no /api). Used for SSE and some redirect targets.
# If not set, it is derived from NEXT_PUBLIC_API_URL.
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8080

# SockJS/STOMP base URL (HTTP origin). Used for chat.
# If not set, falls back to NEXT_PUBLIC_BACKEND_ORIGIN.
NEXT_PUBLIC_WS_BASE_URL=http://localhost:8080

# socket.io base URL for order notifications.
# If not set, falls back to NEXT_PUBLIC_BACKEND_ORIGIN.
NEXT_PUBLIC_ORDER_SOCKET_URL=http://localhost:8082

# SockJS/STOMP base URL for the order WebSocket service.
# If not set, falls back to NEXT_PUBLIC_ORDER_SOCKET_URL.
NEXT_PUBLIC_ORDER_WS_BASE_URL=http://localhost:8082

# Stripe publishable key (required for card payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX

# -----------------------------
# Server-only configuration
# -----------------------------

# Optional: when rendering server-side (SSR) inside Docker, use an internal gateway URL.
# Example: http://api-gateway:8080/api
API_INTERNAL_URL=
```

Notes:

- The Axios client is configured with `withCredentials: true` to support refresh-token cookies issued by the backend.
- Some older alias envs may still be supported by the runtime config:
    - `NEXT_PUBLIC_API_BASE_URL` (alias of `NEXT_PUBLIC_API_URL`)
    - `NEXT_PUBLIC_API_ORIGIN` (alias of `NEXT_PUBLIC_BACKEND_ORIGIN`)

## 8) Folder Structure

```text
app/                          Next.js App Router routes, layouts, and route groups
    (auth)/                     Authentication flows (login/register/verify, etc.)
    (admin)/                    Admin layouts and admin routes
    (client)/                   Customer-facing routes (home, restaurants, cart, payment, etc.)
    merchant/                   Merchant dashboard routes (orders/messages/manage/reports/wallet)
    api/                        Next.js Route Handlers (lightweight proxy endpoints)

components/                   Shared + feature components
    auth/                       Auth providers, guards, auth UI
    client/                     Customer UI (home, restaurants, cart, chat, payment...)
    admin/                      Admin UI (sidebar, tables, etc.)
    merchant/                   Merchant UI
    providers/                  App-wide providers (SSE, chat socket, etc.)
    ui/                         shadcn/ui components and UI primitives

lib/                          Client utilities and infrastructure
    api/                        Typed API clients (auth, orders, chat, restaurants, ...)
    config/                     Runtime environment selection (publicRuntime)
    hooks/                      Reusable hooks (SSE, WebSocket, order sockets, cart sync...)
    utils/                      Helper functions and adapters
    axios.ts                    Axios instance + interceptors + token refresh

stores/                       Zustand stores (auth/cart/chat/location/notifications/...)
types/                        Shared TypeScript types (orders, chat, restaurants, ...)
assets/                       Static assets used by the UI
public/                       Publicly served static files
constants/                    App constants and icon/image registries
fake-data/                    Mock data used for UI development
```

## 9) Contribution Guidelines

We welcome contributions! 🚀

### Issues

1. Search existing issues before opening a new one.
2. Include:
    - expected vs. actual behavior
    - reproduction steps
    - screenshots/logs when helpful
    - environment details (OS, browser, Node version)

### Pull Requests

1. Fork the repo and create a feature branch:

    ```bash
    git checkout -b feat/short-description
    ```

2. Keep PRs focused (one feature/fix per PR).
3. Run checks locally:

    ```bash
    npm run validate
    ```

4. Write clear PR descriptions and link related issues.

## 10) License

MIT License.

If you plan to open-source this repository, consider adding a `LICENSE` file at the root with the MIT text.

## 11) Roadmap

- ✅ Add a complete `.env.example` and documented deployment profiles (local vs. Docker).
- 🧪 Add automated testing (unit + component + e2e) and CI pipelines.
- ♿ Improve accessibility (ARIA coverage, keyboard navigation, color contrast).
- 🌍 Add i18n (route-based locales, translation management).
- 📱 Add PWA support (offline cache, install prompts, push notifications).
- 🔒 Harden security headers + CSP strategy aligned with third-party scripts.
