# 🚀 Hướng dẫn Deploy lên Netlify

## ✅ Đã chuẩn bị sẵn sàng

Ứng dụng đã được cấu hình để deploy lên Netlify với static export.

### 📁 Files đã tạo:
- `netlify.toml` - Cấu hình Netlify
- `public/_redirects` - Redirects cho routing
- `next.config.js` - Cấu hình static export
- Thư mục `out/` - Build output sẵn sàng

## 🚀 Các bước Deploy

### Phương pháp 1: Deploy từ GitHub (Khuyến nghị)

1. **Truy cập Netlify**: https://netlify.com
2. **Đăng nhập** bằng GitHub account
3. **Click "New site from Git"**
4. **Chọn GitHub** và authorize
5. **Chọn repository**: `xiao1112121/proxy-management`
6. **Cấu hình build**:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`
7. **Click "Deploy site"**

### Phương pháp 2: Deploy thủ công

1. **Cài đặt Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login vào Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy từ thư mục out**:
   ```bash
   netlify deploy --dir=out --prod
   ```

### Phương pháp 3: Drag & Drop

1. **Truy cập**: https://app.netlify.com/drop
2. **Kéo thả** thư mục `out/` vào trang web
3. **Chờ deploy** hoàn tất

## ⚙️ Cấu hình sau khi deploy

### 1. Custom Domain (Tùy chọn)
- Vào Site settings > Domain management
- Thêm custom domain nếu có

### 2. Environment Variables
- Vào Site settings > Environment variables
- Thêm các biến môi trường cần thiết

### 3. Build Settings
- Build command: `npm run build`
- Publish directory: `out`
- Node version: `18`

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Build failed**:
   - Kiểm tra Node version (cần 18+)
   - Kiểm tra package.json dependencies

2. **404 on refresh**:
   - Đã có `_redirects` file để xử lý

3. **API routes không hoạt động**:
   - Đã tạm thời disable API routes cho static export
   - Có thể enable lại sau khi setup serverless functions

## 📊 Monitoring

Sau khi deploy, bạn có thể:
- Xem analytics trong Netlify dashboard
- Monitor performance
- Xem logs và errors
- Cấu hình notifications

## 🔄 Auto Deploy

Khi enable auto deploy:
- Mỗi lần push code lên GitHub
- Netlify sẽ tự động build và deploy
- Có thể xem preview trước khi deploy production

## 📱 Mobile Optimization

Ứng dụng đã được tối ưu cho mobile:
- Responsive design
- Touch-friendly interface
- Fast loading
- Offline support (PWA ready)

## 🎯 Kết quả mong đợi

Sau khi deploy thành công:
- URL: `https://your-site-name.netlify.app`
- Tất cả tính năng hoạt động
- Performance tốt
- SEO friendly
- Mobile responsive

---

**Lưu ý**: API routes đã được tạm thời disable. Để enable lại, cần setup Netlify Functions hoặc chuyển sang Vercel.
