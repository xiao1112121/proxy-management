'use client'

import { useState } from 'react'
import { X, Upload, Download, FileText, Database, Globe, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface ImportProxyModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => void
}

export default function ImportProxyModal({ isOpen, onClose, onImport }: ImportProxyModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile)
      setSelectedFile(null)
      onClose()
    }
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Import Proxy từ File</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn file để import</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
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
                  {selectedFile ? selectedFile.name : 'Kéo thả file vào đây hoặc nhấn để chọn'}
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
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
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

          {/* File Info */}
          {selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">File đã chọn</h4>
                  <p className="text-sm text-green-800">
                    <strong>Tên file:</strong> {selectedFile.name}<br />
                    <strong>Kích thước:</strong> {(selectedFile.size / 1024).toFixed(2)} KB<br />
                    <strong>Loại:</strong> {selectedFile.type || 'Không xác định'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Proxy
          </button>
        </div>
      </div>
    </div>
  )
}
