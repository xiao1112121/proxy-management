import { z } from 'zod'

// Proxy validation schema
export const proxySchema = z.object({
  host: z.string()
    .min(1, 'Host không được để trống')
    .max(255, 'Host không được quá 255 ký tự')
    .regex(/^[a-zA-Z0-9.-]+$/, 'Host không hợp lệ'),
  
  port: z.number()
    .int('Port phải là số nguyên')
    .min(1, 'Port phải lớn hơn 0')
    .max(65535, 'Port không được vượt quá 65535'),
  
  username: z.string()
    .max(255, 'Username không được quá 255 ký tự')
    .optional(),
  
  password: z.string()
    .max(255, 'Password không được quá 255 ký tự')
    .optional(),
  
  type: z.enum(['http', 'https', 'socks4', 'socks5']),
  
  group: z.string()
    .max(100, 'Nhóm không được quá 100 ký tự')
    .optional(),
  
  country: z.string()
    .max(100, 'Quốc gia không được quá 100 ký tự')
    .optional(),
  
  city: z.string()
    .max(100, 'Thành phố không được quá 100 ký tự')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Ghi chú không được quá 1000 ký tự')
    .optional(),
})

// Test settings validation
export const testSettingsSchema = z.object({
  timeout: z.number()
    .int('Timeout phải là số nguyên')
    .min(1000, 'Timeout tối thiểu là 1000ms')
    .max(60000, 'Timeout tối đa là 60000ms'),
  
  testUrl: z.string()
    .url('URL test không hợp lệ')
    .max(500, 'URL test không được quá 500 ký tự'),
  
  concurrent: z.number()
    .int('Số lượng đồng thời phải là số nguyên')
    .min(1, 'Số lượng đồng thời tối thiểu là 1')
    .max(50, 'Số lượng đồng thời tối đa là 50'),
  
  testAnonymity: z.boolean().optional(),
  testDnsLeak: z.boolean().optional(),
  testWebrtcLeak: z.boolean().optional(),
  
  customUserAgent: z.string()
    .max(500, 'User Agent không được quá 500 ký tự')
    .optional(),
})

// Bulk operations validation
export const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'update', 'test']),
  
  ids: z.array(z.number().int())
    .min(1, 'Phải chọn ít nhất 1 proxy')
    .max(1000, 'Không được chọn quá 1000 proxy'),
  
  updates: z.record(z.string(), z.any()).optional(),
})

// Import validation
export const importSchema = z.object({
  file: z.instanceof(File),
  format: z.enum(['txt', 'csv', 'json']),
  delimiter: z.string().max(10, 'Ký tự phân cách không được quá 10 ký tự').optional(),
})

// Export validation
export const exportSchema = z.object({
  ids: z.array(z.number().int()).optional(),
  format: z.enum(['json', 'csv', 'txt', 'xml']),
  includeCredentials: z.boolean().optional(),
  includeStats: z.boolean().optional(),
})

// Filter validation
export const filterSchema = z.object({
  status: z.enum(['all', 'alive', 'dead', 'pending', 'testing']).optional(),
  type: z.enum(['all', 'http', 'https', 'socks4', 'socks5']).optional(),
  country: z.string().max(100).optional(),
  group: z.string().max(100).optional(),
  minPing: z.number().int().min(0).optional(),
  maxPing: z.number().int().min(0).optional(),
  minSpeed: z.number().int().min(0).optional(),
  maxSpeed: z.number().int().min(0).optional(),
  search: z.string().max(255).optional(),
})

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

// Error response validation
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
  code: z.string().optional(),
})

// Success response validation
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
})

// Validation helper functions
export const validateProxy = (data: unknown) => {
  try {
    return { success: true, data: proxySchema.parse(data) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.issues 
      }
    }
    return { 
      success: false, 
      error: 'Unknown validation error' 
    }
  }
}

export const validateTestSettings = (data: unknown) => {
  try {
    return { success: true, data: testSettingsSchema.parse(data) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.issues 
      }
    }
    return { 
      success: false, 
      error: 'Unknown validation error' 
    }
  }
}

export const validateBulkOperation = (data: unknown) => {
  try {
    return { success: true, data: bulkOperationSchema.parse(data) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.issues 
      }
    }
    return { 
      success: false, 
      error: 'Unknown validation error' 
    }
  }
}

// Type exports
export type ProxyInput = z.infer<typeof proxySchema>
export type TestSettingsInput = z.infer<typeof testSettingsSchema>
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>
export type ImportInput = z.infer<typeof importSchema>
export type ExportInput = z.infer<typeof exportSchema>
export type FilterInput = z.infer<typeof filterSchema>
export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & { data?: T }
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse<T = any> = z.infer<typeof successResponseSchema> & { data: T }
