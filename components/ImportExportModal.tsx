'use client'

import { useState } from 'react'
import { X, Upload, Download, FileText, Database, Globe, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => void
  onExport: (format: string) => void
}

export default function ImportExportModal({ isOpen, onClose, onImport, onExport }: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState('json')

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile)
      setSelectedFile(null)
      onClose()
    }
  }

  const handleExport = () => {
    onExport(exportFormat)
    onClose()
  }

  const downloadTemplate = (format: string) => {
    let template = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'json':
        template = JSON.stringify([
          {
            host: "192.168.1.1",
            port: 8080,
            username: "user",
            password: "pass",
            type: "http",
            group: "work"
          },
          {
            host: "proxy.example.com",
            port: 3128,
            type: "socks5",
            group: "personal"
          }
        ], null, 2)
        filename = 'proxy-template.json'
        mimeType = 'application/json'
        break
      
      case 'csv':
        template = 'host,port,username,password,type,group\n192.168.1.1,8080,user,pass,http,work\nproxy.example.com,3128,,,socks5,personal'
        filename = 'proxy-template.csv'
        mimeType = 'text/csv'
        break
      
      default:
        template = `# Mẫu file proxy (mỗi dòng một proxy)
# Các định dạng được hỗ trợ:
# host:port
# host:port:username:password
# type://host:port
# type://username:password@host:port

# Ví dụ:
192.168.1.1:8080
proxy.example.com:3128:user:pass
socks5://192.168.1.1:1080
http://user:pass@proxy.example.com:8080`
        filename = 'proxy-template.txt'
        mimeType = 'text/plain'
    }

    const blob = new Blob([template], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nhập/Xuất Proxy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Nhập Proxy
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Xuất Proxy
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'import' ? (
            <div className="space-y-6">
              {/* File Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn file để nhập</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-900 mb-2">
                      {selectedFile ? selectedFile.name : 'Chọn file TXT, CSV hoặc JSON'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Hỗ trợ: TXT, CSV, JSON
                    </span>
                  </label>
                </div>
              </div>

              {/* Sample Files */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tải mẫu file</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadTemplate('txt')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    TXT
                  </button>
                  <button
                    onClick={() => downloadTemplate('csv')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    CSV
                  </button>
                  <button
                    onClick={() => downloadTemplate('json')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    JSON
                  </button>
                </div>
              </div>

              {/* Import Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Hướng dẫn import:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><strong>TXT:</strong> Mỗi dòng một proxy theo định dạng host:port:username:password</li>
                      <li><strong>CSV:</strong> File có header với các cột: host, port, username, password, type, group</li>
                      <li><strong>JSON:</strong> Mảng các object proxy với các thuộc tính cần thiết</li>
                      <li>Username và password là tùy chọn</li>
                      <li>Type mặc định là 'http' nếu không chỉ định</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={!selectedFile}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập Proxy
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Export Format Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn định dạng xuất</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">JSON</div>
                      <div className="text-sm text-gray-500">Định dạng JSON chuẩn</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">CSV</div>
                      <div className="text-sm text-gray-500">Bảng tính Excel</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="txt"
                      checked={exportFormat === 'txt'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">TXT</div>
                      <div className="text-sm text-gray-500">Văn bản thuần</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-1">Thông tin xuất file</h4>
                    <p className="text-sm text-green-800">
                      File sẽ chứa tất cả proxy hiện có với đầy đủ thông tin: host, port, username, password, type, group, status, ping, speed, và các thông tin khác.
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  className="btn btn-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Proxy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
