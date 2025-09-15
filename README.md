# 🚀 Proxy Manager - Ứng dụng quản lý proxy chuyên nghiệp

Ứng dụng web chuyên nghiệp để quản lý và test proxy với giao diện thân thiện và tính năng đầy đủ.

## ✨ Tính năng chính

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

### 🌐 Web Traffic Monitoring
- **Giám sát lưu lượng web**: Theo dõi traffic thực tế
- **Quản lý URL mục tiêu**: Thêm/xóa/sửa URLs
- **Tự động chọn proxy**: Hệ thống tự động chọn proxy nhanh nhất
- **Phân tích hiệu suất**: Thống kê chi tiết về traffic

### 🏥 Health Monitoring
- **Giám sát sức khỏe hệ thống**: Database, API, Proxy, Storage
- **Cảnh báo real-time**: Thông báo khi có vấn đề
- **Metrics chi tiết**: Thời gian phản hồi, tỷ lệ lỗi
- **Dashboard trực quan**: Biểu đồ và báo cáo real-time

### 🔄 Smart Proxy Rotation
- **Xoay vòng thông minh**: Tự động chuyển đổi proxy
- **Load balancing**: Phân tải đều giữa các proxy
- **Failover tự động**: Chuyển sang proxy khác khi lỗi
- **Tối ưu hiệu suất**: Chọn proxy tốt nhất cho từng request

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Advanced Storage Manager (hỗ trợ 100,000+ proxies)
- **Proxy Testing**: https-proxy-agent, socks-proxy-agent
- **Performance**: Virtual scrolling, lazy loading, caching

## 🚀 Cài đặt và chạy

```bash
# Clone repository
git clone https://github.com/xiao1112121/proxy-management.git
cd proxy-management

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm run dev
```

Truy cập ứng dụng tại `http://localhost:3000`

## 📊 Giao diện chính

### Dashboard & Thống kê
- Tổng quan thống kê proxy
- Biểu đồ phân bố theo loại, trạng thái
- Top proxy nhanh nhất
- Phân tích hiệu suất chi tiết

### Danh sách Proxy
- Quản lý proxy với bảng nâng cao
- Thao tác hàng loạt (test, xóa, cập nhật)
- Bộ lọc và tìm kiếm mạnh mẽ
- Virtual scrolling cho hiệu suất cao

### Web Traffic
- Giám sát lưu lượng web real-time
- Quản lý URL mục tiêu
- Tự động chọn proxy nhanh nhất
- Phân tích traffic chi tiết

### Giám sát Sức khỏe
- Health monitoring cho tất cả services
- Cảnh báo real-time
- Metrics và performance tracking
- Dashboard trực quan

### Hiệu suất
- Performance optimization
- Caching strategies
- Memory management
- Speed optimization

## 🔧 API Endpoints

- `POST /api/test-proxy` - Test proxy thật sự
- `POST /api/test-multiple-proxies` - Test nhiều proxy
- `POST /api/traffic-request` - Gửi traffic request
- `GET /api/health-monitoring` - Health check
- `GET /api/performance-metrics` - Performance metrics
- `POST /api/ai-analysis` - AI analysis

## 📁 Cấu trúc dự án

```
proxy-manager/
├── app/
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── core/                  # Core components
│   ├── performance/           # Performance components
│   ├── proxy/                 # Proxy-related components
│   └── ...                    # Other components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── store/                     # State management
├── utils/                     # Utility functions
└── types/                     # TypeScript types
```

## 🚀 Tính năng nâng cao

- ✅ **Hỗ trợ 100,000+ proxies** với virtual scrolling
- ✅ **Advanced Storage Manager** với compression
- ✅ **Real-time monitoring** và health checks
- ✅ **AI-powered analysis** và recommendations
- ✅ **Multi-language support** (Vietnamese/English)
- ✅ **Responsive design** cho mọi thiết bị
- ✅ **Performance optimization** với caching
- ✅ **Error boundaries** và loading states
- ✅ **Keyboard shortcuts** và accessibility
- ✅ **Export/Import** đa định dạng

## 📝 Ghi chú

- Dữ liệu được lưu trong Advanced Storage Manager
- Hỗ trợ tối đa 200,000 proxies với hiệu suất cao
- Giao diện hoàn toàn bằng tiếng Việt
- Sẵn sàng cho production deployment

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request để cải thiện ứng dụng.

## 📄 License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại

---

**Phát triển bởi**: [xiao1112121](https://github.com/xiao1112121)