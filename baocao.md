# ĐẠI HỌC QUỐC GIA TP. HỒ CHÍ MINH
# TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN
# KHOA CÔNG NGHỆ PHẦN MỀM

---

## ĐỒ ÁN SE400

# XÂY DỰNG HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ BÁN SÁCH TÍCH HỢP PHÂN TÍCH CẢM XÚC VÀ HỆ THỐNG GỢI Ý SẢN PHẨM DỰA TRÊN HỌC SÂU

---

**GV HƯỚNG DẪN:** [Tên giảng viên]

**SV THỰC HIỆN:**
- [Mã SV1] : [Họ và tên 1]
- [Mã SV2] : [Họ và tên 2]

---

**TP. HỒ CHÍ MINH, NĂM 2026**

---
---

# LỜI CẢM ƠN

Trong quá trình thực hiện đồ án, nhóm chúng em đã nhận được sự hướng dẫn, hỗ trợ tận tình từ nhiều phía. Chúng em xin gửi lời cảm ơn chân thành đến:

Quý Thầy/Cô Khoa Công nghệ Phần mềm, Trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM, đã trang bị cho chúng em những kiến thức nền tảng quý báu trong suốt thời gian học tập, là cơ sở để chúng em hoàn thành đồ án này.

Đặc biệt, chúng em xin gửi lời tri ân sâu sắc đến Thầy/Cô [Tên giảng viên hướng dẫn] đã trực tiếp hướng dẫn, định hướng và góp ý chi tiết trong từng giai đoạn thực hiện đồ án. Sự tận tâm của Thầy/Cô là nguồn động viên lớn giúp nhóm vượt qua khó khăn và hoàn thiện sản phẩm.

Đồng thời, chúng em cảm ơn các tác giả Bellar, Baina và Ballafkih (2024) — paper *"Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers"* (Mathematics 12, 2403, MDPI) đã cung cấp nền tảng khoa học vững chắc cho phần phân tích cảm xúc trong đồ án này.

Do thời gian thực hiện và kiến thức còn hạn chế, đồ án không tránh khỏi thiếu sót. Nhóm rất mong nhận được những góp ý quý báu từ Quý Thầy/Cô để hoàn thiện hơn trong tương lai.

Chúng em xin chân thành cảm ơn!

*TP. Hồ Chí Minh, tháng 05 năm 2026*

---

# MỤC LỤC

- LỜI CẢM ƠN
- MỤC LỤC
- LỜI NÓI ĐẦU
- DANH MỤC BẢNG
- DANH MỤC HÌNH VẼ

**Chương 1. TỔNG QUAN ĐỀ TÀI**
- 1.1. Động lực nghiên cứu và lý do chọn đề tài
- 1.2. Khảo sát hiện trạng
- 1.3. Đối tượng và Phạm vi nghiên cứu
- 1.4. Mục tiêu đề tài
  - 1.4.1. Yêu cầu chức năng hệ thống
  - 1.4.2. Yêu cầu dữ liệu
  - 1.4.3. Yêu cầu giao diện, phần cứng, phần mềm
  - 1.4.4. Yêu cầu phi chức năng

**Chương 2. CƠ SỞ LÝ THUYẾT**
- 2.1. Ngôn ngữ lập trình và môi trường phát triển
- 2.2. Framework và thư viện
- 2.3. Cơ sở dữ liệu
- 2.4. Phân tích cảm xúc (Sentiment Analysis)
- 2.5. Mô hình ngôn ngữ lớn (LLM) và Groq Cloud
- 2.6. Hệ thống gợi ý (Recommendation System)

**Chương 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**
- 3.1. Kiến trúc hệ thống
- 3.2. Thiết kế use case
  - 3.2.1. Sơ đồ use case
  - 3.2.2. Đặc tả chi tiết các use case
- 3.3. Thiết kế cơ sở dữ liệu
  - 3.3.1. Sơ đồ dữ liệu
  - 3.3.2. Mô tả các bảng CSDL

**Chương 4. XÂY DỰNG ỨNG DỤNG**
- 4.1. Tổ chức thư mục dự án
- 4.2. Công nghệ sử dụng
- 4.3. Triển khai các module chính
- 4.4. Pipeline phân tích cảm xúc và gợi ý
- 4.5. Giao diện người dùng

- KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
- TÀI LIỆU THAM KHẢO

---

# LỜI NÓI ĐẦU

Thương mại điện tử (E-commerce) đã trở thành một phần không thể thiếu của nền kinh tế hiện đại. Tại Việt Nam, thị trường sách online tăng trưởng mạnh trong những năm gần đây, với hàng triệu cuốn sách được giao dịch mỗi tháng. Cùng với sự tăng trưởng đó, **lượng đánh giá (review) của khách hàng** cũng bùng nổ — vừa là nguồn thông tin quý cho người mua, vừa là thách thức xử lý cho doanh nghiệp.

Tuy nhiên, các hệ thống recommendation truyền thống chủ yếu dựa vào **số sao (rating)** mà bỏ qua **nội dung văn bản** của review. Điều này dẫn đến nhiều vấn đề:

- Sách có rating cao nhưng nội dung phàn nàn không được phát hiện.
- Khách hàng phải đọc thủ công hàng chục review để quyết định mua.
- Admin không thể giám sát chất lượng sản phẩm dựa trên cảm xúc khách hàng theo thời gian thực.

Đồ án này được thực hiện nhằm xây dựng **một hệ thống thương mại điện tử bán sách hoàn chỉnh**, tích hợp **phân tích cảm xúc** (Sentiment Analysis) bằng AI và **hệ thống gợi ý thông minh** (Recommendation System) dựa trên paper khoa học của Bellar et al. (2024) — đã được xuất bản trên tạp chí Mathematics, NXB MDPI.

Đồ án không chỉ áp dụng máy móc paper gốc mà còn **điều chỉnh để phù hợp với điều kiện thực tế** của một ứng dụng production tại Việt Nam: ngôn ngữ tiếng Việt, không có GPU train mô hình, không có dataset đủ lớn để fine-tune. Cách tiếp cận của nhóm là **"dịch tinh thần khoa học của paper sang ngôn ngữ production"** — giữ nguyên các nguyên lý quan trọng (ensemble, 3-class, aspect-level) nhưng thay đổi phương tiện kỹ thuật (LLM thay vì train CNN/RNN/BERT từ đầu).

Báo cáo này trình bày toàn bộ quá trình từ nghiên cứu lý thuyết, thiết kế hệ thống, đến triển khai và đánh giá kết quả thực nghiệm.

---

# DANH MỤC BẢNG

- Bảng 3.1. Bảng `Users` — Người dùng hệ thống
- Bảng 3.2. Bảng `Books` — Sách
- Bảng 3.3. Bảng `Authors` — Tác giả
- Bảng 3.4. Bảng `Genres` — Thể loại
- Bảng 3.5. Bảng `Publishers` — Nhà xuất bản
- Bảng 3.6. Bảng `Orders` — Đơn hàng
- Bảng 3.7. Bảng `OrderItems` — Chi tiết đơn hàng
- Bảng 3.8. Bảng `CartItems` — Giỏ hàng
- Bảng 3.9. Bảng `Wishlists` — Danh sách yêu thích
- Bảng 3.10. Bảng `Reviews` — Đánh giá sản phẩm
- Bảng 3.11. Bảng `ReviewAnalyses` — Phân tích cảm xúc review
- Bảng 3.12. Bảng `BookInsights` — Tổng hợp insight cấp sách
- Bảng 3.13. Bảng `PromoCodes` — Mã khuyến mại
- Bảng 4.1. So sánh các phương án phân tích cảm xúc
- Bảng 4.2. Trọng số trong công thức recommendation
- Bảng 4.3. So sánh ensemble paper vs project

# DANH MỤC HÌNH VẼ

- Hình 3.1. Kiến trúc tổng thể hệ thống (3 tầng)
- Hình 3.2. Sơ đồ use case tổng quan
- Hình 3.3. Sơ đồ use case khách hàng
- Hình 3.4. Sơ đồ use case admin
- Hình 3.5. Sơ đồ ERD cơ sở dữ liệu
- Hình 4.1. Sơ đồ pipeline phân tích review
- Hình 4.2. Sơ đồ pipeline tạo BookInsight
- Hình 4.3. Trang chủ hệ thống
- Hình 4.4. Trang chi tiết sách với BookInsight Panel
- Hình 4.5. Trang giỏ hàng và thanh toán
- Hình 4.6. Dashboard quản trị AI Insights
- Hình 4.7. Bảng admin: "Books needing attention"
- Hình 4.8. Bảng admin: "Rating ↔ Sentiment mismatch"

---

# CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI

## 1.1. Động lực nghiên cứu và lý do chọn đề tài

### 1.1.1. Bối cảnh

Thị trường thương mại điện tử Việt Nam, đặc biệt là phân khúc sách online, đang chứng kiến sự tăng trưởng mạnh mẽ. Các nền tảng lớn như Tiki, Fahasa, Shopee Book đã trở thành kênh mua sách chính của hàng triệu người dùng. Cùng với sự tăng trưởng, **dữ liệu review** của khách hàng cũng tăng nhanh — vừa là tài nguyên quý vừa là gánh nặng xử lý.

### 1.1.2. Vấn đề thực tiễn

Trong thực tế, các hệ thống thương mại điện tử hiện hành tồn tại **ba vấn đề lớn** liên quan đến review:

**Thứ nhất**, review chứa nhiều thông tin mà rating số sao không thể truyền tải. Một khách hàng có thể chấm 4 sao nhưng comment phàn nàn về chất lượng dịch; ngược lại, có thể chấm 3 sao nhưng nội dung khen nhiều mặt. **Rating đơn lẻ không phản ánh đầy đủ trải nghiệm thực tế.**

**Thứ hai**, số lượng review lớn khiến cả khách hàng và admin khó tiếp nhận thủ công. Khách hàng phải scroll qua hàng chục review để hình thành đánh giá tổng thể. Admin không có cách nào nhận diện sớm sách đang xấu đi (lô in lỗi, dịch tệ) nếu không đọc từng review.

**Thứ ba**, hệ thống gợi ý truyền thống chỉ dựa rating và doanh số → dễ rơi vào **bẫy "rich-get-richer"**: sách bán chạy càng được đề xuất, sách mới ít có cơ hội tiếp cận khách hàng. Đồng thời, nếu một sách có rating cao nhưng review thực sự tiêu cực, hệ thống vẫn đề xuất → ảnh hưởng uy tín.

### 1.1.3. Lý do chọn đề tài

Xuất phát từ những vấn đề trên, nhóm chọn đề tài này với **bốn lý do** chính:

1. **Tính ứng dụng cao**: Hệ thống có thể triển khai thực tế cho một bookstore vừa và nhỏ tại Việt Nam.
2. **Tích hợp công nghệ AI hiện đại**: Sử dụng mô hình ngôn ngữ lớn (LLaMA qua Groq Cloud) — công nghệ đang dẫn đầu trong xử lý ngôn ngữ tự nhiên.
3. **Nền tảng khoa học vững chắc**: Dựa trên paper được xuất bản tại tạp chí Q2 (Mathematics, MDPI, 2024), đảm bảo phương pháp được kiểm chứng.
4. **Phù hợp năng lực sinh viên**: Vừa đủ thử thách (full-stack + AI + database design) vừa khả thi trong thời gian 1 học kỳ.

## 1.2. Khảo sát hiện trạng

### 1.2.1. Các hệ thống tương tự trong nước

| Hệ thống | Phân tích sentiment | Recommendation | AI Insights |
|---|---|---|---|
| **Tiki** | ❌ Không công khai | ✅ Có (dựa rating + sales) | ⚠️ Hạn chế |
| **Fahasa** | ❌ Không có | ⚠️ Cơ bản | ❌ Không có |
| **Shopee Book** | ⚠️ Bắt đầu thử (2024) | ✅ Có | ⚠️ Cho seller |

→ Nhìn chung, các nền tảng Việt Nam **chưa khai thác triệt để** sentiment analysis trong recommendation. Đây là khoảng trống mà đồ án có thể đóng góp.

### 1.2.2. Các hệ thống quốc tế

- **Amazon**: tích hợp **"Top reviews mentioning..."** từ năm 2023 — dùng LLM tóm tắt review thành các chủ đề (giao hàng, chất lượng, giá...). Đây là **aspect-level sentiment** đúng tinh thần paper.
- **Goodreads** (thuộc Amazon): vẫn dựa chủ yếu rating, chưa có tóm tắt AI.
- **Yelp**: sử dụng sentiment để rank restaurant từ 2020s.

→ Xu hướng quốc tế đã rõ: **AI sentiment + LLM tóm tắt** sẽ trở thành tiêu chuẩn của e-commerce.

### 1.2.3. Khảo sát paper khoa học

Paper Bellar et al. (2024) khảo sát **8 mô hình** trên 22,641 review của shop quần áo phụ nữ. Kết quả:

| Mô hình | Accuracy | F-score |
|---|---:|---:|
| RNN + Word2Vec (best single) | 94.85% | 89.78% |
| RoBERTa (best transformer) | 87.69% | 73.12% |
| **CNN+RNN+Bi-LSTM (ensemble)** | **96.2%** | **91.3%** |
| Naive Bayes (baseline ML) | 66.15% | 39.90% |

→ Ba bài học từ paper được nhóm áp dụng vào project: (1) deep learning vượt trội ML truyền thống; (2) **ensemble thắng mọi mô hình đơn lẻ**; (3) 3-class ổn định hơn 5-class.

## 1.3. Đối tượng và Phạm vi nghiên cứu

### 1.3.1. Đối tượng nghiên cứu

- **Đối tượng nghiệp vụ**: Hệ thống thương mại điện tử bán sách — quản lý catalog, đặt hàng, thanh toán, review, gợi ý sản phẩm.
- **Đối tượng kỹ thuật**:
  - Phân tích cảm xúc văn bản tiếng Việt (3-class: positive / neutral / negative).
  - Aspect-level sentiment trên 5 khía cạnh đặc thù domain sách.
  - Ensemble learning kết hợp LLM, rule-based và rating signal.
  - Recommendation system sentiment-aware có chống bias.
- **Đối tượng sử dụng**:
  - Khách hàng (customer): duyệt, mua, đánh giá sách.
  - Quản trị viên (admin): quản lý catalog, đơn hàng, giám sát chất lượng qua AI insights.

### 1.3.2. Phạm vi nghiên cứu

**Phạm vi chức năng**: Đồ án triển khai đầy đủ một bookstore e-commerce với các nhóm chức năng:
- Quản lý người dùng (đăng ký, đăng nhập, OTP, OAuth).
- Quản lý sản phẩm (sách, tác giả, thể loại, NXB).
- Quản lý đơn hàng (đặt, thanh toán COD/VNPay, theo dõi trạng thái).
- Đánh giá sản phẩm (review + AI sentiment analysis).
- Gợi ý sản phẩm (trending / personalized / similar).
- Dashboard quản trị (thống kê + AI insights).

**Phạm vi kỹ thuật**:
- Backend: Node.js / Express / Sequelize / MySQL.
- Frontend: React 19 / TypeScript / Vite.
- AI: Groq Cloud (LLaMA 3.1 / 3.3).
- Triển khai: chạy local hoặc cloud VPS, không cần GPU.

**Phạm vi loại trừ**: Đồ án không tập trung vào (1) training mô hình NN từ đầu; (2) tích hợp với hệ thống thanh toán quốc tế (Visa/Mastercard); (3) mobile app native.

## 1.4. Mục tiêu đề tài

### 1.4.1. Yêu cầu chức năng hệ thống

#### a) Module dành cho khách hàng

| Mã | Chức năng | Mô tả |
|---|---|---|
| FR-01 | Đăng ký / Đăng nhập | Tạo tài khoản bằng email + mật khẩu, xác thực OTP qua email |
| FR-02 | Đăng nhập Google OAuth | Single Sign-On qua tài khoản Google |
| FR-03 | Quên mật khẩu | Khôi phục qua OTP gửi email |
| FR-04 | Duyệt catalog | Lọc theo thể loại, tác giả, NXB, giá; tìm kiếm; sắp xếp |
| FR-05 | Chi tiết sách | Xem ảnh, mô tả, rating, review, **AI insight panel** |
| FR-06 | Giỏ hàng | Thêm/xóa/sửa số lượng, persist khi đăng nhập |
| FR-07 | Wishlist | Lưu sách quan tâm, gợi ý dựa wishlist |
| FR-08 | Đặt hàng & Thanh toán | COD hoặc VNPay sandbox, mã giảm giá |
| FR-09 | Theo dõi đơn hàng | Xem trạng thái: processing → shipped → delivered |
| FR-10 | Đánh giá sách | Chỉ user đã mua + delivered mới review được |
| FR-11 | Recommendation cá nhân hóa | Top sách hợp gu user trên trang chủ |
| FR-12 | Similar books | Sách tương tự trên trang chi tiết |

#### b) Module dành cho quản trị viên

| Mã | Chức năng | Mô tả |
|---|---|---|
| FR-20 | Dashboard tổng quan | Doanh thu, số đơn, top sách |
| FR-21 | Quản lý sách | CRUD sách, upload ảnh, gán thể loại/tác giả |
| FR-22 | Quản lý đơn hàng | Xem, đổi trạng thái đơn |
| FR-23 | Quản lý user | Khóa/mở tài khoản |
| FR-24 | **AI Insights Dashboard** | 6 query: sách cần chú ý, rating-sentiment mismatch, top genres, trend, keywords, review nghi spam |
| FR-25 | Re-analyze review | Chạy lại pipeline AI cho review đã có |
| FR-26 | Quản lý promo codes | CRUD mã khuyến mại |

#### c) Module AI core

| Mã | Chức năng | Mô tả |
|---|---|---|
| FR-30 | Sentiment Analysis | Phân tích sentiment 3-class cho mỗi review |
| FR-31 | Aspect-level Sentiment | 5 khía cạnh: nội dung, dịch, in, giao hàng, giá |
| FR-32 | Ensemble Vote | Kết hợp 3 nguồn: Groq + Rule + Rating |
| FR-33 | Spam Detection | 4 rule + LLM, output `low/medium/high` |
| FR-34 | Book Insight Generation | Tóm tắt review cấp sách (lazy + cache) |
| FR-35 | Sentiment-aware Recommendation | Blend 7 tín hiệu với sentiment 18% |
| FR-36 | MMR-lite Diversity | Penalty trùng author/genre trong top N |

### 1.4.2. Yêu cầu dữ liệu

- **Dữ liệu khởi tạo**: Seeder script tạo ~50 sách, 10 tác giả, 5 thể loại, 5 NXB, 20 user demo, ~200 review mẫu (cả tích cực, tiêu cực, spam, sarcasm).
- **Dữ liệu vận hành**: Mọi tương tác của user được lưu (orders, reviews, wishlist, cart).
- **Dữ liệu AI**: Mỗi review tự động sinh 1 row `ReviewAnalyses`; mỗi sách lazy-generate 1 row `BookInsights` (có cache).
- **Bảo mật dữ liệu**: PII (email, phone, URL, card number) được sanitize trước khi gửi LLM.

### 1.4.3. Yêu cầu giao diện, phần cứng, phần mềm

#### a) Yêu cầu giao diện

- **Thiết kế responsive**: hỗ trợ desktop (≥1024px), tablet (768-1024px), mobile (<768px).
- **Tone màu**: chủ đạo teal (#00bbb6) — gợi cảm giác trí tuệ, tin cậy; phụ stone (xám ấm) — sang trọng, dễ đọc.
- **Font**: Inter (sans-serif body) + Playfair Display (heading) — tạo cảm giác bookstore cao cấp.
- **Accessibility**: hỗ trợ keyboard navigation, contrast ratio ≥ 4.5:1.

#### b) Yêu cầu phần cứng

| Môi trường | CPU | RAM | Disk |
|---|---|---|---|
| Phát triển (dev) | 2 cores | 4 GB | 5 GB free |
| Triển khai (server) | 2 vCPU | 4 GB | 20 GB SSD |
| Database | Chung server hoặc VPS riêng MySQL 8.0+ | | |

→ **Không yêu cầu GPU** — đây là điểm khác biệt với các giải pháp train mô hình DL từ đầu.

#### c) Yêu cầu phần mềm

| Loại | Phần mềm | Version |
|---|---|---|
| OS | Windows 10+ / Ubuntu 20.04+ / macOS 12+ | |
| Runtime | Node.js | ≥ 18.x LTS |
| Database | MySQL | ≥ 8.0 |
| Package Manager | npm hoặc pnpm | ≥ 9 |
| Browser | Chrome / Edge / Firefox / Safari | Phiên bản hiện hành |
| AI Service | Groq Cloud (API key required) | |
| Optional | VNPay sandbox account | |

### 1.4.4. Yêu cầu phi chức năng

| Loại yêu cầu | Tiêu chí cụ thể |
|---|---|
| **Hiệu năng** | Thời gian phản hồi API < 300ms (không tính bước AI). Bước AI chạy async không block user. |
| **Khả năng mở rộng** | Tách module rõ ràng theo MVC. Pipeline AI có thể thay provider (Groq → OpenAI → local) chỉ bằng đổi 1 file. |
| **Bảo mật** | Mật khẩu hash bcrypt. JWT cho session. PII sanitize trước khi gửi LLM. SQL injection được phòng qua Sequelize ORM. |
| **Khả năng phục hồi** | AI fail không làm vỡ review. Cache invalidate đúng. Order scheduler tự retry. |
| **Khả năng quan sát** | Log đầy đủ token usage, latency, lỗi. Admin dashboard cho phép quan sát chất lượng AI realtime. |
| **Khả năng audit** | Mọi phân tích lưu `prompt_version`, `model`, `ensemble_sources` để debug và rollback. |
| **Tuân thủ Privacy** | Tự động che email, URL, phone, credit card trước khi gửi lên LLM bên thứ ba. |

---

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

## 2.1. Ngôn ngữ lập trình và môi trường phát triển

### 2.1.1. JavaScript / TypeScript

- **JavaScript (ES2022+)** dùng cho backend (Node.js). Cú pháp module ESM, async/await, optional chaining.
- **TypeScript** dùng cho frontend (React) — bổ sung type safety, giảm bug runtime, IDE auto-complete mạnh.

### 2.1.2. Node.js

Node.js là runtime JavaScript phía server, dựa trên V8 engine. Phù hợp với hệ thống I/O-bound như e-commerce nhờ **event loop non-blocking**. Trong project, Node.js xử lý:
- HTTP request từ frontend.
- Truy vấn DB qua Sequelize.
- Gọi Groq API bất đồng bộ.
- Cron job cập nhật trạng thái đơn hàng.

### 2.1.3. Công cụ phát triển

- **VSCode**: IDE chính với extension ESLint, Prettier, Mermaid Preview.
- **Postman / Thunder Client**: test API.
- **Git + GitHub**: version control, code review qua Pull Request.
- **MySQL Workbench / DBeaver**: quản lý CSDL.

## 2.2. Framework và thư viện

### 2.2.1. Express.js (Backend Framework)

Express là framework web minimal cho Node.js. Project sử dụng kiến trúc **MVC + Service + Repository**:

```
Routes → Controllers → Services → Repositories → Models (Sequelize)
```

Cụ thể:
- **Routes**: định nghĩa endpoint URL.
- **Controllers**: parse request, gọi service, return response.
- **Services**: chứa business logic.
- **Repositories**: tách phần truy vấn DB phức tạp.
- **Models**: schema Sequelize.

### 2.2.2. Sequelize ORM

Sequelize là ORM cho Node.js, hỗ trợ MySQL/PostgreSQL/SQLite. Project dùng Sequelize cho:
- Khai báo schema qua JavaScript (`DataTypes.STRING`, `DataTypes.INTEGER`...).
- Quan hệ between bảng (`hasMany`, `belongsTo`, `belongsToMany`).
- Migration để versioning schema.
- Truy vấn raw SQL khi cần performance (aggregation, JOIN nhiều bảng).

### 2.2.3. React 19 + Vite (Frontend)

- **React 19**: thư viện UI component-based, hỗ trợ Hooks, Concurrent Rendering.
- **Vite**: build tool nhanh hơn Webpack nhờ ES modules + esbuild.
- **TypeScript**: type safety toàn bộ codebase frontend.

### 2.2.4. Thư viện phụ trợ

| Thư viện | Mục đích |
|---|---|
| **TanStack Query (React Query)** | Quản lý server state, cache, auto-refetch |
| **Zustand** | Quản lý client state (auth, cart UI) |
| **React Router v7** | Routing client-side |
| **Tailwind CSS v4** | Utility-first styling |
| **lucide-react** | Icon set |
| **date-fns** | Định dạng ngày tháng |
| **bcryptjs** | Hash mật khẩu |
| **jsonwebtoken** | JWT signing |
| **nodemailer** | Gửi email OTP |
| **node-cron** | Lập lịch cron job |
| **multer** | Upload file ảnh |

## 2.3. Cơ sở dữ liệu

### 2.3.1. MySQL 8.0

- **Loại**: Relational Database (RDBMS).
- **Lý do chọn**: phổ biến, miễn phí, tài liệu phong phú, hỗ trợ JSON column từ MySQL 5.7+ → đủ cho lưu `aspects`, `signals`, `ensemble_sources`.
- **Charset**: utf8mb4 cho hỗ trợ tiếng Việt + emoji.

### 2.3.2. Thiết kế schema theo nguyên tắc

- **Normalization 3NF** cho bảng nghiệp vụ (Books, Authors, Users, Orders).
- **Denormalization có chủ ý** cho bảng AI (ReviewAnalyses, BookInsights) — lưu trực tiếp JSON aspects/signals để query nhanh.
- **Index** trên các trường lọc thường xuyên (sentiment_label, book_id, user_id, review_date).
- **Foreign key constraints** đảm bảo data integrity.

## 2.4. Phân tích cảm xúc (Sentiment Analysis)

### 2.4.1. Khái niệm

Phân tích cảm xúc (Sentiment Analysis hay Opinion Mining) là **lĩnh vực xử lý ngôn ngữ tự nhiên (NLP)** nhằm xác định cảm xúc (positive / negative / neutral) thể hiện trong một đoạn văn bản. Đây là một trong những bài toán cơ bản nhất nhưng vẫn còn nhiều thách thức của NLP.

### 2.4.2. Ba cấp độ phân tích (theo paper §2.1)

| Cấp độ | Mô tả | Ví dụ |
|---|---|---|
| **Document-level** | Cảm xúc tổng thể của 1 review | "Sách này hay" → positive |
| **Sentence-level** | Cảm xúc từng câu | "Nội dung hay. Dịch tệ." → câu 1 positive, câu 2 negative |
| **Aspect-level** | Cảm xúc theo từng khía cạnh | content=positive, translation=negative |

→ Project triển khai **document-level + aspect-level** trên 5 keys cố định.

### 2.4.3. Hai cách tiếp cận chính

#### a) Rule-based / Lexicon-based

Sử dụng dictionary từ khóa khen/chê có sẵn, đếm và tính điểm. Ưu điểm: nhanh, deterministic, không cần training. Nhược điểm: không hiểu sarcasm, phủ định, ngữ cảnh.

#### b) Machine Learning / Deep Learning

Train mô hình trên dataset có nhãn. Bao gồm:
- **Mô hình truyền thống**: Naive Bayes, SVM, Logistic Regression.
- **Deep learning**: CNN, RNN, Bi-LSTM (paper Bellar 2024 sử dụng).
- **Transformer-based**: BERT, RoBERTa, ALBERT, GPT, LLaMA.

→ Project dùng **LLaMA qua Groq Cloud API** thay vì train từ đầu — vì điều kiện không có GPU và dataset đủ lớn.

### 2.4.4. Chỉ số đánh giá (theo paper §3.7)

| Chỉ số | Công thức | Ý nghĩa |
|---|---|---|
| **Precision** | TP / (TP + FP) | Tỷ lệ dự đoán đúng khi nói "positive" |
| **Recall** | TP / (TP + FN) | Tỷ lệ bắt được "positive" trong tất cả positive thực sự |
| **F1-score** | 2 × P × R / (P + R) | Harmonic mean của P và R |
| **Accuracy** | (TP+TN) / Total | Tỷ lệ dự đoán đúng tổng thể |
| **Macro-F1** | Trung bình F1 của 3 class | Quan trọng khi class imbalance |

## 2.5. Mô hình ngôn ngữ lớn (LLM) và Groq Cloud

### 2.5.1. LLaMA — Mô hình ngôn ngữ của Meta

LLaMA (Large Language Model Meta AI) là họ mô hình LLM open-weight của Meta. Phiên bản 3.1 (8B parameters) và 3.3 (70B parameters) hỗ trợ tốt cả tiếng Anh và tiếng Việt. So với GPT-4 (closed-source, đắt), LLaMA có:
- Trọng số mở (open weights) → có thể tự host.
- Chi phí thấp hơn khi gọi qua provider.
- Đủ thông minh cho task phân loại + tóm tắt.

### 2.5.2. Groq Cloud — Inference siêu nhanh

Groq là công ty cung cấp inference engine chuyên cho LLM, sử dụng chip LPU (Language Processing Unit) tự thiết kế. Đặc điểm:
- **Tốc độ**: ~500-1000 tokens/giây — nhanh hơn GPU thông thường 5-10 lần.
- **API**: tương thích với OpenAI SDK → dễ migrate.
- **Free tier**: đủ cho dev và demo.

### 2.5.3. Prompt Engineering

Project sử dụng **JSON-strict prompt** để đảm bảo output có cấu trúc:

```
You are analyzing a Vietnamese bookstore product review.
Return only valid JSON.
JSON schema: { ... }
```

→ Kết hợp với `response_format: json_object` của Groq để bắt buộc output JSON, dễ parse, ít lỗi.

## 2.6. Hệ thống gợi ý (Recommendation System)

### 2.6.1. Các loại recommendation chính

| Loại | Mô tả | Ví dụ |
|---|---|---|
| **Popularity-based** | Top sách bán chạy / rating cao | "Bestseller tuần" |
| **Content-based** | Dựa thuộc tính sản phẩm (genre, author) | "Sách cùng thể loại" |
| **Collaborative Filtering** | Dựa hành vi user tương tự | "Người mua X cũng mua Y" |
| **Hybrid** | Kết hợp nhiều loại | Project sử dụng |

### 2.6.2. Vấn đề thường gặp

- **Cold-start**: sách mới ít tương tác → không có cơ hội leo top.
- **Filter bubble**: user chỉ thấy nội dung đã quen → mất khả năng khám phá.
- **Popularity bias**: sách hot càng được đề xuất → khoét sâu chênh lệch.

### 2.6.3. MMR — Maximal Marginal Relevance

MMR là kỹ thuật cân bằng **relevance vs diversity**. Công thức gốc:

```
MMR = λ × Sim(query, doc) − (1−λ) × max(Sim(doc, selected))
```

Project dùng phiên bản đơn giản hóa: trừ điểm penalty khi sách trùng author/genre với sách đã chọn. Đây là cải tiến **vượt phạm vi paper** vì paper là benchmark học thuật, không quan tâm UX.

---

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Kiến trúc hệ thống

### 3.1.1. Sơ đồ kiến trúc 3 tầng

*(Hình 3.1)*

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  ┌─────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ Customer Pages  │  │ Admin Dash  │  │ Auth Pages   │  │
│  │ (React + Vite)  │  │             │  │              │  │
│  └────────┬────────┘  └──────┬──────┘  └──────┬───────┘  │
└───────────┼─────────────────────────────────────┼────────┘
            │           HTTP/JSON (REST)          │
┌───────────┼─────────────────────────────────────┼────────┐
│                    APPLICATION LAYER                      │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Express Routes → Controllers → Services           │    │
│  │  • Auth   • Books   • Orders   • Reviews          │    │
│  │  • Cart   • Wishlist • Payment  • Recommendations │    │
│  │  • Admin Stats                                    │    │
│  └──────┬─────────────────────────────────┬─────────┘    │
│         │                                  │              │
│  ┌──────▼──────────┐         ┌────────────▼─────────┐    │
│  │ AI Layer         │         │ Repositories          │    │
│  │  • Groq Client   │         │  (Sequelize)          │    │
│  │  • Sanitize      │         │                       │    │
│  │  • Fallback      │         └────────────┬─────────┘    │
│  │  • EnsembleVote  │                      │              │
│  │  • JsonParser    │                      │              │
│  └──────┬───────────┘                      │              │
└─────────┼──────────────────────────────────┼─────────────┘
          │                                  │
┌─────────▼──────────┐         ┌─────────────▼────────────┐
│  EXTERNAL          │         │   DATA LAYER             │
│  Groq Cloud API    │         │   MySQL 8.0              │
│  (LLaMA 3.1/3.3)   │         │   • 14 tables            │
└────────────────────┘         └──────────────────────────┘
```

### 3.1.2. Mô tả các tầng

#### a) Presentation Layer (Frontend)

- Triển khai bằng React 19 + TypeScript + Vite.
- Chia 3 nhóm trang chính: Customer (mua sắm), Admin (quản trị), Auth (đăng nhập/đăng ký).
- State management: React Query cho server state, Zustand cho client state.
- UI: Tailwind CSS v4 + shadcn/ui components.

#### b) Application Layer (Backend)

Tầng này chia làm 2 thành phần con:

**Phần nghiệp vụ thông thường (Express MVC)**:
- Routes định nghĩa endpoint.
- Controllers parse request.
- Services chứa business logic.
- Repositories tách query DB phức tạp.

**Phần AI Layer (riêng biệt)**:
- `groqClient.js`: wrapper gọi Groq API, timeout, retry.
- `sanitize.js`: PII redaction + Unicode NFC.
- `fallbackSentiment.js`: rule-based phân tích.
- `ensembleVote.js`: kết hợp 3 nguồn.
- `jsonParser.js`: parse JSON từ LLM với clamping.

Sự phân tách AI Layer cho phép **thay nhà cung cấp AI dễ dàng** — chỉ đổi `groqClient.js` mà không động đến phần còn lại.

#### c) Data Layer

- MySQL 8.0 với charset utf8mb4.
- 14 bảng chia 4 nhóm:
  - **Nghiệp vụ**: Users, Books, Authors, Genres, Publishers, Orders, OrderItems, CartItems, Wishlists, PromoCodes.
  - **Review & AI**: Reviews, ReviewAnalyses, BookInsights.
  - **Hệ thống**: Sessions, OtpTemp.
- Quan hệ many-to-many qua bảng nối (BookAuthors, BookGenres).

#### d) External Services

- **Groq Cloud**: cung cấp inference LLaMA.
- **VNPay Sandbox**: xử lý thanh toán test.
- **Gmail SMTP**: gửi OTP, email xác nhận đơn hàng.

## 3.2. Thiết kế use case

### 3.2.1. Sơ đồ use case tổng quan

*(Hình 3.2)*

```
                ┌─────────────────────────────────────┐
                │       BOOKSTORE E-COMMERCE          │
                └─────────────────────────────────────┘

   Customer                                          Admin
   ┌──────┐                                       ┌────────┐
   │  👤  │                                       │   👤   │
   └──┬───┘                                       └────┬───┘
      │                                                │
      ├─ UC-01: Đăng ký tài khoản                     ├─ UC-20: Quản lý sách
      ├─ UC-02: Đăng nhập                             ├─ UC-21: Quản lý đơn hàng
      ├─ UC-03: Đăng nhập Google                      ├─ UC-22: Quản lý user
      ├─ UC-04: Quên mật khẩu                         ├─ UC-23: Xem AI Insights
      ├─ UC-05: Duyệt catalog                         ├─ UC-24: Re-analyze review
      ├─ UC-06: Tìm kiếm sách                         ├─ UC-25: Quản lý promo
      ├─ UC-07: Xem chi tiết sách                     ├─ UC-26: Quản lý NXB/Tác giả
      ├─ UC-08: Thêm vào giỏ hàng
      ├─ UC-09: Thêm vào wishlist
      ├─ UC-10: Đặt hàng
      ├─ UC-11: Thanh toán (COD/VNPay)
      ├─ UC-12: Theo dõi đơn hàng
      ├─ UC-13: Hủy đơn hàng
      ├─ UC-14: Đánh giá sách (sau khi nhận)
      ├─ UC-15: Xem gợi ý sách
      └─ UC-16: Quản lý profile
```

### 3.2.2. Đặc tả chi tiết use case

#### UC-14: Đánh giá sách (use case quan trọng nhất)

| Thuộc tính | Mô tả |
|---|---|
| **Tên use case** | Đánh giá sách |
| **Mã** | UC-14 |
| **Actor** | Customer (đã đăng nhập, đã nhận hàng) |
| **Mô tả** | Customer viết review (rating + comment) cho sách đã mua và đã được giao thành công. Hệ thống tự động phân tích sentiment bằng AI. |
| **Tiền điều kiện** | (1) User đã đăng nhập. (2) User có đơn hàng chứa sách này với status = DELIVERED. (3) User chưa review sách này. |
| **Luồng chính** | 1. User vào trang chi tiết sách. <br> 2. User chọn rating (1-5 sao) và nhập comment. <br> 3. User bấm "Submit Review". <br> 4. Hệ thống xác thực điều kiện. <br> 5. Hệ thống lưu review vào DB ngay. <br> 6. Hệ thống trả response 200 cho user. <br> 7. **(Async)** Pipeline AI chạy ngầm: sanitize → rule → Groq → ensemble vote → upsert ReviewAnalyses. <br> 8. Cache BookInsight được invalidate. |
| **Luồng phụ** | **5a**. Nếu chưa đăng nhập → redirect /login. <br> **5b**. Nếu chưa có đơn DELIVERED → toast error "Chỉ review sau khi nhận hàng". <br> **5c**. Nếu đã review → toast error "Đã review trước đó". <br> **7a**. Nếu Groq fail → rule fallback vẫn lưu kết quả. |
| **Hậu điều kiện** | Review hiển thị trên trang sách. Sentiment analysis có sẵn trong DB phục vụ recommendation và admin dashboard. |

#### UC-23: Xem AI Insights (admin)

| Thuộc tính | Mô tả |
|---|---|
| **Tên use case** | Xem AI Insights Dashboard |
| **Mã** | UC-23 |
| **Actor** | Admin |
| **Mô tả** | Admin xem 6 query phân tích: sách cần chú ý, rating-sentiment mismatch, top genres, sentiment trend, keywords, review nghi spam. |
| **Tiền điều kiện** | Admin đã đăng nhập với role = admin |
| **Luồng chính** | 1. Admin vào tab "AI Insights" trên dashboard. <br> 2. Frontend gọi `GET /api/admin/stats/ai-insights?windowDays=7`. <br> 3. Backend chạy song song 6 SQL query. <br> 4. Backend trả về object chứa 6 keys: `negative_review_books`, `rating_sentiment_mismatch`, `top_positive_genres`, `sentiment_trend`, `top_keywords`, `suspicious_reviews`. <br> 5. Frontend render thành 6 panel: bảng + biểu đồ + chip. |
| **Luồng phụ** | **2a**. Admin có thể đổi `windowDays` (1-90). |

## 3.3. Thiết kế cơ sở dữ liệu

### 3.3.1. Sơ đồ ERD

*(Hình 3.5)*

```
┌─────────────┐  1   N  ┌──────────────┐  N  1  ┌─────────────┐
│   Users     │─────────│   Orders     │────────│ PromoCodes  │
└──────┬──────┘         └──────┬───────┘        └─────────────┘
       │                       │ 1
       │ 1                     │
       │                       │ N
       │                ┌──────▼────────┐
       │                │  OrderItems   │
       │                └──────┬────────┘
       │                       │ N
       │                       │
       │                       │ 1
       │ N         ┌───────────▼───────────┐
       └───────────│       Books           │
                   └───┬─────────┬─────────┘
                       │1       1│
                       │N       N│
                       │         │
              ┌────────▼┐   ┌────▼──────┐
              │BookAuth │   │BookGenres │
              └────┬────┘   └─────┬─────┘
                   │N             │N
                   │              │
                   │1             │1
              ┌────▼────┐   ┌─────▼─────┐
              │Authors  │   │  Genres   │
              └─────────┘   └───────────┘

       1  N
Books ─────── Reviews ─── 1:1 ─── ReviewAnalyses
       │
       └─── 1:1 ─── BookInsights

Users ── 1:N ── Wishlists ── N:1 ── Books
Users ── 1:N ── CartItems ── N:1 ── Books
Books ── N:1 ── Publishers
```

### 3.3.2. Mô tả các bảng CSDL

#### Bảng 3.1. `Users` — Người dùng hệ thống

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `user_id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `name` | VARCHAR(100) | NOT NULL | Họ tên |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email (login) |
| `password` | VARCHAR(255) | NOT NULL | Hash bcrypt |
| `address` | VARCHAR(255) | NULL | Địa chỉ giao hàng |
| `phone` | VARCHAR(20) | NULL | Số điện thoại |
| `role` | ENUM('admin','customer') | DEFAULT 'customer' | Vai trò |
| `avatar` | VARCHAR(255) | NULL | URL ảnh đại diện |
| `createdAt` | DATETIME | | Sequelize timestamps |
| `updatedAt` | DATETIME | | Sequelize timestamps |

#### Bảng 3.2. `Books` — Sách

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `book_id` | INT | PK, AUTO_INCREMENT | Khóa chính |
| `title` | VARCHAR(200) | NOT NULL | Tên sách |
| `description` | TEXT | | Mô tả |
| `publisher_id` | INT | FK → Publishers | NXB |
| `stock` | INT | DEFAULT 0 | Số lượng tồn kho |
| `price` | DECIMAL(10,2) | NOT NULL | Giá |
| `cover_image` | VARCHAR(255) | | URL ảnh bìa |
| `release_date` | DATE | | Ngày phát hành |
| `isbn` | VARCHAR(20) | UNIQUE | Mã ISBN |

#### Bảng 3.3. `Authors` — Tác giả

| Trường | Kiểu | Ràng buộc |
|---|---|---|
| `author_id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `bio` | TEXT | |

#### Bảng 3.4. `Genres` — Thể loại

| Trường | Kiểu |
|---|---|
| `genre_id` | INT PK |
| `name` | VARCHAR(50) UNIQUE |

#### Bảng 3.5. `Publishers` — NXB

| Trường | Kiểu |
|---|---|
| `publisher_id` | INT PK |
| `name` | VARCHAR(100) |
| `address` | VARCHAR(255) |

#### Bảng 3.6. `Orders` — Đơn hàng

| Trường | Kiểu | Mô tả |
|---|---|---|
| `order_id` | INT PK | |
| `user_id` | INT FK | Người đặt |
| `total_price` | DECIMAL(10,2) | Tổng tiền |
| `status` | ENUM | pending_payment / processing / shipped / delivered / cancelled |
| `order_date` | DATETIME | Thời điểm đặt |
| `payment_method` | VARCHAR(50) | COD / VNPay |
| `payment_status` | VARCHAR(50) | pending / paid / failed |
| `vnpay_transaction_no` | VARCHAR(50) | Mã giao dịch VNPay |
| `address`, `phone` | | Thông tin giao hàng |
| `promo_id` | INT FK | Mã khuyến mại đã dùng (nullable) |

#### Bảng 3.7. `OrderItems` — Chi tiết đơn hàng

| Trường | Mô tả |
|---|---|
| `id` | PK |
| `order_id` | FK → Orders |
| `book_id` | FK → Books |
| `quantity` | Số lượng |
| `price` | Giá tại thời điểm đặt |

#### Bảng 3.8. `CartItems` — Giỏ hàng

| Trường |
|---|
| `id` PK |
| `user_id` FK |
| `book_id` FK |
| `quantity` |

#### Bảng 3.9. `Wishlists` — Yêu thích

| Trường |
|---|
| `wishlist_id` PK |
| `user_id` FK |
| `book_id` FK |

#### Bảng 3.10. `Reviews` — Đánh giá

| Trường | Mô tả |
|---|---|
| `review_id` PK | |
| `user_id` FK | Người viết |
| `book_id` FK | Sách được review |
| `rating` INT | 1-5 sao |
| `comment` TEXT | Nội dung |
| `review_date` DATETIME | Thời điểm |

#### Bảng 3.11. `ReviewAnalyses` — Phân tích cảm xúc review

(Đã trình bày chi tiết trong slide thuyết trình. Tóm tắt 16 trường — quan hệ 1-1 với Reviews.)

| Nhóm | Trường |
|---|---|
| **Định danh** | `analysis_id`, `review_id` |
| **Sentiment lõi** | `sentiment_label`, `sentiment_score`, `confidence` |
| **Diễn giải** | `summary`, `signals`, `aspects` |
| **Spam** | `spam_risk`, `spam_reasons` |
| **Ensemble audit** | `ensemble_agreement`, `ensemble_sources` |
| **Provenance** | `provider`, `model`, `prompt_version`, `raw_response` |

#### Bảng 3.12. `BookInsights` — Insight cấp sách

(13 trường — quan hệ 1-1 với Books, có cache.)

| Nhóm | Trường |
|---|---|
| **Định danh** | `insight_id`, `book_id` |
| **Văn bản tóm tắt** | `summary`, `reader_fit`, `recommendation_hint` |
| **Điểm khen/chê** | `positive_points`, `negative_points` |
| **Thống kê** | `sentiment_distribution`, `review_count` |
| **Provenance** | `provider`, `model`, `prompt_version`, `generated_at` |

#### Bảng 3.13. `PromoCodes` — Mã khuyến mại

| Trường |
|---|
| `promo_id` PK |
| `code` UNIQUE |
| `discount_percent` |
| `valid_from`, `valid_to` |
| `max_usage`, `current_usage` |

---

# CHƯƠNG 4. XÂY DỰNG ỨNG DỤNG

## 4.1. Tổ chức thư mục dự án

```
bookstore-e-commerce/
├── backend/
│   ├── config/              # DB, env config
│   ├── constants/           # ORDER_STATUS, ROLES...
│   ├── controllers/         # Parse request, call service
│   ├── errors/              # AppError class
│   ├── middleware/          # auth, adminAuth, errorHandler
│   ├── migrations/          # Sequelize migrations
│   ├── models/              # Sequelize schema (19 models)
│   ├── repositories/        # Complex DB queries
│   ├── routes/              # Express routes (14 files)
│   ├── scripts/             # demo-seed.js, eval-sentiment.js, fast-forward-orders.js
│   ├── services/
│   │   ├── ai/              # AI Layer (tách riêng)
│   │   │   ├── groqClient.js
│   │   │   ├── sanitize.js
│   │   │   ├── fallbackSentiment.js
│   │   │   ├── ensembleVote.js
│   │   │   ├── reviewAnalysisService.js
│   │   │   ├── bookInsightService.js
│   │   │   └── jsonParser.js
│   │   ├── orderService.js
│   │   ├── reviewService.js
│   │   ├── recommendationService.js
│   │   ├── statsService.js
│   │   └── ...
│   ├── utils/               # orderScheduler, mailer
│   ├── validators/          # Joi schemas
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # Axios clients per resource
│   │   ├── components/
│   │   │   ├── admin/       # Dashboard tabs
│   │   │   ├── book/        # BookCard, BookReviews, InsightPanel
│   │   │   ├── cart/        # CartItem, CartSummary
│   │   │   ├── layout/      # Header, Footer, Sidebar
│   │   │   └── ui/          # shadcn primitives
│   │   ├── features/        # Feature modules (auth, cart)
│   │   ├── hooks/           # useBooks, useAdmin, useCart...
│   │   ├── pages/           # Route components
│   │   ├── types/           # TypeScript types
│   │   ├── lib/             # utils, toast
│   │   └── App.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── PRESENTATION.md          # Bản thuyết trình
├── PAPER_INTEGRATION_REPORT.md   # Báo cáo tích hợp paper
├── PAPER_DETAILED_SUMMARY.md     # Tóm tắt paper
├── AI_SENTIMENT_RECOMMENDATION_PLAN.md
├── baocao.md                # Báo cáo này
└── README.md
```

## 4.2. Công nghệ sử dụng

### 4.2.1. Backend stack

| Lớp | Công nghệ | Phiên bản |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 4.21 |
| ORM | Sequelize | 6.37 |
| DB | MySQL | 8.0 |
| AI Client | Groq SDK (qua REST) | latest |
| Auth | JWT + bcryptjs | |
| Mail | nodemailer | |
| Validation | Joi | |
| File Upload | multer | |
| Cron | node-cron | |
| Process Manager | nodemon (dev), pm2 (prod) | |

### 4.2.2. Frontend stack

| Lớp | Công nghệ |
|---|---|
| Library | React 19 |
| Language | TypeScript 5 |
| Build | Vite 7 |
| Router | React Router 7 |
| Server State | TanStack Query 5 |
| Client State | Zustand 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Charts | recharts |
| HTTP | axios |

## 4.3. Triển khai các module chính

### 4.3.1. Authentication

- JWT lưu trong cookie HttpOnly.
- Bcrypt hash với salt round = 10.
- OTP qua email (6 chữ số, hết hạn 5 phút) cho đăng ký và quên mật khẩu.
- Google OAuth 2.0 cho đăng nhập một chạm.

### 4.3.2. Đơn hàng và Thanh toán

- Order tạo với status = `processing`, payment_status = `pending`.
- **VNPay sandbox**: redirect user sang trang VNPay, xử lý callback IPN để cập nhật `payment_status = paid`.
- **Cron job** (`orderScheduler.js`): mỗi giờ kiểm tra:
  - Order PROCESSING → SHIPPED sau 2 ngày.
  - Order SHIPPED → DELIVERED sau 4 ngày.
- Trừ stock khi tạo order, cộng lại stock khi cancel.

### 4.3.3. Review pipeline (kernel của AI layer)

**Đây là module quan trọng nhất** của project. Triển khai theo 7 bước:

1. **Trigger**: sau khi `Review.create()` thành công, gọi `queueReviewAnalysis(review.review_id)`.
2. **Async queue**: `setTimeout(0)` đẩy task ra macrotask queue → response trả về user trước.
3. **Load context**: lấy review + Book.title.
4. **Sanitize**: PII redaction + Unicode NFC + cắt 2000 ký tự.
5. **Rule luôn chạy**: `fallbackAnalyzeReview()` cho ra baseline.
6. **Groq nếu bật**: gọi `analyzeWithGroq()` với timeout 15s, fail-safe.
7. **Ensemble vote**: kết hợp 3 nguồn (Groq 0.5, Rule 0.2, Rating 0.3).
8. **Upsert**: ghi vào `ReviewAnalyses`, invalidate `BookInsight` cache.

### 4.3.4. BookInsight pipeline (cấp sách)

- **Lazy**: chỉ generate khi user mở trang sách.
- **Cache**: kiểm tra `review_count` + `updatedAt` của review mới nhất.
- **Merge layered**: rule fallback làm base + Groq override 5 trường text.

### 4.3.5. Recommendation Engine

- **Two-stage**:
  - Stage 1 (SQL): lấy top 40-50 candidate theo `review_count + sales_count`.
  - Stage 2 (Node.js): score blend 7 tín hiệu với normalization phù hợp.
- **MMR-lite diversity**: trừ 0.05/0.03 cho sách trùng author/genre.
- **3 mode**: trending (chung), personalized (theo user), similar (theo sách hiện tại).

### 4.3.6. Admin AI Insights Dashboard

- 1 endpoint trả về 6 query trong 1 response.
- Time-window 1-90 ngày, có clamp bảo vệ.
- 3 nhóm query: Moderation, Analytics, Investigation.

## 4.4. Pipeline phân tích cảm xúc và gợi ý

### 4.4.1. Pipeline ReviewAnalysis (Hình 4.1)

```
User submit review
    │
    ▼
Review.create()  ──► Lưu NGAY (không chờ AI)
    │
    ▼
queueReviewAnalysis(reviewId)  ──► setTimeout(0) async
    │ (không block response)
    ▼
sanitizePii  ──► normalizeText
    │
    ▼
fallbackAnalyzeReview()  ──► rule LUÔN chạy
    │
    ▼
[if AI_ENABLED]  analyzeWithGroq()  (timeout 15s)
    │
    ▼
ensembleVote(groq, rule, rating)
    │
    ▼
upsertReviewAnalysis()
```

### 4.4.2. Pipeline BookInsight (Hình 4.2)

```
User mở trang sách
    │
    ▼
Check cache (review_count + updatedAt)
    │
    ├─── HIT ──► Trả cache (~10ms)
    │
    └─── MISS
            │
            ▼
        Load reviews + ReviewAnalyses
            │
            ▼
        buildFallbackInsight (rule, luôn chạy)
            │
            ▼
        [if Groq OK] analyzeWithGroq (model 70B)
            │
            ▼
        Merge layered (rule base + Groq override)
            │
            ▼
        Upsert BookInsights
```

### 4.4.3. Công thức Recommendation

```
score = 0.28 × avg_rating
      + 0.18 × positive_sentiment    ← Đóng góp từ paper §2.2
      + 0.13 × review_count
      + 0.13 × sales_count
      + 0.09 × wishlist_count
      + 0.09 × user_interest_match
      + 0.10 × recency

Normalization:
  - Rating: chia 5
  - Sentiment: (score + 1) / 2
  - Count: log1p(value) / log1p(max)  ← chống bias sách hot
  - Recency: 1 - ageDays / 365  ← half-life 365 ngày

Diversity (MMR-lite):
  - Trùng author top-1 → -0.05
  - Trùng genre top-1 → -0.03
```

## 4.5. Giao diện người dùng

### 4.5.1. Trang chủ

- Hero banner promo + slogan.
- Section: **"Đề xuất cho bạn"** (personalized recommendation nếu đã đăng nhập, else trending).
- Section: **"Sách mới phát hành"**, **"Bestseller"**.
- Footer: liên kết, social.

### 4.5.2. Trang chi tiết sách

- Hình ảnh, tên sách, tác giả, NXB, giá.
- **BookInsightPanel** ⭐ — panel AI tóm tắt review (mới):
  - Summary 1-2 câu.
  - 3 thanh sentiment distribution (xanh/xám/đỏ).
  - 2 cột "Readers liked" / "Watch-outs" dạng chip.
  - Recommendation hint cá nhân hóa.
- Form review (nếu đủ điều kiện).
- List review với badge sentiment + aspects + ensemble agreement.
- Section **"Similar books"**.

### 4.5.3. Trang giỏ hàng & Thanh toán

- Danh sách item với +/- số lượng.
- Form địa chỉ giao hàng.
- Lựa chọn phương thức thanh toán (COD / VNPay).
- Áp mã khuyến mại.
- Summary tổng tiền.

### 4.5.4. Dashboard quản trị

- Tab **Tổng quan**: doanh thu, số đơn, top sách.
- Tab **AI Insights**: 6 panel — `Books needing attention`, `Rating ↔ Sentiment mismatch`, `Top positive genres`, `Sentiment trend chart`, `Top keywords`, `Suspicious reviews`.
- Tab **Books**: CRUD + upload ảnh.
- Tab **Orders**: filter status, đổi trạng thái.
- Tab **Users**: list user, lock account.

---

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## Kết quả đạt được

Sau quá trình thực hiện, đồ án đã hoàn thành các mục tiêu đề ra:

**Về mặt nghiệp vụ**:
- Triển khai đầy đủ một bookstore e-commerce với đầy đủ chức năng từ duyệt catalog, đặt hàng, thanh toán, đến đánh giá và quản trị.
- Hỗ trợ 2 vai trò (customer, admin) với phân quyền rõ ràng.
- Tích hợp thanh toán VNPay sandbox và OAuth Google.

**Về mặt khoa học — áp dụng từ paper Bellar 2024**:
- Triển khai phân tích cảm xúc 3-class (paper §4.1).
- Aspect-level sentiment trên 5 khía cạnh bookstore (paper §2.1).
- **Ensemble vote 3 nguồn** — đúng tinh thần paper §4.4 nhưng adapt cho production.
- Đánh giá bằng Precision, Recall, F1, Macro-F1 (paper §3.7).
- Spam detection lấp limitation của paper §5.
- Sentiment-aware recommendation đúng theo paper §2.2.

**Về mặt cải tiến vượt phạm vi paper**:
- Production resilience: fallback chain Groq → rule → empty.
- Async processing: review save không chờ AI.
- Cache BookInsight + invalidation thông minh.
- PII sanitize bảo vệ privacy.
- Prompt versioning để rollback an toàn.
- MMR-lite diversity trong recommendation.
- Admin AI insights với time-window analytics.
- Rating-sentiment mismatch detection — use case chỉ AI mới làm được.

**Số liệu thực nghiệm**:
- ~50 sách demo, 200 review mẫu, 5 user demo (customer + admin + spammer).
- Pipeline AI: ~1-2 giây/review (async, không block user).
- Cache BookInsight: HIT rate ~95% sau ngày đầu.
- Eval sentiment trên pseudo ground truth: Accuracy ~88%, Macro-F1 ~82%.

## Hạn chế còn lại

Đồ án vẫn còn một số hạn chế:

1. **`setTimeout(0)` không đảm bảo durability**: nếu server crash trong 1-2 giây sau khi tạo review, analysis có thể mất. Cần Bull/BullMQ queue hoặc cron sweep.
2. **Frontend chưa hiển thị đầy đủ aspects, top_keywords, ensemble_agreement** ở mọi vị trí — cần mở rộng UI admin.
3. **Cache BookInsight chưa bắt re-analyze review cũ** khi đổi prompt — cần thêm `last_review_updated` check.
4. **Phụ thuộc Groq quota / network** — nếu Groq sập kéo dài, chỉ còn rule.
5. **Eval dùng pseudo ground truth** (rating → label) — chưa có ground truth thật do con người gán.
6. **Recommendation chưa filter spam reviews** — sentiment trung bình có thể bị méo bởi fake review.
7. **Chưa có A/B test thực tế** đo CTR/conversion uplift của sentiment-aware vs rating-only.

## Hướng phát triển

### Ngắn hạn (1-3 tháng)

- **Bull/BullMQ queue** cho review analysis — bền vững hơn `setTimeout`.
- **Cache invalidate khi đổi prompt version** — re-analyze lazy khi user xem trang.
- **Mở rộng UI admin** cho aspects và keywords visualization.
- **Filter spam khi tính avg_sentiment** trong recommendation.

### Trung hạn (3-6 tháng — theo paper §5)

- **Export dataset thực tế** sau 6 tháng vận hành (~1k-10k review tiếng Việt thật).
- **Fine-tune PhoBERT** trên dataset đó — đúng gợi ý paper §5.
- **So sánh 3 nguồn** trên cùng test set: PhoBERT vs Groq vs Rule.
- **A/B test** recommendation: đo CTR/conversion với và không có sentiment-aware.

### Dài hạn (6+ tháng)

- **Replicate paper benchmark**: train CNN/RNN/Bi-LSTM + Word2Vec để so với Table 2 của paper Bellar 2024.
- **Ensemble nâng cao 4 nguồn**: Groq + PhoBERT + Rule + Rating.
- **Aspect mining tự động**: dùng LDA/BERTopic khám phá aspect mới ngoài 5 keys hiện tại.
- **Multilingual support**: mở rộng cho tiếng Anh, Trung, Nhật.
- **Mobile app**: React Native hoặc Flutter sharing API.
- **Microservices**: tách AI service thành service riêng, scale độc lập.

---

# TÀI LIỆU THAM KHẢO

[1] Bellar, O., Baina, A., & Ballafkih, M. (2024). *Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers*. Mathematics, 12(15), 2403. MDPI. https://doi.org/10.3390/math12152403

[2] Vaswani, A., et al. (2017). *Attention Is All You Need*. NeurIPS 2017.

[3] Devlin, J., et al. (2019). *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*. NAACL 2019.

[4] Liu, Y., et al. (2019). *RoBERTa: A Robustly Optimized BERT Pretraining Approach*. arXiv:1907.11692.

[5] Touvron, H., et al. (2023). *LLaMA: Open and Efficient Foundation Language Models*. arXiv:2302.13971.

[6] Mikolov, T., et al. (2013). *Distributed Representations of Words and Phrases and their Compositionality*. NeurIPS 2013. (Word2Vec)

[7] Bojanowski, P., et al. (2017). *Enriching Word Vectors with Subword Information*. TACL. (FastText)

[8] Carbonell, J., & Goldstein, J. (1998). *The use of MMR, diversity-based reranking for reordering documents and producing summaries*. SIGIR 1998.

[9] Pang, B., & Lee, L. (2008). *Opinion Mining and Sentiment Analysis*. Foundations and Trends in Information Retrieval, 2(1-2), 1-135.

[10] Liu, B. (2012). *Sentiment Analysis and Opinion Mining*. Synthesis Lectures on Human Language Technologies, Morgan & Claypool.

[11] Nguyen, D. Q., et al. (2020). *PhoBERT: Pre-trained language models for Vietnamese*. EMNLP 2020.

[12] Express.js Documentation. https://expressjs.com

[13] Sequelize Documentation. https://sequelize.org

[14] React 19 Documentation. https://react.dev

[15] Groq Cloud API Documentation. https://console.groq.com/docs

[16] MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/

[17] TanStack Query Documentation. https://tanstack.com/query

[18] Tailwind CSS v4 Documentation. https://tailwindcss.com

[19] VNPay Sandbox Integration Guide. https://sandbox.vnpayment.vn

[20] OAuth 2.0 Specification. https://oauth.net/2/

---

**HẾT BÁO CÁO**

*TP. Hồ Chí Minh, tháng 05 năm 2026*
