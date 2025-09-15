# Hướng dẫn Refactor Kiến trúc Proxy Manager

## 🎯 Tổng quan

Dự án đã được refactor để có kiến trúc rõ ràng và dễ bảo trì hơn. Dưới đây là hướng dẫn sử dụng kiến trúc mới.

## 📁 Cấu trúc mới

### 1. Store Management (Zustand)
```
store/
└── proxyStore.ts          # Centralized state management
```

### 2. Components theo Domain
```
components/
├── core/                  # Core components
│   ├── ErrorBoundary/    # Error handling
│   ├── Layout/           # Layout components
│   └── Navigation/       # Navigation components
├── proxy/                # Proxy domain
│   ├── ProxyList/        # Proxy list management
│   ├── ProxyForm/        # Add/edit proxy forms
│   ├── ProxyTest/        # Proxy testing
│   └── ProxyStats/       # Proxy statistics
├── performance/          # Performance domain
│   ├── PerformanceDashboard/
│   ├── PerformanceMonitor/
│   └── PerformanceCharts/
├── monitoring/           # Health monitoring
│   ├── HealthDashboard/
│   ├── HealthMetrics/
│   └── HealthAlerts/
└── shared/              # Shared components
    ├── Button/
    ├── Modal/
    ├── Table/
    └── Form/
```

### 3. API & Validation
```
lib/
├── api-client.ts         # Centralized API client
├── validators.ts         # Zod validation schemas
└── i18n.ts              # Internationalization
```

## 🚀 Cách sử dụng

### 1. State Management

```typescript
import { useProxySelectors, useProxyActions } from '@/store/proxyStore'

function MyComponent() {
  // Selectors - chỉ đọc data
  const { proxies, selectedProxies, stats, isLoading, error } = useProxySelectors()
  
  // Actions - thao tác với data
  const { addProxy, updateProxy, deleteProxy, testProxy } = useProxyActions()
  
  // Sử dụng
  const handleAddProxy = (proxy) => {
    addProxy(proxy)
  }
}
```

### 2. API Client

```typescript
import { proxyApi, performanceApi } from '@/lib/api-client'

// Sử dụng API
const result = await proxyApi.add(proxyData)
if (result.success) {
  console.log('Proxy added:', result.data)
} else {
  console.error('Error:', result.error)
}
```

### 3. Validation

```typescript
import { validateProxy } from '@/lib/validators'

const result = validateProxy(proxyData)
if (result.success) {
  // Data hợp lệ
  console.log(result.data)
} else {
  // Hiển thị lỗi validation
  console.error(result.details)
}
```

### 4. Components mới

```typescript
import ProxyList from '@/components/proxy/ProxyList'
import PerformanceDashboard from '@/components/performance/PerformanceDashboard'
import { ErrorBoundary } from '@/components/core/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ProxyList
        onEdit={handleEdit}
        onTest={handleTest}
        onBulkDelete={handleBulkDelete}
      />
      <PerformanceDashboard />
    </ErrorBoundary>
  )
}
```

## 🔄 Migration từ code cũ

### 1. Thay thế Custom Hooks

**Trước:**
```typescript
const { proxies, addProxy, updateProxy } = useLazyProxyData()
```

**Sau:**
```typescript
const { proxies } = useProxySelectors()
const { addProxy, updateProxy } = useProxyActions()
```

### 2. Thay thế API calls

**Trước:**
```typescript
const response = await fetch('/api/test-proxy', {
  method: 'POST',
  body: JSON.stringify({ proxy })
})
```

**Sau:**
```typescript
const result = await proxyApi.test(proxy)
if (result.success) {
  // Handle success
}
```

### 3. Thay thế Components

**Trước:**
```typescript
import AdvancedProxyTable from '@/components/AdvancedProxyTable'
```

**Sau:**
```typescript
import ProxyList from '@/components/proxy/ProxyList'
```

## 📊 Lợi ích của kiến trúc mới

### 1. Maintainability
- ✅ Components được tổ chức theo domain
- ✅ Code dễ tìm kiếm và sửa đổi
- ✅ Tách biệt rõ ràng giữa các concerns

### 2. Performance
- ✅ State management tập trung với Zustand
- ✅ Chỉ re-render khi cần thiết
- ✅ Proper caching strategy

### 3. Developer Experience
- ✅ Type safety với TypeScript
- ✅ Error handling chuẩn
- ✅ Debugging dễ dàng hơn

### 4. Scalability
- ✅ Dễ dàng thêm tính năng mới
- ✅ Code reuse cao
- ✅ Testing dễ dàng

## 🛠️ Các bước tiếp theo

### 1. Hoàn thiện Migration
- [ ] Di chuyển tất cả components cũ vào cấu trúc mới
- [ ] Cập nhật tất cả imports
- [ ] Test toàn bộ chức năng

### 2. Cải thiện Performance
- [ ] Implement virtualization cho danh sách lớn
- [ ] Add proper caching
- [ ] Optimize re-renders

### 3. Thêm tính năng mới
- [ ] Real-time updates
- [ ] Advanced filtering
- [ ] Export/Import improvements

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Import errors**: Kiểm tra đường dẫn import
2. **Type errors**: Cập nhật types theo schema mới
3. **State not updating**: Sử dụng actions thay vì direct state manipulation

### Debug tips

1. Sử dụng Redux DevTools để debug Zustand store
2. Kiểm tra console logs cho API errors
3. Sử dụng React DevTools để debug components

## 📝 Ghi chú

- Kiến trúc mới tương thích ngược với code cũ
- Có thể chạy song song trong quá trình migration
- Tất cả tính năng cũ vẫn hoạt động bình thường

## 🤝 Đóng góp

Khi thêm tính năng mới:
1. Tạo component trong domain phù hợp
2. Sử dụng Zustand store cho state
3. Thêm validation với Zod
4. Viết tests cho component mới
