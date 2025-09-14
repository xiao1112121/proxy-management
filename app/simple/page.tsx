'use client'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Proxy Manager - Trang Test
      </h1>
      <p className="text-gray-600 mb-4">
        Nếu bạn thấy trang này, Next.js đang hoạt động bình thường.
      </p>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Trạng thái:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ Next.js hoạt động</li>
          <li>✅ Tailwind CSS hoạt động</li>
          <li>✅ TypeScript hoạt động</li>
        </ul>
      </div>
    </div>
  )
}
