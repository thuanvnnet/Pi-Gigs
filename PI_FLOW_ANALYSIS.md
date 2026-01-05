# Phân Tích Quy Trình Login và Thanh Toán Pi Network SDK

## 📋 TỔNG QUAN

Tài liệu này phân tích chi tiết quy trình đăng nhập và thanh toán sử dụng Pi Network SDK trong ứng dụng.

---

## 🔐 QUY TRÌNH LOGIN

### Flow hiện tại:

1. **Khởi tạo SDK** (`components/pi-scripts.tsx`)
   - Load script từ `https://sdk.minepi.com/pi-sdk.js`
   - Init SDK với polling mechanism (check mỗi 50ms)
   - Config: `version: "2.0"`, `sandbox: true/false` từ env

2. **Gọi authenticate** (`components/providers/auth-provider.tsx`)
   - Scopes: `["username", "payments"]`
   - Callback: `onIncompletePaymentFound` để xử lý payment chưa hoàn thành
   - Nhận `accessToken` và `user` object

3. **Validate với Server** (`app/actions/auth.ts`)
   - Gửi `accessToken` và `user` lên server
   - Server tìm hoặc tạo user trong database
   - Serialize dữ liệu (Decimal -> String, Date -> ISO)

4. **Lưu vào LocalStorage**
   - Lưu user object vào `localStorage.setItem("pi_user", ...)`
   - Tự động load lại khi refresh trang

### ⚠️ VẤN ĐỀ PHÁT HIỆN:

#### ❌ **CRITICAL: Sai syntax authenticate trong auth-provider.tsx**

**File:** `components/providers/auth-provider.tsx:54`

```typescript
// ❌ SAI - Truyền callback trực tiếp
const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
```

**So sánh với code đúng:**

```typescript
// ✅ ĐÚNG - Truyền object options
const auth = await window.Pi.authenticate(["username", "payments"], {
  onIncompletePaymentFound: (p: any) => addLog("⚠️ Treo đơn: " + p.paymentId)
});
```

Pi SDK v2.0 yêu cầu tham số thứ hai phải là **object**, không phải callback trực tiếp.

#### 📝 Các điểm khác:

1. ✅ **SDK Initialization**: Đúng cách, sử dụng polling để đảm bảo SDK load xong
2. ✅ **Error Handling**: Có try-catch và alert thông báo lỗi
3. ✅ **Persistence**: Sử dụng localStorage hợp lý
4. ⚠️ **AccessToken**: Không thấy validate accessToken với Pi API (có thể cần thêm)

---

## 💳 QUY TRÌNH THANH TOÁN

### Flow hiện tại:

1. **Kiểm tra User đã login** (`components/checkout/checkout-button.tsx:24`)
   - Nếu chưa login → gọi `login()` và return

2. **Authenticate lại (không cần thiết)** (`checkout-button.tsx:37-41`)
   - Gọi lại `window.Pi.authenticate()` mặc dù user đã login
   - Wrap trong try-catch để tránh crash

3. **Tạo Order** (`app/actions/order.ts`)
   - Validate UUID buyerId
   - Tìm gig trong database
   - Tạo order với status "CREATED"
   - Return `orderId` và `amount`

4. **Tạo Payment với SDK** (`checkout-button.tsx:101`)
   ```typescript
   await window.Pi.createPayment(paymentData, callbacks)
   ```
   - `paymentData`: `{ amount, memo, metadata }`
   - `callbacks`: `{ onReadyForServerApproval, onServerCompleted, onCancel, onError }`

5. **Approve Payment** (`app/actions/payment.ts:8`)
   - Callback `onReadyForServerApproval` được trigger
   - Gọi Pi API: `POST /v2/payments/{paymentId}/approve`
   - Headers: `Authorization: Key ${PI_API_KEY}`

6. **Complete Payment** (`app/actions/payment.ts:30`)
   - Callback `onServerCompleted` được trigger với `txid`
   - Gọi Pi API: `POST /v2/payments/{paymentId}/complete`
   - Body: `{ txid }`
   - **⚠️ TODO**: Cần update database (mark order as PAID) - hiện đang comment

### ⚠️ VẤN ĐỀ PHÁT HIỆN:

#### 1. **Redundant Authentication**
- Line 37-41 trong `checkout-button.tsx`: Gọi lại authenticate không cần thiết
- User đã login từ trước, chỉ cần kiểm tra `window.Pi` tồn tại

#### 2. **Missing Database Update**
- `completePayment` function có comment TODO (line 45-46)
- Cần update order status trong database sau khi complete thành công

#### 3. **Error Handling**
- Các callback error handling chỉ alert, không có retry mechanism
- Không có xử lý timeout cho approve/complete API calls

#### 4. **Payment State Management**
- Không có mechanism để resume incomplete payment khi user quay lại
- `onIncompletePaymentFound` chỉ log, không có UI/flow để xử lý

---

## 📊 SO SÁNH CODE PATTERNS

### Pattern 1: authenticate() trong test-login (✅ ĐÚNG)
```typescript
const auth = await window.Pi.authenticate(["username", "payments"], {
  onIncompletePaymentFound: (p: any) => addLog("⚠️ Treo đơn: " + p.paymentId)
});
```

### Pattern 2: authenticate() trong checkout-button (✅ ĐÚNG)
```typescript
await window.Pi.authenticate(["username", "payments"], {
  onIncompletePaymentFound: (p: any) => console.log("Incomplete:", p)
});
```

### Pattern 3: authenticate() trong auth-provider (❌ SAI)
```typescript
const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
```

---

## ✅ KHUYẾN NGHỊ

### Ưu tiên cao:
1. **Fix authenticate syntax** trong `auth-provider.tsx`
2. **Thêm database update** trong `completePayment`
3. **Remove redundant authenticate** trong `checkout-button.tsx`

### Ưu tiên trung bình:
4. **Cải thiện error handling** với retry logic
5. **Xử lý incomplete payments** với UI flow
6. **Validate accessToken** trên server

### Ưu tiên thấp:
7. **Thêm TypeScript types** cho Pi SDK (thay vì `any`)
8. **Thêm logging/tracking** cho payment events
9. **Add unit tests** cho payment flow

---

## 🔗 LIÊN KẾT FILES

### Login Flow:
- `components/pi-scripts.tsx` - SDK initialization
- `components/providers/auth-provider.tsx` - Login logic
- `app/actions/auth.ts` - Server-side validation
- `app/test-login/page.tsx` - Test page

### Payment Flow:
- `components/checkout/checkout-button.tsx` - Payment UI & flow
- `app/actions/order.ts` - Order creation
- `app/actions/payment.ts` - Payment API calls
- `public/pi-test.html` - Static test file

---

## 📝 GHI CHÚ

- Tất cả code đều sử dụng Pi SDK v2.0
- Sandbox mode được control qua env: `NEXT_PUBLIC_PI_SANDBOX`
- API endpoint: `https://api.minepi.com/v2`
- SDK endpoint: `https://sdk.minepi.com/pi-sdk.js`

