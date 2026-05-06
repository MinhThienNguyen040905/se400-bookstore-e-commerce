# Project Context - Bookstore E-commerce

Tài liệu này dùng làm handoff nhanh cho các session sau. Nó phản ánh code hiện tại của project sau đợt refactor backend Order/Payment/VNPay.

## Tổng Quan

Đây là project thương mại điện tử bán sách theo kiến trúc client-server.

- `backend/`: Node.js, Express, Sequelize, MySQL.
- `frontend/`: React 19, Vite, TypeScript, React Query, Zustand, Axios.
- Payment: COD và VNPay sandbox.
- Auth: JWT access token qua `Authorization: Bearer ...`, refresh token lưu bằng HttpOnly cookie.
- Media: Cloudinary cho cover sách và avatar.
- Email: Nodemailer cho OTP và email xác nhận đơn hàng.
- Scheduler: `node-cron` tự động xử lý order pending/processing/shipped.

## Cách Chạy

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

URL mặc định:

- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api`
- Frontend: `http://localhost:5173`

Biến môi trường backend quan trọng:

- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`
- `SSL_CA_PATH` nếu dùng DB cloud cần SSL
- `JWT_SECRET`
- `CLIENT_URL`
- `EMAIL_USER`, `EMAIL_PASS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VNP_TMNCODE`, `VNP_HASHSECRET`

Frontend dùng:

- `VITE_API_URL`, mặc định fallback là `http://localhost:3000/api`

## Kiến Trúc Backend

Backend đi theo luồng:

```txt
routes -> middleware/auth + asyncHandler -> controllers -> validators -> services -> repositories/models -> database
```

Các phần chính:

- `server.js`: entrypoint, load associations, middleware, routes, scheduler.
- `routes/`: định tuyến REST API.
- `controllers/`: lấy input HTTP, gọi validator/service, trả `res.success`.
- `validators/`: parse và validate input đơn giản, không query DB.
- `services/`: business logic chính, transaction, rule nghiệp vụ.
- `repositories/`: query dài hoặc query include phức tạp, hiện mới có `orderRepository.js`.
- `models/`: Sequelize models.
- `middleware/`: auth, response wrapper, error handler.
- `utils/`: email, scheduler, transaction helper, timeline.
- `errors/AppError.js`: lỗi nghiệp vụ có status code.

Response thành công có format do `middleware/response.js`:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Lỗi nghiệp vụ dùng `AppError`, qua `errorHandler` trả:

```json
{
  "success": false,
  "message": "..."
}
```

## Backend Routes Chính

User/Auth:

- `POST /api/users/login`
- `POST /api/users/refresh-token`
- `POST /api/users/logout`
- `POST /api/users/request-otp`
- `POST /api/users/verify-otp`
- `POST /api/users/register`
- `POST /api/users/reset-password`
- `PUT /api/users/profile`
- `PUT /api/users/change-password`
- `GET /api/users` admin
- `DELETE /api/users/delete`

Books:

- `GET /api/books`
- `GET /api/books/new-releases`
- `GET /api/books/top-rated`
- `GET /api/books/all` admin
- `GET /api/books/:id`
- `POST /api/books` admin, upload `cover_image`
- `PUT /api/books/:id` admin, upload `cover_image`
- `DELETE /api/books/:id` admin

Cart:

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/:book_id`

Orders:

- `POST /api/orders` COD checkout
- `GET /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/all` admin
- `PUT /api/orders/order-status` admin
- `PUT /api/orders/cancel`
- `GET /api/orders/:id`

Payment:

- `POST /api/payment/create_payment_url`
- `GET /api/payment/vnpay_return`

Other modules:

- `promos`, `reviews`, `wishlist`, `authors`, `genres`, `publishers`, `admin/stats`

## Data Model Chính

Các model quan trọng:

- `User`: `user_id`, `name`, `email`, `password`, `role`, `phone`, `address`, `avatar`
- `Book`: `book_id`, `title`, `description`, `publisher_id`, `stock`, `price`, `cover_image`, `release_date`, `isbn`
- `CartItem`: cart theo `user_id`, `book_id`, `quantity`
- `Order`: `order_id`, `total_price`, `status`, `payment_method`, `payment_status`, `address`, `phone`, `vnpay_transaction_no`
- `OrderItem`: snapshot item trong đơn, gồm `quantity`, `price`
- `PromoCode`: mã giảm giá, phần trăm giảm, min amount, expiry
- `Review`, `Wishlist`, `Session`, `OtpTemp`
- `Author`, `Genre`, `Publisher`
- Join tables: `BookAuthor`, `BookGenre`

Associations nằm trong `backend/models/associations.js`:

- User hasMany CartItem, Order, Review, Session, Wishlist.
- Book hasMany CartItem, OrderItem, Review, Wishlist.
- Order hasMany OrderItem.
- Order belongsTo PromoCode.
- Book belongsTo Publisher.
- Book belongsToMany Author qua `BookAuthor`.
- Book belongsToMany Genre qua `BookGenre`.

Order status:

```js
pending_payment, processing, shipped, delivered, cancelled
```

Payment status:

```js
pending, paid, failed
```

## Auth Flow

Login:

1. Frontend gọi `POST /api/users/login`.
2. `authService.login` kiểm tra email/password.
3. Backend trả access token và user.
4. Refresh token random được lưu vào bảng `Sessions` và set vào HttpOnly cookie `refreshToken`.
5. Frontend lưu access token/user bằng Zustand persist trong `useAuthStore`.

Refresh token:

1. Axios interceptor bắt lỗi `401`.
2. Gọi `POST /api/users/refresh-token`.
3. Backend đọc cookie `refreshToken`, kiểm tra bảng `Sessions`.
4. Trả access token mới.
5. Frontend cập nhật store và retry request cũ.

Middleware:

- `auth`: yêu cầu Bearer token, set `req.user`.
- `adminAuth`: yêu cầu `req.user.role === 'admin'`.
- `optionalAuth`: nếu có token hợp lệ thì set user, nếu không vẫn cho qua.

## Frontend Kiến Trúc

Frontend nằm trong `frontend/src`.

Các phần chính:

- `main.tsx`: render React app.
- `App.tsx`: setup `QueryClientProvider` và React Router.
- `routes/index.tsx`: khai báo route page.
- `api/`: axios client và API wrapper.
- `hooks/`: React Query hooks và action hooks.
- `features/auth/useAuthStore.ts`: Zustand auth store.
- `features/cart/useCartStore.ts`: cart store.
- `pages/`: page-level UI.
- `components/`: UI tái sử dụng, admin tabs, profile, book, auth forms.
- `types/`: TypeScript type cho domain.

Axios client:

- File: `frontend/src/api/axios.ts`
- Base URL: `VITE_API_URL` hoặc `http://localhost:3000/api`
- `withCredentials: true` để gửi refresh cookie.
- Response interceptor unwrap format backend: nếu `success` true thì trả `data`.
- Khi `401`, tự gọi refresh token, cập nhật access token và retry.

Frontend routes chính:

- `/`, `/shop`, `/book/:id`
- `/login`, `/register`, `/reset-password`
- `/cart`, `/checkout`
- `/order-success`, `/order-failure`
- `/my-orders`, `/profile`
- `/admin`
- collection pages như `/new-releases`, `/bestsellers`, `/deals`, `/genre/:id`

## Luồng Cart

Files chính:

- Backend: `cartController.js`, `cartService.js`, `cartValidator.js`
- Frontend: `cartApi.ts`, `useCartQuery.ts`, `useCartActions.ts`, `useCartStore.ts`

Luồng thêm cart:

1. Controller gọi `cartValidator.addToCart`.
2. Validator parse `book_id`, `quantity`; quantity mặc định là `1`.
3. Service kiểm tra sách tồn tại.
4. Nếu cart item đã có, cộng quantity.
5. Kiểm tra tồn kho trước khi save.
6. Trả cart item kèm thông tin Book.

Luồng update cart:

1. Validator cho phép quantity `0`.
2. Service kiểm tra cart item và book.
3. Nếu quantity `0` thì xóa item.
4. Nếu > 0 thì update quantity.
5. Trả `getCart`.

## Luồng COD Order

Files chính:

- `orderController.js`
- `orderValidator.js`
- `orderService.js`
- `orderPricingService.js`
- `inventoryService.js`
- `orderRepository.js`
- `withTransaction.js`

Luồng:

1. Frontend gọi `POST /api/orders` với `payment_method: "COD"`, `address`, `phone`, optional `promo_code`.
2. Controller parse input bằng `orderValidator.createCodOrder`.
3. `orderService.createCodOrder` kiểm tra payment method, address/phone.
4. Trong `withTransaction`:
   - tìm user
   - lấy cart items
   - validate stock bằng `validateCartItemsInStock({ lock: true })`
   - tính giá bằng `calculateOrderPricing`
   - tạo `Order` với `status=processing`, `payment_status=pending`
   - tạo `OrderItem`
   - trừ kho bằng `decreaseStockForCartItems`
   - xóa cart
5. Sau transaction, gửi email xác nhận.
6. Trả `{ order_id }`.

Cancel COD:

1. User gọi `PUT /api/orders/cancel`.
2. Validator parse `order_id`.
3. Service lấy order qua `orderRepository.findOrderForCancel`.
4. Chỉ cho hủy khi `status=processing`.
5. Set `status=cancelled`.
6. Hoàn kho bằng `restoreStockForOrderItems`.

## Luồng VNPay

Files chính:

- `paymentController.js`
- `paymentValidator.js`
- `paymentService.js`
- `vnpayService.js`
- `orderPricingService.js`
- `inventoryService.js`
- `withTransaction.js`

Create payment URL:

1. Frontend gọi `POST /api/payment/create_payment_url`.
2. Controller parse input bằng `paymentValidator.createVnpayPayment`.
3. `paymentService.createVnpayPayment` chạy trong transaction.
4. Lấy cart items của user.
5. Tìm các order VNPay cũ của user có `status=pending_payment`, `payment_status=pending`.
6. Các pending order cũ được release:
   - hoàn kho
   - set `status=cancelled`
   - set `payment_status=failed`
7. Validate stock cart hiện tại với row lock.
8. Tính giá/promo qua `calculateOrderPricing`.
9. Tạo order mới:
   - `payment_method=VNPay`
   - `status=pending_payment`
   - `payment_status=pending`
10. Tạo order items.
11. Trừ kho.
12. Tạo URL VNPay bằng `vnpayService.createPaymentUrl`.

VNPay return:

1. VNPay redirect về `GET /api/payment/vnpay_return`.
2. `vnpayService.verifyReturnParams` kiểm tra chữ ký.
3. Signature invalid: redirect frontend `/order-failure?code=97`.
4. Order not found: redirect failure `code=01`.
5. Idempotency:
   - nếu `payment_status=paid`: redirect success
   - nếu order `cancelled` hoặc `payment_status=failed`: redirect failure rõ ràng
   - chỉ xử lý khi `status=pending_payment` và `payment_status=pending`
6. Nếu `vnp_ResponseCode === "00"`:
   - set `status=processing`
   - set `payment_status=paid`
   - lưu `vnpay_transaction_no`
   - xóa cart
   - gửi email xác nhận sau transaction
   - redirect `/order-success?code=00&orderId=...`
7. Nếu fail:
   - hoàn kho
   - set `status=cancelled`
   - set `payment_status=failed`
   - lưu `vnpay_transaction_no` nếu có
   - redirect `/order-failure?code=...`

Điểm quan trọng sau refactor:

- VNPay fail/expired không hard delete order nữa.
- Duplicate pending VNPay order được release trước khi tạo order mới.
- Callback idempotent, không redirect success sai cho order chưa paid.

## Pricing, Promo Và Inventory

Pricing:

- File: `backend/services/orderPricingService.js`
- API:
  - `calculateCartSubtotal(cartItems)`
  - `applyPromoCode({ promoCode, subtotal })`
  - `calculateOrderPricing({ cartItems, promoCode })`

Behavior promo:

- Không có promo: giữ nguyên subtotal.
- Promo hết hạn, không tồn tại hoặc chưa đủ `min_amount`: bỏ qua promo, không throw.
- Promo hợp lệ: tính discount percent, trả `totalPrice`, `promoId`, `discountAmount`.

Inventory:

- File: `backend/services/inventoryService.js`
- API:
  - `validateCartItemsInStock({ cartItems, transaction, lock })`
  - `decreaseStockForCartItems({ cartItems, transaction })`
  - `restoreStockForOrderItems({ orderItems, transaction })`

Quy tắc:

- COD và VNPay checkout đều lock row book khi validate stock.
- Trừ kho chỉ qua `decreaseStockForCartItems`.
- Hoàn kho khi cancel/payment fail/expired qua `restoreStockForOrderItems`.

## Scheduler

File: `backend/utils/orderScheduler.js`

Cron chạy mỗi giờ:

1. Gọi `paymentService.cleanupExpiredPendingPayments`.
   - Tìm order `pending_payment/pending` quá 15 phút.
   - Hoàn kho.
   - Set `cancelled/failed`.
2. Đơn `processing` quá 2 ngày chuyển sang `shipped`.
3. Đơn `shipped` quá 4 ngày chuyển sang `delivered`.
4. COD khi delivered được set `payment_status=paid`.

## Repository Layer

Hiện chỉ có:

- `backend/repositories/orderRepository.js`

Repository này gom các query order include dài:

- `findUserOrders`
- `findUserOrdersWithTimelineData`
- `findAllOrdersPaginated`
- `findOrderDetailById`
- `findOrderForCancel`
- `findOrderForConfirmationEmail`

Service vẫn giữ:

- mapping response
- permission user/admin
- rule nghiệp vụ
- transaction orchestration

## Validator Layer

Hiện có:

- `validators/common.js`
- `validators/cartValidator.js`
- `validators/orderValidator.js`
- `validators/paymentValidator.js`

Nguyên tắc:

- Validator chỉ parse/validate input HTTP.
- Validator không query DB.
- Service vẫn throw `AppError` cho rule cần DB như stock, user/order tồn tại, permission.

## Book/Catalog Module

Files chính:

- `bookController.js`
- `bookService.js`
- `catalogService.js`
- routes `books`, `authors`, `genres`, `publishers`

Book features:

- search keyword theo title
- filter price
- filter genre/author bằng ID hoặc name
- filter rating trung bình
- sort price asc/desc, newest, top-rated
- pagination
- detail book có authors, genres, publisher, reviews
- admin CRUD book, upload cover qua multer temp file và Cloudinary

Lưu ý:

- `bookService.js` vẫn đang chứa nhiều logic query/filter khá lớn.
- Nếu tiếp tục refactor, đây là ứng viên tách repository/helper tiếp theo.

## Promo Module

Files:

- `promoController.js`
- `promoService.js`
- `orderPricingService.js`

Admin tạo/list promo.

Customer check promo qua:

- `POST /api/promos/by-code`

Checkout COD/VNPay không dùng trực tiếp `promoService`; nó dùng `orderPricingService` để giữ behavior im lặng bỏ qua promo không hợp lệ.

## Review Và Wishlist

Review:

- Service kiểm tra user chỉ review sách đã mua với order delivered.
- Có list review theo book.

Wishlist:

- Toggle add/remove wishlist.
- Get wishlist của user kèm thông tin book/authors.

## Admin

Admin route dùng `auth` + `adminAuth`.

Admin features hiện có:

- quản lý books, authors, genres, publishers
- quản lý promos
- quản lý orders và update status
- xem stats dashboard
- xem users

Frontend admin:

- `frontend/src/pages/AdminPage.tsx`
- `frontend/src/components/admin/tabs/*`
- hooks `useAdmin*`

## Quy Ước Và Lưu Ý Khi Code Tiếp

- Không đổi route path hoặc response field nếu không kiểm tra frontend.
- Controller nên mỏng: lấy input, gọi validator/service, trả response.
- Service không dùng `req`, `res`, `next`.
- Lỗi nghiệp vụ dùng `AppError`.
- Route async phải bọc `asyncHandler`.
- Query include dài nên đưa vào repository nếu làm service khó đọc.
- Transaction mới nên dùng `withTransaction`.
- Logic stock nên dùng `inventoryService`.
- Logic pricing/promo checkout nên dùng `orderPricingService`.
- Input mới nên thêm validator trước khi vào service.
- Cẩn thận với worktree có thay đổi sẵn; không revert thay đổi không liên quan.

## Verification

Syntax check backend:

```powershell
Get-ChildItem -Path backend -Recurse -File -Include *.js,*.cjs |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

Frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Manual test quan trọng:

- Auth: login, refresh token, logout.
- Cart: add, update, remove, get.
- COD: create order, out of stock, cancel.
- VNPay: create payment URL, success callback, failed callback, duplicate callback.
- Scheduler: expired pending VNPay order hoàn kho và mark failed.
- Orders: user chỉ xem order của mình, admin xem tất cả.
- Admin: CRUD book, update order status, promo.

## Trạng Thái Refactor Hiện Tại

Đã làm:

- Phase 1: harden VNPay return handling.
- Phase 2: prevent duplicate pending VNPay orders.
- Phase 3: tách pricing/promo logic.
- Phase 4: tách inventory helpers.
- Phase 5: thêm transaction helper.
- Phase 6: tách order repository.
- Phase 7: thêm validators cho cart/order/payment.

Chưa xác nhận trong session này:

- Manual test end-to-end thật với DB/VNPay sandbox.
- Frontend build/lint sau toàn bộ refactor.

Các file refactor quan trọng:

- `backend/services/paymentService.js`
- `backend/services/orderService.js`
- `backend/services/orderPricingService.js`
- `backend/services/inventoryService.js`
- `backend/utils/withTransaction.js`
- `backend/repositories/orderRepository.js`
- `backend/validators/*`
- `backend/REFACTOR_NEXT_STEPS_PLAN.md`
