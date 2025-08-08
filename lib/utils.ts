import { format, formatDistance, parseISO, isValid } from 'date-fns'

// Date formatting utilities
export function formatDate(date: Date | string, formatString: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'
  return format(dateObj, formatString)
}

export function formatDateTime(date: Date | string, formatString: string = 'MMM dd, yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'
  return format(dateObj, formatString)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// Tag filtering utilities
export function filterByTags<T extends { tags: string[] }>(items: T[], tags: string[]): T[] {
  if (tags.length === 0) return items
  return items.filter(item => tags.some(tag => item.tags.includes(tag)))
}

export function filterByStatus<T extends { status: string }>(items: T[], status: string): T[] {
  if (!status || status === 'all') return items
  return items.filter(item => item.status === status)
}

export function searchItems<T extends Record<string, any>>(
  items: T[], 
  searchTerm: string, 
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return items
  
  const term = searchTerm.toLowerCase()
  return items.filter(item => 
    searchFields.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(term)
    })
  )
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Array utilities
export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(items: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Color utilities
export function getStatusColor(status: string): string {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    todo: 'bg-gray-100 text-gray-800',
  }
  return colors[status as keyof typeof colors] || colors.inactive
}

export function getPriorityColor(priority: string): string {
  const colors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  }
  return colors[priority as keyof typeof colors] || colors.medium
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue || null
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing localStorage:', error)
  }
}

// API response utilities
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function isApiError(error: any): boolean {
  return error && (error.response || error.request || error.message)
}

// Pagination utilities
export function paginate<T>(items: T[], page: number, pageSize: number): {
  items: T[]
  totalPages: number
  currentPage: number
  totalItems: number
} {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = items.slice(startIndex, endIndex)
  
  return {
    items: paginatedItems,
    totalPages: Math.ceil(items.length / pageSize),
    currentPage: page,
    totalItems: items.length,
  }
}

// Generate random utilities
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Time utilities
export function getTimeAgo(date: Date | string): string {
  return formatRelativeTime(date)
}

export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
}

export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return format(dateObj, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
}

export function isThisWeek(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return dateObj >= weekAgo
}

export function isThisMonth(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear()
} 

// Client custom fields and notes management
export interface ClientCustomFields {
  aum?: string
  nextMeeting?: string
  notes?: string
  customFields?: Record<string, string>
  lastUpdated: string
}

const CLIENT_CUSTOM_FIELDS_KEY = 'glenn_dashboard_client_custom_fields'

// Get custom fields for a client
export function getClientCustomFields(clientId: string): ClientCustomFields | null {
  try {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(CLIENT_CUSTOM_FIELDS_KEY)
    if (!stored) return null
    
    const allFields = JSON.parse(stored)
    return allFields[clientId] || null
  } catch (error) {
    console.error('Error getting client custom fields:', error)
    return null
  }
}

// Save custom fields for a client
export function saveClientCustomFields(clientId: string, fields: Partial<ClientCustomFields>): void {
  try {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(CLIENT_CUSTOM_FIELDS_KEY)
    const allFields = stored ? JSON.parse(stored) : {}
    
    const existingFields = allFields[clientId] || {}
    const updatedFields = {
      ...existingFields,
      ...fields,
      lastUpdated: new Date().toISOString()
    }
    
    allFields[clientId] = updatedFields
    localStorage.setItem(CLIENT_CUSTOM_FIELDS_KEY, JSON.stringify(allFields))
  } catch (error) {
    console.error('Error saving client custom fields:', error)
  }
}

// Delete custom fields for a client
export function deleteClientCustomFields(clientId: string): void {
  try {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(CLIENT_CUSTOM_FIELDS_KEY)
    if (!stored) return
    
    const allFields = JSON.parse(stored)
    delete allFields[clientId]
    localStorage.setItem(CLIENT_CUSTOM_FIELDS_KEY, JSON.stringify(allFields))
  } catch (error) {
    console.error('Error deleting client custom fields:', error)
  }
}

// Get all custom fields for all clients
export function getAllClientCustomFields(): Record<string, ClientCustomFields> {
  try {
    if (typeof window === 'undefined') return {}
    
    const stored = localStorage.getItem(CLIENT_CUSTOM_FIELDS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error getting all client custom fields:', error)
    return {}
  }
}

// Format currency for AUM display
export function formatAUM(amount: string | number): string {
  if (!amount) return 'Not specified'
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'Invalid amount'
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`
  } else {
    return `$${num.toLocaleString()}`
  }
}

// Format date for display
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return 'Not scheduled'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `${date.toLocaleDateString()} (Past)`
    } else if (diffDays === 0) {
      return `${date.toLocaleDateString()} (Today)`
    } else if (diffDays === 1) {
      return `${date.toLocaleDateString()} (Tomorrow)`
    } else if (diffDays <= 7) {
      return `${date.toLocaleDateString()} (In ${diffDays} days)`
    } else {
      return date.toLocaleDateString()
    }
  } catch {
    return 'Invalid date'
  }
} 