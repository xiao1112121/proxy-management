<<<<<<< HEAD
# Proxy Manager - Ứng dụng quản lý và test proxy

Ứng dụng web chuyên nghiệp để quản lý và test proxy với giao diện thân thiện và tính năng đầy đủ.

## 🚀 Tính năng chính

### 📋 Quản lý Proxy
- **Thêm proxy đơn lẻ**: Hỗ trợ HTTP, HTTPS, SOCKS4, SOCKS5
- **Import hàng loạt**: Thêm nhiều proxy cùng lúc từ file text/CSV
- **Export dữ liệu**: Xuất danh sách proxy ra file JSON
- **Chỉnh sửa proxy**: Cập nhật thông tin proxy trực tiếp
- **Xóa proxy**: Loại bỏ proxy không cần thiết

### 🧪 Test Proxy
- **Test tự động**: Kiểm tra proxy hoạt động hay không
- **Đo tốc độ**: Tính toán thời gian phản hồi
- **Test đồng thời**: Kiểm tra nhiều proxy cùng lúc
- **Cài đặt linh hoạt**: Tùy chỉnh timeout, URL test, số lượng đồng thời
- **Kết quả chi tiết**: Hiển thị lỗi và thông tin test

### 📊 Thống kê và Báo cáo
- **Dashboard tổng quan**: Số liệu proxy hoạt động, không hoạt động
- **Biểu đồ phân bố**: Theo loại, trạng thái, nhóm, vị trí
- **Top proxy nhanh nhất**: Danh sách proxy có tốc độ cao
- **Phân tích hiệu suất**: Tỷ lệ thành công, tốc độ trung bình

### 🏷️ Phân loại và Nhóm
- **Nhóm proxy**: Tổ chức proxy theo nhóm tùy chỉnh
- **Lọc và tìm kiếm**: Tìm proxy theo host, vị trí, loại
- **Sắp xếp**: Sắp xếp theo tốc độ, trạng thái, thời gian test

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: LocalStorage (có thể nâng cấp lên database)

## 📦 Cài đặt

1. **Clone repository**:
```bash
git clone <repository-url>
cd proxy-manager
```

2. **Cài đặt dependencies**:
```bash
npm install
```

3. **Chạy ứng dụng**:
```bash
npm run dev
```

4. **Truy cập ứng dụng**:
Mở trình duyệt và truy cập `http://localhost:3000`

## 🎯 Hướng dẫn sử dụng

### Thêm Proxy
1. Chuyển đến tab "Thêm Proxy"
2. Chọn chế độ đơn lẻ hoặc hàng loạt
3. Nhập thông tin proxy (host, port, loại, username/password)
4. Click "Thêm Proxy"

### Test Proxy
1. Chuyển đến tab "Test Proxy"
2. Chọn proxy cần test (hoặc chọn tất cả)
3. Cấu hình cài đặt test (timeout, URL, số lượng đồng thời)
4. Click "Bắt đầu test"

### Xem Thống kê
1. Chuyển đến tab "Thống kê"
2. Xem các biểu đồ và số liệu tổng quan
3. Phân tích hiệu suất proxy

## 📁 Cấu trúc dự án

```
proxy-manager/
├── app/
│   ├── globals.css          # CSS toàn cục
│   ├── layout.tsx           # Layout chính
│   └── page.tsx             # Trang chủ
├── components/
│   ├── ProxyList.tsx        # Danh sách proxy
│   ├── ProxyForm.tsx        # Form thêm proxy
│   ├── ProxyTest.tsx        # Test proxy
│   └── ProxyStats.tsx       # Thống kê
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Cấu hình

### Cài đặt Test Proxy
- **Timeout**: Thời gian chờ tối đa (mặc định: 10s)
- **URL Test**: URL để test proxy (mặc định: https://httpbin.org/ip)
- **Số lượng đồng thời**: Số proxy test cùng lúc (mặc định: 5)

### Import/Export
- **Định dạng import**: `host:port:username:password` (mỗi dòng một proxy)
- **Định dạng export**: JSON với đầy đủ thông tin proxy

## 🚀 Tính năng nâng cao (có thể phát triển)

- [ ] Database thực (SQLite/PostgreSQL)
- [ ] API backend với Node.js/Express
- [ ] Xác thực người dùng
- [ ] Lưu trữ đám mây
- [ ] Test proxy theo lịch
- [ ] Thông báo khi proxy lỗi
- [ ] API để tích hợp với ứng dụng khác
- [ ] Docker containerization

## 📝 Ghi chú

- Dữ liệu hiện tại được lưu trong LocalStorage của trình duyệt
- Ứng dụng hoạt động hoàn toàn trên client-side
- Có thể mở rộng để sử dụng database thực và API backend

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request để cải thiện ứng dụng.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
=======
# proxy-management
proxy management 
>>>>>>> 9c33c06ba1155b33a11cca180bae76ff3084c340
