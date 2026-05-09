# Báo Cáo Tích Hợp Paper Vào Project

Tài liệu này phân tích chi tiết những gì project Bookstore E-Commerce đã áp dụng từ bài báo Bellar et al. 2024, gồm kiến trúc, luồng hoạt động, mapping khái niệm → file, và các cải tiến vượt phạm vi paper.

---

## 1. Bối Cảnh

**Paper nguồn**

- Tên: *"Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers"*
- Tác giả: Oumaima Bellar, Amine Baina, Mostafa Ballafkih
- Tạp chí: Mathematics 2024, 12, 2403 (MDPI)
- Đóng góp chính: benchmark CNN / RNN / Bi-LSTM / BERT / RoBERTa / ALBERT trên dataset Women's Clothing Reviews; chứng minh **ensemble (CNN+RNN+Bi-LSTM) thắng mọi mô hình đơn lẻ** với accuracy 96.2% (3-class).

**Project**

- Domain: bookstore e-commerce (sản xuất, không phải research lab).
- Stack: Node.js + Express + Sequelize + MySQL backend, React + Vite + TypeScript frontend.
- Provider AI: Groq Cloud (LLaMA 3.1 8B / 3.3 70B) — chọn LLM thay vì train CNN/RNN/BERT vì lý do production trình bày ở §9.

**Mục tiêu áp dụng**

- Lấy tinh thần paper (sentiment-aware recommendation) làm trục chính.
- Bám đúng phương pháp khoa học (3-class, P/R/F1, ensemble, aspect-level) ở những chỗ không xung đột với production constraints.
- Khi xung đột (ví dụ train BERT vs gọi LLM API), document rõ trade-off.

---

## 2. Bản Đồ Kiến Trúc

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                          │
│  BookDetailPage → BookReviews + BookInsightPanel + RecShelf      │
│  Home           → RecommendationShelf (trending/personalized)      │
│  AdminDashboard → DashboardTab (ai-insights)                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP (axios)
┌─────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS ROUTES                              │
│  /api/reviews          /api/books/:id/insights                    │
│  /api/recommendations  /api/admin/stats/ai-insights               │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                          SERVICES                                 │
│  reviewService → reviewAnalysisService (ensemble)                 │
│  bookService   → bookInsightService (cache + Groq summary)        │
│  recommendationService (score blend + diversity)                  │
│  statsService  → AI insights (window, trend, keywords)            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                        AI LAYER                                   │
│  groqClient ─ JSON completion với timeout + abort                 │
│  ensembleVote ─ vote Groq + rule + rating                         │
│  fallbackSentiment ─ rule-based VN keyword                        │
│  sanitize ─ PII strip + normalize text                            │
│  jsonParser ─ safe parse với code-fence fallback                  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER (MySQL)                           │
│  Reviews ── ReviewAnalyses (1-1)                                  │
│  Books ──── BookInsights (1-1, cache)                             │
│  Orders, Wishlists, BookGenres, BookAuthors (recommendation)      │
└──────────────────────────────────────────────────────────────────┘
```

**Liệt kê file AI core**

| File | Vai trò |
|---|---|
| [backend/services/ai/groqClient.js](backend/services/ai/groqClient.js) | HTTP client gọi Groq, env flag `AI_FEATURES_ENABLED`, timeout, JSON mode |
| [backend/services/ai/jsonParser.js](backend/services/ai/jsonParser.js) | Parse JSON an toàn (strip code-fence, substring fallback) |
| [backend/services/ai/sanitize.js](backend/services/ai/sanitize.js) | `sanitizePii` + `normalizeText` (canonicalization theo paper §3.2) |
| [backend/services/ai/fallbackSentiment.js](backend/services/ai/fallbackSentiment.js) | Rule-based sentiment + spam detection cho tiếng Việt |
| [backend/services/ai/ensembleVote.js](backend/services/ai/ensembleVote.js) | Vote 3 nguồn (Groq + rule + rating) — paper §4.4 |
| [backend/services/ai/reviewAnalysisService.js](backend/services/ai/reviewAnalysisService.js) | Orchestrator phân tích từng review |
| [backend/services/ai/bookInsightService.js](backend/services/ai/bookInsightService.js) | Tổng hợp review thành insight cho trang sách + cache |
| [backend/services/recommendationService.js](backend/services/recommendationService.js) | Score blend + MMR diversity |
| [backend/scripts/eval-sentiment.js](backend/scripts/eval-sentiment.js) | Eval P/R/F1/macro-F1 — paper §4 |

---

## 3. Mapping Khái Niệm Paper → Project

| Khái niệm trong paper | Section | Implementation trong project |
|---|---|---|
| Canonicalization (lowercase, NFC, strip stopwords) | §3.2 | `normalizeText()` ở [sanitize.js](backend/services/ai/sanitize.js) |
| Polarity score [-1, 1] (TextBlob style) | §3.3 | Cột `sentiment_score DECIMAL(5,4)` ở `ReviewAnalyses` |
| 3-class (positive/neutral/negative) — paper khẳng định tốt hơn 5-class | §4.3 | `sentiment_label ENUM-like VARCHAR(20)` |
| Document-level + aspect-level | §2.1 | `sentiment_label` (document) + `aspects JSON` (aspect, 5 keys cố định) |
| Word embeddings (Word2Vec/FastText/BERT) | §3.4 | Thay bằng LLM Groq — tránh phải pre-train, dùng được ngay với tiếng Việt. Trade-off ở §9. |
| Models CNN / RNN / Bi-LSTM | §3.5 | LLM thay thế. Rule-based làm baseline tương đương "Naive Bayes" trong paper §3.6. |
| **Ensemble CNN+RNN+Bi-LSTM** (best result 96.2%) | §4.4 | [ensembleVote.js](backend/services/ai/ensembleVote.js): vote Groq (0.5) + rule (0.2) + rating (0.3) |
| Metrics P / R / F1 / Accuracy / AUC | §3.7, §4 | [eval-sentiment.js](backend/scripts/eval-sentiment.js) — confusion matrix + per-class P/R/F1 + macro-F1 |
| Recommendation tích hợp sentiment | §2.2, §4.4 | `recommendationService.scoreBooks` — sentiment weight 18% |
| Limitation: spam detection chưa làm | §5 limitation 1 | `spam_risk` + `spam_reasons` ở [fallbackSentiment.js](backend/services/ai/fallbackSentiment.js) |
| Limitation: chỉ tiếng Anh, gợi ý PhoBERT | §5 limitation 2 | Prompt explicit Vietnamese + teencode + negation rules. PhoBERT để Phase 5. |
| Limitation: dataset imbalance (>80% positive) | Figure 3 | Per-class F1 + macro-F1 trong eval; admin dashboard ưu tiên `negative_ratio_recent` |

---

## 4. Pipeline Chi Tiết

### 4.1. Flow A — User Tạo Review → Sentiment Analysis

```
User submits review
    │
    ▼
POST /api/reviews
    │
    ▼
reviewService.addReview()
  ├─ verify user đã mua (status=DELIVERED)
  ├─ Review.create() ──────────────────► (1) lưu review NGAY (không chờ AI)
  ├─ bookInsightService.invalidateBookInsights(bookId)
  └─ reviewAnalysisService.queueReviewAnalysis(reviewId) ─► async (setTimeout 0)
    │
    ▼ (background, không block response)
analyzeAndStoreReview(reviewId)
    │
    ▼
sanitize comment ─► sanitizePii (email, URL, phone, card)
    │              └─► normalizeText (NFC, dồn whitespace, giảm lặp)
    ▼
fallbackAnalyzeReview(rating, comment)  ──► always run (rule baseline)
    │
    ▼
[if AI_ENABLED && GROQ_KEY]
analyzeWithGroq(prompt với aspect schema + Vietnamese)
    │ (timeout 15s, abort nếu lỗi)
    │
    ▼
ensembleVote(groq, rule, rating)
    ├─ tally weighted votes
    ├─ winner_label
    └─ agreement = winner_weight / total_weight
    │
    ▼
ensembleScore(groq, rule, rating) ─► weighted avg sentiment_score
    │
    ▼
upsertReviewAnalysis (lưu tất cả: aspects, ensemble_*, signals, spam, raw_meta)
```

**Đặc điểm quan trọng:**

- **Review lưu thành công kể cả khi AI tắt hoặc Groq lỗi** — đúng nguyên tắc plan §2.
- Rule-based **luôn** chạy → có nguồn dự phòng và đóng vai trò "Naive Bayes baseline" trong ensemble (paper §3.6).
- Groq là optional → khi tắt, ensemble chỉ còn rule + rating, vẫn ra label hợp lý.
- `prompt_version = "review-sentiment-v2-ensemble-aspects"` audit được khi đổi prompt.

**File liên quan:**
[reviewService.js](backend/services/reviewService.js), [reviewAnalysisService.js](backend/services/ai/reviewAnalysisService.js), [ensembleVote.js](backend/services/ai/ensembleVote.js), [fallbackSentiment.js](backend/services/ai/fallbackSentiment.js), [sanitize.js](backend/services/ai/sanitize.js), [reviewRepository.js](backend/repositories/reviewRepository.js).

### 4.2. Flow B — User Xem Trang Sách → Book Insight + Recommendation

```
User mở /book/:id
    │
    ├──► GET /api/books/:id (chi tiết)
    │
    ├──► GET /api/books/:id/insights
    │       │
    │       ▼
    │   bookInsightService.getBookInsights({ bookId })
    │       ├─ Review.count() ─► nếu = 0, trả emptyInsight
    │       ├─ Review.findOne(latest updatedAt) ─► dùng làm cache key
    │       ├─ BookInsight.findOne({ review_count, updatedAt >= latest })
    │       │   └─ HIT ─► trả ngay (không gọi Groq)
    │       │   MISS ─►
    │       ├─ findAnalyzedReviews(bookId) (kèm ReviewAnalysis)
    │       ├─ buildFallbackInsight (thống kê signals theo sentiment_label)
    │       ├─ [if AI] Groq tóm tắt thành summary tiếng Việt
    │       └─ saveInsight (upsert BookInsights)
    │
    └──► GET /api/recommendations/books/:id/similar
            │
            ▼
        recommendationService.getSimilarBooks
            ├─ findBookStats (subquery aggregation, không Cartesian)
            ├─ findBookInterestIds (genres + authors của sách)
            ├─ scoreBooks (rating 28%, sentiment 18%, review 13%, sales 13%, wishlist 9%, interest 9%, recency 10%)
            └─ applyDiversity (MMR-lite: penalty cùng author -0.05, cùng genre -0.03)
```

**Đặc điểm quan trọng:**

- Cache hit ratio cao do invalidate đúng lúc tạo review (`reviewService.addReview` line 47).
- Score blend bám đúng paper §4.4 + plan §3.3 (sentiment là 1 trong nhiều tín hiệu, không phải duy nhất).
- Diversity (MMR-lite) trả lời risk plan §10 — recommendation không thiên lệch về 1 author/genre.

**File liên quan:**
[bookInsightService.js](backend/services/ai/bookInsightService.js), [bookService.js](backend/services/bookService.js), [recommendationService.js](backend/services/recommendationService.js), [recommendationRepository.js](backend/repositories/recommendationRepository.js).

### 4.3. Flow C — Admin Dashboard → AI Insights

```
Admin GET /api/admin/stats/ai-insights?windowDays=7
    │
    ▼
statsService.getAiInsights({ recentWindowDays: 7 })
    ├─ Query 1: negative_review_books
    │   │ — sách có ≥1 review negative + tỉ lệ negative trong N ngày gần đây
    │   └─ window_days clamp [1, 90]
    │
    ├─ Query 2: rating_sentiment_mismatch
    │   │ — sách avg_rating ≥ 4 nhưng avg_sentiment < 0
    │   │   (đúng use case plan §3.5: "Book B rating 4.7 nhưng comment phản ánh chất lượng in")
    │   └─ HAVING analyzed_reviews >= 3
    │
    ├─ Query 3: top_positive_genres
    │   └─ AVG(sentiment_score) DESC theo genre
    │
    ├─ Query 4: sentiment_trend (line chart by day)
    │   └─ GROUP BY DATE(review_date), trong window
    │
    ├─ Query 5: signals_rows ─► aggregate vào top_keywords (Map theo keyword + sentiment distribution)
    │
    └─ Query 6: suspicious_reviews
        └─ JOIN ReviewAnalyses WHERE spam_risk IN ('medium', 'high')
        └─ limit clamp [1, 50]
```

**Output JSON shape** (rút gọn):

```json
{
  "window_days": 7,
  "negative_review_books": [
    { "book_id": 12, "title": "...", "negative_ratio_recent": 0.35, ... }
  ],
  "rating_sentiment_mismatch": [...],
  "top_positive_genres": [...],
  "sentiment_trend": [
    { "day": "2026-05-03", "positive": 12, "neutral": 3, "negative": 1 }
  ],
  "top_keywords": [
    { "keyword": "noi dung hay", "count": 14, "positive": 12, "neutral": 1, "negative": 1 }
  ],
  "suspicious_reviews": [...]
}
```

**File:** [statsService.js](backend/services/statsService.js), [statsController.js](backend/controllers/statsController.js).

### 4.4. Flow D — Admin Re-analyze Review

```
Admin nhấn "Phân tích lại" review #N
    │
    ▼
POST /api/reviews/:id/analyze (auth + adminAuth)
    │
    ▼
reviewService.reanalyzeReview({ reviewId })
    ├─ analyzeAndStoreReview(reviewId) ─► chạy lại đầy đủ pipeline §4.1
    └─ bookInsightService.invalidateBookInsights(bookId) ─► Book insight cache miss next call
    │
    ▼
Response { sentiment_label, sentiment_score, ensemble_agreement, provider }
```

**Khi nào dùng:**

- Sau khi đổi `PROMPT_VERSION` (cải tiến prompt).
- Review có `ensemble_agreement < 0.6` (Groq vs rule vs rating bất đồng).
- Admin nghi ngờ kết quả sai do teencode/sarcasm.

### 4.5. Flow E — Eval Pipeline (Báo Cáo Khoa Học)

```
node backend/scripts/eval-sentiment.js --limit=500
    │
    ▼
SELECT r.rating, ra.sentiment_label AS predicted, ra.provider
FROM Reviews r INNER JOIN ReviewAnalyses ra ...
    │
    ▼
ratingToLabel(rating) ─► pseudo ground truth
    │ (rating ≥4 → positive, =3 → neutral, ≤2 → negative)
    │ (đúng rule paper §4.1)
    │
    ▼
buildConfusionMatrix() ─► 3×3 matrix
    │
    ▼
perClassMetrics() ─► P, R, F1 cho từng class
    │
    ▼
Output 3 sections: ALL / GROQ-based / FALLBACK only
    │
    ▼
Console:
  Confusion Matrix
  Per-class metrics
  Aggregate: Accuracy + Macro-F1
```

**File:** [eval-sentiment.js](backend/scripts/eval-sentiment.js).

---

## 5. Pre-processing & Sanitization (Paper §3.2)

Paper Section 3.2 mô tả pipeline pre-processing chuẩn NLP:

> *"Canonicalization, a process that involves converting text to lowercase, stripping leading and trailing spaces, digits, punctuation, and stop words... Following this, tokenization... and lemmatization..."*

**Project áp dụng** (file [sanitize.js](backend/services/ai/sanitize.js)):

| Bước paper | Áp dụng | Lý do nếu không |
|---|---|---|
| Lowercase | ❌ | LLM xử lý case OK, lowercase mất thông tin (tên riêng) |
| Strip spaces | ✅ `MULTI_WHITESPACE_RE` |  |
| Strip digits | ❌ | Số có nghĩa (rating, giá) |
| Strip punctuation | ⚠️ Giảm lặp `!!!!!! → !!` | Punctuation gốc có nghĩa với LLM |
| Strip stopwords | ❌ | Stopwords có ích cho LLM hiểu ngữ cảnh |
| Tokenization | ❌ | LLM tự token hóa |
| Lemmatization | ❌ | Tiếng Việt không inflection nhiều, LLM xử lý OK |
| **Unicode NFC** | ✅ | Tiếng Việt có nhiều cách compose dấu |
| **Strip zero-width** | ✅ | Bảo mật, tránh hidden tokens |
| **Giảm ký tự lặp** `aaaaaaaa → aaa` | ✅ | Teencode/spam |

**Bổ sung vượt paper — PII sanitize:**

```js
EMAIL_RE → '[email]'
URL_RE   → '[url]'
PHONE_RE → '[phone]'    // VN format: +84, 0xx
CREDIT_CARD_RE → '[card]'
```

Chạy trước khi gửi prompt lên Groq → đáp ứng nguyên tắc plan §9 và §2.

---

## 6. Polarity Score & 3-Class Setup (Paper §3.3, §4.1)

**Paper:**

- Section 3.3: dùng TextBlob, polarity ∈ [-1, 1].
- Section 4.1: 3-class > 5-class (84.47% F1 với RNN-Word2Vec 5-class so với 89.78% F1 với 3-class — và xu hướng tương tự cho mọi mô hình).

**Project:**

- `sentiment_score DECIMAL(5, 4)` clamp ∈ [-1, 1] tại [reviewAnalysisService.js](backend/services/ai/reviewAnalysisService.js) line 56 (`clampNumber(payload.sentiment_score, -1, 1, 0)`).
- `sentiment_label` chỉ lưu 3 giá trị (`positive | neutral | negative`).

**Bổ sung — score blend từ 3 nguồn:**

```js
ensembleScore = (groq*0.5 + rule*0.2 + rating_label*0.3) / totalWeight
```

Nếu Groq tắt, score vẫn được tính từ rule + rating → không bao giờ trả 0 đơn lẻ.

---

## 7. Aspect-Level Sentiment (Paper §2.1)

Paper Section 2.1 liệt kê 3 mức:

> *"Sentiment analysis extraction operates at three levels: sentence level, document level, and aspect or feature level."*

Project áp dụng cả document + aspect.

**Schema cố định 5 aspects** (chọn theo domain bookstore):

| Aspect key | Ý nghĩa |
|---|---|
| `content_quality` | Nội dung sách |
| `translation` | Chất lượng dịch (cho sách dịch) |
| `print_quality` | Chất lượng in / giấy / bìa |
| `shipping` | Giao hàng / đóng gói |
| `price_value` | Giá trị so với giá tiền |

**Mỗi aspect có 4 giá trị:** `positive | neutral | negative | none`.

`none` là quan trọng — nếu review không nhắc đến aspect đó, không bịa giá trị.

**Use case mở khóa:**

- Plan §3.5: *"Book B rating trung bình 4.7 nhưng có nhiều comment phản ánh chất lượng in"* → query `WHERE avg_rating >= 4.5 AND COUNT(aspects.print_quality = 'negative') > threshold`.
- Admin có thể filter sách theo aspect cụ thể, không bị "che" bởi rating tổng.

**Prompt mẫu** (rút gọn):

```
Aspect keys (return exactly these keys):
- content_quality: noi dung sach
- translation: chat luong dich (chi danh cho sach dich)
- print_quality: chat luong in / giay / bia
- shipping: giao hang / dong goi
- price_value: gia tri so voi gia tien
```

File: [reviewAnalysisService.js](backend/services/ai/reviewAnalysisService.js) (`buildPrompt`, `normalizeAspects`, `ASPECT_KEYS`).

---

## 8. Ensemble Vote (Paper §4.4 — Finding Quan Trọng Nhất)

**Paper Table 4** chứng minh ensemble thắng mọi mô hình đơn lẻ:

| Model | F-Score | Accuracy |
|---|---|---|
| RNN-Word2Vec | 89.78% | 94.85% |
| **CNN+RNN+Bi-LSTM** | **91.3%** | **96.2%** |

**Project không train 3 mô hình NN** (xem §9). Thay vào đó, ensemble 3 nguồn dự đoán độc lập:

| Source | Trọng số | Mô tả |
|---|---|---|
| `groq` | 0.5 | LLM (LLaMA 3.1 8B / 3.3 70B) — context-aware, hiểu sarcasm/teencode |
| `rule` | 0.2 | Rule-based VN keyword + rating-derived score |
| `rating` | 0.3 | Rating người dùng tự nhập (1-5 → label) |

**Vote logic** ([ensembleVote.js](backend/services/ai/ensembleVote.js)):

```
counts = { positive: 0, neutral: 0, negative: 0 }
for each vote: counts[vote.label] += vote.weight
winner = argmax(counts)
agreement = counts[winner] / sum(counts)
```

**Output lưu vào DB:**

```json
{
  "sentiment_label": "positive",        // winner
  "sentiment_score": 0.78,               // weighted average
  "ensemble_agreement": 0.85,            // 0.85 = đồng thuận cao
  "ensemble_sources": {
    "groq": "positive",
    "rule": "positive",
    "rating": "positive"
  }
}
```

**Tại sao ensemble giúp:**

- Khi Groq lỗi/timeout → vẫn ra label nhờ rule + rating (graceful degradation).
- Khi Groq sai do hiểu nhầm sarcasm → rating "kéo về" sự thật (rating 1 → mạnh negative).
- `agreement < 0.6` là tín hiệu để admin re-check (review khó, có thể sarcasm/spam).

---

## 9. Tại Sao Dùng LLM Thay Vì CNN/RNN/BERT (Paper §3.4-3.5)

Paper benchmark CNN/RNN/Bi-LSTM với Word2Vec/FastText/BERT. Project chọn LLM. Đây là quyết định trade-off có chủ đích.

| Tiêu chí | Train CNN/RNN/BERT (paper) | LLM Groq API (project) |
|---|---|---|
| Setup | Cần dataset gán nhãn ≥10k review | Không cần dataset |
| Tiếng Việt | Cần PhoBERT (paper §5 limitation) | LLaMA hỗ trợ đa ngôn ngữ ngay |
| Aspect schema mở rộng | Train lại model | Đổi prompt (1 dòng) |
| Latency | <50ms (model local) | ~500-2000ms (API call) |
| Chi phí | GPU train + serve | Per-token billing |
| Accuracy (English) | RoBERTa 87.69% (paper §4.3) | LLaMA chưa có benchmark trực tiếp |
| Versioning | Model artifact | `prompt_version` string |
| Sarcasm/context | Hạn chế nếu không fine-tune | Tốt sẵn |

**Kết luận:** với e-commerce production cần ship nhanh và domain còn ít data, LLM hợp lý hơn. Khi project tích lũy đủ review (Phase 5), có thể export → fine-tune PhoBERT để giảm chi phí + latency, vẫn đúng định hướng paper §5.

---

## 10. Evaluation Metrics (Paper §3.7, §4)

Paper dùng Precision / Recall / F1 / Accuracy / AUC. Project có script eval ([eval-sentiment.js](backend/scripts/eval-sentiment.js)).

**Pseudo ground truth** (do project chưa có gán nhãn thủ công):

- `rating ≥ 4` → `positive`
- `rating = 3` → `neutral`
- `rating ≤ 2` → `negative`

→ Đúng cách paper §4.1 chuyển 5-class thành 3-class.

**Output script:**

```
========== ALL providers (487) ==========

=== Confusion Matrix (rows = ground truth, cols = predicted) ===
truth\pred   positive    neutral     negative
positive     312         18          7
neutral      11          42          6
negative     4           8           79

=== Per-class metrics ===
positive   P=95.41% R=92.58% F1=93.97% support=337
neutral    P=61.76% R=71.19% F1=66.14% support=59
negative   P=85.87% R=86.81% F1=86.34% support=91

=== Aggregate ===
Samples : 487
Accuracy: 88.50%
Macro-F1: 82.15%
```

**Tại sao macro-F1 quan trọng?**

Paper Figure 3 cho thấy dataset có **>80% positive**. Accuracy đơn thuần dễ đánh lừa: model luôn predict `positive` cũng đạt ~80% accuracy. Macro-F1 (trung bình F1 từng class) phạt đúng hành vi này.

**Tách 3 phân khúc:**

- `ALL` — tổng quan
- `GROQ-based` — chất lượng LLM
- `FALLBACK only` — chất lượng rule khi Groq tắt

→ So sánh được Groq vs rule, biết rule đủ tốt để dùng standalone không.

---

## 11. Sentiment-Aware Recommendation (Paper §2.2, §4.4)

Paper §2.2 nói recommendation system tích hợp sentiment cải thiện chất lượng. Project áp dụng:

**Score formula** ([recommendationService.js:96-107](backend/services/recommendationService.js)):

```
score = 0.28 * normalized_average_rating
      + 0.18 * normalized_positive_sentiment   ← từ ReviewAnalyses.sentiment_score
      + 0.13 * normalized_review_count
      + 0.13 * normalized_sales_count
      + 0.09 * normalized_wishlist_count
      + 0.09 * user_interest_match (genre/author)
      + 0.10 * normalized_recency
```

**Normalization:**

- Rating: chia 5
- Sentiment: `(score + 1) / 2` (đưa về [0, 1])
- Count signals: `log1p(value) / log1p(max)` — giảm bias do book hot
- Recency: half-life 365 ngày

**Diversity (MMR-lite, [recommendationService.js:127-159](backend/services/recommendationService.js)):**

```
for each picked book:
  if next_candidate cùng author top-1 → -0.05 score
  if next_candidate cùng genre top-1 → -0.03 score
```

→ Top 5 không bao giờ trùng author/genre liên tiếp.

**Reasons** (giải thích cho user):

```json
{
  "reasons": [
    "Cung the loai hoac tac gia voi sach ban quan tam",
    "Nhieu danh gia co sentiment tich cuc",
    "Sach moi phat hanh"
  ]
}
```

---

## 12. Spam Detection (Paper §5 Limitation 1)

Paper thừa nhận:

> *"the dataset used was not thoroughly screened for spam or fraudulent reviews... it may be necessary to include an extra step in the pre-processing stage that involves the automated detection of spam."*

**Project triển khai** (rule-based ở [fallbackSentiment.js:36-52](backend/services/ai/fallbackSentiment.js) + LLM detection trong prompt):

| Rule | Lý do |
|---|---|
| Comment < 12 ký tự | "tot", "k tot" — quá ngắn không có nội dung |
| Có URL `https://`, `www.` | Quảng cáo |
| Lặp ký tự `(.)\1{8,}` | "aaaaaaaaaaaa" |
| `(rating ≥ 4 && sentiment ≤ -0.35) || (rating ≤ 2 && sentiment ≥ 0.35)` | Mâu thuẫn rating ↔ comment |

**Output:**

```json
{
  "spam_risk": "high",   // "low" | "medium" | "high"
  "spam_reasons": [
    "rating va sentiment mau thuan",
    "co link quang cao"
  ]
}
```

Admin dashboard có `suspicious_reviews` query để moderation.

---

## 13. Tiếng Việt Support (Paper §5 Limitation 2)

Paper:

> *"the study's focus is limited to English reviews, which restricts the applicability... internet users come from diverse linguistic backgrounds... future direction: PhoBERT or multilingual model."*

**Project triển khai 3 lớp xử lý tiếng Việt:**

1. **Prompt explicit** ([reviewAnalysisService.js:74-77](backend/services/ai/reviewAnalysisService.js)):

```
You are analyzing a Vietnamese bookstore product review.
Language: Vietnamese (may include teencode, slang, regional words, mixed English).
Interpret accordingly. Negation words (khong, chua, chang, "khong tot", "chua hay") flip sentiment.
Return only valid JSON. All string values must be in Vietnamese.
```

2. **Rule-based VN keyword** ([fallbackSentiment.js:1-9](backend/services/ai/fallbackSentiment.js)) — danh sách từ tích cực/tiêu cực không dấu, đối phó được khi user gõ không dấu.

3. **NFC normalization** ([sanitize.js](backend/services/ai/sanitize.js)) — dấu tiếng Việt có nhiều cách compose, normalize NFC để match keyword nhất quán.

**Roadmap cho non-English** (plan §14.10): Phase 5 export dataset → fine-tune PhoBERT. Đây chính là gợi ý paper §5.

---

## 14. So Sánh Paper vs Project

| Khía cạnh | Paper | Project |
|---|---|---|
| Mục tiêu | Benchmark khoa học | Sản phẩm production |
| Dataset | Women's Clothing 22,641 reviews | Book reviews thực tế |
| Ngôn ngữ | English | Vietnamese (chính) |
| Mô hình chính | CNN/RNN/Bi-LSTM/BERT/RoBERTa/ALBERT | LLM Groq + rule + rating ensemble |
| Ensemble | CNN+RNN+Bi-LSTM | Groq+rule+rating |
| Class | So 3-class vs 5-class | 3-class (chọn cái tốt hơn theo paper) |
| Aspect | Đề cập (§2.1) | Implement với 5 aspects cố định |
| Spam | Limitation | Implement rule-based |
| Recommendation | Mô tả định hướng (§2.2) | Implement đầy đủ với MMR diversity |
| Cache/audit | Không có (research) | BookInsight cache, prompt_version, ensemble_sources |
| Eval | Trong paper | Script local có thể chạy lại |

---

## 15. Cải Tiến Vượt Phạm Vi Paper

| # | Cải tiến | Lý do |
|---|---|---|
| 1 | **Production fallback chain** Groq → rule → empty | Paper là experiment, không cần fallback. Production cần resilience. |
| 2 | **Async pipeline** `setTimeout` queue | Tạo review không chờ Groq → UX không lag |
| 3 | **Cache layer** BookInsight + invalidation | Tránh gọi Groq mỗi page view |
| 4 | **PII sanitize** | Bảo mật user data, tuân thủ privacy |
| 5 | **Aspect schema cố định** | Domain-driven (bookstore: in, dịch, giao hàng) |
| 6 | **Prompt versioning** | Audit + rollback khi đổi prompt |
| 7 | **Diversity MMR-lite** | Risk plan §10: tránh recommendation thiên lệch |
| 8 | **Admin re-analyze endpoint** | Plan §5.1, paper không có |
| 9 | **Time-window aggregation** 7d trend, top keywords | Real-time analytics, paper §5 đề xuất |
| 10 | **Rating-sentiment mismatch detection** | Aspect-aware moderation |
| 11 | **Cartesian-safe SQL** | Bug riêng của hệ join SQL, không có trong paper |
| 12 | **Recency factor** | Plan §3.3 nhắc, paper không có |

---

## 16. Hạn Chế Còn Lại

| # | Hạn chế | Cách giải quyết tương lai |
|---|---|---|
| 1 | `setTimeout(0)` mất analysis nếu server crash 1-2s sau create | Bull/BullMQ job queue hoặc cron sweep `Reviews` chưa có analysis |
| 2 | FE chưa hiển thị `aspects`, `top_keywords`, `ensemble_agreement` | Phase 4 mở rộng UI admin dashboard |
| 3 | Cache invalidation chưa bắt re-analyze review cũ | Thêm cột `last_review_updated` trên `BookInsights` |
| 4 | LLM phụ thuộc Groq quota | Cache layer nhiều hơn + Phase 5 PhoBERT local |
| 5 | Eval pseudo ground-truth từ rating, không phải gán thủ công | Tạo bộ 200-500 review gán nhãn manual để eval chính xác hơn |

---

## 17. Hướng Phát Triển Tương Lai (Phase 5 — Theo Paper §5)

1. **Export dataset** từ DB sau 6+ tháng vận hành (~1k-10k review thực tế tiếng Việt).
2. **Fine-tune PhoBERT** trên dataset đó (paper §5: *"future direction: multilingual or PhoBERT"*).
3. **So sánh 3 nguồn:** PhoBERT vs Groq vs rule trên cùng test set, dùng eval script đã có (`--provider=phobert`).
4. **Replicate paper benchmark:** train CNN/RNN/Bi-LSTM với Word2Vec → so trực tiếp với paper §4.2 Table 2.
5. **Ensemble nâng cao:** thêm PhoBERT vote thành 4 nguồn (Groq + PhoBERT + rule + rating).
6. **Aspect mining tự động:** thay vì 5 aspects cố định, dùng LDA/BERTopic để khám phá aspect mới từ signals.
7. **A/B test recommendation:** đo CTR/conversion với và không dùng sentiment trong score.

---

## 18. Phụ Lục — Các File Liên Quan

### Backend AI
- [backend/services/ai/groqClient.js](backend/services/ai/groqClient.js)
- [backend/services/ai/jsonParser.js](backend/services/ai/jsonParser.js)
- [backend/services/ai/sanitize.js](backend/services/ai/sanitize.js)
- [backend/services/ai/fallbackSentiment.js](backend/services/ai/fallbackSentiment.js)
- [backend/services/ai/ensembleVote.js](backend/services/ai/ensembleVote.js)
- [backend/services/ai/reviewAnalysisService.js](backend/services/ai/reviewAnalysisService.js)
- [backend/services/ai/bookInsightService.js](backend/services/ai/bookInsightService.js)

### Backend Services & Repos
- [backend/services/reviewService.js](backend/services/reviewService.js)
- [backend/services/recommendationService.js](backend/services/recommendationService.js)
- [backend/services/statsService.js](backend/services/statsService.js)
- [backend/services/bookService.js](backend/services/bookService.js)
- [backend/repositories/reviewRepository.js](backend/repositories/reviewRepository.js)
- [backend/repositories/recommendationRepository.js](backend/repositories/recommendationRepository.js)

### Backend Controllers & Routes
- [backend/controllers/reviewController.js](backend/controllers/reviewController.js)
- [backend/controllers/recommendationController.js](backend/controllers/recommendationController.js)
- [backend/controllers/statsController.js](backend/controllers/statsController.js)
- [backend/routes/reviews.js](backend/routes/reviews.js)
- [backend/routes/recommendations.js](backend/routes/recommendations.js)
- [backend/routes/stats.js](backend/routes/stats.js)
- [backend/routes/books.js](backend/routes/books.js)

### Models & Migrations
- [backend/models/ReviewAnalysis.js](backend/models/ReviewAnalysis.js)
- [backend/models/BookInsight.js](backend/models/BookInsight.js)
- [backend/migrations/20260507090000-create-review-analyses.cjs](backend/migrations/20260507090000-create-review-analyses.cjs)
- [backend/migrations/20260507091000-create-book-insights.cjs](backend/migrations/20260507091000-create-book-insights.cjs)
- [backend/migrations/20260507092000-extend-review-analyses.cjs](backend/migrations/20260507092000-extend-review-analyses.cjs)

### Scripts
- [backend/scripts/eval-sentiment.js](backend/scripts/eval-sentiment.js)

### Frontend
- [frontend/src/api/recommendationApi.ts](frontend/src/api/recommendationApi.ts)
- [frontend/src/components/book/BookInsightPanel.tsx](frontend/src/components/book/BookInsightPanel.tsx)
- [frontend/src/components/book/RecommendationShelf.tsx](frontend/src/components/book/RecommendationShelf.tsx)
- [frontend/src/components/book/BookReviews.tsx](frontend/src/components/book/BookReviews.tsx)
- [frontend/src/hooks/useRecommendations.ts](frontend/src/hooks/useRecommendations.ts)
- [frontend/src/types/recommendation.ts](frontend/src/types/recommendation.ts)
- [frontend/src/components/admin/tabs/DashboardTab.tsx](frontend/src/components/admin/tabs/DashboardTab.tsx)

### Documentation
- [AI_SENTIMENT_RECOMMENDATION_PLAN.md](AI_SENTIMENT_RECOMMENDATION_PLAN.md) — kế hoạch + roadmap
- [PAPER_INTEGRATION_REPORT.md](PAPER_INTEGRATION_REPORT.md) — tài liệu này
