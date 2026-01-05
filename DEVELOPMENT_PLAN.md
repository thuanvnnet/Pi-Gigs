# Kế Hoạch Triển Khai Các Module Còn Thiếu

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ Modules Đã Hoàn Thành

1. **Authentication & User Management**
   - ✅ Login với Pi Network SDK
   - ✅ User creation/retrieval
   - ✅ LocalStorage persistence
   - ❌ Profile management (edit profile, bio, avatar)

2. **Gig Management (Phần cơ bản)**
   - ✅ Create gig
   - ✅ View gig list (homepage)
   - ✅ View gig detail
   - ❌ Edit gig
   - ❌ Delete gig
   - ❌ Pause/Activate gig
   - ❌ Manage gigs dashboard

3. **Order Management (Phần cơ bản)**
   - ✅ Create order
   - ✅ List orders (buying/selling)
   - ✅ View order detail
   - ✅ Payment processing (approve, complete)
   - ❌ Update order status (IN_PROGRESS, DELIVERED)
   - ❌ Cancel order
   - ❌ Dispute order
   - ❌ Order workflow management

4. **Payment System**
   - ✅ Approve payment
   - ✅ Complete payment
   - ✅ Database integration
   - ❌ Payment history
   - ❌ Refund handling

### ❌ Modules Hoàn Toàn Chưa Có

1. **Review System** (Model có sẵn nhưng chưa có UI/Function)
   - ❌ Create review after order completion
   - ❌ Seller reply to reviews
   - ❌ Review management

2. **Messaging System** (Conversation & Message)
   - ❌ Create conversation
   - ❌ Send messages
   - ❌ Message list/conversation list
   - ❌ Real-time messaging (optional: WebSocket/SSE)

3. **Notification System**
   - ❌ Create notifications
   - ❌ Notification list
   - ❌ Mark as read
   - ❌ Notification bell/dropdown

4. **Category Management**
   - ❌ Category list page
   - ❌ Filter gigs by category
   - ❌ Category navigation

5. **Search & Filter**
   - ❌ Search gigs by title/description
   - ❌ Filter by category, price range
   - ❌ Sort options

6. **Seller Profile Page**
   - ❌ Seller public profile
   - ❌ Seller gigs list
   - ❌ Seller reviews/ratings

---

## 🎯 KẾ HOẠCH TRIỂN KHAI CHI TIẾT

### Phase 1: Core Features (Ưu tiên cao - 2-3 tuần)

#### 1.1 Order Management Enhancement
**Files cần tạo:**
- `app/actions/order.ts` (mở rộng)
- `app/dashboard/orders/[orderId]/page.tsx` (mới)
- `components/orders/order-status-update.tsx` (mới)

**Chức năng:**
- [ ] Update order status (IN_PROGRESS, DELIVERED, COMPLETED, CANCELLED)
- [ ] Order detail page với full workflow
- [ ] Seller: Mark as IN_PROGRESS, DELIVERED
- [ ] Buyer: Mark as COMPLETED, CANCELLED
- [ ] Requirements submission/update

**Priority:** 🔴 HIGH

#### 1.2 Review System
**Files cần tạo:**
- `app/actions/review.ts` (mới)
- `components/reviews/create-review-form.tsx` (mới)
- `components/reviews/seller-reply.tsx` (mới)
- `app/dashboard/orders/[orderId]/review/page.tsx` (mới)

**Chức năng:**
- [ ] Create review after order completion
- [ ] Seller reply to review
- [ ] Update seller rating average (trigger khi có review mới)
- [ ] Review display improvements

**Priority:** 🔴 HIGH

#### 1.3 Category Management
**Files cần tạo:**
- `app/actions/category.ts` (mới)
- `app/categories/page.tsx` (mới)
- `app/categories/[slug]/page.tsx` (mới)
- `components/categories/category-select.tsx` (mới)

**Chức năng:**
- [ ] List all categories
- [ ] Filter gigs by category
- [ ] Category dropdown in create-gig form
- [ ] Category navigation

**Priority:** 🟡 MEDIUM-HIGH

---

### Phase 2: Communication & User Experience (2-3 tuần)

#### 2.1 Messaging System
**Files cần tạo:**
- `app/actions/conversation.ts` (mới)
- `app/actions/message.ts` (mới)
- `app/messages/page.tsx` (mới)
- `app/messages/[conversationId]/page.tsx` (mới)
- `components/messages/conversation-list.tsx` (mới)
- `components/messages/message-input.tsx` (mới)
- `components/messages/message-bubble.tsx` (mới)

**Chức năng:**
- [ ] Create conversation between buyer/seller
- [ ] Send/receive messages
- [ ] Message list with last message preview
- [ ] Unread message count
- [ ] Mark messages as read
- [ ] Real-time updates (optional: polling hoặc WebSocket)

**Priority:** 🟡 MEDIUM-HIGH

#### 2.2 Notification System
**Files cần tạo:**
- `app/actions/notification.ts` (mới)
- `components/notifications/notification-bell.tsx` (mới)
- `components/notifications/notification-dropdown.tsx` (mới)
- `app/dashboard/notifications/page.tsx` (mới)

**Chức năng:**
- [ ] Create notifications (order updates, messages, reviews)
- [ ] Notification bell với unread count
- [ ] Notification dropdown/list
- [ ] Mark as read
- [ ] Auto-create notifications cho các events:
  - Order created, updated, completed
  - New message
  - New review
  - Payment completed

**Priority:** 🟡 MEDIUM

#### 2.3 Profile Management
**Files cần tạo:**
- `app/actions/user.ts` (mới)
- `app/dashboard/profile/page.tsx` (mới)
- `components/profile/edit-profile-form.tsx` (mới)
- `app/seller/[sellerId]/page.tsx` (mới)

**Chức năng:**
- [ ] Edit user profile (bio, avatar)
- [ ] Public seller profile page
- [ ] Seller gigs list on profile
- [ ] Seller statistics

**Priority:** 🟡 MEDIUM

---

### Phase 3: Advanced Features (2-3 tuần)

#### 3.1 Search & Filter System
**Files cần tạo:**
- `app/actions/search.ts` (mới)
- `app/search/page.tsx` (mới)
- `components/search/search-filters.tsx` (mới)

**Chức năng:**
- [ ] Search gigs by title/description
- [ ] Filter by category, price range
- [ ] Sort by price, rating, date
- [ ] Advanced filters

**Priority:** 🟢 MEDIUM-LOW

#### 3.2 Gig Management Dashboard
**Files cần tạo:**
- `app/dashboard/my-gigs/page.tsx` (mới)
- `app/dashboard/my-gigs/[gigId]/edit/page.tsx` (mới)
- `app/actions/gig.ts` (mở rộng)

**Chức năng:**
- [ ] List seller's gigs
- [ ] Edit gig
- [ ] Delete gig
- [ ] Pause/Activate gig
- [ ] Gig statistics

**Priority:** 🟡 MEDIUM

#### 3.3 Order Workflow Enhancements
**Files cần tạo:**
- `app/actions/order.ts` (mở rộng)
- `components/orders/order-actions.tsx` (mới)

**Chức năng:**
- [ ] Cancel order (with refund logic)
- [ ] Dispute order
- [ ] Requirements management
- [ ] Delivery file upload (optional)

**Priority:** 🟢 LOW-MEDIUM

---

### Phase 4: Polish & Optimization (1-2 tuần)

#### 4.1 Wallet & Transaction History
**Files cần tạo:**
- `app/dashboard/wallet/page.tsx` (mới)
- `app/actions/wallet.ts` (mới)

**Chức năng:**
- [ ] Wallet balance display
- [ ] Transaction history
- [ ] Earnings/spending summary

**Priority:** 🟢 LOW

#### 4.2 Admin/Mod Features (Optional)
**Files cần tạo:**
- `app/admin/*` (mới)

**Chức năng:**
- [ ] User management
- [ ] Gig moderation
- [ ] Order management
- [ ] Category management

**Priority:** ⚪ OPTIONAL

---

### Phase 5: Admin Dashboard & Management (2-3 tuần)

#### 5.1 Admin Authentication & Authorization
**Files cần tạo:**
- `app/actions/admin.ts` (mới)
- `lib/middleware/admin.ts` (mới)
- `components/admin/admin-auth-check.tsx` (mới)

**Chức năng:**
- [ ] Check admin/mod role trong server actions
- [ ] Admin route protection middleware
- [ ] Admin auth check component
- [ ] Role-based access control (ADMIN vs MOD permissions)
- [ ] Admin login/logout (nếu cần separate flow)

**Priority:** 🔴 HIGH (cho Admin features)

#### 5.2 Admin Dashboard Overview
**Files cần tạo:**
- `app/admin/page.tsx` (mới) - Dashboard overview
- `app/admin/layout.tsx` (mới) - Admin layout với sidebar
- `components/admin/admin-sidebar.tsx` (mới)
- `components/admin/admin-header.tsx` (mới)
- `components/admin/stat-cards.tsx` (mới)

**Chức năng:**
- [ ] Admin dashboard với statistics cards:
  - Total users, active users, new users (this month)
  - Total gigs, active gigs, banned gigs
  - Total orders, completed orders, revenue
  - Total reviews, average rating
- [ ] Charts/Graphs (optional: revenue trends, user growth)
- [ ] Recent activity feed
- [ ] Quick actions

**Priority:** 🔴 HIGH

#### 5.3 User Management
**Files cần tạo:**
- `app/admin/users/page.tsx` (mới)
- `app/admin/users/[userId]/page.tsx` (mới)
- `components/admin/users/user-list.tsx` (mới)
- `components/admin/users/user-detail.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] List all users với pagination, search, filters
- [ ] User detail page:
  - User info (username, email, wallet balance, roles)
  - User stats (gigs count, orders count, reviews count)
  - User's gigs list
  - User's orders list
  - User's reviews list
- [ ] Update user role (USER, MOD, ADMIN)
- [ ] Ban/unban user (set isActive = false/true)
- [ ] Delete user (soft delete hoặc hard delete)
- [ ] View user activity log (optional)

**Priority:** 🔴 HIGH

#### 5.4 Gig Moderation
**Files cần tạo:**
- `app/admin/gigs/page.tsx` (mới)
- `app/admin/gigs/[gigId]/page.tsx` (mới)
- `components/admin/gigs/gig-list.tsx` (mới)
- `components/admin/gigs/gig-detail.tsx` (mới)
- `components/admin/gigs/gig-status-actions.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] List all gigs với pagination, search, filters (status, category, seller)
- [ ] Gig detail page:
  - Full gig info
  - Seller info
  - Reviews list
  - Orders list
- [ ] Change gig status:
  - ACTIVE → PAUSED (pause gig)
  - ACTIVE → BANNED (ban gig - vi phạm policy)
  - PAUSED → ACTIVE (reactivate)
  - BANNED → ACTIVE (unban - với reason)
- [ ] Delete gig (soft delete hoặc hard delete)
- [ ] View gig analytics (views, orders, revenue)
- [ ] Report handling (nếu có report system)

**Priority:** 🔴 HIGH

#### 5.5 Order Management (Admin View)
**Files cần tạo:**
- `app/admin/orders/page.tsx` (mới)
- `app/admin/orders/[orderId]/page.tsx` (mới)
- `components/admin/orders/order-list.tsx` (mới)
- `components/admin/orders/order-detail.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] List all orders với pagination, search, filters (status, buyer, seller)
- [ ] Order detail page:
  - Full order info
  - Buyer & seller info
  - Payment info
  - Review (nếu có)
  - Message history (nếu có)
- [ ] View order (read-only, không edit trực tiếp)
- [ ] Cancel order (admin can cancel any order - với reason)
- [ ] Refund order (nếu có refund system)
- [ ] Dispute resolution (nếu có dispute system)
- [ ] Order analytics

**Priority:** 🟡 MEDIUM-HIGH

#### 5.6 Category Management (Admin)
**Files cần tạo:**
- `app/admin/categories/page.tsx` (mới)
- `app/admin/categories/new/page.tsx` (mới)
- `app/admin/categories/[categoryId]/edit/page.tsx` (mới)
- `components/admin/categories/category-form.tsx` (mới)
- `components/admin/categories/category-tree.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] List all categories với tree structure (parent-child)
- [ ] Create category:
  - Name, slug, iconUrl
  - Parent category (optional)
  - Level, isActive
- [ ] Edit category
- [ ] Delete category (check if có gigs đang dùng)
- [ ] Reorder categories (optional)
- [ ] Category statistics (gigs count per category)

**Priority:** 🟡 MEDIUM-HIGH

#### 5.7 Review Management
**Files cần tạo:**
- `app/admin/reviews/page.tsx` (mới)
- `components/admin/reviews/review-list.tsx` (mới)
- `components/admin/reviews/review-actions.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] List all reviews với pagination, search, filters
- [ ] View review detail
- [ ] Delete review (nếu vi phạm policy)
- [ ] Hide/unhide review (optional)
- [ ] Review statistics

**Priority:** 🟢 MEDIUM

#### 5.8 Analytics & Reports (Optional)
**Files cần tạo:**
- `app/admin/analytics/page.tsx` (mới)
- `components/admin/analytics/revenue-chart.tsx` (mới)
- `components/admin/analytics/user-growth-chart.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] Revenue analytics (daily, weekly, monthly)
- [ ] User growth chart
- [ ] Gig performance analytics
- [ ] Category performance analytics
- [ ] Top sellers/buyers
- [ ] Export reports (CSV, PDF - optional)

**Priority:** 🟢 LOW-MEDIUM

#### 5.9 Settings & Configuration (Optional)
**Files cần tạo:**
- `app/admin/settings/page.tsx` (mới)
- `app/actions/admin.ts` (mở rộng)

**Chức năng:**
- [ ] Platform settings
- [ ] Email templates (nếu có email system)
- [ ] Payment settings
- [ ] System logs
- [ ] Backup/Restore (optional)

**Priority:** ⚪ OPTIONAL

---

## 📋 CHECKLIST THEO MODULE

### 🔵 Review System
- [ ] `app/actions/review.ts`
  - [ ] `createReview(orderId, buyerId, rating, comment)`
  - [ ] `addSellerReply(reviewId, sellerId, reply)`
  - [ ] `getReviewsByGig(gigId)`
  - [ ] `getReviewsBySeller(sellerId)`
  - [ ] Update seller rating average (trigger)

- [ ] `app/dashboard/orders/[orderId]/review/page.tsx`
  - [ ] Review form UI
  - [ ] Rating stars component
  - [ ] Comment textarea

- [ ] `components/reviews/seller-reply.tsx`
  - [ ] Reply form for sellers
  - [ ] Display existing replies

### 🔵 Messaging System
- [ ] `app/actions/conversation.ts`
  - [ ] `createOrGetConversation(user1Id, user2Id)`
  - [ ] `getConversations(userId)`
  - [ ] `getConversation(conversationId, userId)`

- [ ] `app/actions/message.ts`
  - [ ] `sendMessage(conversationId, senderId, content, attachments?)`
  - [ ] `getMessages(conversationId, limit, cursor?)`
  - [ ] `markAsRead(messageIds, userId)`
  - [ ] `getUnreadCount(userId)`

- [ ] `app/messages/page.tsx`
  - [ ] Conversation list
  - [ ] Last message preview
  - [ ] Unread indicators

- [ ] `app/messages/[conversationId]/page.tsx`
  - [ ] Message thread
  - [ ] Message input
  - [ ] Real-time updates (polling)

### 🔵 Notification System
- [ ] `app/actions/notification.ts`
  - [ ] `createNotification(recipientId, type, title, content, entityId?, entityType?)`
  - [ ] `getNotifications(userId, limit, cursor?)`
  - [ ] `markAsRead(notificationId)`
  - [ ] `markAllAsRead(userId)`
  - [ ] `getUnreadCount(userId)`

- [ ] Notification triggers (trong các actions khác):
  - [ ] Order created → notify seller
  - [ ] Order status updated → notify buyer/seller
  - [ ] Payment completed → notify both
  - [ ] New message → notify recipient
  - [ ] New review → notify seller

- [ ] `components/notifications/notification-bell.tsx`
  - [ ] Bell icon với badge
  - [ ] Dropdown với recent notifications
  - [ ] Click to view all

### 🔵 Category Management
- [ ] `app/actions/category.ts`
  - [ ] `getCategories(parentId?)`
  - [ ] `getCategoryBySlug(slug)`
  - [ ] `getGigsByCategory(categoryId)`

- [ ] `app/categories/page.tsx`
  - [ ] Category grid/list
  - [ ] Category hierarchy

- [ ] `app/categories/[slug]/page.tsx`
  - [ ] Category detail với gigs
  - [ ] Filter options

- [ ] `components/categories/category-select.tsx`
  - [ ] Dropdown/Select component
  - [ ] Replace text input trong create-gig

### 🔵 Order Management Enhancements
- [ ] `app/actions/order.ts` (mở rộng)
  - [ ] `updateOrderStatus(orderId, userId, newStatus)`
  - [ ] `cancelOrder(orderId, userId, reason?)`
  - [ ] `disputeOrder(orderId, userId, reason)`
  - [ ] `updateRequirements(orderId, userId, requirements)`

- [ ] `app/dashboard/orders/[orderId]/page.tsx`
  - [ ] Full order detail
  - [ ] Status timeline
  - [ ] Action buttons (buyer/seller specific)
  - [ ] Requirements section
  - [ ] Messages link
  - [ ] Review button (nếu completed)

### 🔵 Profile Management
- [ ] `app/actions/user.ts`
  - [ ] `updateProfile(userId, data)`
  - [ ] `getSellerProfile(sellerId)`
  - [ ] `getSellerGigs(sellerId)`

- [ ] `app/dashboard/profile/page.tsx`
  - [ ] Edit profile form
  - [ ] Avatar upload
  - [ ] Bio editor

- [ ] `app/seller/[sellerId]/page.tsx`
  - [ ] Public seller profile
  - [ ] Seller gigs grid
  - [ ] Seller stats
  - [ ] Seller reviews

### 🔵 Search & Filter
- [ ] `app/actions/search.ts`
  - [ ] `searchGigs(query, filters, sort, pagination)`
  - [ ] Filter by category, price range, rating
  - [ ] Sort by price, rating, date

- [ ] `app/search/page.tsx`
  - [ ] Search input
  - [ ] Filters sidebar
  - [ ] Results grid
  - [ ] Pagination

### 🔵 Admin Dashboard
- [ ] `app/actions/admin.ts`
  - [ ] `checkAdminAccess(userId)` - Check if user is admin/mod
  - [ ] `getAdminStats()` - Dashboard statistics
  - [ ] `getUsers(filters, pagination)`
  - [ ] `getUser(userId)`
  - [ ] `updateUserRole(userId, role)`
  - [ ] `banUser(userId, reason)`
  - [ ] `unbanUser(userId)`
  - [ ] `getGigs(filters, pagination)`
  - [ ] `getGig(gigId)`
  - [ ] `updateGigStatus(gigId, status, reason)`
  - [ ] `deleteGig(gigId)`
  - [ ] `getOrders(filters, pagination)`
  - [ ] `getOrder(orderId)`
  - [ ] `cancelOrderAsAdmin(orderId, reason)`
  - [ ] `getCategories()`
  - [ ] `createCategory(data)`
  - [ ] `updateCategory(categoryId, data)`
  - [ ] `deleteCategory(categoryId)`
  - [ ] `getReviews(filters, pagination)`
  - [ ] `deleteReview(reviewId)`

- [ ] `lib/middleware/admin.ts`
  - [ ] `requireAdmin(userId)` - Server-side check
  - [ ] `requireMod(userId)` - Server-side check

- [ ] `components/admin/admin-auth-check.tsx`
  - [ ] Client-side admin check
  - [ ] Redirect nếu không phải admin

- [ ] `app/admin/page.tsx`
  - [ ] Dashboard overview với stats cards
  - [ ] Charts/graphs (optional)
  - [ ] Recent activity

- [ ] `app/admin/layout.tsx`
  - [ ] Admin sidebar navigation
  - [ ] Admin header
  - [ ] Protected route wrapper

- [ ] `app/admin/users/page.tsx`
  - [ ] User list với search, filters
  - [ ] Pagination
  - [ ] Quick actions (ban, change role)

- [ ] `app/admin/users/[userId]/page.tsx`
  - [ ] User detail view
  - [ ] User stats
  - [ ] User's gigs, orders, reviews

- [ ] `app/admin/gigs/page.tsx`
  - [ ] Gig list với search, filters
  - [ ] Status actions (ban, pause, activate)

- [ ] `app/admin/gigs/[gigId]/page.tsx`
  - [ ] Gig detail view
  - [ ] Moderation actions
  - [ ] Gig analytics

- [ ] `app/admin/orders/page.tsx`
  - [ ] Order list với search, filters
  - [ ] Order status view

- [ ] `app/admin/orders/[orderId]/page.tsx`
  - [ ] Order detail view (read-only)
  - [ ] Admin actions (cancel, refund)

- [ ] `app/admin/categories/page.tsx`
  - [ ] Category tree/list
  - [ ] Create/edit/delete categories

- [ ] `app/admin/reviews/page.tsx`
  - [ ] Review list
  - [ ] Delete/hide reviews

- [ ] `app/admin/analytics/page.tsx` (Optional)
  - [ ] Revenue charts
  - [ ] User growth charts
  - [ ] Performance metrics

---

## 🗂️ CẤU TRÚC FILES DỰ KIẾN

```
app/
├── actions/
│   ├── review.ts              [MỚI]
│   ├── conversation.ts        [MỚI]
│   ├── message.ts             [MỚI]
│   ├── notification.ts        [MỚI]
│   ├── category.ts            [MỚI]
│   ├── user.ts                [MỚI]
│   ├── search.ts              [MỚI]
│   ├── order.ts               [MỞ RỘNG]
│   ├── gig.ts                 [MỞ RỘNG]
│   ├── payment.ts             [✅ Đã có]
│   └── auth.ts                [✅ Đã có]
│
├── dashboard/
│   ├── orders/
│   │   ├── [orderId]/
│   │   │   ├── page.tsx       [MỚI]
│   │   │   └── review/
│   │   │       └── page.tsx   [MỚI]
│   │   └── page.tsx           [✅ Đã có]
│   ├── my-gigs/
│   │   ├── [gigId]/
│   │   │   └── edit/
│   │   │       └── page.tsx   [MỚI]
│   │   └── page.tsx           [MỚI]
│   ├── profile/
│   │   └── page.tsx           [MỚI]
│   ├── notifications/
│   │   └── page.tsx           [MỚI]
│   ├── wallet/
│   │   └── page.tsx           [MỚI]
│   └── create-gig/
│       └── page.tsx           [✅ Đã có]
│
├── messages/
│   ├── [conversationId]/
│   │   └── page.tsx           [MỚI]
│   └── page.tsx               [MỚI]
│
├── categories/
│   ├── [slug]/
│   │   └── page.tsx           [MỚI]
│   └── page.tsx               [MỚI]
│
├── seller/
│   └── [sellerId]/
│       └── page.tsx           [MỚI]
│
├── search/
│   └── page.tsx               [MỚI]
│
├── admin/
│   ├── layout.tsx             [MỚI]
│   ├── page.tsx               [MỚI]
│   ├── users/
│   │   ├── [userId]/
│   │   │   └── page.tsx       [MỚI]
│   │   └── page.tsx           [MỚI]
│   ├── gigs/
│   │   ├── [gigId]/
│   │   │   └── page.tsx       [MỚI]
│   │   └── page.tsx           [MỚI]
│   ├── orders/
│   │   ├── [orderId]/
│   │   │   └── page.tsx       [MỚI]
│   │   └── page.tsx           [MỚI]
│   ├── categories/
│   │   ├── [categoryId]/
│   │   │   └── edit/
│   │   │       └── page.tsx   [MỚI]
│   │   ├── new/
│   │   │   └── page.tsx       [MỚI]
│   │   └── page.tsx           [MỚI]
│   ├── reviews/
│   │   └── page.tsx           [MỚI]
│   └── analytics/
│       └── page.tsx           [MỚI - Optional]
│
└── [các trang hiện có...]

components/
├── reviews/
│   ├── create-review-form.tsx [MỚI]
│   └── seller-reply.tsx       [MỚI]
│
├── messages/
│   ├── conversation-list.tsx  [MỚI]
│   ├── message-input.tsx      [MỚI]
│   └── message-bubble.tsx     [MỚI]
│
├── notifications/
│   ├── notification-bell.tsx  [MỚI]
│   └── notification-dropdown.tsx [MỚI]
│
├── categories/
│   └── category-select.tsx    [MỚI]
│
├── orders/
│   ├── order-status-update.tsx [MỚI]
│   └── order-actions.tsx      [MỚI]
│
├── admin/
│   ├── admin-sidebar.tsx      [MỚI]
│   ├── admin-header.tsx       [MỚI]
│   ├── admin-auth-check.tsx   [MỚI]
│   ├── stat-cards.tsx         [MỚI]
│   ├── users/
│   │   ├── user-list.tsx      [MỚI]
│   │   └── user-detail.tsx    [MỚI]
│   ├── gigs/
│   │   ├── gig-list.tsx       [MỚI]
│   │   ├── gig-detail.tsx     [MỚI]
│   │   └── gig-status-actions.tsx [MỚI]
│   ├── orders/
│   │   ├── order-list.tsx     [MỚI]
│   │   └── order-detail.tsx   [MỚI]
│   ├── categories/
│   │   ├── category-form.tsx  [MỚI]
│   │   └── category-tree.tsx  [MỚI]
│   ├── reviews/
│   │   ├── review-list.tsx    [MỚI]
│   │   └── review-actions.tsx [MỚI]
│   └── analytics/             [MỚI - Optional]
│       ├── revenue-chart.tsx
│       └── user-growth-chart.tsx
│
└── [các components hiện có...]

lib/
├── middleware/
│   └── admin.ts               [MỚI]
└── [các lib hiện có...]
```

---

## ⏱️ TIMELINE ƯỚC TÍNH

### Week 1-2: Phase 1 Core Features
- Order Management Enhancement (3-4 days)
- Review System (4-5 days)
- Category Management (2-3 days)

### Week 3-4: Phase 2 Communication
- Messaging System (5-6 days)
- Notification System (3-4 days)
- Profile Management (2-3 days)

### Week 5-6: Phase 3 Advanced Features
- Search & Filter (3-4 days)
- Gig Management Dashboard (3-4 days)
- Order Workflow Enhancements (2-3 days)

### Week 7-8: Phase 4 Polish
- Wallet & Transaction History (2-3 days)
- Bug fixes & optimization
- Testing & refinement

### Week 9-11: Phase 5 Admin Dashboard
- Admin Authentication & Authorization (2-3 days)
- Admin Dashboard Overview (2-3 days)
- User Management (3-4 days)
- Gig Moderation (3-4 days)
- Order Management (Admin) (2-3 days)
- Category Management (Admin) (2-3 days)
- Review Management (1-2 days)
- Analytics & Reports (Optional) (2-3 days)

**Tổng cộng: ~11 tuần (2.5-3 tháng) với 1 developer full-time**  
*(Không tính Admin: ~8 tuần)*

---

## 🎯 ƯU TIÊN TRIỂN KHAI (Nếu thời gian hạn chế)

### Must Have (Core MVP):
1. ✅ Order Management Enhancement
2. ✅ Review System
3. ✅ Category Management
4. ✅ Profile Management

### Should Have (Important):
5. ✅ Messaging System
6. ✅ Notification System
7. ✅ Search & Filter

### Nice to Have (Enhancements):
8. ⚪ Gig Management Dashboard
9. ⚪ Wallet & Transaction History
10. ⚪ Order Workflow Enhancements (dispute, etc.)
11. ⚪ Admin Dashboard (nếu cần quản lý platform)

---

## 📝 NOTES

1. **Database Schema**: Đã có đầy đủ models, không cần migration mới
   - UserRole enum đã có ADMIN, MOD, USER
   - GigStatus enum đã có ACTIVE, PAUSED, BANNED, DRAFT
2. **Real-time**: Có thể dùng polling trước, sau đó nâng cấp lên WebSocket nếu cần
3. **File Upload**: Cần setup storage service (AWS S3, Cloudinary, etc.) cho avatar, delivery files
4. **Notifications**: Có thể implement với database polling trước, sau đó dùng server-sent events hoặc WebSocket
5. **Search**: Có thể dùng Prisma full-text search, hoặc integrate Algolia/Meilisearch sau
6. **Admin Access**: Cần có cách assign admin role cho user (có thể dùng database migration hoặc admin panel)
7. **Admin Security**: Tất cả admin routes cần check role ở server-side, không chỉ client-side

---

## 🔄 DEPENDENCIES

Một số modules phụ thuộc lẫn nhau:
- Review System → Order Management (cần order completed)
- Notifications → All modules (tạo notifications từ events)
- Messages → Orders (tạo conversation từ order)
- Profile → Reviews, Gigs (hiển thị seller stats)

**Recommendation**: Triển khai theo thứ tự Phase 1 → Phase 2 → Phase 3

