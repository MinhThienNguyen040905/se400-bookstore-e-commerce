# Thuyết Trình: Áp Dụng Paper Bellar 2024 Vào Project Bookstore E-Commerce

> Project SE400 — Sentiment-Aware Recommendation System
> Paper nguồn: *Bellar, Baina, Ballafkih (2024) — Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers* (Mathematics 12, 2403, MDPI)

---

## Slide 1 — Mở Đầu

**Vấn đề**

- Review e-commerce chứa nhiều tín hiệu hơn rating số sao đơn thuần.
- Số lượng review lớn → khách hàng và admin khó đọc thủ công.
- Recommendation chỉ dựa rating dễ thiên lệch, không phản ánh trải nghiệm thực.

**Câu hỏi của paper**

> Làm thế nào để sentiment analysis từ review cải thiện recommendation trong e-commerce?

**Mục tiêu project**

- Lấy tinh thần khoa học của paper (3-class, ensemble, aspect-level, P/R/F1).
- Áp dụng vào production thực tế: tiếng Việt, không có GPU, không có dataset lớn.
- Document rõ những chỗ phải đánh đổi.

---

## Slide 2 — Tóm Tắt Đóng Góp Của Paper

**Phương pháp**

- Dataset: Women's Clothing E-Commerce Reviews (22,641 review).
- So sánh: CNN, RNN, Bi-LSTM, BERT, ALBERT, RoBERTa, ensemble, ML truyền thống.
- Embedding: Word2Vec, FastText, transformer-based.
- 2 thiết lập: 3-class vs 5-class.

**Kết quả chính**

| Mô hình | Accuracy | F-score |
|---|---:|---:|
| RNN + Word2Vec (best single) | 94.85% | 89.78% |
| RoBERTa (best transformer) | 87.69% | 73.12% |
| **CNN+RNN+Bi-LSTM (ensemble)** | **96.2%** | **91.3%** |
| Naive Bayes (baseline ML) | 66.15% | 39.90% |

**3 finding quan trọng nhất**

1. Deep learning vượt trội ML truyền thống.
2. **Ensemble thắng mọi mô hình đơn lẻ.**
3. 3-class ổn định và thực dụng hơn 5-class.

---

## Slide 3 — Project Stack

**Backend**

- Node.js + Express + Sequelize + MySQL
- AI provider: Groq Cloud (LLaMA 3.1 8B / 3.3 70B)
- Tại sao LLM thay vì train CNN/RNN/BERT? → xem Slide 9.

**Frontend**

- React 19 + Vite + TypeScript + React Query + Zustand

**Tài liệu đã viết**

- `AI_SENTIMENT_RECOMMENDATION_PLAN.md` — kế hoạch chi tiết
- `PAPER_INTEGRATION_REPORT.md` + `.html` — báo cáo tích hợp
- `PAPER_DETAILED_SUMMARY.md` — phân tích paper

---

## Slide 4 — Kiến Trúc Hệ Thống

```
FRONTEND (React)
  BookDetailPage  →  Reviews + InsightPanel + RecShelf
  Home            →  RecommendationShelf
  AdminDashboard  →  AI Insights tab
            │
            ▼ HTTP
EXPRESS ROUTES
  /api/reviews    /api/books/:id/insights
  /api/recommendations    /api/admin/stats/ai-insights
            │
            ▼
SERVICES
  reviewService   →  reviewAnalysisService (ensemble)
  bookService     →  bookInsightService (cache)
  recommendationService (score blend + diversity)
  statsService    →  AI insights
            │
            ▼
AI LAYER
  groqClient  •  ensembleVote  •  fallbackSentiment
  sanitize    •  jsonParser
            │
            ▼
DATA (MySQL)
  Reviews ── ReviewAnalyses (1-1)
  Books  ── BookInsights (1-1, cache)
```

---

## Slide 5 — Mapping Paper → Project

| Khái niệm paper | Section | Implementation |
|---|---|---|
| Canonicalization (NFC, strip whitespace) | §3.2 | `sanitize.js → normalizeText()` |
| Polarity score [-1, 1] | §3.3 | `sentiment_score DECIMAL(5,4)` |
| 3-class setup | §4.1 | `sentiment_label` ENUM 3 giá trị |
| Document + aspect level | §2.1 | `sentiment_label` + `aspects JSON` |
| **Ensemble CNN+RNN+Bi-LSTM** | **§4.4** | **`ensembleVote.js` (Groq + rule + rating)** |
| P/R/F1/Accuracy/AUC | §3.7, §4 | `scripts/eval-sentiment.js` |
| Sentiment-aware recommendation | §2.2 | `recommendationService` (sentiment 18%) |
| Spam detection (limitation) | §5 | `spam_risk` + `spam_reasons` |
| Tiếng Việt support (limitation) | §5 | Prompt explicit + rule VN + NFC |
| Class imbalance | Figure 3 | Macro-F1 + `negative_ratio_recent` |

---

## Slide 6 — Pre-processing (Paper §3.2)

**Paper yêu cầu**: lowercase, strip spaces/digits/punctuation/stopwords, tokenize, lemmatize.

**Project điều chỉnh cho LLM + tiếng Việt**

| Bước paper | Project | Giải thích |
|---|---|---|
| Lowercase | ❌ | LLM xử lý case OK, lowercase mất tên riêng |
| Strip spaces | ✅ | Dồn whitespace dư |
| Strip digits/punct | ⚠️ Chỉ giảm lặp `!!!!!! → !!` | Số/punct có nghĩa với LLM |
| Strip stopwords | ❌ | Stopwords có ích cho ngữ cảnh LLM |
| Tokenize/lemmatize | ❌ | LLM tự xử lý |
| **Unicode NFC** | ✅ | Tiếng Việt nhiều cách compose dấu |
| **Strip zero-width** | ✅ | Bảo mật |
| **Giảm ký tự lặp** | ✅ | Teencode/spam |

**Bổ sung — PII sanitize (vượt paper)**

```
EMAIL → [email]
URL → [url]
PHONE → [phone]
CREDIT_CARD → [card]
```

→ Tuân thủ privacy, không leak thông tin user lên LLM.

---

## Slide 7 — 3-Class Setup (Paper §4.1)

**Paper chứng minh**: 3-class > 5-class.

| RNN + Word2Vec | F-score |
|---|---:|
| 3-class | 89.78% |
| 5-class | 84.47% |

**Lý do**: ranh giới giữa rating 1↔2 và 4↔5 không rõ → model khó học.

**Project áp dụng**

- DB lưu chỉ `positive | neutral | negative`.
- Mapping rating khi cần ground truth:
  - rating 4-5 → positive
  - rating 3 → neutral
  - rating 1-2 → negative
- Đúng cách paper §4.1 chuyển 5-class thành 3-class.

---

## Slide 8 — Aspect-Level Sentiment (Paper §2.1)

**Paper liệt kê 3 mức**: sentence, document, aspect.

**Project triển khai cả document + aspect** với schema cố định 5 keys cho domain bookstore:

| Aspect | Ý nghĩa |
|---|---|
| `content_quality` | Nội dung sách |
| `translation` | Chất lượng dịch |
| `print_quality` | In / giấy / bìa |
| `shipping` | Giao hàng / đóng gói |
| `price_value` | Giá trị so với giá |

**Mỗi aspect**: `positive | neutral | negative | none`

→ `none` rất quan trọng: không bịa giá trị nếu review không nhắc đến.

**Use case mở khóa**

> "Sách rating 4.7 nhưng `print_quality = negative` chiếm 30% review"

→ Query này không thể làm chỉ với sentiment tổng. Aspect cho phép admin moderation thông minh hơn.

---

## Slide 9 — ⭐ Ensemble Vote (Finding Quan Trọng Nhất Của Paper)

**Paper §4.4** — Ensemble CNN+RNN+Bi-LSTM thắng mọi single model.

**Project ensemble 3 nguồn dự đoán độc lập về bản chất tín hiệu**

| Source | Weight | Đặc tính |
|---|---:|---|
| `groq` (LLM) | 0.5 | Context-aware, hiểu sarcasm/teencode |
| `rule` (keyword) | 0.2 | Deterministic, không phụ thuộc network |
| `rating` (user input) | 0.3 | Ground truth từ user |

**Vote logic**

```
counts = { positive: 0, neutral: 0, negative: 0 }
for vote in [groq, rule, rating]:
  counts[vote.label] += vote.weight

winner = argmax(counts)
agreement = counts[winner] / sum(counts)
```

**Output lưu DB**

```json
{
  "sentiment_label": "positive",
  "sentiment_score": 0.78,
  "ensemble_agreement": 0.85,
  "ensemble_sources": {
    "groq": "positive",
    "rule": "positive",
    "rating": "positive"
  }
}
```

**Tại sao ensemble cứu mạng production**

- Groq lỗi/timeout → rule + rating vẫn cho label hợp lý.
- Groq sai do sarcasm → rating "kéo về" sự thật.
- `agreement < 0.6` → tín hiệu admin re-check.

---

## Slide 10 — Tại Sao LLM Thay Vì CNN/RNN/BERT?

**Trade-off có chủ đích**

| Tiêu chí | Paper (train NN) | Project (LLM API) |
|---|---|---|
| Setup | Dataset ≥10k gán nhãn | Không cần dataset |
| Tiếng Việt | Cần PhoBERT (paper §5 nhận) | LLaMA hỗ trợ ngay |
| Aspect schema mở rộng | Train lại model | Đổi prompt 1 dòng |
| Latency | <50ms | 500-2000ms |
| Chi phí | GPU train + serve | Per-token billing |
| Versioning | Model artifact | `prompt_version` string |
| Sarcasm/context | Hạn chế nếu không fine-tune | Tốt sẵn |

**Kết luận**: với e-commerce production cần ship nhanh + domain còn ít data → LLM hợp lý hơn.

**Roadmap Phase 5**: khi tích lũy ≥10k review thực tế → export → fine-tune PhoBERT (đúng paper §5).

---

## Slide 11 — Pipeline Phân Tích Review

```
User submit review
    │
    ▼
Review.create()  ─►  Lưu NGAY (không chờ AI)
    │
    ▼
queueReviewAnalysis(reviewId)  ─►  setTimeout(0) async
    │ (không block response)
    ▼
sanitizePii  ─►  normalizeText
    │
    ▼
fallbackAnalyzeReview()  ─►  rule LUÔN chạy
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

**3 nguyên tắc**

1. Review save thành công kể cả khi AI tắt/lỗi.
2. Rule luôn chạy → baseline + dự phòng.
3. AI là **optional enhancement**, không phải dependency.

---

## Slide 12 — Sentiment-Aware Recommendation (Paper §2.2)

**Score blend** — sentiment là 1 trong nhiều tín hiệu (không phải duy nhất)

```
score = 0.28 × avg_rating
      + 0.18 × positive_sentiment   ← từ ReviewAnalyses
      + 0.13 × review_count
      + 0.13 × sales_count
      + 0.09 × wishlist_count
      + 0.09 × user_interest_match  (genre/author)
      + 0.10 × recency              (half-life 365 ngày)
```

**Normalization**

- Rating: chia 5
- Sentiment: `(score + 1) / 2`
- Count: `log1p(value) / log1p(max)` → tránh bias sách hot

**Diversity (MMR-lite, vượt paper)**

```
Sau khi pick 1 sách:
  cùng author top-1  →  -0.05 score
  cùng genre top-1   →  -0.03 score
```

→ Top 5 không trùng author/genre liên tiếp.

**Reasons** (giải thích cho user)

> "Cùng thể loại với sách bạn đã mua, có nhiều đánh giá sentiment tích cực, mới phát hành."

---

## Slide 13 — Evaluation Pipeline (Paper §3.7, §4)

**Script eval chạy local**

```powershell
node backend/scripts/eval-sentiment.js --limit=500
```

**Pseudo ground truth** (đúng paper §4.1): rating → label

**Output**

```
========== ALL providers (487) ==========

Confusion Matrix (rows = truth, cols = predicted)
              positive  neutral  negative
positive      312       18       7
neutral       11        42       6
negative      4         8        79

Per-class metrics
positive   P=95.41% R=92.58% F1=93.97%  support=337
neutral    P=61.76% R=71.19% F1=66.14%  support=59
negative   P=85.87% R=86.81% F1=86.34%  support=91

Accuracy : 88.50%
Macro-F1 : 82.15%
```

**Tại sao macro-F1 quan trọng?**

Paper Figure 3: dataset >80% positive. Accuracy đơn thuần dễ đánh lừa (model luôn predict `positive` cũng ~80%). Macro-F1 phạt đúng hành vi này.

**Tách 3 phân khúc**: ALL / GROQ-based / FALLBACK only → so chất lượng từng nguồn.

---

## Slide 14 — Admin AI Insights Dashboard

**Endpoint**: `GET /api/admin/stats/ai-insights?windowDays=7`

**6 query**

1. `negative_review_books` — sách negative tăng trong N ngày
2. `rating_sentiment_mismatch` — rating ≥4 nhưng sentiment <0 ⚠️
3. `top_positive_genres` — genre có sentiment trung bình cao nhất
4. `sentiment_trend` — line chart by day
5. `top_keywords` — signals xuất hiện nhiều + phân bố sentiment
6. `suspicious_reviews` — spam_risk ∈ {medium, high}

**Vượt paper**: time-window analytics, mismatch detection, keyword aggregation.

---

## Slide 15 — Spam Detection (Paper §5 Limitation)

**Paper nhận**: dataset chưa lọc spam/fraudulent reviews → cần thêm bước.

**Project implement** (rule-based + LLM)

| Rule | Ý nghĩa |
|---|---|
| Comment < 12 ký tự | "tốt", "k tốt" — quá ngắn |
| Có URL `https://`, `www.` | Quảng cáo |
| Lặp ký tự `(.)\1{8,}` | "aaaaaaaa" |
| `rating ≥4 && sentiment ≤-0.35` | Mâu thuẫn |
| `rating ≤2 && sentiment ≥0.35` | Mâu thuẫn |

**Output**

```json
{
  "spam_risk": "high",
  "spam_reasons": [
    "rating va sentiment mau thuan",
    "co link quang cao"
  ]
}
```

---

## Slide 16 — 12 Cải Tiến Vượt Phạm Vi Paper

| # | Cải tiến | Lý do |
|---|---|---|
| 1 | Production fallback chain Groq → rule → empty | Paper là experiment, không cần |
| 2 | Async `setTimeout(0)` queue | Tạo review không chờ AI |
| 3 | `BookInsight` cache + invalidation | Tránh gọi Groq mỗi page view |
| 4 | PII sanitize (email/URL/phone/card) | Bảo mật user |
| 5 | Aspect schema cố định 5 keys | Domain-driven |
| 6 | `prompt_version` audit | Rollback khi đổi prompt |
| 7 | MMR-lite diversity | Tránh recommendation thiên lệch |
| 8 | Admin re-analyze endpoint | Re-run khi confidence thấp |
| 9 | Time-window 7d trend, top keywords | Real-time analytics |
| 10 | Rating-sentiment mismatch detection | Aspect-aware moderation |
| 11 | Cartesian-safe SQL (subquery aggregation) | Bug-fix riêng |
| 12 | Recency factor (half-life 365 ngày) | Sách mới được boost hợp lý |

---

## Slide 17 — Hạn Chế Còn Lại

| # | Hạn chế | Cách giải quyết tương lai |
|---|---|---|
| 1 | `setTimeout(0)` mất analysis nếu server crash 1-2s sau create | Bull/BullMQ queue hoặc cron sweep |
| 2 | Frontend chưa hiển thị `aspects`, `top_keywords`, `ensemble_agreement` | Mở rộng UI admin |
| 3 | Cache chưa bắt re-analyze review cũ khi đổi prompt | Thêm `last_review_updated` |
| 4 | Phụ thuộc Groq quota/network | Phase 5: PhoBERT local |
| 5 | Eval dùng pseudo ground truth | Gán nhãn manual 200-500 review |

---

## Slide 18 — Roadmap Phase 5 (Theo Paper §5)

1. **Export dataset** sau 6+ tháng vận hành (~1k-10k review tiếng Việt thực tế).
2. **Fine-tune PhoBERT** trên dataset đó — đúng gợi ý paper §5.
3. **So sánh 3 nguồn** trên cùng test set: PhoBERT vs Groq vs rule.
4. **Replicate paper benchmark**: train CNN/RNN/Bi-LSTM + Word2Vec → so với Table 2 của paper.
5. **Ensemble nâng cao**: 4 nguồn (Groq + PhoBERT + rule + rating).
6. **Aspect mining tự động**: LDA/BERTopic khám phá aspect mới.
7. **A/B test recommendation**: đo CTR/conversion uplift có vs không sentiment.

---

## Slide 19 — Kết Luận

**Project đã áp dụng từ paper**

- 3-class setup, polarity [-1, 1], canonicalization
- Document + aspect-level sentiment
- Ensemble (finding §4.4 quan trọng nhất)
- Metrics khoa học (P/R/F1, macro-F1)
- Sentiment-aware recommendation
- Spam detection (lấp limitation paper)
- Vietnamese support (lấp limitation paper)

**Project đã cải tiến vượt paper**

- Production resilience (fallback chain, async, cache)
- Privacy (PII sanitize)
- Operability (prompt versioning, admin re-analyze)
- Recommendation diversity (MMR-lite, recency)
- Analytics (time-window, mismatch, keyword aggregation)

**Triết lý**

> Mỗi lần đi lệch paper đều có lý do production cụ thể và được document.
> Không phải "không làm theo paper" — mà là "dịch tinh thần paper sang ngôn ngữ production".

---

## Slide 20 — Q & A

**Câu hỏi gợi mở**

- Tại sao không dùng BERT/RoBERTa như paper? → Slide 10
- Ensemble Groq+rule+rating có thực sự giống ensemble paper không? → Slide 9
- Làm sao đo được hiệu quả khi chưa có ground truth thật? → Slide 13
- Khi nào nên chuyển sang PhoBERT? → Slide 18

**Tài liệu tham khảo**

- Paper: *Bellar et al. 2024, Mathematics 12, 2403*
- `AI_SENTIMENT_RECOMMENDATION_PLAN.md`
- `PAPER_INTEGRATION_REPORT.md`
- `PAPER_DETAILED_SUMMARY.md`
- Source code: `backend/services/ai/*`, `backend/scripts/eval-sentiment.js`
