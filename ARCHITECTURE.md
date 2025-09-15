# Kiến trúc dự án Proxy Manager

## 📋 Tổng quan

Dự án Proxy Manager là một ứng dụng web quản lý và kiểm tra proxy được xây dựng với Next.js 14, TypeScript và Prisma. Ứng dụng cung cấp giao diện thân thiện để quản lý proxy, kiểm tra hiệu suất và theo dõi sức khỏe hệ thống.

## 🏗️ Kiến trúc hiện tại

### 1. Framework & Công nghệ

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite với Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

### 2. Cấu trúc thư mục

```
proxy-manager/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (12 endpoints)
│   │   ├── auth/          # Authentication APIs
│   │   ├── proxy-test/    # Proxy testing APIs
│   │   ├── health-monitoring/
│   │   └── performance-metrics/
│   ├── auth/              # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components (50+ files)
│   ├── ProxyList.tsx      # Main proxy list
│   ├── ProxyForm.tsx      # Add/edit proxy form
│   ├── ProxyTest.tsx      # Proxy testing
│   ├── PerformanceTab.tsx # Performance monitoring
│   └── ... (47 more components)
├── hooks/                 # Custom hooks (20+ files)
│   ├── useLazyProxyData.ts
│   ├── useOptimizedProxyList.ts
│   ├── usePerformanceMonitor.ts
│   └── ... (17 more hooks)
├── lib/                   # Utilities & configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── i18n.ts           # Internationalization
│   └── prisma.ts         # Prisma client
├── types/                 # TypeScript definitions
│   └── proxy.ts          # Proxy-related types
├── utils/                 # Helper functions (10+ files)
│   ├── importExport.ts   # Import/export utilities
│   ├── realProxyTest.ts  # Proxy testing logic
│   └── ... (8 more utilities)
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── dev.db           # SQLite database
└── public/               # Static assets
```

### 3. Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  proxies  Proxy[]
}

model Proxy {
  id          Int      @id @default(autoincrement())
  host        String
  port        Int
  username    String?
  password    String?
  type        String
  status      String   @default("pending")
  group       String?
  country     String?
  city        String?
  ping        Int?
  speed       Int?
  lastTested  DateTime?
  notes       String?
  failCount   Int      @default(0)
  successCount Int     @default(0)
  isSelected  Boolean  @default(false)
  userAgent   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([type])
}
```

## ⚠️ Vấn đề hiện tại

### 1. Tổ chức Components
- **Vấn đề**: Quá nhiều components trong 1 thư mục (50+ files)
- **Hậu quả**: Khó tìm kiếm, bảo trì và tái sử dụng
- **Ví dụ**: ProxyList, ProxyListSimple, ProxyListMinimal, ProxyListComplex...

### 2. State Management
- **Vấn đề**: Logic state rải rác trong nhiều custom hooks
- **Hậu quả**: Khó debug, inconsistent state, performance issues
- **Ví dụ**: useLazyProxyData, useOptimizedProxyList, useAdvancedCaching...

### 3. API Architecture
- **Vấn đề**: Không có error handling chuẩn, thiếu validation
- **Hậu quả**: API không ổn định, khó debug
- **Ví dụ**: Một số API không có try-catch, thiếu input validation

### 4. Performance
- **Vấn đề**: Quá nhiều re-renders, không có proper caching
- **Hậu quả**: Ứng dụng chậm với dataset lớn
- **Ví dụ**: Mỗi lần test proxy đều re-render toàn bộ list

## 🚀 Đề xuất cải thiện

### 1. Tổ chức lại Components (Domain-Driven Design)

```
components/
├── core/                  # Core components
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── Navigation/
│   │   ├── TabNavigation.tsx
│   │   └── Breadcrumb.tsx
│   └── ErrorBoundary/
│       └── ErrorBoundary.tsx
├── proxy/                 # Proxy domain
│   ├── ProxyList/
│   │   ├── index.tsx
│   │   ├── ProxyListItem.tsx
│   │   ├── ProxyListHeader.tsx
│   │   └── ProxyListFilters.tsx
│   ├── ProxyForm/
│   │   ├── index.tsx
│   │   ├── ProxyFormFields.tsx
│   │   └── ProxyFormValidation.tsx
│   ├── ProxyTest/
│   │   ├── index.tsx
│   │   ├── ProxyTestItem.tsx
│   │   └── ProxyTestResults.tsx
│   └── ProxyStats/
│       ├── index.tsx
│       └── ProxyStatsCharts.tsx
├── performance/           # Performance domain
│   ├── PerformanceDashboard/
│   ├── PerformanceMonitor/
│   └── PerformanceCharts/
├── monitoring/            # Health monitoring domain
│   ├── HealthDashboard/
│   ├── HealthMetrics/
│   └── HealthAlerts/
└── shared/               # Shared components
    ├── Button/
    ├── Modal/
    ├── Table/
    └── Form/
```

### 2. State Management với Zustand

```typescript
// store/proxyStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ProxyState {
  proxies: Proxy[]
  selectedProxies: number[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addProxy: (proxy: Omit<Proxy, 'id'>) => void
  updateProxy: (id: number, updates: Partial<Proxy>) => void
  deleteProxy: (id: number) => void
  selectProxy: (id: number, selected: boolean) => void
  testProxy: (id: number) => Promise<void>
  testAllProxies: () => Promise<void>
}

export const useProxyStore = create<ProxyState>()(
  devtools(
    persist(
      (set, get) => ({
        proxies: [],
        selectedProxies: [],
        isLoading: false,
        error: null,
        
        addProxy: (proxy) => {
          const newProxy = { ...proxy, id: Date.now() }
          set((state) => ({
            proxies: [...state.proxies, newProxy]
          }))
        },
        
        updateProxy: (id, updates) => {
          set((state) => ({
            proxies: state.proxies.map(p => 
              p.id === id ? { ...p, ...updates } : p
            )
          }))
        },
        
        // ... other actions
      }),
      {
        name: 'proxy-store',
        partialize: (state) => ({ proxies: state.proxies })
      }
    )
  )
)
```

### 3. API Architecture cải thiện

```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL = '/api'
  
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      if (!response.ok) {
        throw new ApiError(response.status, await response.text())
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// lib/validators.ts
import { z } from 'zod'

export const proxySchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535),
  username: z.string().optional(),
  password: z.string().optional(),
  type: z.enum(['http', 'https', 'socks4', 'socks5']),
})

// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { proxySchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = proxySchema.parse(body)
    
    // Process proxy creation
    const proxy = await createProxy(validatedData)
    
    return NextResponse.json({ success: true, data: proxy })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4. Performance Optimization

```typescript
// hooks/useVirtualizedList.ts
import { useVirtualizer } from '@tanstack/react-virtual'

export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number = 50
) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
  })
  
  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
  }
}

// components/ProxyList/VirtualizedProxyList.tsx
export function VirtualizedProxyList({ proxies }: { proxies: Proxy[] }) {
  const { parentRef, virtualItems } = useVirtualizedList(proxies)
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProxyListItem proxy={proxies[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 📊 Lợi ích của kiến trúc mới

### 1. Maintainability
- Components được tổ chức theo domain
- Code dễ tìm kiếm và sửa đổi
- Tách biệt rõ ràng giữa các concerns

### 2. Performance
- State management tập trung
- Virtualization cho danh sách lớn
- Proper caching strategy

### 3. Developer Experience
- Type safety với TypeScript
- Error handling chuẩn
- Debugging dễ dàng hơn

### 4. Scalability
- Dễ dàng thêm tính năng mới
- Code reuse cao
- Testing dễ dàng

## 🛠️ Kế hoạch triển khai

### Phase 1: Tổ chức lại Components (1-2 tuần)
1. Tạo cấu trúc thư mục mới
2. Di chuyển components theo domain
3. Update imports và exports

### Phase 2: State Management (1 tuần)
1. Implement Zustand store
2. Migrate từ custom hooks
3. Test state management

### Phase 3: API Improvements (1 tuần)
1. Thêm validation với Zod
2. Implement error handling chuẩn
3. Add logging và monitoring

### Phase 4: Performance Optimization (1-2 tuần)
1. Implement virtualization
2. Add proper caching
3. Optimize re-renders

## 📝 Kết luận

Dự án Proxy Manager hiện tại có kiến trúc cơ bản nhưng cần được cải thiện để đạt được:
- **Maintainability**: Code dễ bảo trì và mở rộng
- **Performance**: Xử lý tốt với dataset lớn
- **Developer Experience**: Dễ phát triển và debug
- **Scalability**: Có thể mở rộng trong tương lai

Việc refactor kiến trúc sẽ giúp dự án trở nên chuyên nghiệp và dễ bảo trì hơn.
