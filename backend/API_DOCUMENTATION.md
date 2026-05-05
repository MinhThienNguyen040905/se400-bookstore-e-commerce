# API Documentation - Module 2 (Storefront)

## 📚 Enhanced Book Search & Filter

### GET `/api/books`

Lấy danh sách sách với tính năng tìm kiếm, lọc và sắp xếp nâng cao.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `keyword` | string | Tìm kiếm theo tên sách | `?keyword=harry` |
| `min_price` | number | Giá tối thiểu | `?min_price=100000` |
| `max_price` | number | Giá tối đa | `?max_price=500000` |
| `genre` | string | Lọc theo thể loại (IDs hoặc tên, phân cách bằng dấu phẩy) | `?genre=1,2` hoặc `?genre=Fiction,Fantasy` |
| `rating` | number | Lọc sách có rating trung bình >= giá trị này (1-5) | `?rating=4` |
| `sort` | string | Sắp xếp kết quả | `price-asc`, `price-desc`, `newest`, `top-rated` |
| `page` | number | Trang hiện tại (default: 1) | `?page=2` |
| `limit` | number | Số sách mỗi trang (default: 20) | `?limit=10` |

**Example Requests:**

```bash
# Tìm sách có từ "harry", giá từ 100k-500k, thể loại Fantasy, rating >= 4
GET /api/books?keyword=harry&min_price=100000&max_price=500000&genre=Fantasy&rating=4&sort=top-rated&page=1&limit=10

# Lọc theo nhiều thể loại (IDs)
GET /api/books?genre=1,2,3&sort=newest

# Sách mới nhất
GET /api/books?sort=newest&limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách sách thành công",
  "data": {
    "books": [
      {
        "book_id": 1,
        "title": "Harry Potter and the Philosopher's Stone",
        "cover_image": "https://...",
        "price": 250000,
        "stock": 50,
        "avg_rating": 4.5,
        "publisher": "Bloomsbury",
        "authors": "J.K. Rowling",
        "genres": "Fantasy, Adventure"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

## ❤️ Wishlist Feature

### POST `/api/wishlist/toggle`

Thêm hoặc xóa sách khỏi danh sách yêu thích (Toggle).

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "book_id": 123
}
```

**Response (Added):**

```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "action": "added",
    "book_id": 123
  }
}
```

**Response (Removed):**

```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích",
  "data": {
    "action": "removed",
    "book_id": 123
  }
}
```

---

### GET `/api/wishlist`

Lấy danh sách yêu thích của người dùng.

**Authentication:** Required (Bearer Token)

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách yêu thích thành công",
  "data": [
    {
      "wishlist_id": 1,
      "added_at": "2025-12-20T10:30:00.000Z",
      "book": {
        "book_id": 123,
        "title": "Harry Potter and the Philosopher's Stone",
        "price": 250000,
        "cover_image": "https://...",
        "stock": 50,
        "authors": "J.K. Rowling"
      }
    }
  ]
}
```

---

## 🚀 Setup Instructions

### 1. Run Migration

Để tạo bảng `Wishlists` trong database:

```bash
cd backend
npx sequelize-cli db:migrate
```

### 2. Restart Server

```bash
npm start
```

---

## 🧪 Testing with Postman

### Test Enhanced Search

1. **Tìm kiếm cơ bản:**
   ```
   GET http://localhost:3000/api/books?keyword=harry
   ```

2. **Lọc theo giá và rating:**
   ```
   GET http://localhost:3000/api/books?min_price=100000&max_price=500000&rating=4
   ```

3. **Lọc theo thể loại và sắp xếp:**
   ```
   GET http://localhost:3000/api/books?genre=1,2&sort=top-rated&limit=10
   ```

### Test Wishlist

1. **Thêm sách vào wishlist:**
   ```
   POST http://localhost:3000/api/wishlist/toggle
   Authorization: Bearer <your_token>
   Content-Type: application/json
   
   {
     "book_id": 123
   }
   ```

2. **Xem danh sách wishlist:**
   ```
   GET http://localhost:3000/api/wishlist
   Authorization: Bearer <your_token>
   ```

3. **Xóa sách khỏi wishlist (call lại toggle):**
   ```
   POST http://localhost:3000/api/wishlist/toggle
   Authorization: Bearer <your_token>
   
   {
     "book_id": 123
   }
   ```

---

## 📝 Notes

- **Rating Filter:** Chỉ lọc sách có ít nhất 1 review. Sách chưa có review sẽ có `avg_rating = 0`.
- **Genre Filter:** Hỗ trợ cả genre IDs (số) và genre names (chữ).
- **Wishlist Toggle:** Một endpoint duy nhất để thêm/xóa, giúp Frontend dễ xử lý hơn.
- **Pagination:** Default là 20 sách/trang. Frontend có thể tùy chỉnh `limit`.

---

## ✅ Completed Features

- ✅ Enhanced search với keyword
- ✅ Price range filter (min_price, max_price)
- ✅ Genre filter (nhiều thể loại, hỗ trợ IDs hoặc tên)
- ✅ Rating filter (average rating aggregation từ Reviews)
- ✅ Multiple sort options (price-asc/desc, newest, top-rated)
- ✅ Pagination (page, limit)
- ✅ Wishlist Model & Associations
- ✅ Wishlist Toggle API (add/remove)
- ✅ Get Wishlist API
- ✅ Database Migration for Wishlists table
