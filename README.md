# 📚 Bookstore Ecommerce - Fullstack Project

Dự án website thương mại điện tử kinh doanh sách, được xây dựng theo kiến trúc **Client-Server**. Hệ thống bao gồm đầy đủ các tính năng cho người dùng (tìm kiếm, đặt hàng, đánh giá, thanh toán online) và trang quản trị (Admin dashboard) để quản lý sách, đơn hàng và thống kê doanh thu.

## 🚀 Công Nghệ Sử Dụng

### Backend

* **Core:** Node.js, Express.js
* **Database:** MySQL, Sequelize ORM (có Migrations & Seeders).
* **Authentication:** JWT (Access Token + Refresh Token), Cookie (HttpOnly).
* **File Storage:** Cloudinary (lưu ảnh bìa sách, avatar).
* **Payment:** Tích hợp cổng thanh toán VNPAY (Sandbox), COD.
* **Email Service:** Nodemailer (Gửi OTP, xác nhận đơn hàng).
* **Automation:** Node-cron (Tự động cập nhật trạng thái đơn hàng).

### Frontend

* **Framework:** React (Vite).
* **Language:** TypeScript.
* **State Management:** Context API / Redux (tuỳ config).
* **Styling:** Tailwind CSS / CSS Modules.
* **Routing:** React Router DOM.
* **HTTP Client:** Axios (có Interceptors xử lý refresh token).

---

## ✨ Tính Năng Chính

### 👤 Người dùng (Customer)

* **Xác thực:** Đăng ký, Đăng nhập, Quên mật khẩu (OTP qua Email), Đăng xuất.
* **Tìm kiếm & Lọc:** Tìm kiếm theo từ khóa, lọc theo giá, thể loại, đánh giá, tác giả.
* **Sản phẩm:** Xem chi tiết sách, xem đánh giá/bình luận.
* **Giỏ hàng:** Thêm/sửa/xóa sản phẩm, đồng bộ giỏ hàng khi đăng nhập.
* **Thanh toán:**
* Thanh toán khi nhận hàng (COD).
* Thanh toán online qua ví VNPAY.
* Áp dụng mã giảm giá (Promo Code).


* **Cá nhân:** Quản lý Profile, đổi Avatar, xem lịch sử đơn hàng, xem trạng thái vận chuyển (Timeline).
* **Đánh giá:** Chỉ được đánh giá sách khi đã mua và đơn hàng thành công ("Verified Purchase").
* **Wishlist:** Lưu sách yêu thích.

### 🛠 Quản trị viên (Admin)

* **Thống kê (Dashboard):** Xem tổng doanh thu, số user, đơn hàng mới, biểu đồ doanh thu theo tháng.
* **Quản lý Sách:** CRUD (Thêm, sửa, xóa) sách, upload ảnh bìa.
* **Quản lý Danh mục:** Tác giả, Thể loại, Nhà xuất bản.
* **Quản lý Đơn hàng:** Cập nhật trạng thái, hủy đơn.
* **Quản lý Mã giảm giá:** Tạo mã coupon, set hạn sử dụng.

---

## 📂 Cấu Trúc Dự Án

```bash
bookstore-project/
├── backend/                # Mã nguồn Server (Node.js)
│   ├── certs/              # Chứa SSL Certificate (ca.pem) cho DB
│   ├── config/             # Cấu hình DB, VNPAY
│   ├── controllers/        # Logic xử lý chính (Books, Orders, Users...)
│   ├── middleware/         # Auth, Upload, Error Handling
│   ├── migrations/         # Database migrations (Sequelize)
│   ├── models/             # Định nghĩa Schema DB
│   ├── routes/             # Định tuyến API
│   ├── utils/              # Email sender, Scheduler
│   ├── server.js           # Entry point
│   └── .env                # Biến môi trường Backend
├── frontend/               # Mã nguồn Client (React)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Các trang (Home, Cart, Login...)
│   │   ├── services/       # Gọi API (Axios config)
│   │   └── ...
│   └── .env                # Biến môi trường Frontend
└── README.md

```

---

## ⚙️ Cài Đặt & Chạy Dự Án

### 1. Yêu cầu tiên quyết

* Node.js (v16 trở lên).
* MySQL Server (XAMPP, Docker hoặc Cloud Database như Aiven/Railway).
* Git.

### 2. Cài đặt Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend

```


2. Cài đặt các gói phụ thuộc:
```bash
npm install

```


3. **Cấu hình biến môi trường:**
   - Copy file `.env.example` thành `.env`:
     - **Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
     - **Linux/Mac:**
     ```bash
     cp .env.example .env
     ```
   - Mở file `.env` và điền các thông tin cấu hình thực tế của bạn (Database, JWT Secret, Cloudinary, Email, VNPAY...).
   - Hãy đảm bảo thêm .env vào .gitignore để không track nhầm thay đổi của .env.


4. **Khởi tạo Database:**
Chạy migration để tạo bảng trong MySQL:
```bash
npx sequelize-cli db:migrate

```


5. **Chạy Server:**
```bash
npm start
# Hoặc chế độ dev (tự restart khi sửa code)
npm run dev

```


Server sẽ chạy tại `http://localhost:3000`.

### 3. Cài đặt Frontend

1. Mở terminal mới, di chuyển vào thư mục frontend:
```bash
cd frontend

```


2. Cài đặt các gói phụ thuộc:
```bash
npm install

```


3. **Cấu hình biến môi trường:**
Tạo file `.env` (hoặc `.env.local`) trong thư mục `frontend/`:
```env
VITE_API_URL=http://localhost:3000/api

```


4. **Chạy Client:**
```bash
npm run dev

```


Truy cập website tại `http://localhost:5173`.

---

## 🧪 Tài Liệu API

Chi tiết về các endpoints xem tại file [API_DOCUMENTATION.md](https://www.google.com/search?q=./backend/API_DOCUMENTATION.md).

Một số API chính:

* `GET /api/books`: Lấy danh sách sách (Filter, Search, Sort).
* `POST /api/users/login`: Đăng nhập.
* `POST /api/payment/create_payment_url`: Tạo link thanh toán VNPAY.
* `POST /api/wishlist/toggle`: Thêm/Xóa wishlist.

---

## 📝 Lưu Ý Quan Trọng

1. **SSL Database:** Nếu bạn sử dụng database cloud (như Aiven trong code mẫu), hãy đảm bảo file `backend/certs/ca.pem` tồn tại và đúng đường dẫn trong `.env`.
2. **Order Scheduler:** Backend có chạy một cron job (`utils/orderScheduler.js`) mỗi giờ để tự động cập nhật trạng thái đơn hàng (Processing -> Shipped -> Delivered) nhằm mô phỏng quy trình thực tế.
3. **Bảo mật:** Không commit file `.env` lên Github công khai để tránh lộ Key.

---

## 🤝 Đóng Góp (Contributing)

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo Pull Request hoặc mở Issue để thảo luận.

---

