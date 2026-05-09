# Project Context - Bookstore E-commerce

This file is a quick handoff for future sessions. It reflects the current state of the project after the Order/Payment/VNPay refactor and the AI sentiment/recommendation MVP.

## Overview

This is a bookstore e-commerce app with a client-server architecture.

- `backend/`: Node.js, Express, Sequelize, MySQL.
- `frontend/`: React 19, Vite, TypeScript, React Query, Zustand, Axios.
- Payment: COD and VNPay sandbox.
- Auth: JWT access token via `Authorization: Bearer ...`, refresh token stored in HttpOnly cookie.
- Media: Cloudinary for book covers and avatars.
- Email: Nodemailer for OTP and order confirmation emails.
- Scheduler: `node-cron` auto handles pending/processing/shipped orders.

## Run

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

Default URLs:

- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api`
- Frontend: `http://localhost:5173`

## Important Env Vars

Backend:

- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`
- `SSL_CA_PATH`
- `JWT_SECRET`
- `CLIENT_URL`
- `EMAIL_USER`, `EMAIL_PASS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VNP_TMNCODE`, `VNP_HASHSECRET`
- `AI_FEATURES_ENABLED`
- `GROQ_API_KEY`
- `GROQ_MODEL_FAST`
- `GROQ_MODEL_SMART`
- `AI_REQUEST_TIMEOUT_MS`
- `AI_MAX_REVIEW_CHARS`

Frontend:

- `VITE_API_URL` with fallback to `http://localhost:3000/api`

## Backend Architecture

Flow:

```txt
routes -> middleware/auth + asyncHandler -> controllers -> validators -> services -> repositories/models -> database
```

Main folders:

- `server.js`: entrypoint, associations, middleware, routes, scheduler.
- `routes/`: REST API routing.
- `controllers/`: read HTTP input, call validator/service, return `res.success`.
- `validators/`: parse and validate request input only.
- `services/`: business logic, transactions, rules.
- `repositories/`: heavier queries / include-heavy access.
- `models/`: Sequelize models.
- `middleware/`: auth, response wrapper, error handler.
- `utils/`: email, scheduler, transaction helper, timeline.
- `errors/AppError.js`: business error with status code.

Success response format:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error response format:

```json
{
  "success": false,
  "message": "..."
}
```

## Main Routes

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
- `GET /api/books/:id/insights`
- `POST /api/books` admin
- `PUT /api/books/:id` admin
- `DELETE /api/books/:id` admin

Cart:

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/:book_id`

Orders:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/all` admin
- `PUT /api/orders/order-status` admin
- `PUT /api/orders/cancel`
- `GET /api/orders/:id`

Payment:

- `POST /api/payment/create_payment_url`
- `GET /api/payment/vnpay_return`

Recommendations:

- `GET /api/recommendations/personalized`
- `GET /api/recommendations/trending`
- `GET /api/recommendations/books/:id/similar`

Admin stats:

- `GET /api/admin/stats`
- `GET /api/admin/stats/ai-insights`

Other modules:

- `promos`, `reviews`, `wishlist`, `authors`, `genres`, `publishers`

## Data Model

Important models:

- `User`: `user_id`, `name`, `email`, `password`, `role`, `phone`, `address`, `avatar`
- `Book`: `book_id`, `title`, `description`, `publisher_id`, `stock`, `price`, `cover_image`, `release_date`, `isbn`
- `CartItem`: `user_id`, `book_id`, `quantity`
- `Order`: `order_id`, `total_price`, `status`, `payment_method`, `payment_status`, `address`, `phone`, `vnpay_transaction_no`
- `OrderItem`: snapshot item in order, includes `quantity`, `price`
- `PromoCode`: discount code data
- `Review`: rating/comment/date
- `ReviewAnalysis`: AI analysis for a review
- `BookInsight`: cached AI summary for a book
- `Wishlist`, `Session`, `OtpTemp`
- `Author`, `Genre`, `Publisher`
- Join tables: `BookAuthor`, `BookGenre`

Associations in `backend/models/associations.js`:

- User hasMany CartItem, Order, Review, Session, Wishlist.
- Book hasMany CartItem, OrderItem, Review, Wishlist.
- Review hasOne ReviewAnalysis as `analysis`.
- Book hasOne BookInsight as `insight`.
- Order hasMany OrderItem.
- Order belongsTo PromoCode.
- Book belongsTo Publisher.
- Book belongsToMany Author via `BookAuthor`.
- Book belongsToMany Genre via `BookGenre`.

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

1. Frontend calls `POST /api/users/login`.
2. `authService.login` checks email/password.
3. Backend returns access token and user.
4. Refresh token is stored in `Sessions` and set as HttpOnly cookie `refreshToken`.
5. Frontend stores access token/user in Zustand persist.

Refresh token:

1. Axios interceptor catches `401`.
2. Calls `POST /api/users/refresh-token`.
3. Backend reads `refreshToken` cookie and checks `Sessions`.
4. Returns a new access token.
5. Frontend updates store and retries request.

Middleware:

- `auth`: requires Bearer token and sets `req.user`.
- `adminAuth`: requires `req.user.role === 'admin'`.
- `optionalAuth`: sets user if token exists, otherwise lets request pass.

## Review Flow

Review create flow:

1. `POST /api/reviews` with `book_id`, `rating`, `comment`.
2. Service checks book, user, duplicate review, and delivered order ownership.
3. Review is saved immediately.
4. AI analysis is queued asynchronously.
5. Fallback rules run if Groq is missing, disabled, or fails.
6. Book insight cache is invalidated.

AI review output stored in `ReviewAnalysis`:

- `sentiment_label`
- `sentiment_score`
- `confidence`
- `summary`
- `signals`
- `spam_risk`
- `spam_reasons`
- `provider`
- `model`
- `prompt_version`
- `raw_response`

Review list responses now include `analysis` when available.

## AI / Groq MVP

Implemented:

- `backend/services/ai/groqClient.js`
- `backend/services/ai/fallbackSentiment.js`
- `backend/services/ai/jsonParser.js`
- `backend/services/ai/reviewAnalysisService.js`
- `backend/services/ai/bookInsightService.js`

Design rules:

- AI never blocks checkout, payment, auth, or stock.
- Review save must succeed even if AI fails.
- Groq is used only for background/lazy analysis and summaries.
- Output is parsed as JSON only.
- Fallback rule-based sentiment is used when Groq is unavailable.

## Recommendation System

Implemented as rule-based MVP using:

- average rating
- average sentiment
- review count
- sales count
- wishlist count
- genre/author interest match
- recency

Backend files:

- `backend/services/recommendationService.js`
- `backend/repositories/recommendationRepository.js`
- `backend/controllers/recommendationController.js`
- `backend/routes/recommendations.js`
- `backend/validators/recommendationValidator.js`

Returned item shape:

```json
{
  "book": {},
  "score": 0.82,
  "reasons": ["...", "..."],
  "signals": {}
}
```

## Book Insight

`GET /api/books/:id/insights` returns cached or regenerated summary:

- summary
- positive_points
- negative_points
- reader_fit
- recommendation_hint
- sentiment_distribution
- review_count

Cached in `BookInsight`. Cache is invalidated when a new review is added.

## Admin AI Insights

`GET /api/admin/stats/ai-insights` returns:

- books with negative sentiment patterns
- top positive genres
- suspicious reviews

## Frontend Structure

Frontend lives in `frontend/src`.

Main parts:

- `main.tsx`: React entry.
- `App.tsx`: QueryClientProvider and router.
- `routes/index.tsx`: route definitions.
- `api/`: axios client and API wrappers.
- `hooks/`: React Query hooks.
- `features/auth/useAuthStore.ts`: auth store.
- `features/cart/useCartStore.ts`: cart store.
- `pages/`: page-level UI.
- `components/`: reusable UI, admin tabs, profile, book, auth forms.
- `types/`: TypeScript domain types.

Axios client:

- `frontend/src/api/axios.ts`
- base URL from `VITE_API_URL` or `http://localhost:3000/api`
- `withCredentials: true`
- response interceptor unwraps `{ success, data }`
- `401` triggers refresh token retry

Main frontend routes:

- `/`, `/shop`, `/book/:id`
- `/login`, `/register`, `/reset-password`
- `/cart`, `/checkout`
- `/order-success`, `/order-failure`
- `/my-orders`, `/profile`
- `/admin`
- collections such as `/new-releases`, `/bestsellers`, `/deals`, `/genre/:id`

## Frontend AI UI

Updated files:

- `frontend/src/pages/BookDetailPage.tsx`
- `frontend/src/components/book/BookReviews.tsx`
- `frontend/src/components/book/BookInsightPanel.tsx`
- `frontend/src/components/book/RecommendationShelf.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/components/admin/tabs/DashboardTab.tsx`

UI changes:

- review sentiment badge and short summary
- book insight panel on detail page
- similar books shelf on book detail
- personalized recommendations on home
- admin AI insights panel

## Cart Flow

Main files:

- Backend: `cartController.js`, `cartService.js`, `cartValidator.js`
- Frontend: `cartApi.ts`, `useCartQuery.ts`, `useCartActions.ts`, `useCartStore.ts`

Add-to-cart flow:

1. Controller calls `cartValidator.addToCart`.
2. Validator parses `book_id`, `quantity`; default `quantity` is `1`.
3. Service checks book exists.
4. If cart item exists, quantity is increased.
5. Stock is checked before save.
6. Returns cart item with Book data.

Update flow:

1. Validator allows `quantity = 0`.
2. Service checks cart item and book.
3. If `quantity = 0`, item is removed.
4. If `quantity > 0`, item is updated.
5. Returns `getCart`.

## COD Order Flow

Main files:

- `orderController.js`
- `orderValidator.js`
- `orderService.js`
- `orderPricingService.js`
- `inventoryService.js`
- `orderRepository.js`
- `withTransaction.js`

Flow:

1. Frontend calls `POST /api/orders` with `payment_method: "COD"`, `address`, `phone`, optional `promo_code`.
2. Validator parses input.
3. Service checks payment method, address, phone.
4. In transaction:
   - find user
   - load cart items
   - validate stock with row lock
   - calculate pricing
   - create order with `status=processing`, `payment_status=pending`
   - create order items
   - decrease stock
   - clear cart
5. Send confirmation email after transaction.
6. Return `{ order_id }`.

Cancel COD:

1. User calls `PUT /api/orders/cancel`.
2. Service loads order by `orderRepository.findOrderForCancel`.
3. Only `processing` orders can be cancelled.
4. Set `status=cancelled`.
5. Restore stock from order items.

## VNPay Flow

Main files:

- `paymentController.js`
- `paymentValidator.js`
- `paymentService.js`
- `vnpayService.js`
- `orderPricingService.js`
- `inventoryService.js`
- `withTransaction.js`

Create payment URL:

1. Frontend calls `POST /api/payment/create_payment_url`.
2. Validator parses input.
3. Service runs in transaction.
4. Load cart items.
5. Release old pending VNPay orders for the user.
6. Validate stock with row lock.
7. Calculate pricing and promo.
8. Create new order with `payment_method=VNPay`, `status=pending_payment`, `payment_status=pending`.
9. Create order items.
10. Decrease stock.
11. Generate VNPay URL.

VNPay return:

1. VNPay redirects to `GET /api/payment/vnpay_return`.
2. Signature is verified.
3. Invalid signature redirects to failure.
4. Idempotency is enforced.
5. `vnp_ResponseCode === "00"` sets order to `processing/paid`, stores transaction no, clears cart, sends confirmation email.
6. Failure restores stock, marks order `cancelled/failed`, and redirects to failure.

Important after refactor:

- VNPay fail/expired does not hard delete orders.
- Duplicate pending VNPay orders are released before a new one is created.
- Callback is idempotent.

## Pricing, Promo, Inventory

Pricing file:

- `backend/services/orderPricingService.js`

API:

- `calculateCartSubtotal(cartItems)`
- `applyPromoCode({ promoCode, subtotal })`
- `calculateOrderPricing({ cartItems, promoCode })`

Promo behavior:

- No promo: subtotal stays unchanged.
- Expired / missing / below minimum amount promo: ignored silently.
- Valid promo: discount percent is applied.

Inventory file:

- `backend/services/inventoryService.js`

API:

- `validateCartItemsInStock({ cartItems, transaction, lock })`
- `decreaseStockForCartItems({ cartItems, transaction })`
- `restoreStockForOrderItems({ orderItems, transaction })`

Rules:

- COD and VNPay checkout both lock book rows when validating stock.
- Stock is only decreased through helper.
- Stock is restored on cancel / payment fail / expired pending payment.

## Scheduler

File:

- `backend/utils/orderScheduler.js`

Runs hourly:

1. Calls `paymentService.cleanupExpiredPendingPayments`.
   - finds `pending_payment/pending` orders older than 15 minutes
   - restores stock
   - marks them `cancelled/failed`
2. Orders in `processing` for more than 2 days become `shipped`.
3. Orders in `shipped` for more than 4 days become `delivered`.
4. COD delivered orders get `payment_status=paid`.

## Validator Layer

Current validators:

- `validators/common.js`
- `validators/cartValidator.js`
- `validators/orderValidator.js`
- `validators/paymentValidator.js`
- `validators/recommendationValidator.js`

Principles:

- Validators only parse/validate HTTP input.
- Validators do not query DB.
- Business rules that need DB stay in services and throw `AppError`.

## Current Refactor Status

Done:

- VNPay return hardening
- duplicate pending VNPay cleanup
- pricing/promo split
- inventory helpers
- transaction helper
- order repository
- cart/order/payment validators
- AI foundation and fallback sentiment
- review analysis persistence
- book insight cache
- recommendation MVP

Verification:

- Backend `node --check`: pass
- Frontend `npm run build`: pass
- ESLint on touched frontend files: pass
- Full frontend lint still has many pre-existing errors in untouched files

Important files to know:

- `backend/services/ai/*`
- `backend/services/reviewService.js`
- `backend/services/bookService.js`
- `backend/services/recommendationService.js`
- `backend/repositories/reviewRepository.js`
- `backend/repositories/recommendationRepository.js`
- `backend/models/ReviewAnalysis.js`
- `backend/models/BookInsight.js`
- `backend/routes/recommendations.js`
- `backend/migrations/20260507090000-create-review-analyses.cjs`
- `backend/migrations/20260507091000-create-book-insights.cjs`
- `frontend/src/components/book/BookInsightPanel.tsx`
- `frontend/src/components/book/RecommendationShelf.tsx`
