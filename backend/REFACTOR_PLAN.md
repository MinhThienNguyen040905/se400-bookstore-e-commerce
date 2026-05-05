# Backend Refactor Plan

## 1. Muc tieu

Tai cau truc backend theo huong controller mong, business logic nam trong service, validation tach rieng, va cac query phuc tap co the gom vao repository khi can.

Muc tieu chinh:

- Giam logic trong `controllers/`.
- Tach nghiep vu khoi Express `req`/`res`.
- De test tung use case ma khong can mock HTTP.
- Giam lap code transaction, validate, tinh tien, format response.
- Tao nen tang de mo rong order, payment, auth, admin ma it gay vo cac module khac.

Khong lam trong dot refactor dau:

- Khong doi database schema neu khong bat buoc.
- Khong doi API response contract neu frontend dang phu thuoc.
- Khong rewrite toan bo backend trong mot lan.
- Khong them repository layer cho moi model neu query van don gian.

## 2. Kien truc muc tieu

```txt
backend/
  controllers/      # Nhan req/res, goi service, tra response
  services/         # Nghiep vu chinh: cart, order, auth, payment...
  repositories/     # Optional: query DB phuc tap, include lap lai
  validators/       # Validate body/query/params
  middleware/       # Auth, response, error handler
  utils/            # Helper thuan, email, cloudinary, scheduler
  models/           # Sequelize models
  routes/           # Dinh nghia endpoint va middleware
  constants/        # Enum, TTL, status
  config/           # DB, VNPAY, external config
```

## 3. Nguyen tac refactor

### Controller

Controller chi nen:

- Lay du lieu tu `req.params`, `req.query`, `req.body`, `req.user`, `req.file`.
- Goi validator neu chua dung middleware validate.
- Goi service.
- Set cookie/header neu can vi day la HTTP concern.
- Tra `res.success(...)` hoac day loi sang error middleware.

Controller khong nen:

- Query Sequelize truc tiep, tru cac endpoint rat nho trong giai do chuyen tiep.
- Tu tinh tong tien, tru kho, tao order item, gui mail.
- Goi transaction truc tiep.
- Chua logic nghiep vu phuc tap.

### Service

Service nen:

- Nhan plain object, vi du `{ userId, bookId, quantity }`.
- Tra ve plain data.
- Throw `AppError` voi status code khi gap loi nghiep vu.
- Quan ly transaction neu use case can tinh nhat quan.
- Goi model/repository/utils.

Service khong nen:

- Biet `req`, `res`, `next`.
- Goi `res.success`, `res.error`, `res.cookie`.
- Doc body/query truc tiep.

### Repository

Repository chi them khi:

- Query co `include`, `where`, `attributes` lap lai nhieu noi.
- Query qua dai lam service kho doc.
- Can dong goi cac thao tac DB co ten nghiep vu ro rang.

Khong can tao repository cho moi model ngay tu dau.

### Validator

Validator nen gom:

- Parse va validate body/query/params.
- Chuyen string query sang number/boolean/date khi can.
- Khong query DB.
- Khong chua business rule can DB, vi du "stock con du" nen nam o service.

## 4. Cau truc loi va async

Them cac file nen co:

```txt
backend/
  errors/
    AppError.js
  middleware/
    errorHandler.js
  utils/
    asyncHandler.js
```

`AppError.js`:

```js
export default class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.isOperational = true;
    }
}
```

`asyncHandler.js`:

```js
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
```

`errorHandler.js`:

```js
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.isOperational ? err.message : 'Loi server';

    if (!err.isOperational) {
        console.error(err);
    }

    res.status(status).json({ success: false, message });
};

export default errorHandler;
```

Sau do mount o cuoi `server.js`, sau routes:

```js
app.use(errorHandler);
```

## 5. Thu tu trien khai de it rui ro

### Phase 0: Chuan hoa nen tang

Checklist:

- [ ] Tao `errors/AppError.js`.
- [ ] Tao `utils/asyncHandler.js`.
- [ ] Tao `middleware/errorHandler.js`.
- [ ] Mount `errorHandler` trong `server.js`.
- [ ] Cap nhat 1 controller nho de test pattern.
- [ ] Chay `node --check` toan backend.
- [ ] Start server va test 1 endpoint thanh cong, 1 endpoint loi.

Ket qua mong doi:

- Backend van giu response format `{ success, message, data }`.
- Loi async duoc bat tap trung.
- Controller khong can `try/catch` lap lai qua nhieu.

### Phase 1: Refactor Cart

Ly do lam dau:

- Scope nho.
- It lien quan payment/order.
- Dang co logic validate quantity va stock ro rang.

File moi:

```txt
services/cartService.js
validators/cartValidator.js
```

Chuyen cac use case:

- `addToCart({ userId, bookId, quantity })`
- `updateCart({ userId, bookId, quantity })`
- `removeFromCart({ userId, bookId })`
- `getCart({ userId })`

Controller sau refactor:

- Lay `userId`.
- Lay input.
- Goi validator.
- Goi service.
- Tra response.

Checklist:

- [ ] Tao `cartService.js`.
- [ ] Chuyen logic stock check vao service.
- [ ] Chuyen format cart response vao service hoac `cartMapper`.
- [ ] Xoa import model khoi `cartController.js`.
- [ ] Dung `asyncHandler` cho routes/controller.
- [ ] Test cac case: add, add vuot stock, update 0, remove, get cart.

### Phase 2: Refactor Auth/User

Ly do:

- Dang gom nhieu flow: login, refresh, logout, OTP, register, reset password, profile, avatar.
- Nen tach tung cum de tranh file controller qua dai.

File moi:

```txt
services/authService.js
services/userService.js
services/otpService.js
validators/authValidator.js
validators/userValidator.js
```

Phan tach de xuat:

- `authService.login({ email, password })`
- `authService.refreshToken({ refreshToken })`
- `authService.logout({ refreshToken })`
- `otpService.requestOtp({ email })`
- `otpService.verifyOtp({ email, otp })`
- `userService.completeRegister({ email, password, name, phone, address })`
- `userService.resetPassword({ email, otp, newPassword })`
- `userService.changePassword({ userId, oldPassword, newPassword })`
- `userService.updateProfile({ userId, profile, avatarFile })`
- `userService.deleteUser({ requesterId, requesterRole, targetUserId })`

Quy uoc:

- Cookie refresh token van de controller set/clear.
- Service tra ve `{ accessToken, user, refreshToken }` khi login.
- Upload file co the de controller/middleware nhan file, service chi xu ly `avatarFile.path`.

Checklist:

- [ ] Tao `authService.js`.
- [ ] Dua token generation va session create vao service.
- [ ] Tao helper cookie options rieng neu can: `utils/cookieOptions.js`.
- [ ] Tao `otpService.js`.
- [ ] Chuyen send OTP vao service.
- [ ] Tao `userService.js`.
- [ ] Xoa import Sequelize/model khong can thiet khoi controller.
- [ ] Test login, refresh, logout, request OTP, reset password, change password.

### Phase 3: Refactor Order

Ly do:

- Order la module nhieu nghiep vu nhat.
- Can transaction, promo, stock, order item, email.
- Nen refactor sau khi da co pattern tu Cart va Auth.

File moi:

```txt
services/orderService.js
services/promoService.js
repositories/orderRepository.js
repositories/cartRepository.js
repositories/bookRepository.js
validators/orderValidator.js
```

Use case:

- `createCodOrder({ userId, promoCode, address, phone })`
- `getUserOrders({ userId })`
- `getMyOrdersWithTimeline({ userId })`
- `getAllOrders({ page, limit })`
- `getOrderById({ orderId, requesterId, requesterRole })`
- `updateOrderStatus({ orderId, status })`
- `cancelOrder({ userId, orderId })`

Tach helper:

```txt
services/orderPricingService.js
utils/orderTimeline.js
```

Business rule nen ro rang:

- Chi COD tao order qua `/api/orders`.
- Don COD ban dau `processing`, `payment_status = pending`.
- Cancel chi cho phep khi `processing`.
- Cancel phai hoan kho.
- Admin update status can validate status hop le.

Checklist:

- [ ] Tach `buildStatusHistory` sang `utils/orderTimeline.js`.
- [ ] Tach tinh total va promo sang `orderPricingService`.
- [ ] Tach transaction tao COD order sang `orderService.createCodOrder`.
- [ ] Chuyen hoan kho khi cancel vao service.
- [ ] Xoa query Sequelize khoi `orderController.js`.
- [ ] Test create COD, empty cart, out of stock, cancel, admin update, get detail permission.

### Phase 4: Refactor Payment/VNPay

Ly do:

- Payment dang vua tao order tam, vua build URL, vua verify callback.
- Can tach ro cong thanh toan va order lifecycle.

File moi:

```txt
services/paymentService.js
services/vnpayService.js
validators/paymentValidator.js
```

Use case:

- `paymentService.createVnpayPayment({ userId, address, phone, promoCode, ipAddress })`
- `paymentService.handleVnpayReturn(query)`
- `vnpayService.createPaymentUrl(params)`
- `vnpayService.verifyReturnParams(query)`

Can bo sung nghiep vu:

- Expire don `pending_payment` neu user khong quay ve callback.
- Hoan kho cho don pending qua han.
- Khong hard delete neu can audit; co the chuyen sang `cancelled` va `payment_status = failed`.

Checklist:

- [ ] Tach sort/sign/verify VNPay sang `vnpayService`.
- [ ] Tach tao pending order sang `paymentService`.
- [ ] Tach success callback sang `markVnpayOrderPaid`.
- [ ] Tach failed callback sang `releasePendingOrder`.
- [ ] Tao scheduler cleanup pending payment neu chon luat expire.
- [ ] Test signature invalid, success, failed, missing order, duplicate callback.

### Phase 5: Refactor Book/Admin Catalog

Module gom:

- Books
- Authors
- Genres
- Publishers
- Promo codes

File moi de xuat:

```txt
services/bookService.js
services/catalogService.js
services/promoService.js
validators/bookValidator.js
validators/catalogValidator.js
repositories/bookRepository.js
```

Checklist:

- [ ] Tach filter/search/sort/pagination cua books.
- [ ] Tach upload cover va Cloudinary destroy logic.
- [ ] Tao mapper cho book response neu can.
- [ ] Tach CRUD authors/genres/publishers neu controller dang lap pattern.
- [ ] Test search/filter, top rated, new releases, admin CRUD.

### Phase 6: Refactor Review/Wishlist/Stats

Review:

- Tach rule "chi review khi da mua va delivered".
- Tach aggregate rating neu lap lai.

Wishlist:

- Tach toggle wishlist va get wishlist.
- Co the dung service don gian, chua can repository.

Stats:

- Tach query dashboard sang service/repository vi query thong ke thuong dai.

Checklist:

- [ ] Tao `reviewService.js`.
- [ ] Tao `wishlistService.js`.
- [ ] Tao `statsService.js`.
- [ ] Test permission review, duplicate review, wishlist toggle, admin stats.

## 6. Vi du pattern sau refactor

Controller:

```js
import cartService from '../services/cartService.js';

const addToCart = async (req, res) => {
    const cartItem = await cartService.addToCart({
        userId: req.user.user_id,
        bookId: req.body.book_id,
        quantity: req.body.quantity
    });

    res.success(cartItem, 'Them vao gio hang thanh cong', 201);
};

export default { addToCart };
```

Service:

```js
import AppError from '../errors/AppError.js';
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';

const addToCart = async ({ userId, bookId, quantity = 1 }) => {
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
        throw new AppError('So luong khong hop le', 400);
    }

    const book = await Book.findByPk(bookId);
    if (!book) throw new AppError('Sach khong ton tai', 404);

    const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id: bookId } });
    const newQuantity = (cartItem?.quantity || 0) + requestedQuantity;

    if (book.stock < newQuantity) {
        throw new AppError('So luong trong kho khong du', 400);
    }

    if (cartItem) {
        cartItem.quantity = newQuantity;
        await cartItem.save();
        return cartItem;
    }

    return CartItem.create({ user_id: userId, book_id: bookId, quantity: requestedQuantity });
};

export default { addToCart };
```

Route:

```js
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, asyncHandler(cartController.addToCart));
```

## 7. Testing va verification moi phase

Moi phase nen chay:

```powershell
cd backend
npm list --depth=0
Get-ChildItem -Recurse -File -Include *.js,*.cjs | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object { node --check $_.FullName }
node server.js
```

Manual test bang Postman/browser:

- Auth: login, refresh-token, logout.
- Cart: add, update, update quantity 0, remove, get.
- Order: create COD, cancel, get my orders.
- Payment: create VNPay URL, return success/failure sandbox.
- Admin: get all orders, update status, stats.

Nen them script sau vao `package.json` sau nay:

```json
{
  "scripts": {
    "check": "node --check server.js",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

Neu chua them test framework, co the bat dau bang integration tests cho services quan trong:

- `cartService`
- `authService`
- `orderService`
- `paymentService`

## 8. Quy uoc dat ten

Service:

- `cartService.js`
- `authService.js`
- `orderService.js`
- `paymentService.js`

Validator:

- `cartValidator.js`
- `authValidator.js`
- `orderValidator.js`

Repository:

- `bookRepository.js`
- `orderRepository.js`
- `cartRepository.js`

Function service:

- Dung ten theo use case: `createCodOrder`, `cancelOrder`, `refreshToken`.
- Tham so la object de de mo rong: `createCodOrder({ userId, promoCode, address, phone })`.

Loi:

- Dung `throw new AppError(message, status)`.
- Khong return `{ error }` tu service.

## 9. Rủi ro va cach giam rui ro

### Rui ro: Vo frontend vi response doi

Cach giam:

- Giu nguyen `res.success(data, message, status)`.
- Giu ten field response hien tai trong phase dau.
- Chi doi noi bo backend.

### Rui ro: Transaction bi tach sai

Cach giam:

- Use case nao co tru kho/tao order/clear cart thi transaction nam trong service.
- Tat ca query trong transaction phai truyen `{ transaction }`.
- Rollback bang throw error, controller khong tu rollback.

### Rui ro: Upload file bi ro rac temp file

Cach giam:

- Controller/middleware nhan file.
- Service upload Cloudinary.
- Dung `finally` de xoa temp file neu ton tai.

### Rui ro: Payment callback goi lai nhieu lan

Cach giam:

- Payment service can idempotent.
- Neu order da `paid`, return success redirect lai.
- Neu order da cancel/failed, khong tru/hoan kho lan 2.

## 10. Milestone de thuc hien

### Milestone A: Foundation

- `AppError`
- `asyncHandler`
- `errorHandler`
- Update server mount error middleware

Done khi:

- Mot endpoint test co the throw `AppError` va response dung format.

### Milestone B: Cart

- `cartService`
- Controller mong
- Route dung `asyncHandler`

Done khi:

- Cart khong con import Sequelize models trong controller.
- Cac case add/update/remove/get pass manual test.

### Milestone C: Auth/User

- `authService`
- `otpService`
- `userService`

Done khi:

- Login/refresh/logout/OTP/change password/update profile hoat dong nhu cu.

### Milestone D: Order/Payment

- `orderService`
- `paymentService`
- `vnpayService`
- Pending payment cleanup rule

Done khi:

- COD va VNPay chay duoc end-to-end.
- Pending payment khong giu kho mai mai.

### Milestone E: Catalog/Admin

- Book/catalog/promo/stats services.

Done khi:

- Controller chi con adapter HTTP.
- Query dai duoc gom vao service/repository.

## 11. Thu tu commit de de review

De moi commit nho va de rollback:

1. `refactor: add backend error handling foundation`
2. `refactor: move cart business logic to service`
3. `refactor: move auth logic to services`
4. `refactor: move order logic to service`
5. `refactor: isolate vnpay payment service`
6. `refactor: move catalog logic to services`
7. `refactor: move review wishlist stats logic to services`
8. `test: add service coverage for cart auth order payment`

## 12. Definition of Done

Mot module duoc xem la refactor xong khi:

- Controller khong query model truc tiep.
- Controller khong chua business rule phuc tap.
- Service khong dung `req`, `res`, `next`.
- Loi nghiep vu dung `AppError`.
- API response khong doi voi frontend.
- `node --check` pass.
- Server start duoc.
- Manual test cac endpoint chinh pass.

