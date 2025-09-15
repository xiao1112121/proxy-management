# 🔐 Hướng dẫn cấu hình Authentication

## 📋 Tổng quan
Ứng dụng đã được tích hợp hệ thống đăng nhập/đăng ký với:
- **NextAuth.js** cho authentication
- **Google OAuth** cho đăng nhập bằng Gmail
- **Credentials Provider** cho đăng ký tài khoản thông thường
- **Prisma + SQLite** cho database

## 🚀 Cài đặt

### 1. Cài đặt dependencies
```bash
npm install next-auth @next-auth/prisma-adapter prisma @prisma/client bcryptjs @types/bcryptjs
```

### 2. Cấu hình Environment Variables
Tạo file `.env.local` trong thư mục gốc:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Tùy chọn)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

### 3. Khởi tạo Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Cấu hình Google OAuth (Tùy chọn)

#### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google+ API

#### Bước 2: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (cho production)

#### Bước 3: Cập nhật Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id-from-step-2
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-2
```

## 🎯 Tính năng Authentication

### ✅ Đã hoàn thành
- [x] Đăng ký tài khoản với email/password
- [x] Đăng nhập với email/password
- [x] Đăng nhập với Google OAuth
- [x] Bảo vệ routes với middleware
- [x] User menu với thông tin người dùng
- [x] Trang chào mừng cho người dùng chưa đăng nhập
- [x] Database schema cho User và Proxy
- [x] Mã hóa mật khẩu với bcrypt
- [x] Session management

### 🔧 Cấu trúc Database
```sql
User {
  id: String (Primary Key)
  name: String?
  email: String (Unique)
  password: String? (Hashed)
  image: String?
  createdAt: DateTime
  updatedAt: DateTime
}

Proxy {
  id: Int (Primary Key)
  host: String
  port: Int
  username: String?
  password: String?
  type: String
  status: String
  userId: String (Foreign Key)
  // ... other fields
}
```

## 🚦 Cách sử dụng

### 1. Chạy ứng dụng
```bash
npm run dev
```

### 2. Truy cập ứng dụng
- **Chưa đăng nhập**: Hiển thị trang chào mừng với nút đăng ký/đăng nhập
- **Đã đăng nhập**: Hiển thị ứng dụng quản lý proxy đầy đủ

### 3. Đăng ký tài khoản
- Click **"Đăng ký miễn phí"** hoặc **"Đăng ký ngay"**
- Điền thông tin: Họ tên, Email, Mật khẩu
- Click **"Đăng ký tài khoản"**

### 4. Đăng nhập
- **Với email/password**: Điền email và mật khẩu
- **Với Google**: Click **"Đăng nhập với Google"**

### 5. Quản lý tài khoản
- Click vào avatar ở góc phải header
- Chọn **"Hồ sơ cá nhân"** hoặc **"Cài đặt"**
- Click **"Đăng xuất"** để thoát

## 🔒 Bảo mật

### ✅ Các biện pháp bảo mật đã áp dụng
- Mã hóa mật khẩu với bcrypt (12 rounds)
- JWT tokens cho session management
- Middleware bảo vệ routes
- Validation input đầy đủ
- SQL injection protection với Prisma
- CSRF protection với NextAuth

### 🛡️ Khuyến nghị bổ sung
- Sử dụng HTTPS trong production
- Cấu hình rate limiting
- Thêm 2FA (Two-Factor Authentication)
- Logging và monitoring
- Regular security updates

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. "NEXTAUTH_SECRET is not defined"
```bash
# Thêm vào .env.local
NEXTAUTH_SECRET=your-secret-key-here
```

#### 2. "Google OAuth error"
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Đảm bảo redirect URI đúng
- Kiểm tra Google Cloud Console settings

#### 3. "Database connection error"
```bash
# Khởi tạo lại database
npx prisma db push
```

#### 4. "Prisma client not generated"
```bash
npx prisma generate
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Xem file `.env.local` có đúng format
3. Chạy `npm run dev` để xem lỗi chi tiết
4. Kiểm tra database connection

---

**Lưu ý**: Đây là phiên bản development. Trong production, cần cấu hình thêm các biện pháp bảo mật và tối ưu hóa.
