# Hướng dẫn sử dụng hệ thống đa ngôn ngữ (i18n)

## Tổng quan

Ứng dụng Proxy Manager đã được việt hóa hoàn toàn với hệ thống đa ngôn ngữ hỗ trợ tiếng Việt và tiếng Anh.

## Cấu trúc hệ thống

### 1. File cấu hình i18n (`lib/i18n.ts`)

- Chứa tất cả các bản dịch cho cả tiếng Việt và tiếng Anh
- Được tổ chức theo các nhóm chức năng: common, navigation, dashboard, proxyList, filters, aiIntelligence, performance, forms, modals, messages

### 2. Hook sử dụng (`useLanguage`)

```typescript
import { useLanguage } from '@/lib/i18n'

function MyComponent() {
  const { t, language, setLanguage } = useLanguage()
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </div>
  )
}
```

### 3. Component chuyển đổi ngôn ngữ (`LanguageSwitcher`)

- Cho phép người dùng chuyển đổi giữa tiếng Việt và tiếng Anh
- Được tích hợp vào header của ứng dụng

## Cách sử dụng

### 1. Sử dụng hook useLanguage

```typescript
import { useLanguage } from '@/lib/i18n'

function MyComponent() {
  const { t } = useLanguage()
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  )
}
```

### 2. Sử dụng với tham số

```typescript
// Trong translations
importSuccess: 'Import thành công! Đã nhập {count} proxy.'

// Trong component
<p>{t('proxyList.importSuccess', { count: 5 })}</p>
// Kết quả: "Import thành công! Đã nhập 5 proxy."
```

### 3. Thêm bản dịch mới

1. Thêm key vào interface `TranslationKeys` trong `lib/i18n.ts`
2. Thêm bản dịch tiếng Việt vào object `translations.vi`
3. Thêm bản dịch tiếng Anh vào object `translations.en`

```typescript
// Thêm vào interface
interface TranslationKeys {
  common: {
    newKey: string
  }
}

// Thêm vào translations
vi: {
  common: {
    newKey: 'Bản dịch tiếng Việt'
  }
},
en: {
  common: {
    newKey: 'English translation'
  }
}
```

## Các nhóm bản dịch

### 1. `common` - Các từ/cụm từ chung
- loading, error, success, cancel, confirm, save, delete, edit, add, etc.

### 2. `navigation` - Điều hướng
- dashboard, proxyList, aiIntelligence, performance, etc.

### 3. `dashboard` - Trang chính
- title, description, totalProxies, aliveProxies, etc.

### 4. `proxyList` - Danh sách proxy
- title, addProxy, importProxy, exportProxy, testSelected, etc.

### 5. `filters` - Bộ lọc
- allStatuses, allTypes, advancedFilters, clearFilters, etc.

### 6. `aiIntelligence` - AI Intelligence
- title, description, overview, recommendations, predictions, etc.

### 7. `performance` - Hiệu suất
- title, description, systemPerformance, responseTime, etc.

### 8. `forms` - Form validation
- required, invalidFormat, hostRequired, portRequired, etc.

### 9. `modals` - Modal dialogs
- confirmAction, confirmDelete, confirmBulkDelete, etc.

### 10. `messages` - Thông báo
- welcome, successMessage, errorMessage, warningMessage, etc.

## Lưu ý

1. **Tất cả text hiển thị cho người dùng** phải sử dụng hệ thống i18n
2. **Không hardcode** text tiếng Việt hoặc tiếng Anh trong component
3. **Sử dụng key có ý nghĩa** và tổ chức theo nhóm chức năng
4. **Kiểm tra bản dịch** khi thêm tính năng mới
5. **Cập nhật cả 2 ngôn ngữ** khi thêm key mới

## Ví dụ hoàn chỉnh

```typescript
'use client'

import React from 'react'
import { useLanguage } from '@/lib/i18n'

export default function MyComponent() {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {t('dashboard.title')}
      </h1>
      
      <p className="text-gray-600">
        {t('dashboard.description')}
      </p>
      
      <div className="flex space-x-2">
        <button className="btn btn-primary">
          {t('common.save')}
        </button>
        <button className="btn btn-secondary">
          {t('common.cancel')}
        </button>
      </div>
      
      <div className="text-sm text-gray-500">
        {t('proxyList.showing', { 
          count: 10, 
          total: 100 
        })}
      </div>
    </div>
  )
}
```

## Kết luận

Hệ thống i18n đã được tích hợp hoàn toàn vào ứng dụng Proxy Manager, cho phép người dùng chuyển đổi giữa tiếng Việt và tiếng Anh một cách dễ dàng. Tất cả các component chính đã được việt hóa và sẵn sàng sử dụng.
