# Hướng dẫn cấu hình Authentication

## 1. Cài đặt Dependencies

Các dependencies đã được cài đặt:
- `bcryptjs` - Mã hóa mật khẩu
- `jsonwebtoken` - Tạo và xác thực JWT tokens
- `@types/bcryptjs` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

## 2. Cấu hình Environment Variables

Tạo file `.env.local` với nội dung:

```env
# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URL for OAuth redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 3. Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API
4. Tạo OAuth 2.0 credentials
5. Thêm authorized redirect URIs:
   - `http://localhost:3000/api/auth/google` (development)
   - `https://yourdomain.com/api/auth/google` (production)
6. Copy Client ID và Client Secret vào file `.env.local`

## 4. Các trang đã tạo

### Trang đăng nhập: `/login`
- Form đăng nhập với email/password
- Đăng nhập bằng Google
- Validation và error handling
- Responsive design

### Trang đăng ký: `/register`
- Form đăng ký với họ tên, email, password
- Xác nhận mật khẩu
- Đăng ký bằng Google
- Validation đầy đủ

### API Endpoints

#### POST `/api/auth/register`
- Đăng ký tài khoản mới
- Mã hóa mật khẩu với bcrypt
- Tạo JWT token
- Validation đầy đủ

#### POST `/api/auth/login`
- Đăng nhập với email/password
- Xác thực mật khẩu
- Tạo JWT token
- Error handling

#### GET `/api/auth/google`
- Xử lý Google OAuth flow
- Lấy thông tin user từ Google
- Tạo JWT token
- Redirect về trang chính

## 5. AuthContext

Context quản lý trạng thái đăng nhập:
- `user` - Thông tin user hiện tại
- `token` - JWT token
- `isLoading` - Trạng thái loading
- `login()` - Hàm đăng nhập
- `logout()` - Hàm đăng xuất
- `isAuthenticated` - Kiểm tra đã đăng nhập

## 6. Header Component

Header với:
- Logo và navigation
- User menu khi đã đăng nhập
- Nút đăng nhập/đăng ký khi chưa đăng nhập
- Dropdown menu với thông tin user
- Responsive design

## 7. Cách sử dụng

1. Truy cập `/login` để đăng nhập
2. Truy cập `/register` để đăng ký
3. Sử dụng `useAuth()` hook trong components
4. Kiểm tra `isAuthenticated` để bảo vệ routes

## 8. Lưu ý

- Hiện tại sử dụng mock database (array in-memory)
- Trong production cần kết nối database thật
- JWT secret phải được bảo mật
- Google OAuth cần cấu hình đúng redirect URIs