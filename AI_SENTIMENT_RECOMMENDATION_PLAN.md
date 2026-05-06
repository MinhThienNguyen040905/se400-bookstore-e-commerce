# AI Sentiment & Recommendation Plan

Tài liệu này mô tả kế hoạch áp dụng sentiment analysis, review insight, recommendation cải tiến và Groq free models vào project Bookstore E-commerce.

Mục tiêu là tạo thêm giá trị AI rõ ràng cho project mà không làm hệ thống phụ thuộc sống còn vào model bên ngoài.

## 1. Bối Cảnh

Project hiện có:

- Backend: Node.js, Express, Sequelize, MySQL.
- Frontend: React, Vite, TypeScript, React Query, Zustand.
- Review hiện có model `Review` với `rating`, `comment`, `review_date`, `user_id`, `book_id`.
- Book detail đã có review/rating.
- Admin đã có dashboard/stats cơ bản.
- Recommendation hiện có thể mở rộng từ các dữ liệu: order, review, wishlist, book metadata, genres, authors, publisher.

Bài báo đã đọc:

- Tên: "Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers".
- Ý chính: dùng review text để dự đoán sentiment/rating và hỗ trợ recommendation.
- Các hướng chính: tiền xử lý text, embedding, CNN/RNN/Bi-LSTM, BERT/RoBERTa/ALBERT, ensemble.
- Bài học áp dụng: không nhất thiết đưa model nặng vào ngay; nên dùng sentiment score, review summary và ranking signal cho recommendation.

## 2. Nguyên Tắc Thiết Kế

- Không để AI chặn các flow quan trọng như checkout, order, auth, payment.
- Review vẫn được lưu thành công kể cả khi Groq lỗi hoặc hết quota.
- Groq/API model chỉ chạy ở background hoặc lazy async.
- Kết quả AI phải được cache/lưu DB để frontend không gọi model trực tiếp.
- Không gửi dữ liệu nhạy cảm lên model: email, phone, address, token, payment info.
- Prompt phải yêu cầu output JSON để backend parse ổn định.
- Có fallback rule-based nếu model lỗi.
- Có thể tắt toàn bộ AI bằng env flag.

## 3. Tính Năng Đề Xuất

### 3.1. Review Sentiment Analysis

Khi user tạo review, hệ thống phân tích comment để lấy:

- `sentiment_label`: `positive`, `neutral`, `negative`.
- `sentiment_score`: số từ `-1` đến `1`.
- `confidence`: số từ `0` đến `1`.
- `short_summary`: tóm tắt 1 câu về cảm xúc của review.
- `signals`: danh sách điểm được khen/chê, ví dụ `["noi dung hay", "giao hang tot"]`.

Input:

```json
{
  "rating": 5,
  "comment": "Sach rat hay, noi dung de hieu, bia dep"
}
```

Output mong muốn:

```json
{
  "sentiment_label": "positive",
  "sentiment_score": 0.86,
  "confidence": 0.91,
  "short_summary": "Doc gia hai long voi noi dung va hinh thuc sach.",
  "signals": ["noi dung de hieu", "bia dep"]
}
```

### 3.2. Book Review Summary

Trên trang chi tiết sách, tổng hợp nhiều review thành insight:

- Điểm độc giả thích.
- Điểm độc giả chưa thích.
- Nhóm độc giả phù hợp.
- Tóm tắt chung 2-4 câu.
- Tỷ lệ sentiment positive/neutral/negative.

Ví dụ:

```json
{
  "book_id": 12,
  "positive_points": ["noi dung thuc te", "de doc", "trinh bay dep"],
  "negative_points": ["mot so phan lap lai", "gia hoi cao"],
  "summary": "Da so doc gia danh gia sach de doc va huu ich...",
  "recommendation_hint": "Phu hop voi nguoi moi bat dau tim hieu chu de nay."
}
```

### 3.3. Sentiment-Aware Recommendation

Tạo điểm xếp hạng sách tốt hơn bằng cách kết hợp:

- Rating trung bình.
- Số lượng review.
- Sentiment trung bình.
- Số lần mua.
- Wishlist count.
- Genre/author user quan tâm.
- Recency của sách.

Ý tưởng score ban đầu:

```txt
recommendation_score =
  0.30 * normalized_average_rating +
  0.20 * normalized_positive_sentiment +
  0.15 * normalized_review_count +
  0.15 * normalized_sales_count +
  0.10 * normalized_wishlist_count +
  0.10 * user_interest_match
```

Không cần hoàn hảo ngay. Mục tiêu MVP là có ranking hợp lý, giải thích được và dễ demo.

### 3.4. Recommendation Explanation

Khi gợi ý sách, có thể giải thích:

```txt
Gợi ý vì bạn đã mua sách cùng thể loại, sách có nhiều đánh giá tích cực và được wishlist nhiều.
```

Output API có thể thêm:

```json
{
  "book": {},
  "score": 0.82,
  "reasons": [
    "Cung the loai voi sach ban da mua",
    "Nhieu danh gia tich cuc",
    "Tac gia duoc yeu thich"
  ]
}
```

### 3.5. Admin AI Insights

Admin có thể xem:

- Sách có sentiment tiêu cực tăng.
- Genre được đánh giá tích cực nhất.
- Review cần kiểm duyệt.
- Sách rating cao nhưng comment có sentiment xấu.
- Top keyword xuất hiện trong review.

Các insight hữu ích:

```txt
- "Book A co 35% review tieu cuc trong 7 ngay gan day."
- "Genre Self-help co sentiment trung binh cao nhat."
- "Book B rating trung binh 4.7 nhung co nhieu comment phan anh chat luong in."
```

### 3.6. Fake/Spam Review Detection

MVP rule-based trước:

- Comment quá ngắn.
- Comment trùng nhiều review khác.
- Rating và sentiment mâu thuẫn mạnh.
- Một user tạo nhiều review giống nhau.
- Review chứa nội dung quảng cáo/link.

Output:

```json
{
  "risk_level": "low | medium | high",
  "reasons": ["comment qua ngan", "rating va sentiment mau thuan"]
}
```

## 4. Kiến Trúc Đề Xuất

### 4.1. Backend Modules

Thêm các file:

```txt
backend/services/ai/groqClient.js
backend/services/ai/reviewAnalysisService.js
backend/services/ai/bookInsightService.js
backend/services/recommendationService.js
backend/repositories/reviewRepository.js
backend/repositories/recommendationRepository.js
backend/validators/recommendationValidator.js
backend/routes/recommendations.js
backend/controllers/recommendationController.js
```

Nếu muốn giữ scope nhỏ hơn ở MVP:

```txt
backend/services/reviewAnalysisService.js
backend/services/recommendationService.js
```

### 4.2. Database Changes

Option A: thêm field trực tiếp vào `Reviews`.

```txt
Reviews
- sentiment_label VARCHAR(20)
- sentiment_score DECIMAL(5, 4)
- sentiment_confidence DECIMAL(5, 4)
- ai_summary TEXT
- ai_signals JSON
- spam_risk VARCHAR(20)
- spam_reasons JSON
- analyzed_at DATETIME
```

Option B: tạo bảng riêng để dễ mở rộng.

```txt
ReviewAnalyses
- analysis_id PK
- review_id FK
- sentiment_label VARCHAR(20)
- sentiment_score DECIMAL(5, 4)
- confidence DECIMAL(5, 4)
- summary TEXT
- signals JSON
- spam_risk VARCHAR(20)
- spam_reasons JSON
- provider VARCHAR(50)
- model VARCHAR(100)
- prompt_version VARCHAR(50)
- raw_response JSON
- created_at DATETIME
- updated_at DATETIME
```

Khuyến nghị: dùng Option B nếu muốn sạch và audit được model/prompt. Dùng Option A nếu muốn demo nhanh.

### 4.3. Environment Variables

Thêm vào backend `.env`:

```env
AI_FEATURES_ENABLED=true
GROQ_API_KEY=
GROQ_MODEL_FAST=llama-3.1-8b-instant
GROQ_MODEL_SMART=llama-3.3-70b-versatile
AI_REQUEST_TIMEOUT_MS=15000
AI_MAX_REVIEW_CHARS=2000
```

Ghi chú:

- Model cụ thể và free limit có thể thay đổi theo Groq account.
- Backend cần xử lý `429 Too Many Requests`.

### 4.4. Groq Usage Strategy

Dùng Groq cho:

- Sentiment classification.
- Review summary.
- Book insight summary.
- Recommendation explanation.

Không dùng Groq cho:

- Checkout.
- Payment.
- Auth.
- Stock.
- Quyết định nghiệp vụ bắt buộc.

Fallback khi Groq lỗi:

- Nếu có rating:
  - rating 4-5 -> `positive`
  - rating 3 -> `neutral`
  - rating 1-2 -> `negative`
- Nếu chỉ có comment:
  - rule đơn giản theo từ khóa tích cực/tiêu cực.

## 5. API Đề Xuất

### 5.1. Analyze Review

Không nhất thiết public. Có thể internal sau khi tạo review.

```txt
POST /api/reviews/:id/analyze
Auth: admin hoặc internal
```

Response:

```json
{
  "success": true,
  "message": "Phan tich review thanh cong",
  "data": {
    "review_id": 1,
    "sentiment_label": "positive",
    "sentiment_score": 0.84
  }
}
```

### 5.2. Book AI Insights

```txt
GET /api/books/:id/insights
```

Response:

```json
{
  "success": true,
  "data": {
    "book_id": 12,
    "summary": "...",
    "positive_points": [],
    "negative_points": [],
    "sentiment_distribution": {
      "positive": 12,
      "neutral": 3,
      "negative": 1
    }
  }
}
```

### 5.3. Recommendations

```txt
GET /api/recommendations/personalized
GET /api/recommendations/books/:id/similar
GET /api/recommendations/trending
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "book": {},
      "score": 0.82,
      "reasons": ["Cung the loai", "Nhieu review tich cuc"]
    }
  ]
}
```

### 5.4. Admin AI Insights

```txt
GET /api/admin/stats/ai-insights
```

Response:

```json
{
  "success": true,
  "data": {
    "negative_review_books": [],
    "top_positive_genres": [],
    "suspicious_reviews": []
  }
}
```

## 6. Prompt Design

### 6.1. Review Sentiment Prompt

Yêu cầu output JSON nghiêm ngặt:

```txt
You are analyzing a bookstore product review.
Return only valid JSON.

Input:
rating: {{rating}}
comment: {{comment}}

Task:
- Classify sentiment as positive, neutral, or negative.
- Give sentiment_score from -1 to 1.
- Give confidence from 0 to 1.
- Summarize the review in Vietnamese.
- Extract up to 5 short signals.
- Detect spam risk.

JSON schema:
{
  "sentiment_label": "positive|neutral|negative",
  "sentiment_score": number,
  "confidence": number,
  "short_summary": string,
  "signals": string[],
  "spam_risk": "low|medium|high",
  "spam_reasons": string[]
}
```

### 6.2. Book Summary Prompt

```txt
You are summarizing customer reviews for a bookstore product page.
Return only valid JSON in Vietnamese.

Reviews:
{{reviews}}

JSON schema:
{
  "summary": string,
  "positive_points": string[],
  "negative_points": string[],
  "reader_fit": string,
  "recommendation_hint": string
}
```

## 7. Frontend Changes

### 7.1. Book Detail Page

Update:

- Hiển thị sentiment distribution.
- Hiển thị AI summary nếu có.
- Hiển thị điểm khen/chê dạng compact.
- Không làm layout quá marketing; giữ đúng kiểu product detail.

Files dự kiến:

```txt
frontend/src/pages/BookDetailPage.tsx
frontend/src/components/book/BookReviews.tsx
frontend/src/components/book/BookDetailCard.tsx
frontend/src/api/booksApi.ts
frontend/src/types/book.ts
```

### 7.2. Recommendation UI

Thêm section:

- "Recommended for you".
- "Readers also liked".
- "Highly rated by sentiment".

Files dự kiến:

```txt
frontend/src/api/recommendationApi.ts
frontend/src/hooks/useRecommendations.ts
frontend/src/components/book/RecommendationShelf.tsx
frontend/src/pages/Home.tsx
frontend/src/pages/BookDetailPage.tsx
```

### 7.3. Admin Dashboard

Thêm tab hoặc card trong dashboard:

- Review sentiment overview.
- Suspicious reviews.
- Books needing attention.

Files dự kiến:

```txt
frontend/src/components/admin/tabs/DashboardTab.tsx
frontend/src/hooks/useAdmin.ts
frontend/src/types/admin.ts
```

## 8. Roadmap Theo Phase

### Phase 0: Foundation

Mục tiêu:

- Chuẩn bị cấu hình AI, Groq client và fallback.

Checklist:

- [ ] Thêm env vars AI/Groq.
- [ ] Tạo `groqClient`.
- [ ] Tạo JSON parser helper an toàn.
- [ ] Tạo fallback sentiment từ rating/comment.
- [ ] Không gọi AI trong checkout/order/auth.
- [ ] Syntax check backend.

### Phase 1: Review Sentiment MVP

Mục tiêu:

- Khi user tạo review, hệ thống có thể phân tích và lưu sentiment.

Checklist:

- [ ] Chọn DB Option A hoặc B.
- [ ] Thêm migration.
- [ ] Thêm model nếu dùng `ReviewAnalysis`.
- [ ] Thêm `reviewAnalysisService`.
- [ ] Gọi phân tích sau `Review.create`.
- [ ] Nếu Groq lỗi, lưu fallback hoặc để `pending`.
- [ ] API get review trả thêm analysis.
- [ ] Frontend hiển thị sentiment nhỏ trong review.

Manual test:

- [ ] Review positive.
- [ ] Review negative.
- [ ] Review empty/short comment.
- [ ] Groq key thiếu.
- [ ] Groq 429/fail.

### Phase 2: Book Review Summary

Mục tiêu:

- Trang chi tiết sách có insight tổng hợp từ reviews.

Checklist:

- [ ] Tạo service lấy reviews đã phân tích.
- [ ] Tạo summary bằng Groq hoặc aggregate rule.
- [ ] Cache summary theo `book_id`.
- [ ] Invalidate cache khi có review mới.
- [ ] Thêm endpoint `GET /api/books/:id/insights`.
- [ ] Frontend hiển thị summary.

Manual test:

- [ ] Book chưa có review.
- [ ] Book có ít review.
- [ ] Book có nhiều review.
- [ ] Summary cache hoạt động.

### Phase 3: Sentiment-Aware Recommendation

Mục tiêu:

- Recommendation không chỉ dựa rating mà thêm sentiment/order/wishlist.

Checklist:

- [ ] Tạo `recommendationService`.
- [ ] Tạo query lấy book stats.
- [ ] Tính `recommendation_score`.
- [ ] Tạo endpoint personalized/trending/similar.
- [ ] Thêm reason generation rule-based trước.
- [ ] Frontend thêm recommendation shelf.

Manual test:

- [ ] Guest user thấy trending.
- [ ] Logged-in user thấy personalized.
- [ ] Sách sentiment xấu không đứng quá cao chỉ vì rating.
- [ ] Reason dễ hiểu.

### Phase 4: Admin AI Insights

Mục tiêu:

- Admin có dashboard insight về review/sentiment.

Checklist:

- [ ] Query books có sentiment tiêu cực cao.
- [ ] Query suspicious reviews.
- [ ] Query top positive genres/authors.
- [ ] Thêm endpoint admin stats.
- [ ] Thêm UI cards/charts.

Manual test:

- [ ] Admin xem được insight.
- [ ] User thường bị chặn.
- [ ] Dữ liệu rỗng không làm UI vỡ.

### Phase 5: Advanced Model Path

Chỉ làm nếu project cần tính nghiên cứu sâu hơn:

- Export reviews thành dataset.
- Train model riêng bằng Python.
- So sánh rule/Groq/model local.
- Thử PhoBERT hoặc multilingual model nếu review tiếng Việt nhiều.
- Thêm batch job re-analyze review khi đổi model/prompt.

## 9. Data & Privacy

Không gửi lên Groq:

- Email.
- Phone.
- Address.
- Payment info.
- Token/session.

Được gửi:

- Review comment.
- Rating.
- Book title nếu cần context.
- Genre/author nếu cần context.

Cần sanitize:

- Cắt comment quá dài.
- Loại bỏ link đáng ngờ nếu cần.
- Không log full prompt chứa dữ liệu user ở production.

## 10. Rủi Ro Và Cách Giảm

### Groq rate limit hoặc downtime

Giảm rủi ro:

- Fallback sentiment.
- Retry có giới hạn.
- Cache result.
- Không chặn tạo review.

### JSON model trả sai format

Giảm rủi ro:

- Prompt yêu cầu "Return only valid JSON".
- Parse bằng helper.
- Validate output.
- Fallback nếu parse fail.

### Chi phí hoặc quota

Giảm rủi ro:

- Chỉ phân tích review mới.
- Summary book cache.
- Batch/lazy processing.
- Không gọi AI mỗi lần render page.

### Sentiment sai do tiếng Việt/teencode

Giảm rủi ro:

- Prompt yêu cầu hiểu tiếng Việt.
- Kết hợp rating làm tín hiệu phụ.
- Cho admin re-run analysis.
- Sau này dùng multilingual/PhoBERT nếu đủ dữ liệu.

### Recommendation bị thiên lệch

Giảm rủi ro:

- Không dùng sentiment làm tín hiệu duy nhất.
- Kết hợp rating, sales, wishlist, recency.
- Có diversity theo genre/author.

## 11. Verification

Backend syntax:

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

Manual test chính:

- Add review vẫn thành công khi AI tắt.
- Add review với Groq key hợp lệ lưu sentiment.
- Groq lỗi không làm API review fail.
- Book detail hiển thị insight.
- Recommendation trả sách hợp lý.
- Admin insights chỉ admin xem được.

## 12. Definition Of Done

MVP được xem là xong khi:

- Review mới có sentiment analysis hoặc fallback.
- Kết quả AI được lưu DB, không gọi model trực tiếp từ frontend.
- Book detail có review insight hoặc sentiment distribution.
- Có endpoint recommendation dùng sentiment như một tín hiệu.
- Groq lỗi/quota hết không làm hỏng flow chính.
- Backend syntax check pass.
- Frontend build/lint pass hoặc ghi rõ lỗi còn lại.

## 13. Hướng Ưu Tiên Đề Xuất

Thứ tự nên làm:

1. Phase 0: AI foundation + Groq client.
2. Phase 1: Review sentiment MVP.
3. Phase 3: Recommendation score rule-based có sentiment.
4. Phase 2: Book review summary.
5. Phase 4: Admin AI insights.
6. Phase 5: model riêng nếu cần nghiên cứu sâu.

Lý do:

- Sentiment review là nền tảng cho mọi phần sau.
- Recommendation rule-based nhanh có giá trị demo.
- Summary/admin insight đẹp nhưng nên dựa trên dữ liệu sentiment đã lưu.
- Model riêng chỉ đáng làm sau khi đã có đủ review thật.
