# Backend Refactor Next Steps Plan

## 1. Muc tieu

Plan nay tiep noi `REFACTOR_PLAN.md` sau khi backend da co controller mong, service layer, `AppError`, `asyncHandler`, va `errorHandler`.

Muc tieu chinh:

- Lam chac flow Order/Payment, dac biet VNPay.
- Giam lap logic tinh gia, promo, tru kho, hoan kho.
- Lam service de doc hon ma khong tao repository/abstraction qua som.
- Giu nguyen API response contract hien tai cho frontend.
- Uu tien sua bug va rui ro nghiep vu truoc khi lam dep cau truc.

Khong lam trong dot nay:

- Khong doi database schema neu chua can.
- Khong rewrite toan bo service.
- Khong tao repository cho moi model.
- Khong doi route path hoac response field neu frontend dang phu thuoc.

## 2. Hien trang tom tat

Da lam tot:

- Controller hau het chi lay input tu `req`, goi service, tra `res.success`.
- Routes da boc `asyncHandler`.
- Service khong dung `req`, `res`, `next`.
- Loi nghiep vu da co `AppError`.
- `node --check` backend dang pass.

Con can xu ly:

- `paymentService.js` dang dung `User` trong VNPay callback nhung chua import.
- VNPay co the tru kho nhieu lan neu user tao payment URL lap lai khi cart chua bi xoa.
- Callback VNPay co the redirect success cho order khong con `pending_payment` du chua `paid`.
- Payment failed/expired dang hard delete order, mat audit trail.
- Logic promo/tinh gia lap giua `orderService.js` va `paymentService.js`.
- Logic check stock, tru kho, hoan kho lap giua Order/Payment/Scheduler.
- Chua co validator layer rieng.

## 3. Nguyen tac refactor tiep theo

- Sua loi runtime va rui ro payment truoc khi tach file.
- Tach helper khi co it nhat 2 noi dung chung logic.
- Service van la noi dieu phoi use case va quan ly transaction.
- Helper/repository khong biet HTTP.
- Validator chi validate/parse input, khong query DB.
- Moi phase phai chay `node --check` va manual test endpoint lien quan.

## 4. Phase 1: Fix Payment/VNPay safety

Muc tieu:

- VNPay callback khong loi runtime.
- Callback idempotent va khong bao success sai.
- Payment failed/expired khong lam mat lich su neu co the tranh.

Checklist:

- [x] Import `User` vao `paymentService.js`.
- [x] Doi dieu kien idempotent trong `handleVnpayReturn`:
  - Neu `payment_status === 'paid'` thi redirect success.
  - Neu order da `cancelled` hoac `payment_status === 'failed'` thi redirect failure/status ro rang.
  - Chi xu ly thanh toan khi `status === pending_payment` va `payment_status === pending`.
- [x] Khi VNPay response fail:
  - Hoan kho mot lan.
  - Set `status = cancelled`.
  - Set `payment_status = failed`.
  - Luu `vnpay_transaction_no` neu co.
  - Khong `destroy` order tru khi co yeu cau ro rang.
- [x] Khi pending payment het han:
  - Hoan kho.
  - Set `status = cancelled`.
  - Set `payment_status = failed`.
  - Khong hard delete order.
- [x] Dam bao cleanup scheduler khong hoan kho lai cho order da failed/cancelled.
- [ ] Manual test:
  - Signature invalid.
  - Order not found.
  - Payment success.
  - Payment fail.
  - Callback success goi lai lan 2.
  - Expired pending payment cleanup.

Ghi chu:

- Neu database hien tai co don pending cu, can canh giac khi cleanup chay lan dau.
- Neu frontend dang mong redirect `/order-success` cho mot so case cu, can test lai flow redirect.

## 5. Phase 2: Prevent duplicate pending VNPay orders

Muc tieu:

- Mot cart khong bi tru kho nhieu lan do tao nhieu payment URL.

Huong xu ly de xuat:

- Khi user tao VNPay payment:
  - Kiem tra user co order `pending_payment` + `payment_status = pending` con han hay khong.
  - Neu co, co 2 cach:
    - Cach A: tra lai payment URL moi cho order cu neu amount/cart van phu hop.
    - Cach B: huy order pending cu, hoan kho, roi tao order moi.
- De don gian va de dung, uu tien Cach B trong lan refactor nay.

Checklist:

- [x] Tao helper `releasePendingPaymentOrder({ order, transaction, reason })`.
- [x] Truoc khi tao pending order moi, tim pending order cu cua user.
- [x] Neu co pending order cu:
  - Lock/order query trong transaction.
  - Hoan kho order items.
  - Set `status = cancelled`, `payment_status = failed`.
- [x] Khi tao order VNPay moi, lock stock row truoc khi tru kho.
- [ ] Manual test:
  - Click tao VNPay URL 2 lan lien tiep.
  - Stock chi phan anh order pending moi nhat.
  - Pending order cu bi cancelled/failed.

## 6. Phase 3: Tach pricing va promo logic

Muc tieu:

- COD va VNPay dung chung cach tinh subtotal, promo, final total.
- Khong con duplicate `applyPromoCode`.

File de xuat:

```txt
backend/services/orderPricingService.js
```

API de xuat:

```js
calculateCartSubtotal(cartItems)
applyPromoCode({ promoCode, subtotal })
calculateOrderPricing({ cartItems, promoCode })
```

Output de xuat:

```js
{
    subtotal,
    discountAmount,
    totalPrice,
    promoId,
    promo: null
}
```

Checklist:

- [ ] Chuyen logic tinh subtotal tu `orderService.js` va `paymentService.js`.
- [ ] Chuyen logic promo duplicate vao `orderPricingService.js` hoac reuse `promoService`.
- [ ] Dam bao promo het han/khong du min amount giu behavior cu neu frontend dang phu thuoc.
- [ ] COD va VNPay cung goi `calculateOrderPricing`.
- [ ] Manual test:
  - Khong co promo.
  - Promo hop le.
  - Promo het han.
  - Promo khong du min amount.

## 7. Phase 4: Tach inventory helpers

Muc tieu:

- Logic check stock, tru kho, hoan kho co mot noi dung chung.
- Giam rui ro oversell va hoan kho lap.

File de xuat:

```txt
backend/services/inventoryService.js
```

API de xuat:

```js
validateCartItemsInStock({ cartItems, transaction, lock = false })
decreaseStockForCartItems({ cartItems, transaction })
restoreStockForOrderItems({ orderItems, transaction })
```

Checklist:

- [ ] Move check stock tu `orderService.createCodOrder`.
- [ ] Move check stock tu `paymentService.createVnpayPayment`.
- [ ] Move decrement stock tu COD/VNPay vao helper.
- [ ] Move increment stock tu cancel/payment failed/cleanup vao helper.
- [ ] Trong checkout COD/VNPay, lock row book khi validate stock.
- [ ] Manual test:
  - Out of stock.
  - COD create.
  - VNPay create.
  - Cancel COD.
  - VNPay fail/expired restore stock.

## 8. Phase 5: Them transaction helper

Muc tieu:

- Giam lap code `sequelize.transaction`, `try/catch`, `commit`, `rollback`.
- Tranh quen rollback khi throw loi.

File de xuat:

```txt
backend/utils/withTransaction.js
```

API de xuat:

```js
const withTransaction = async (handler) => {
    const transaction = await sequelize.transaction();

    try {
        const result = await handler(transaction);
        await transaction.commit();
        return result;
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        throw err;
    }
};
```

Checklist:

- [ ] Tao `withTransaction`.
- [ ] Doi `createCodOrder` sang `withTransaction`.
- [ ] Doi `cancelOrder` sang `withTransaction`.
- [ ] Doi `createVnpayPayment`, `handleVnpayReturn`, `cleanupExpiredPendingPayments`.
- [ ] Khong doi behavior ngoai API.
- [ ] `node --check` pass.

## 9. Phase 6: Tach order repository cho query dai

Muc tieu:

- Service doc theo use case, query include dai nam rieng.
- Chi tach query lap/dai, khong tao repository cho moi model.

File de xuat:

```txt
backend/repositories/orderRepository.js
```

API de xuat:

```js
findUserOrders(userId)
findUserOrdersWithTimelineData(userId)
findAllOrdersPaginated({ page, limit })
findOrderDetailById(orderId)
findOrderForCancel({ orderId, userId, transaction })
```

Checklist:

- [ ] Tach query cua `getOrders`.
- [ ] Tach query cua `getMyOrders`.
- [ ] Tach query cua `getAllOrders`.
- [ ] Tach query cua `getOrderById`.
- [ ] Giu mapping/permission trong service neu do la business rule.
- [ ] Manual test:
  - User get own orders.
  - Admin get all.
  - Detail permission user/admin.

## 10. Phase 7: Them validators

Muc tieu:

- Controller khong phai truyen input thieu parse.
- Service van giu business rule can DB.

Thu muc de xuat:

```txt
backend/validators/
  cartValidator.js
  orderValidator.js
  paymentValidator.js
  bookValidator.js
```

Checklist:

- [ ] `orderValidator.createCodOrder(body)` parse `promo_code`, `payment_method`, `address`, `phone`.
- [ ] `orderValidator.updateOrderStatus(body)` validate `order_id`, `status`.
- [ ] `orderValidator.cancelOrder(body)` validate `order_id`.
- [ ] `paymentValidator.createVnpayPayment(body)` validate `address`, `phone`, `promo_code`.
- [ ] `cartValidator` parse `book_id`, `quantity`.
- [ ] Controller goi validator truoc service.
- [ ] Service tiep tuc throw `AppError` cho rule can DB nhu stock/user/order permission.

## 11. Thu tu commit de de review

1. `fix: harden vnpay return handling`
2. `fix: prevent duplicate pending vnpay orders`
3. `refactor: share order pricing logic`
4. `refactor: centralize stock updates`
5. `refactor: add transaction helper`
6. `refactor: move order queries to repository`
7. `refactor: add request validators for cart order payment`

## 12. Verification moi phase

Chay syntax check:

```powershell
cd backend
Get-ChildItem -Recurse -File -Include *.js,*.cjs |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

Manual test toi thieu:

- Cart: add, update, remove, get.
- COD: create, empty cart, out of stock, cancel.
- VNPay: create payment URL, success callback, failed callback, duplicate callback.
- Scheduler: expired pending payment restore stock va mark failed.
- Order detail: user chi xem order cua minh, admin xem tat ca.

## 13. Definition of Done

Dot refactor nay xong khi:

- `paymentService.js` khong con bug `User is not defined`.
- VNPay callback idempotent va khong success sai.
- Failed/expired pending payment khong hard delete order.
- COD va VNPay dung chung pricing/promo logic.
- Stock check/decrement/increment dung chung helper.
- Checkout COD/VNPay lock stock row khi validate.
- Transaction boilerplate duoc gom lai hoac it nhat khong lap sai.
- Query order dai duoc tach neu service qua kho doc.
- Co validator cho input chinh cua cart/order/payment.
- `node --check` pass.
- Manual test cac flow chinh pass.
