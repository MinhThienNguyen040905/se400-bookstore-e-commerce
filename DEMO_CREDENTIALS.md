# Demo Credentials & Kịch Bản Demo

> File này phục vụ buổi demo với giảng viên: chứa toàn bộ tài khoản, mật khẩu,
> và **kịch bản đăng nhập từng user để thấy rõ từng tính năng mà project đã
> áp dụng từ paper Bellar 2024**.

## 1. Cách Chạy Seeder

```powershell
cd backend
node scripts/demo-seed.js
```

**Lưu ý**: script sẽ `TRUNCATE` các bảng (giữ nguyên Books / Authors / Genres / Publishers / BookAuthors / BookGenres). Sau khi chạy, restart backend để chắc chắn cache trong RAM (nếu có) được clear:

```powershell
npm run dev
```

URL frontend: `http://localhost:5173` — URL admin: `http://localhost:5173/admin`.

---

## 2. Bảng Tài Khoản

| # | Vai trò | Email | Mật khẩu | Mục đích demo |
|---|---|---|---|---|
| 1 | **Admin** | `admin@bookstore.demo` | `Admin@123` | Truy cập admin dashboard + AI insights |
| 2 | **Customer chính** | `customer@bookstore.demo` | `Customer@123` | Trải nghiệm đầy đủ: cart, order, wishlist, recommendation |
| 3 | Reviewer tích cực | `positive@bookstore.demo` | `Demo@123` | Demo sentiment **positive** + aspect cao |
| 4 | Reviewer tiêu cực | `negative@bookstore.demo` | `Demo@123` | Demo sentiment **negative** + aspect (print/shipping/translation) |
| 5 | Reviewer mâu thuẫn | `mismatch@bookstore.demo` | `Demo@123` | Demo **ensemble agreement THẤP** + rating-sentiment mismatch |
| 6 | Reviewer aspect | `aspect@bookstore.demo` | `Demo@123` | Demo **aspect-based sentiment** đa dạng (paper §2.1) |
| 7 | Reviewer spam | `spammer@bookstore.demo` | `Demo@123` | Demo **spam detection** (rule + LLM) — paper §5 limitation |

---

## 3. Kịch Bản Demo Chi Tiết (Đi Theo Thứ Tự)

### Bước 1 — Đăng nhập **Customer chính** → giới thiệu trải nghiệm cơ bản

> `customer@bookstore.demo` / `Customer@123`

**Mục đích**: chứng minh AI không cản trở trải nghiệm thông thường (paper §2 plan principle: AI không block flow chính).

- Mở Home → xem section **"Personalized Recommendation"** → giải thích score blend (rating 28% + sentiment 18% + recency 10% + diversity).
- Xem **Cart** → có sẵn 3 sách.
- Xem **My Orders** → 1 order `processing` (đang xử lý) + nhiều order `delivered`.
- Mở **Book Detail** một sách đã có review → cuộn xuống **Book Insight Panel**:
  - Hiển thị `summary` tiếng Việt.
  - `positive_points` / `negative_points`.
  - **Sentiment distribution** (positive/neutral/negative count).
- Section **"Similar books"** → nhấn vào reason để thấy *"Cùng thể loại / Nhiều đánh giá tích cực / Sách mới phát hành"*.

→ Slide 4, 11, 12 của PRESENTATION.md.

### Bước 2 — Đăng nhập **Reviewer tích cực**

> `positive@bookstore.demo` / `Demo@123`

**Mục đích**: thấy review **positive** với ensemble đồng thuận cao.

- Vào trang sách đã review → mở phần Reviews. Mỗi review giờ hiện rõ:
  - Badge **sentiment** (xanh = positive)
  - **Summary** AI tiếng Việt trong khung xám
  - Hàng **Aspects** chips (vd: `Nội dung: positive`, `Giao hàng: positive`)
  - Hàng **Signals**: "noi dung hay", "bia dep", "giao hang nhanh"...
  - Hàng **Ensemble vote**: `groq=positive · rule=positive · rating=positive` + badge `agreement 100%` xanh
  - Dòng provider: `groq (llama-3.1-8b-instant)`

→ Slide 9 (ensemble vote).

### Bước 3 — Đăng nhập **Reviewer tiêu cực**

> `negative@bookstore.demo` / `Demo@123`

**Mục đích**: thấy **aspect-based sentiment** chi tiết.

- Vào sách đã review → xem analysis:
  - `print_quality = negative`, `shipping = negative`, `translation = negative`.
  - Các sách khác chỉ `content_quality` âm.
- Đây chính là minh chứng cho **paper §2.1 aspect-level sentiment**.

→ Slide 8 (aspect-based sentiment).

### Bước 4 — Đăng nhập **Reviewer mâu thuẫn** ⚠️ (highlight)

> `mismatch@bookstore.demo` / `Demo@123`

**Mục đích**: ⭐ **trọng tâm — chứng minh ensemble vote bảo vệ hệ thống khỏi rating giả/mỉa mai.**

- Review *"Khong tot nhu mong doi..."* nhưng rating **5 sao**:
  - UI sẽ hiển thị **Ensemble vote**: `groq=negative · rule=negative · rating=positive`
  - Badge **agreement** màu **vàng/đỏ** (50%) — ngưỡng cảnh báo
  - Dòng **spam high** + reason "rating va sentiment mau thuan"
  - Winner cuối: `negative` (weight 0.7 > 0.3)
- Review ngược (rating 1 nhưng comment khen) → tương tự ngược chiều.

**Câu chuyện kể với giảng viên**:
> Đây chính là tình huống paper §5 chỉ ra (review giả/mỉa mai). Trong paper, dataset không lọc spam → kết quả bị nhiễu. Project giải quyết bằng **ensemble 3 nguồn** lấy cảm hứng từ paper §4.4 (CNN+RNN+Bi-LSTM ensemble): không tin tuyệt đối vào bất kỳ nguồn nào.

→ Slide 9, 15.

### Bước 5 — Đăng nhập **Reviewer aspect**

> `aspect@bookstore.demo` / `Demo@123`

**Mục đích**: aspect đa dạng — sách thì translation tốt, sách thì print xấu.

- Mở từng review → thấy `aspects` JSON khác nhau:
  - Sách A: `translation = positive`, `content_quality = positive`
  - Sách B: `print_quality = negative`, `shipping = negative`
- → Cho phép admin filter: *"sách rating cao nhưng print_quality âm"*.

### Bước 6 — Đăng nhập **Reviewer spam**

> `spammer@bookstore.demo` / `Demo@123`

**Mục đích**: spam detection.

- Review *"tot"* (comment 3 ký tự) → `spam_risk = high`, reason: "comment qua ngan".
- Review chứa link `https://shop-spam.example.com` → `spam_risk = high`, reason: "co link quang cao".

→ Slide 15 (spam detection — paper §5 limitation).

### Bước 7 — Đăng nhập **Admin** 🎯 (climax)

> `admin@bookstore.demo` / `Admin@123`

**Mục đích**: trình diễn toàn bộ AI insights — đây là phần "wow" cuối buổi.

Vào `/admin` → tab Dashboard. Cuộn xuống section **"AI Review Insights"**.

Trên cùng có **Window selector** (7d / 14d / 30d) — click để đổi cửa sổ thời gian → toàn bộ dữ liệu refetch (chứng minh time-window analytics).

Sẽ thấy 3 hàng:

**Hàng 1**: Sentiment trend (line chart) — 3 đường positive/neutral/negative theo ngày trong window.

**Hàng 2** (2 card):
| Section | Ý nghĩa |
|---|---|
| **Books needing attention** | Sách có tỉ lệ negative cao trong window — kèm cover + ratio % |
| **Rating ↔ Sentiment mismatch** ⭐ | Sách rating ≥4 nhưng sentiment <0 (use case paper §5). Khung amber, badge `paper §5` |

**Hàng 3** (3 card):
| Section | Ý nghĩa |
|---|---|
| **Top positive genres** | Genre có `AVG(sentiment_score)` cao nhất |
| **Top keywords** | Signals xuất hiện nhiều + **stacked bar** xanh/xám/đỏ thể hiện phân bố sentiment từng keyword |
| **Suspicious reviews** | Review `spam_risk ∈ {medium, high}` + lý do — từ user mismatch & spammer |

**Câu chuyện kể**:
> Đây là phần vượt phạm vi paper. Paper chỉ benchmark mô hình trên dataset offline. Project mang **time-window analytics + mismatch detection + keyword aggregation** vào production — admin có thể moderate sách/review trong tuần gần đây.

→ Slide 14, 16 (cải tiến vượt paper).

### Bước 8 — Chạy **Eval Pipeline** (offline, terminal)

```powershell
cd backend
node scripts/eval-sentiment.js --limit=500
```

Kết quả console sẽ in:
- Confusion Matrix 3×3
- Per-class P / R / F1
- Accuracy + Macro-F1
- Tách 3 phân khúc: ALL / GROQ-based / FALLBACK only

→ Slide 13 (evaluation metrics — paper §3.7 + §4).

**Câu chuyện kể**:
> Project đo lường bằng cùng metric paper dùng (P/R/F1, macro-F1 thay vì accuracy đơn thuần — để xử lý class imbalance theo paper Figure 3).

---

## 4. Mã Promo (Phục Vụ Demo Checkout)

| Code | Discount | Min amount | Trạng thái |
|---|---|---|---|
| `WELCOME10` | 10% | 100,000đ | Còn hạn (30 ngày) |
| `READER20` | 20% | 200,000đ | Còn hạn (60 ngày) |
| `DEMO5` | 5% | 0đ | Còn hạn (90 ngày) |
| `EXPIRED50` | 50% | 50,000đ | **Đã hết hạn** (15 ngày trước) — demo case "promo ignored silently" |

---

## 5. Bảng Mapping User → Tính Năng Paper

| Tính năng paper / cải tiến | User để demo | Section paper |
|---|---|---|
| 3-class sentiment | `positive` + `negative` | §4.1 |
| Aspect-based sentiment | `aspect` + `negative` | §2.1 |
| **Ensemble vote** ⭐ | `mismatch` | §4.4 |
| Rating-sentiment mismatch | `mismatch` | §5 limitation |
| Spam detection | `spammer` | §5 limitation |
| Vietnamese support | tất cả (comment tiếng Việt) | §5 limitation |
| Fallback chain (Groq → rule) | `customer` (1 số review provider=fallback) | Cải tiến |
| Sentiment-aware recommendation | `customer` | §2.2 |
| Time-window analytics | `admin` | Cải tiến |
| Eval pipeline | terminal | §3.7, §4 |
| Class imbalance handling | terminal (macro-F1) | Figure 3 |

---

## 6. Lưu Ý Bảo Mật

- **CHỈ DÙNG TRONG MÔI TRƯỜNG DEMO/LOCAL.** Không commit file này nếu chứa tài khoản thật.
- Sau buổi demo, đổi mật khẩu admin hoặc xóa user demo:
  ```sql
  DELETE FROM Users WHERE email LIKE '%@bookstore.demo';
  ```
- Mật khẩu trong file đã được hash bằng bcrypt (cost=10) trong DB qua hook `beforeCreate`.

---

## 7. Re-Run / Reset Demo

Chạy lại seeder bất cứ lúc nào — sẽ TRUNCATE và tạo lại:

```powershell
cd backend
node scripts/demo-seed.js
```

→ Mất ~5-10 giây.
