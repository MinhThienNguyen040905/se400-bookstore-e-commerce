# Kịch Bản Thuyết Trình (Lời Nói)

> File này là **lời nói khi thuyết trình** đi kèm với 20 slide trong [PRESENTATION.md](PRESENTATION.md).
> Mỗi slide có 1-3 phút nói. Tổng thời lượng dự kiến: **25-30 phút** + Q&A.
> Phong cách: trò chuyện tự nhiên, dùng "em / mình / project" để xưng hô.
> Phần in nghiêng *(...)* là chỉ dẫn động tác (chỉ tay, click chuột, đổi slide).

---

## 🎤 Mở Đầu (30 giây — trước slide 1)

> Em chào thầy/cô và các bạn. Hôm nay em xin trình bày project SE400: **xây dựng hệ thống recommendation cho bookstore e-commerce dựa trên sentiment analysis review**. Project này em làm theo định hướng của một bài báo khoa học năm 2024 — em sẽ giới thiệu kỹ ở slide kế tiếp.
>
> Phần trình bày gồm 3 ý chính: **một** là project đã áp dụng những gì từ bài báo, **hai** là project có những cải tiến nào vượt phạm vi bài báo, và **ba** là demo trực tiếp hệ thống đang chạy.

---

## Slide 1 — Mở Đầu (1 phút)

> *(Chỉ vào phần "Vấn đề")*
>
> Trước hết, vấn đề mà cả paper và project này cùng giải quyết: trong các sàn thương mại điện tử, **rating số sao không phản ánh đầy đủ ý kiến khách hàng**. Một cuốn sách 4 sao có thể vì khách thích nội dung nhưng chê chất lượng in. Nếu chỉ nhìn số sao, hệ thống recommendation sẽ bỏ sót thông tin đó.
>
> Số lượng review lại quá lớn — admin không thể đọc thủ công, khách hàng cũng không.
>
> *(Chỉ vào câu hỏi của paper)*
>
> Vì vậy câu hỏi của paper là: **làm thế nào dùng sentiment analysis để cải thiện recommendation?**
>
> Mục tiêu của project em là **lấy tinh thần khoa học của paper áp dụng vào production thực tế** — với 3 ràng buộc khác paper: dữ liệu tiếng Việt, không có GPU để train model, và dataset chưa lớn. Em sẽ document rõ những chỗ phải đánh đổi.

---

## Slide 2 — Tóm Tắt Paper (2 phút)

> *(Chỉ vào tên paper)*
>
> Paper em chọn là *"Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers"* của Bellar và cộng sự, đăng trên tạp chí Mathematics năm 2024.
>
> Paper benchmark **8 mô hình** trên 22 nghìn review thời trang nữ — từ machine learning truyền thống như Naive Bayes, đến deep learning CNN/RNN/Bi-LSTM, đến transformer BERT/RoBERTa/ALBERT.
>
> *(Chỉ vào bảng kết quả)*
>
> Có 3 finding quan trọng em sẽ bám sát suốt project:
>
> **Một**, deep learning vượt trội ML truyền thống — Naive Bayes chỉ đạt F1 40%, trong khi RNN-Word2Vec đạt 90%.
>
> **Hai** — và đây là finding **quan trọng nhất** — **ensemble CNN+RNN+Bi-LSTM thắng mọi mô hình đơn lẻ**, đạt accuracy 96.2% và F1 91.3%. Em sẽ quay lại finding này ở slide 9 vì project em xây dựng ensemble lấy cảm hứng trực tiếp từ đây.
>
> **Ba**, paper chứng minh thiết lập 3-class (positive/neutral/negative) ổn định hơn 5-class. Project em dùng 3-class theo gợi ý đó.

---

## Slide 3 — Project Stack (45 giây)

> *(Chỉ vào danh sách stack)*
>
> Về kỹ thuật: backend dùng Node.js + Sequelize + MySQL, frontend dùng React + Vite + TypeScript. AI provider em chọn **Groq Cloud** — chạy LLaMA 3.1 và 3.3.
>
> *(Hơi dừng lại nhấn mạnh)*
>
> Câu hỏi đầu tiên thầy/cô có thể hỏi: **tại sao không train CNN/RNN/BERT như paper mà lại dùng LLM?** Em xin để câu trả lời chi tiết ở slide 10, vì đây là trade-off có chủ đích — không phải "không làm theo paper" mà là "dịch tinh thần paper sang ngôn ngữ production".
>
> Em cũng đã viết 3 tài liệu chi tiết — kế hoạch, báo cáo tích hợp, và phân tích paper. Tất cả nằm trong repo.

---

## Slide 4 — Kiến Trúc Hệ Thống (2 phút)

> *(Chỉ vào sơ đồ tổng quát trước khi đi vào từng tầng)*
>
> Đây là sơ đồ kiến trúc của hệ thống, gồm **5 tầng** xếp từ trên xuống: frontend, routes, services, AI layer, và data. Em xin đi từ trên xuống để thầy/cô thấy **một request đi qua hệ thống như thế nào**.
>
> *(Chỉ vào tầng Frontend)*
>
> **Tầng 1 — Frontend (React + TypeScript).** Có 3 màn hình chính tiêu thụ AI:
>
> - **BookDetailPage** — trang chi tiết sách. Khi user mở sẽ thấy 3 thành phần dùng AI: danh sách review kèm sentiment badge, panel **BookInsight** tóm tắt ý kiến độc giả, và shelf **similar books** gợi ý sách tương tự.
> - **Home** — trang chủ có **RecommendationShelf** hiển thị sách trending hoặc personalized.
> - **AdminDashboard** — tab AI Insights cho admin xem trend sentiment, mismatch, top keywords.
>
> Frontend **không gọi LLM trực tiếp** — chỉ gọi API backend qua axios. Đây là nguyên tắc bảo mật: API key Groq không bao giờ ra browser.
>
> *(Chỉ mũi tên xuống "Routes")*
>
> **Tầng 2 — Express Routes.** Em mapping 4 endpoint chính theo đúng feature: `/api/reviews` cho CRUD review, `/api/books/:id/insights` cho insight panel, `/api/recommendations` cho recommendation, và `/api/admin/stats/ai-insights` cho admin dashboard. Routes mỏng — chỉ làm 2 việc: validate request và gọi service.
>
> *(Chỉ vào tầng Services)*
>
> **Tầng 3 — Services (nghiệp vụ).** Mỗi service phụ trách một domain:
>
> - **reviewService** — flow tạo/sửa review thông thường, sau khi save mới gọi `reviewAnalysisService` để phân tích **ensemble** (Groq + rule + rating).
> - **bookService → bookInsightService** — có **cache layer**: nếu insight đã có và review chưa thay đổi thì trả ngay, không gọi Groq lại. Đây là điểm tối ưu chi phí quan trọng.
> - **recommendationService** — tính điểm sách bằng **score blend** 7 tín hiệu (rating, sentiment, sales, wishlist…) rồi áp **diversity** MMR-lite để tránh top 5 trùng author/genre.
> - **statsService** — aggregate dữ liệu cho admin: window 7-30 ngày, sentiment trend, top keywords.
>
> *(Chỉ vào tầng AI Layer — nhấn mạnh)*
>
> **Tầng 4 — AI Layer.** Đây là phần em đầu tư nhiều nhất, gồm **5 file tách bạch trách nhiệm**:
>
> - **groqClient** — HTTP client gọi Groq API, có **timeout 15s**, abort signal, và env flag `AI_FEATURES_ENABLED` để **tắt toàn bộ AI** bằng 1 biến môi trường.
> - **ensembleVote** — bỏ phiếu 3 nguồn, đây là implementation của finding ensemble paper §4.4 mà em sẽ kể chi tiết ở slide 9.
> - **fallbackSentiment** — rule-based VN keyword, đóng vai trò **baseline luôn chạy** — kể cả khi Groq tắt vẫn có sentiment.
> - **sanitize** — làm sạch text: NFC, strip PII (email, phone, URL, card), giảm ký tự lặp. Slide 6 em sẽ kể.
> - **jsonParser** — parse output LLM an toàn, có fallback strip code-fence — chống case Groq trả `\`\`\`json ... \`\`\``.
>
> Em đặt cả 5 file này trong folder `backend/services/ai/` riêng biệt — **không trộn vào business logic**, để khi bỏ Groq sang provider khác (OpenAI, PhoBERT local) chỉ cần thay 1 file.
>
> *(Chỉ vào tầng Data dưới cùng)*
>
> **Tầng 5 — Data Layer (MySQL + Sequelize).** Em thêm 2 bảng mới phục vụ AI:
>
> - **ReviewAnalyses (1-1 với Reviews)** — mỗi review có đúng một record phân tích, lưu `sentiment_label`, `sentiment_score`, `aspects` (JSON 5 keys), `ensemble_agreement`, `spam_risk`, `provider`, `prompt_version`. Tách bảng riêng để **audit được model nào trả kết quả nào**.
> - **BookInsights (1-1 với Books, đóng vai trò cache)** — lưu insight tổng hợp của cả sách, invalidate khi có review mới. Tránh gọi Groq mỗi lần user mở trang.
>
> *(Chốt nguyên tắc thiết kế)*
>
> Em xin nhấn mạnh **3 nguyên tắc kiến trúc** xuyên suốt sơ đồ này:
>
> **Một** — **AI tách khỏi critical path**. Tạo review không chờ AI: response trả 200 trước, AI chạy background qua `setTimeout(0)`. Slide 11 em sẽ giải thích pipeline async cụ thể.
>
> **Hai** — **AI là optional**. Bật/tắt bằng env flag, lỗi Groq không làm sập review. Ensemble vẫn cho ra kết quả từ rule + rating.
>
> **Ba** — **Cache + audit**. Mọi output AI đều lưu DB kèm `provider`, `model`, `prompt_version` — để sau này đổi prompt có thể batch re-analyze và so sánh.

---

## Slide 5 — Mapping Paper → Project (2.5 phút)

> *(Mở slide, đứng lùi 1 bước cho audience nhìn toàn bảng trước)*
>
> Đây là slide em coi là **bằng chứng định lượng** — chứng minh project không "lấy ý tưởng chung chung" mà **bám đúng từng section cụ thể** của paper. Cột giữa là số section paper, cột phải là file/cột DB tương ứng trong project. Em xin đi theo **3 nhóm khái niệm** thay vì đọc từng dòng.
>
> *(Chỉ vào 3 dòng đầu — nhóm "Text & Label")*
>
> **Nhóm 1 — Tiền xử lý và label setup.** Có 3 dòng:
>
> - Paper **§3.2** nói về *canonicalization* — chuyển text về dạng chuẩn trước khi đưa vào model. Project có function `normalizeText()` trong [sanitize.js](backend/services/ai/sanitize.js) — em sẽ giải thích chi tiết bước nào giữ, bước nào bỏ ở slide 6.
> - Paper **§3.3** dùng *polarity score* khoảng [−1, 1] kiểu TextBlob. Project lưu cột `sentiment_score DECIMAL(5,4)` ở bảng ReviewAnalyses — clamp đúng range, độ chính xác 4 chữ số sau dấu phẩy.
> - Paper **§4.1** chứng minh 3-class ổn định hơn 5-class — em đã kể slide trước. Project lưu `sentiment_label` chỉ 3 giá trị `positive | neutral | negative`. Khi cần ground truth từ rating thì map theo đúng công thức paper.
>
> *(Chỉ vào 4 dòng giữa — nhóm "Models & Methods")*
>
> **Nhóm 2 — Phương pháp phân tích.** Đây là phần quan trọng nhất:
>
> - **§2.1 — Document + aspect level.** Paper liệt kê 3 mức: sentence, document, aspect. Project triển khai **cả document lẫn aspect-level** — `sentiment_label` cho toàn review, `aspects JSON` với **5 keys cố định** cho domain bookstore. Slide 8 em sẽ kể tại sao chọn 5 aspects này.
>
> *(Dừng lại, nhấn mạnh dòng ensemble)*
>
> - **§4.4 — Ensemble** — đây là **finding quan trọng nhất** của paper, cũng là phần em đầu tư nhiều nhất. Paper ensemble CNN+RNN+Bi-LSTM đạt 96.2% accuracy. Project có file [ensembleVote.js](backend/services/ai/ensembleVote.js) bỏ phiếu **3 nguồn khác bản chất**: Groq + rule + rating. Slide 9 em sẽ nói chậm phần này.
> - **§3.7 và §4 — Metrics.** Paper báo cáo Precision, Recall, F1, Accuracy, AUC. Project có script [eval-sentiment.js](backend/scripts/eval-sentiment.js) chạy 1 lệnh ra confusion matrix, per-class P/R/F1, macro-F1. Slide 13 em sẽ demo.
> - **§2.2 — Sentiment-aware recommendation.** Paper nói tích hợp sentiment cải thiện recommendation nhưng **không đưa công thức cụ thể**. Project xây dựng score blend 7 tín hiệu trong [recommendationService.js](backend/services/recommendationService.js) — sentiment đóng góp **18%**. Slide 12 em sẽ giải thích trọng số.
>
> *(Chỉ vào 3 dòng cuối — nhóm "Limitations paper")*
>
> **Nhóm 3 — Lấp limitation của paper.** Đây là chỗ em đặc biệt tự hào: paper §5 thừa nhận **3 hạn chế**, project lấp **cả ba**:
>
> - **Spam detection** — paper bỏ ngỏ. Project có `spam_risk` 3 mức và `spam_reasons` cụ thể trong [fallbackSentiment.js](backend/services/ai/fallbackSentiment.js). Slide 15.
> - **Non-English support** — paper chỉ test tiếng Anh, gợi ý PhoBERT cho ngôn ngữ khác. Project xử lý tiếng Việt qua **3 lớp**: prompt khai báo rõ Vietnamese + teencode + negation, rule VN keyword, và NFC normalize.
> - **Class imbalance** — paper Figure 3 cho thấy dataset có >80% positive. Project **không che giấu** vấn đề này: eval báo cáo **macro-F1** thay vì chỉ accuracy, và admin dashboard ưu tiên hiển thị `negative_ratio_recent` để bù bias.
>
> *(Chốt slide)*
>
> Tóm lại bảng này có **10 mapping** — không phải mỗi mapping là một code reference cụ thể em có thể mở ra trong demo. Em coi đây là **"slide phòng thủ"**: nếu thầy/cô hỏi "phần X của paper triển khai ở đâu", em luôn quay lại slide này và chỉ thẳng vào file.

---

## Slide 6 — Pre-processing (1.5 phút)

> *(Chỉ vào bảng)*
>
> Đây là chỗ project **không làm y nguyên paper** vì tool khác nhau.
>
> Paper section 3.2 đề xuất 7 bước canonicalization: lowercase, strip whitespace, strip digits, punctuation, stopwords, tokenize, lemmatize. Mấy bước này hợp lý cho input của Word2Vec/RNN — vì mấy model đó cần token sạch.
>
> Nhưng **input của LLM khác**: LLM tự tokenize, tự hiểu case, tự xử lý stopwords. Nếu em lowercase hết thì mất tên riêng. Nếu strip stopwords thì câu mất ngữ cảnh.
>
> *(Chỉ vào các bước project giữ)*
>
> Vậy project chỉ giữ những bước **thực sự có lợi cho LLM**: dồn whitespace dư, NFC unicode (vì tiếng Việt có nhiều cách compose dấu), và giảm ký tự lặp như "aaaaaaa" → "aaa" để chống teencode.
>
> *(Nhấn mạnh phần bổ sung)*
>
> Project còn **bổ sung một bước paper không có**: PII sanitize — strip email, URL, số điện thoại, credit card trước khi gửi lên Groq. Đây là vấn đề **privacy** mà paper không quan tâm vì nó chỉ là experiment, còn project là production phải tuân thủ.

---

## Slide 7 — 3-Class Setup (1 phút)

> Paper benchmark cả 3-class và 5-class trên mọi mô hình. Kết quả: 3-class luôn ổn định hơn. Ví dụ RNN-Word2Vec đạt F1 89.78% ở 3-class so với 84.47% ở 5-class.
>
> Lý do là **ranh giới giữa rating 1 với 2, hoặc 4 với 5 không rõ ràng**. User cho 4 hay 5 sao đôi khi chỉ phụ thuộc tâm trạng. Bắt model phân biệt được là khó.
>
> Project bám theo finding này: **DB chỉ lưu 3 nhãn**, và khi cần ground truth từ rating cho evaluation thì map theo công thức paper: 4-5 thành positive, 3 thành neutral, 1-2 thành negative.

---

## Slide 8 — Aspect-Level Sentiment (1.5 phút)

> *(Chỉ vào bảng aspect)*
>
> Paper section 2.1 nói có 3 mức phân tích — sentence, document, aspect. Document-level chỉ cho biết toàn review là positive hay negative. Aspect-level cho biết **chi tiết hơn**: nội dung tốt, nhưng giao hàng tệ.
>
> Project thiết kế **schema cố định 5 aspects** cho domain bookstore: nội dung, dịch thuật, chất lượng in, giao hàng, và giá trị. Em chọn 5 này vì đây là 5 thứ khách hàng sách thực sự quan tâm.
>
> Mỗi aspect có 4 giá trị: positive, neutral, negative, và **none**. *(Nhấn mạnh chữ "none")*. Em nhấn mạnh chữ "none" — nếu review không nhắc đến aspect đó, hệ thống không được bịa giá trị. Đây là nguyên tắc quan trọng để tránh false signal.
>
> *(Chỉ vào use case)*
>
> Aspect mở khóa use case mà sentiment tổng không làm được. Ví dụ: "sách rating trung bình 4.7 nhưng có 30% review báo print_quality âm". Query này admin có thể chạy ngay, dẫn đến hành động: kiểm tra chất lượng in của nhà cung cấp. Đây là **giá trị business** mà paper chỉ đề cập, project làm thật.

---

## Slide 9 — ⭐ Ensemble Vote (3 phút — slide quan trọng nhất)

> *(Dừng lại nhấn mạnh)*
>
> Đây là slide quan trọng nhất của buổi thuyết trình. Em xin nói chậm hơn một chút.
>
> Paper section 4.4 chứng minh: **ensemble CNN+RNN+Bi-LSTM thắng mọi mô hình đơn lẻ**. Bảng số nhỏ ở trên: RNN single đạt accuracy 94.85%, còn ensemble đạt 96.2%. Khác biệt 1.4% — nhỏ nhưng chứng minh nguyên tắc.
>
> Câu hỏi đặt ra: project không train 3 mô hình thì làm sao có "ensemble"?
>
> *(Chỉ vào bảng 3 source)*
>
> Project ensemble **3 nguồn dự đoán độc lập về bản chất tín hiệu**:
>
> - **Groq** — LLM, weight 0.5 — đây là nguồn mạnh nhất, hiểu được sarcasm, teencode, ngữ cảnh.
> - **Rule-based** — keyword tiếng Việt, weight 0.2 — deterministic, không cần network, luôn chạy được.
> - **Rating** — input thẳng từ user, weight 0.3 — đây là ground truth bán phần.
>
> *(Chỉ vào logic)*
>
> Vote logic đơn giản: cộng weight theo nhãn, nhãn nào nhiều weight nhất thắng. Tính thêm `agreement` = weight của nhãn thắng chia tổng — đây là **độ tin cậy** của kết quả.
>
> *(Chỉ vào ví dụ JSON)*
>
> Output lưu cả 3 thứ vào DB: nhãn cuối, score weighted average, và `ensemble_sources` để audit từng nguồn.
>
> *(Chỉ vào phần "tại sao")*
>
> Tại sao ensemble cứu mạng production?
>
> **Một**: Groq quota hết hoặc network lỗi — rule + rating vẫn đủ để cho ra label. Hệ thống không sập.
>
> **Hai**: nếu Groq hiểu nhầm vì sarcasm — rating user nhập sẽ "kéo về" sự thật. Vì user biết rõ cảm xúc của mình.
>
> **Ba**: khi `agreement < 0.6`, đó là tín hiệu **admin nên review lại**. Đây chính là mismatch detection em sẽ kể slide sau.
>
> Đây là slide em sẽ demo trực tiếp ở phần demo — đăng nhập user `mismatch@bookstore.demo` sẽ thấy review có agreement 50%.

---

## Slide 10 — LLM vs CNN/RNN/BERT (1.5 phút)

> Bây giờ trả lời câu hỏi nhiều người sẽ hỏi: **tại sao không train CNN/RNN/BERT như paper?**
>
> Em không tránh né câu hỏi này. Bảng này so 7 tiêu chí.
>
> *(Chỉ từng dòng)*
>
> Train mô hình cần **dataset gán nhãn ≥10k review** — project chưa có. Cần **PhoBERT** cho tiếng Việt — phải fine-tune. Cần **GPU** để train. Nếu muốn đổi aspect schema phải retrain.
>
> Trong khi gọi LLM API: không cần dataset, hỗ trợ tiếng Việt sẵn, đổi aspect bằng đổi prompt 1 dòng, không cần GPU.
>
> *(Thừa nhận điểm yếu)*
>
> Đổi lại project chịu 2 nhược điểm: **latency** — 500-2000ms thay vì <50ms, và **chi phí** per-token thay vì cost-once GPU.
>
> Quan điểm của em: với **e-commerce production cần ship nhanh** và **domain còn ít data**, LLM hợp lý hơn. Và đây không phải kết thúc — slide 18 em sẽ kể roadmap Phase 5: khi tích lũy đủ review thực tế sẽ fine-tune PhoBERT theo đúng gợi ý paper section 5.

---

## Slide 11 — Pipeline Phân Tích Review (1.5 phút)

> *(Chỉ tay theo sơ đồ từ trên xuống)*
>
> Đây là luồng xảy ra khi user submit review. Em muốn nhấn vào 3 chi tiết:
>
> **Một**: ngay sau `Review.create()`, hệ thống **trả response thành công cho user**. Không chờ AI. AI chạy ở background qua `setTimeout(0)`. Nguyên tắc: AI không bao giờ làm chậm UX.
>
> **Hai**: rule-based **luôn chạy** kể cả khi AI bật. Tại sao? Vì rule đóng vai trò "Naive Bayes baseline" trong ensemble. Nếu rule và Groq không đồng thuận → đó là tín hiệu.
>
> **Ba**: nếu AI tắt hoàn toàn hoặc Groq lỗi, pipeline vẫn cho ra kết quả từ rule + rating. Review không bao giờ thiếu analysis.
>
> *(Chỉ vào 3 nguyên tắc dưới cùng)*
>
> Tóm lại 3 nguyên tắc thiết kế: review save phải thành công, rule luôn chạy, AI là optional enhancement.

---

## Slide 12 — Sentiment-Aware Recommendation (2 phút)

> Paper section 2.2 nói recommendation system **tích hợp sentiment cải thiện chất lượng**, nhưng paper không đi sâu vào công thức. Project xây dựng công thức cụ thể.
>
> *(Chỉ vào score formula)*
>
> 7 tín hiệu, mỗi tín hiệu có trọng số:
>
> - Rating 28% — tín hiệu mạnh nhất, vì user đã chấm thẳng.
> - **Sentiment 18%** — đây là điểm khác biệt với hệ recommendation thông thường, lấy từ ReviewAnalyses.
> - Review count, sales, wishlist mỗi cái 9-13% — tín hiệu social proof.
> - Interest match 9% — genre/author user đã mua.
> - Recency 10% — half-life 365 ngày, sách mới được boost nhẹ.
>
> *(Chỉ vào normalization)*
>
> Normalization quan trọng: count signal dùng `log1p` để **tránh bias sách hot** — sách bán 1000 cuốn không nên áp đảo sách 100 cuốn theo tỉ lệ tuyến tính.
>
> *(Chỉ vào diversity)*
>
> Cuối cùng em thêm **MMR-lite diversity** — sau khi pick 1 sách, các candidate cùng author bị trừ 0.05 điểm, cùng genre trừ 0.03 điểm. Đây là cải tiến vượt paper — paper không quan tâm diversity vì nó là benchmark, không phải UX.
>
> Kết quả: top 5 recommendation không bao giờ trùng author/genre liên tiếp. Reasons sinh ra dạng "cùng thể loại sách bạn đã mua, sentiment tích cực, mới phát hành" để **giải thích cho user** — tăng trust.

---

## Slide 13 — Evaluation Pipeline (2 phút)

> Paper benchmark bằng 5 metric: Precision, Recall, F1, Accuracy, AUC. Project có script chạy lại được bất cứ lúc nào.
>
> *(Chỉ vào lệnh chạy)*
>
> Chỉ 1 lệnh terminal `node scripts/eval-sentiment.js` là ra báo cáo.
>
> *(Chỉ vào ground truth)*
>
> Project chưa có 500 review gán nhãn thủ công, nên dùng **pseudo ground truth** từ rating — theo đúng cách paper section 4.1 chuyển 5-class thành 3-class. Em thừa nhận đây là hạn chế: nếu user mỉa mai cho 5 sao nhưng comment chê, "truth" này sẽ sai. Đó là lý do em đặt mismatch detection ở slide sau.
>
> *(Chỉ vào output mẫu)*
>
> Output có 3 phần: confusion matrix, per-class metrics, và aggregate accuracy + macro-F1.
>
> *(Nhấn mạnh phần "tại sao macro-F1")*
>
> Đây là câu hỏi quan trọng: **tại sao em báo cáo macro-F1 chứ không phải accuracy?**
>
> Paper Figure 3 chỉ ra dataset có **>80% positive** — class imbalance nặng. Nếu một model "lười" luôn predict positive sẽ đạt accuracy ~80% — nhìn đẹp nhưng vô dụng vì bỏ sót toàn bộ negative.
>
> Macro-F1 = trung bình F1 của 3 class. Nếu F1 của negative = 0, macro-F1 sẽ kéo xuống rõ. Đây là metric phạt đúng hành vi lười.
>
> Script còn tách 3 phân khúc: ALL, GROQ-only, FALLBACK-only — để biết Groq có đáng tiền không.

---

## Slide 14 — Admin AI Insights (1.5 phút)

> *(Mở liệt kê 6 query)*
>
> Endpoint admin trả về 6 query trong 1 lần gọi.
>
> Hai query đầu là **moderation**: sách negative tăng, và sách rating cao nhưng sentiment thấp — em sẽ kể chi tiết slide sau vì đây là use case quan trọng.
>
> Hai query giữa là **analytics**: top positive genres, và sentiment trend line chart theo ngày.
>
> Hai query cuối là **investigation**: top keywords và suspicious reviews.
>
> *(Nhấn mạnh)*
>
> Phần này em coi là **vượt phạm vi paper** — paper chỉ benchmark model offline, project mang **time-window analytics, mismatch detection, keyword aggregation** vào production. Admin có thể chọn window 7/14/30 ngày để xem trend.

---

## Slide 15 — Spam Detection (1 phút)

> Paper section 5 thừa nhận: *"dataset chưa lọc kỹ spam hoặc fraudulent reviews"*. Đây là limitation paper.
>
> Project lấp limitation này bằng rule-based + LLM detection.
>
> *(Chỉ vào bảng rule)*
>
> 4 rule chính: comment quá ngắn dưới 12 ký tự, có URL ngoài, lặp ký tự, và **mâu thuẫn rating với sentiment** — rule cuối là quan trọng nhất.
>
> Output có spam_risk 3 mức và lý do cụ thể. Admin dashboard có section "Suspicious reviews" lấy danh sách từ đây để moderation.
>
> Phần này em sẽ demo bằng user `spammer@bookstore.demo`.

---

## Slide 16 — 12 Cải Tiến Vượt Paper (2 phút)

> *(Chỉ vào toàn bảng)*
>
> Đây là slide em **không đi từng dòng** mà chỉ kể nhóm. 12 cải tiến chia 3 nhóm:
>
> *(Chỉ vào nhóm 1-4)*
>
> **Nhóm production resilience** — fallback chain, async pipeline, cache, PII sanitize. Paper là experiment chạy 1 lần ra số rồi xong, không cần fallback. Project là production phải resilient.
>
> *(Chỉ vào nhóm 5-8)*
>
> **Nhóm operability** — aspect schema cố định, prompt versioning, MMR diversity, admin re-analyze endpoint. Đây là những thứ giúp admin vận hành lâu dài, paper không có.
>
> *(Chỉ vào nhóm 9-12)*
>
> **Nhóm analytics** — time-window trend, rating-sentiment mismatch detection, SQL fix, recency factor. Đây là phần phân tích real-time mà paper không cần vì chỉ đánh giá offline.
>
> Em muốn nhấn mạnh: **mỗi cải tiến đều có lý do production cụ thể**, không phải làm cho có.

---

## Slide 17 — Hạn Chế Còn Lại (1 phút)

> Em cũng muốn **trung thực về hạn chế** — không chỉ kể cái tốt.
>
> *(Chỉ vào dòng 1)*
>
> **Một**: `setTimeout(0)` không bền vững. Nếu server crash 1-2 giây sau khi user submit review, analysis sẽ mất. Cách fix: dùng Bull/BullMQ queue. Em chưa làm vì scope project.
>
> **Hai**: ban đầu frontend chưa hiển thị đầy đủ `aspects`, `top_keywords`, `ensemble_agreement` — nhưng phần này em **đã làm xong** trong tuần này, em sẽ demo trực tiếp.
>
> *(Chỉ dòng 3, 4, 5)*
>
> Ba là cache invalidation chưa hoàn toàn. Bốn là phụ thuộc Groq quota. Năm là eval dùng pseudo ground truth.
>
> Đây là roadmap cho Phase 5 — slide sau.

---

## Slide 18 — Roadmap Phase 5 (1.5 phút)

> *(Đọc lướt 7 dòng)*
>
> Khi project tích lũy đủ review thực tế (~1k-10k) sau 6 tháng vận hành, em có roadmap 7 bước:
>
> **Một**: export dataset thực tế.
> **Hai**: fine-tune PhoBERT trên đó — đây chính là gợi ý cuối của paper section 5.
> **Ba**: so 3 nguồn — PhoBERT vs Groq vs rule — trên cùng test set.
> **Bốn**: replicate paper benchmark CNN/RNN/Bi-LSTM với Word2Vec — để **đối chiếu trực tiếp** với Table 2 của paper.
> **Năm**: ensemble nâng cao 4 nguồn — thêm PhoBERT vào vote.
> **Sáu**: aspect mining tự động bằng LDA/BERTopic.
> **Bảy**: A/B test trên người dùng thật — đo CTR/conversion uplift.
>
> *(Tóm)*
>
> Khi đó project sẽ chuyển từ "áp dụng tinh thần paper" thành "đóng góp ngược lại cho cộng đồng" với benchmark trên dataset tiếng Việt thực tế.

---

## Slide 19 — Kết Luận (1.5 phút)

> *(Chỉ phần "đã áp dụng")*
>
> Tóm lại — project đã áp dụng từ paper:
>
> Thiết lập 3-class, polarity range, canonicalization, document + aspect, ensemble — đây là finding quan trọng nhất, metrics khoa học, sentiment-aware recommendation, spam detection và Vietnamese support — hai cái này lấp limitation của paper.
>
> *(Chỉ phần "đã cải tiến")*
>
> Project cũng cải tiến vượt paper ở 5 nhóm: resilience, privacy, operability, recommendation diversity, và real-time analytics.
>
> *(Đọc câu triết lý)*
>
> Triết lý cuối cùng của project em xin để ở đây:
>
> > "Mỗi lần đi lệch paper đều có lý do production cụ thể và được document. Không phải 'không làm theo paper' mà là 'dịch tinh thần paper sang ngôn ngữ production'."
>
> Em rất biết ơn bài báo của Bellar và cộng sự đã cung cấp framework khoa học cho project này.

---

## Slide 20 — Q & A (mở ra, không nói trước, chờ câu hỏi)

> Em xin dừng phần trình bày ở đây. *(Nhìn xuống audience, mỉm cười)*
>
> Em xin sẵn sàng nhận câu hỏi từ thầy/cô.

---

## 🎬 Demo Trực Tiếp (5-7 phút — sau Q&A hoặc trước Slide 20)

> Em có chuẩn bị **demo trực tiếp** trên hệ thống đang chạy. Em xin chia sẻ màn hình.

### Demo bước 1: User mismatch (~2 phút) ⭐

> Em đăng nhập user `mismatch@bookstore.demo`. *(Login)*
>
> Em mở trang sách `/book/174`. *(Cuộn xuống review)*
>
> Đây là review của user mismatch — rating **5 sao** *(chỉ vào sao vàng)* nhưng comment chê "không tốt như mong đợi, in xấu".
>
> Hệ thống AI **không bị lừa**. Nhìn vào hàng **Ensemble vote**: Groq nói negative, Rule nói negative, Rating nói positive. Vote 0.7 vs 0.3 → kết quả cuối: **negative**.
>
> Badge `agreement` chỉ 50% màu vàng — tín hiệu cho admin nên review lại.
>
> Dòng tiếp theo: **spam high** + lý do "rating va sentiment mau thuan".
>
> Đây chính là minh chứng cho slide 9 — ensemble bảo vệ hệ thống.

### Demo bước 2: User aspect (~1 phút)

> Em chuyển sang user `aspect@bookstore.demo`. Mở review của user này.
>
> Nhìn hàng **Aspects**: `Nội dung: positive`, `Dịch thuật: positive`, các aspect khác `none`.
>
> User khác review sách khác: `Chất lượng in: negative`, `Giao hàng: negative`.
>
> Đây là minh chứng aspect-level slide 8.

### Demo bước 3: Admin dashboard ⭐⭐⭐ (~3 phút)

> Em đăng nhập **admin**. Vào tab Dashboard.
>
> *(Cuộn xuống AI Insights)*
>
> Hàng đầu — **Sentiment trend** 3 đường positive/neutral/negative theo ngày.
>
> Em đổi **window selector** từ 7d sang 30d *(click)* — toàn bộ dashboard refetch.
>
> Hàng hai trái: sách negative tăng — kèm tỉ lệ %.
>
> Hàng hai phải — **Rating ↔ Sentiment mismatch** *(nhấn mạnh)*. Đây là card khung amber, có badge `paper §5`. Sách rating ★4-5 nhưng sentiment âm — chính là use case slide 8.
>
> Hàng ba: top genres, **top keywords với stacked bar** xanh/xám/đỏ — mỗi keyword cho biết phân bố sentiment.
>
> Cuối cùng: **suspicious reviews** lấy từ user spammer và mismatch.
>
> Đây là toàn bộ slide 14 chạy trên dữ liệu thật.

### Demo bước 4 (optional): Eval pipeline (~1 phút)

> Cuối cùng em chạy script eval trên terminal: `node scripts/eval-sentiment.js`.
>
> *(Wait, scroll output)*
>
> Confusion matrix 3×3, per-class P/R/F1, accuracy và **macro-F1**. Đây là minh chứng slide 13.

---

## 📋 Tips Khi Thuyết Trình

### Trước buổi
- Tập nói trước gương 1 lần để canh thời gian.
- Chuẩn bị 2 tab browser: tab demo (đã login admin), tab terminal sẵn lệnh eval.
- Restart backend + frontend trước 5 phút.

### Trong khi nói
- **Đừng đọc thẳng slide** — slide là gợi ý, kịch bản là lời.
- Khi đến slide 9 (ensemble) — **nói chậm hơn**, đây là phần quan trọng nhất.
- Khi đến slide 16 (cải tiến) — đừng đi từng dòng, chỉ kể nhóm.
- Slide 17 (hạn chế) — quan trọng vì **chứng tỏ trung thực**, giảng viên đánh giá cao.

### Khi gặp câu hỏi khó
- Nếu không biết: nói thẳng "đây là câu hỏi rất hay, em chưa nghiên cứu sâu phần này, em sẽ tìm hiểu thêm". **Đừng cố bịa**.
- Nếu câu hỏi hỏi về paper: lùi về slide 5 (mapping) — luôn có đáp án ở đó.
- Nếu hỏi về implement: dẫn về file cụ thể trong [PAPER_INTEGRATION_REPORT.md](PAPER_INTEGRATION_REPORT.md).

### Câu hỏi nhiều khả năng được hỏi

**Q: Tại sao chọn paper này?**
> Vì paper khớp 100% domain (e-commerce + review + recommendation), có benchmark đầy đủ, và có ensemble finding em thấy thực dụng.

**Q: Có thực sự dùng AI không hay chỉ là rule?**
> Có, em demo trực tiếp. Mở DB sẽ thấy `provider = "groq"` và `model = "llama-3.1-8b-instant"` ở mỗi ReviewAnalysis.

**Q: Nếu Groq tắt thì sao?**
> Slide 11 — rule + rating ensemble vẫn chạy. Demo bằng cách set `AI_FEATURES_ENABLED=false` rồi tạo review mới.

**Q: Accuracy 88.50% so với paper 96.2% — có thấp không?**
> 1. Paper là dataset tiếng Anh được clean kỹ, project là dataset tiếng Việt thực tế.
> 2. Ground truth của project là **pseudo từ rating**, không phải gán thủ công như paper.
> 3. Quan trọng hơn là **macro-F1 82%** vì class imbalance — chứng minh model không "lười".

**Q: Sao không train model riêng?**
> Slide 10 — trade-off có chủ đích. Roadmap Phase 5 (slide 18) sẽ làm khi có đủ data.

---

## 📁 Files Cần Mở Sẵn (Tab Browser)

1. `http://localhost:5173` — trang chủ (kiểm tra recommendation shelf)
2. `http://localhost:5173/book/174` — sách có nhiều review
3. `http://localhost:5173/login` — sẵn sàng switch user
4. `http://localhost:5173/admin` — admin dashboard
5. Terminal mở sẵn ở thư mục `backend/`

Chúc thầy/cô và các bạn buổi thuyết trình thành công! 🎓
