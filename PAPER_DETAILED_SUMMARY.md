# Tóm Tắt Chi Tiết Bài Báo

## 1. Thông Tin Chung

| Mục | Nội dung |
|---|---|
| Tên bài báo | Sentiment Analysis: Predicting Product Reviews for E-Commerce Recommendations Using Deep Learning and Transformers |
| Tác giả | Oumaima Bellar, Amine Baina, Mostafa Ballafkih |
| Tạp chí | Mathematics, 2024, tập 12, bài 2403 |
| DOI | https://doi.org/10.3390/math12152403 |
| Ngày xuất bản | 02/08/2024 |
| Lĩnh vực | Natural Language Processing, sentiment analysis, rating prediction, e-commerce recommendation |
| Từ khóa | artificial intelligence, sentiment analysis/rating, NLP, deep learning, transformers, product reviews |

Bài báo nghiên cứu cách dùng phân tích cảm xúc từ review sản phẩm để dự đoán rating và hỗ trợ hệ thống gợi ý trong thương mại điện tử. Thay vì chỉ xem rating số sao, bài báo khai thác nội dung review dạng văn bản để hiểu ý kiến thật của khách hàng, sau đó so sánh nhiều nhóm mô hình học máy, học sâu và transformer.

## 2. Bối Cảnh Và Vấn Đề Nghiên Cứu

Trong e-commerce, người dùng thường để lại nhiều review sau khi mua hàng. Các review này chứa thông tin quan trọng về:

- Cảm nhận của khách hàng đối với sản phẩm.
- Lý do khách hàng thích hoặc không thích sản phẩm.
- Tín hiệu cho biết sản phẩm có nên được recommend cho người dùng khác hay không.
- Điểm mạnh, điểm yếu, vấn đề chất lượng hoặc trải nghiệm mua hàng.

Tuy nhiên, số lượng review lớn khiến cả khách hàng và doanh nghiệp khó đọc thủ công. Sentiment analysis được dùng để tự động phân loại review thành tích cực, trung lập hoặc tiêu cực, hoặc dự đoán rating chi tiết hơn theo thang 1-5.

Câu hỏi nghiên cứu chính của bài báo là:

> Làm thế nào để sử dụng các mô hình deep learning và transformer nhằm cải thiện phân tích cảm xúc cho dự đoán review sản phẩm trong hệ thống recommendation e-commerce?

## 3. Mục Tiêu Của Bài Báo

Bài báo đặt ra các mục tiêu chính:

1. So sánh nhiều mô hình sentiment analysis trên dữ liệu review e-commerce.
2. Đánh giá sự khác biệt giữa bài toán phân loại 3 lớp và 5 lớp.
3. So sánh các kỹ thuật embedding gồm Word2Vec, FastText và transformer-based embeddings.
4. Kiểm tra hiệu quả của các mô hình deep learning như CNN, RNN, Bi-LSTM.
5. Kiểm tra hiệu quả của các transformer variants như BERT, ALBERT, RoBERTa.
6. Đánh giá mô hình ensemble kết hợp CNN, RNN và Bi-LSTM.
7. So sánh deep learning với machine learning truyền thống như Naive Bayes, SVM, Logistic Regression, Decision Tree, Random Forest.

## 4. Nền Tảng Lý Thuyết

### 4.1. Sentiment Analysis

Sentiment analysis, còn gọi là opinion mining, là kỹ thuật NLP dùng để xác định cảm xúc hoặc thái độ trong văn bản. Bài báo nhắc đến ba cấp độ phân tích:

- **Sentence level**: phân tích cảm xúc từng câu.
- **Document level**: phân tích cảm xúc toàn bộ review hoặc văn bản.
- **Aspect/feature level**: phân tích cảm xúc theo từng đặc điểm sản phẩm, ví dụ chất lượng, giá, kích thước, giao hàng.

Bài báo cũng chia sentiment analysis thành các hướng tiếp cận:

- **Lexicon-based**: dựa trên từ điển cảm xúc.
- **Machine learning-based**: dùng thuật toán học máy truyền thống hoặc deep learning.
- **Hybrid**: kết hợp lexicon và machine learning.

Các khó khăn được bài báo nêu gồm:

- Ngôn ngữ mơ hồ, cùng một từ có thể mang nghĩa khác nhau tùy ngữ cảnh.
- Sarcasm và irony khó nhận diện.
- Phủ định như "not bad" hoặc "not good" làm thay đổi cực tính cảm xúc.
- Emoji, emoticon, slang và informal language có thể không xuất hiện trong dữ liệu huấn luyện.
- Review giả, spam hoặc review không trung thực có thể làm sai lệch kết quả.

### 4.2. Recommendation Systems

Recommendation system dùng dữ liệu hành vi và sở thích người dùng để gợi ý sản phẩm phù hợp. Bài báo mô tả các nhóm chính:

- **Content-based filtering**: gợi ý dựa trên đặc điểm sản phẩm và lịch sử quan tâm của người dùng.
- **Collaborative filtering**: gợi ý dựa trên hành vi của những người dùng có sở thích tương tự.
- **Hybrid recommendation**: kết hợp nhiều nguồn tín hiệu để tăng độ chính xác.
- **Deep learning-based methods**: dùng neural network để học pattern phức tạp.
- **NLP-based recommendation**: dùng review text, sentiment analysis, text classification hoặc topic modeling làm tín hiệu gợi ý.

Ý tưởng quan trọng của bài báo là sentiment từ review có thể được dùng như một dạng feedback bổ sung cho recommendation. Một sản phẩm không chỉ được đánh giá bằng số sao, mà còn bằng nội dung khách hàng thực sự viết.

## 5. Dataset

Bài báo sử dụng dataset **Women's Clothing E-Commerce Reviews** từ Kaggle.

Thông tin chính:

- Số dòng: 22,641 review.
- Số cột: 10 biến.
- Mỗi dòng tương ứng với một review của khách hàng.
- Domain: review sản phẩm thời trang nữ.

Các trường dữ liệu chính:

| Trường | Ý nghĩa |
|---|---|
| Clothing ID | Mã sản phẩm được review |
| Age | Tuổi người review |
| Title | Tiêu đề review |
| Review Text | Nội dung review |
| Rating | Điểm đánh giá từ 1 đến 5 |
| Recommended IND | Người dùng có recommend sản phẩm hay không, 1 là có, 0 là không |
| Positive Feedback Count | Số người thấy review hữu ích |
| Division Name | Nhóm sản phẩm cấp cao |
| Department Name | Department của sản phẩm |
| Class Name | Lớp sản phẩm |

Bài báo nhận xét dataset bị mất cân bằng, vì phần lớn khách hàng có xu hướng recommend sản phẩm. Đây là vấn đề thường gặp trong e-commerce thật: review tích cực và rating cao thường chiếm đa số.

## 6. Tiền Xử Lý Dữ Liệu

Bài báo thực hiện các bước tiền xử lý văn bản:

1. Chuyển chữ về lowercase.
2. Loại bỏ khoảng trắng dư thừa.
3. Loại bỏ số, dấu câu và stop words.
4. Tokenization: tách câu thành các token.
5. Lemmatization: đưa từ về dạng gốc.
6. Index encoding: chuyển token thành chỉ số.
7. Zero padding: chuẩn hóa độ dài chuỗi đầu vào.
8. Tạo thêm biến `Text_Length` để phân tích độ dài review.

Các thư viện được nhắc đến gồm Python 3.7, NLTK, regular expression và Keras 2.7.1.

## 7. Polarity Detection Và Feature Extraction

Bài báo dùng **TextBlob** để tính polarity ban đầu cho review. Polarity nằm trong khoảng từ -1 đến 1:

- Gần -1: cảm xúc tiêu cực.
- Gần 0: trung lập.
- Gần 1: cảm xúc tích cực.

Sau đó, bài báo sử dụng các kỹ thuật feature extraction:

### 7.1. Word2Vec

Word2Vec học vector biểu diễn cho từng từ dựa trên quan hệ giữa các từ trong corpus. Ưu điểm là đơn giản, hiệu quả và thường hoạt động tốt với deep learning truyền thống.

Hạn chế: cùng một từ thường có một vector cố định, nên khó xử lý từ đa nghĩa theo ngữ cảnh.

### 7.2. FastText

FastText mở rộng Word2Vec bằng cách chia từ thành n-grams. Cách này giúp xử lý hình thái từ tốt hơn, đặc biệt với từ hiếm hoặc biến thể chính tả.

Hạn chế tương tự Word2Vec: vẫn không thực sự hiểu ngữ cảnh sâu như transformer.

### 7.3. BERT Và Transformer Variants

BERT tạo contextual embeddings, tức là vector của một từ thay đổi theo ngữ cảnh. Bài báo đánh giá:

- **BERT**: mô hình transformer hai chiều, pre-trained trên lượng lớn văn bản.
- **RoBERTa**: biến thể tối ưu hóa của BERT, thường mạnh hơn trong nhiều bài toán NLP.
- **ALBERT**: biến thể nhỏ gọn và hiệu quả hơn BERT.

## 8. Thiết Lập Thí Nghiệm

Bài báo đánh giá hai cách gán nhãn:

### 8.1. 3-Class Setup

Rating được gom thành 3 nhóm:

| Rating gốc | Nhãn |
|---|---|
| 1, 2 | Negative |
| 3 | Neutral |
| 4, 5 | Positive |

Thiết lập này phù hợp khi hệ thống chỉ cần biết sentiment tổng quát.

### 8.2. 5-Class Setup

Giữ nguyên rating 1-5:

| Rating | Ý nghĩa |
|---|---|
| 1 | Extremely negative |
| 2 | Negative |
| 3 | Neutral |
| 4 | Positive |
| 5 | Extremely positive |

Thiết lập này chi tiết hơn nhưng khó hơn, vì mô hình phải phân biệt các mức gần nhau như 4 và 5 hoặc 1 và 2.

## 9. Các Mô Hình Được So Sánh

### 9.1. CNN

CNN được dùng để bắt các pattern cục bộ trong văn bản, ví dụ cụm từ thể hiện cảm xúc như "very good", "poor quality", "fits perfectly".

Điểm mạnh:

- Tốt trong việc nhận diện phrase hoặc n-gram quan trọng.
- Huấn luyện tương đối nhanh.

Điểm yếu:

- Không mạnh bằng RNN/Bi-LSTM trong việc nắm bắt chuỗi dài.

### 9.2. RNN

RNN xử lý dữ liệu tuần tự và giữ hidden state để ghi nhớ thông tin trước đó trong câu.

Điểm mạnh:

- Phù hợp với văn bản vì thứ tự từ có ý nghĩa.
- Kết quả trong bài báo rất tốt khi kết hợp với Word2Vec.

Điểm yếu:

- Có thể gặp vấn đề với chuỗi dài.

### 9.3. Bi-LSTM

Bi-LSTM đọc chuỗi theo cả hai hướng, từ trái sang phải và từ phải sang trái. Nhờ đó mô hình có thể hiểu cả ngữ cảnh trước và sau một từ.

Điểm mạnh:

- Mạnh hơn RNN thường trong nhiều bài toán NLP.
- Xử lý dependency dài tốt hơn.

Điểm yếu:

- Tốn tài nguyên hơn RNN/CNN.

### 9.4. BERT, ALBERT, RoBERTa

Nhóm transformer được kỳ vọng xử lý ngữ cảnh tốt hơn embedding truyền thống. Tuy nhiên trong thí nghiệm của bài báo, nhóm BERT variants không vượt qua ensemble deep learning truyền thống.

### 9.5. Ensemble Models

Bài báo kiểm tra các mô hình ensemble:

- CNN-RNN
- CNN-Bi-LSTM
- RNN-Bi-LSTM
- CNN-RNN-Bi-LSTM

Mục tiêu là kết hợp ưu điểm của nhiều kiến trúc: CNN bắt local features, RNN xử lý sequence, Bi-LSTM hiểu ngữ cảnh hai chiều.

### 9.6. Machine Learning Truyền Thống

Bài báo cũng so sánh với:

- Naive Bayes
- Support Vector Machine
- Logistic Regression
- Decision Tree
- Random Forest

Nhóm này cho kết quả thấp hơn đáng kể so với deep learning.

## 10. Thước Đo Đánh Giá

Bài báo sử dụng các metric:

| Metric | Ý nghĩa |
|---|---|
| Precision | Trong các dự đoán positive, bao nhiêu là đúng |
| Recall | Trong các mẫu positive thật, mô hình tìm được bao nhiêu |
| F-score | Trung bình điều hòa giữa precision và recall |
| Accuracy | Tỷ lệ dự đoán đúng tổng thể |
| AUC | Khả năng phân biệt giữa các lớp |

Vì dữ liệu review có thể mất cân bằng, F-score và AUC quan trọng hơn accuracy đơn thuần.

## 11. Kết Quả Thực Nghiệm

### 11.1. CNN, RNN, Bi-LSTM Với Word2Vec Và FastText

| Setup | Embedding | Model | Precision | Recall | F-score | Accuracy | AUC |
|---|---|---:|---:|---:|---:|---:|---:|
| 3-class | Word2Vec | CNN | 73.35 | 68.08 | 70.54 | 80.09 | 80.91 |
| 3-class | Word2Vec | RNN | 85.30 | 84.67 | 83.75 | 87.83 | 89.91 |
| 3-class | Word2Vec | Bi-LSTM | 76.23 | 76.75 | 75.67 | 83.22 | 85.72 |
| 3-class | FastText | CNN | 65.42 | 59.97 | 62.72 | 75.45 | 76.03 |
| 3-class | FastText | RNN | 77.89 | 74.15 | 74.76 | 81.53 | 84.17 |
| 3-class | FastText | Bi-LSTM | 67.48 | 67.85 | 66.96 | 77.99 | 80.54 |
| 5-class | Word2Vec | CNN | 83.65 | 78.53 | 80.73 | 90.99 | 85.17 |
| 5-class | Word2Vec | RNN | 88.87 | 90.77 | 89.78 | 94.85 | 93.75 |
| 5-class | Word2Vec | Bi-LSTM | 84.08 | 87.45 | 85.58 | 92.89 | 91.65 |
| 5-class | FastText | CNN | 76.07 | 68.39 | 71.45 | 87.61 | 78.19 |
| 5-class | FastText | RNN | 83.76 | 85.28 | 84.47 | 92.37 | 90.12 |
| 5-class | FastText | Bi-LSTM | 81.89 | 84.15 | 82.95 | 91.75 | 89.57 |

Nhận xét:

- Word2Vec tốt hơn FastText trong hầu hết cấu hình.
- RNN với Word2Vec là mô hình đơn có kết quả tốt nhất theo bảng số liệu.
- CNN là mô hình yếu hơn trong nhóm neural network đơn.
- Trong phần thảo luận, bài báo có đoạn nhắc Bi-LSTM nổi bật, nhưng số liệu trong bảng cho thấy RNN-Word2Vec đạt accuracy và F-score cao hơn Bi-LSTM.

### 11.2. BERT Variants

| Setup | Model | Precision | Recall | F-score | Accuracy | AUC |
|---|---|---:|---:|---:|---:|---:|
| 3-class | BERT | 57.14 | 53.39 | 53.08 | 73.57 | 80.46 |
| 3-class | ALBERT | 54.79 | 51.57 | 52.51 | 69.08 | 76.37 |
| 3-class | RoBERTa | 59.29 | 57.10 | 57.81 | 72.47 | 79.18 |
| 5-class | BERT | 71.38 | 70.91 | 71.30 | 86.66 | 86.33 |
| 5-class | ALBERT | 69.29 | 68.53 | 68.84 | 85.59 | 84.55 |
| 5-class | RoBERTa | 73.27 | 73.07 | 73.12 | 87.69 | 87.09 |

Nhận xét:

- RoBERTa tốt nhất trong nhóm BERT variants.
- ALBERT thấp nhất trong ba mô hình.
- BERT variants không vượt qua RNN-Word2Vec hoặc ensemble trong bài báo này.
- Kết quả phụ thuộc mạnh vào cách fine-tune, chất lượng dữ liệu và thiết lập huấn luyện.

### 11.3. Ensemble Models

| Model | Precision | Recall | F-score | Accuracy | AUC |
|---|---:|---:|---:|---:|---:|
| CNN-RNN | 90.9 | 87.8 | 90.7 | 94.9 | 96.3 |
| CNN-Bi-LSTM | 88.9 | 86.6 | 89.5 | 93.9 | 98.9 |
| RNN-Bi-LSTM | 90.9 | 91.7 | 87.7 | 95.7 | 98.7 |
| CNN-RNN-Bi-LSTM | 91.9 | 90.8 | 91.3 | 96.2 | 99.3 |

Nhận xét:

- Ensemble tốt hơn các mô hình đơn.
- Mô hình tốt nhất là **CNN-RNN-Bi-LSTM**.
- Accuracy cao nhất: **96.2%**.
- F-score cao nhất: **91.3%**.
- AUC cao nhất: **99.3%**.

Đây là kết luận thực nghiệm quan trọng nhất của bài báo: kết hợp nhiều mô hình deep learning có thể khai thác được nhiều loại đặc trưng văn bản hơn so với mô hình đơn.

### 11.4. Machine Learning Truyền Thống

| Model | Precision | Recall | F-score | Accuracy | AUC |
|---|---:|---:|---:|---:|---:|
| Naive Bayes | 43.76 | 38.40 | 39.90 | 66.15 | 62.12 |
| Support Vector Machine | 37.71 | 36.21 | 36.82 | 64.23 | 56.11 |
| Logistic Regression | 43.93 | 35.97 | 37.68 | 64.14 | 62.26 |
| Decision Tree | 43.88 | 30.27 | 30.84 | 66.30 | 60.20 |
| Random Forest | 46.15 | 26.27 | 24.80 | 55.02 | 59.17 |

Nhận xét:

- Machine learning truyền thống kém hơn deep learning rõ rệt.
- F-score thấp cho thấy mô hình truyền thống khó xử lý review text hiệu quả trong bài toán này.
- Bài báo kết luận deep learning phù hợp hơn cho sentiment rating prediction.

## 12. Kết Luận Chính Của Bài Báo

Các kết luận quan trọng:

1. Sentiment analysis từ review là nguồn tín hiệu có giá trị cho recommendation trong e-commerce.
2. Deep learning vượt trội so với machine learning truyền thống trong bài toán review sentiment/rating prediction.
3. Word2Vec hoạt động tốt hơn FastText trong thí nghiệm của bài báo, dù khác biệt không phải lúc nào cũng quá lớn.
4. RoBERTa là mô hình tốt nhất trong nhóm BERT, ALBERT, RoBERTa.
5. Ensemble model tốt hơn mô hình đơn.
6. CNN-RNN-Bi-LSTM là mô hình có kết quả tốt nhất toàn bài.
7. Bài toán 3-class thường dễ hơn và ổn định hơn khi triển khai thực tế, vì ranh giới giữa 1-2 và 4-5 không phải lúc nào cũng rõ.

## 13. Hạn Chế Của Bài Báo

Bài báo tự nêu một số hạn chế:

- Dataset chưa được lọc kỹ spam hoặc fraudulent reviews.
- Dữ liệu chỉ là tiếng Anh Mỹ, nên kết quả chưa chắc áp dụng tốt cho ngôn ngữ khác.
- Chưa xử lý sâu bài toán multilingual reviews.
- Chưa kết hợp lexicon-enhanced BERT hoặc lexicon-RNN.
- Chưa phân tích tỷ lệ polysemous words khi dùng BERT.
- Chưa kiểm nghiệm trên real-time production data.

Ngoài ra, có thể bổ sung một số nhận xét phê bình:

- Dataset chỉ thuộc domain thời trang nữ, nên khả năng generalize sang domain khác như sách cần được kiểm tra lại.
- Kết quả transformer thấp hơn kỳ vọng, có thể do cấu hình fine-tuning, preprocessing hoặc tài nguyên huấn luyện.
- Bài báo tập trung nhiều vào classification metrics, chưa trình bày sâu cách sentiment score được đưa vào thuật toán recommendation cuối cùng.
- Chưa đánh giá recommendation bằng các metric đặc thù như NDCG, MAP, Hit Rate hoặc conversion uplift.

## 14. Ý Nghĩa Đối Với Project Bookstore E-Commerce

Mặc dù dataset của bài báo là thời trang, tư tưởng chính có thể chuyển sang bookstore:

| Trong bài báo | Trong bookstore |
|---|---|
| Clothing product reviews | Book reviews |
| Rating 1-5 | Rating sách 1-5 |
| Recommended IND | Người dùng có khuyên đọc/mua sách hay không |
| Class Name, Department | Genre, author, publisher, category |
| Sentiment prediction | Phân tích cảm xúc review sách |
| Review-based recommendation | Gợi ý sách dựa trên rating, review, genre, hành vi |

Ứng dụng phù hợp cho bookstore:

1. **Phân loại sentiment review**
   - Negative, neutral, positive.
   - Có thể lưu thêm confidence score.

2. **Trích xuất insight theo sách**
   - Người đọc khen gì: nội dung, nhân vật, văn phong, giá trị học tập.
   - Người đọc chê gì: dịch thuật, chất lượng in, nội dung khó hiểu, giao hàng.

3. **Cải thiện recommendation**
   - Không chỉ recommend sách nhiều sao.
   - Ưu tiên sách có sentiment tích cực ổn định.
   - Giảm trọng số sách có nhiều review tiêu cực gần đây.

4. **Admin analytics**
   - Theo dõi sentiment theo thời gian.
   - Phát hiện sách có vấn đề chất lượng.
   - Phát hiện trend review tiêu cực hoặc bất thường.

5. **Kiểm soát spam/fraud**
   - Bài báo nêu đây là hạn chế.
   - Project có thể bổ sung spam detection để cải thiện độ tin cậy review.

## 15. Hướng Áp Dụng Thực Tế Khuyến Nghị

Với một project e-commerce production, không nhất thiết phải train lại CNN/RNN/BERT ngay từ đầu. Có thể áp dụng theo từng mức:

### Mức 1: Rule-Based + Rating

- Dùng rating và từ khóa sentiment.
- Phù hợp khi chưa có nhiều dữ liệu review.
- Dễ triển khai, chi phí thấp.

### Mức 2: LLM-Based Sentiment

- Dùng LLM để phân tích sentiment, aspect và summary.
- Phù hợp với tiếng Việt và dữ liệu nhỏ.
- Cần kiểm soát timeout, fallback, JSON parsing và chi phí API.

### Mức 3: Ensemble Production

- Kết hợp rating, rule-based sentiment, LLM sentiment và hành vi người dùng.
- Gần với tinh thần ensemble của bài báo.
- Có thể triển khai mà không cần GPU hoặc pipeline training phức tạp.

### Mức 4: Train Model Riêng

- Khi đã có đủ review thật.
- Có thể thử PhoBERT, multilingual BERT hoặc transformer tiếng Việt.
- Cần tập train/validation/test, metric rõ ràng và quy trình tái huấn luyện.

## 16. Điểm Cần Nhớ Khi Trích Dẫn Bài Báo

Các luận điểm có thể dùng trong báo cáo:

- Review text chứa nhiều tín hiệu hơn rating đơn thuần.
- Sentiment analysis giúp e-commerce hiểu khách hàng và cải thiện recommendation.
- Deep learning hiệu quả hơn machine learning truyền thống trong sentiment prediction.
- Ensemble CNN-RNN-Bi-LSTM đạt kết quả tốt nhất trong bài báo.
- 3-class sentiment là lựa chọn thực tế khi cần hệ thống ổn định và dễ giải thích.
- Spam/fraud review và multilingual data là các vấn đề cần xử lý khi đưa vào production.

## 17. Tóm Tắt Một Đoạn

Bài báo của Bellar, Baina và Ballafkih nghiên cứu việc dự đoán cảm xúc và rating từ review sản phẩm e-commerce để hỗ trợ hệ thống recommendation. Nhóm tác giả dùng dataset Women's Clothing E-Commerce Reviews, tiền xử lý văn bản, tạo embedding bằng Word2Vec, FastText và transformer variants, sau đó so sánh CNN, RNN, Bi-LSTM, BERT, ALBERT, RoBERTa, ensemble models và machine learning truyền thống. Kết quả cho thấy deep learning vượt trội so với machine learning truyền thống, Word2Vec hiệu quả hơn FastText trong nhiều cấu hình, RoBERTa tốt nhất trong nhóm transformer, và ensemble CNN-RNN-Bi-LSTM đạt kết quả cao nhất với accuracy 96.2%, F-score 91.3% và AUC 99.3%. Bài báo có giá trị làm nền tảng cho việc xây dựng sentiment-aware recommendation trong các hệ thống e-commerce như bookstore.
