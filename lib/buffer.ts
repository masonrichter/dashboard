import axios from 'axios'

const BUFFER_ACCESS_TOKEN = process.env.NEXT_PUBLIC_BUFFER_ACCESS_TOKEN || process.env.BUFFER_ACCESS_TOKEN
const BUFFER_BASE_URL = 'https://api.bufferapp.com/1'

const bufferApi = axios.create({
  baseURL: BUFFER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${BUFFER_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

export interface BufferProfile {
  id: string
  service: string
  service_id: string
  service_username: string
  service_url: string
  avatar: string
  avatar_https: string
  team_id: string
  user_id: string
  disabled: boolean
  default: boolean
  schedule_time: string
  schedule_time_zone: string
  created_at: number
  updated_at: number
}

export interface BufferUpdate {
  id: string
  text: string
  profile_ids: string[]
  scheduled_at: number
  sent_at: number
  created_at: number
  updated_at: number
  status: 'pending' | 'sent' | 'failed'
  service_update_id: string
  media: {
    photo?: string
    video?: string
    thumbnail?: string
    description?: string
    link?: string
  }
  metadata: {
    via: string
    retweet_count: number
    favorite_count: number
    comment_count: number
    share_count: number
  }
}

export interface CreateUpdateData {
  text: string
  profile_ids: string[]
  scheduled_at?: number
  media?: {
    photo?: string
    video?: string
    thumbnail?: string
    description?: string
    link?: string
  }
}

export interface ScheduledPost {
  id: string
  text: string
  profile_ids: string[]
  scheduled_at: Date
  status: 'pending' | 'sent' | 'failed'
  media?: {
    photo?: string
    video?: string
    thumbnail?: string
    description?: string
    link?: string
  }
  created_at: Date
  updated_at: Date
}

// Enhanced error handling
export class BufferAPIError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message)
    this.name = 'BufferAPIError'
  }
}

// Check if Buffer API is configured
export function isBufferConfigured(): boolean {
  return !!BUFFER_ACCESS_TOKEN
}

// Get all profiles (social media accounts)
export async function getProfiles(): Promise<BufferProfile[]> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get('/profiles.json')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch profiles: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch profiles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get a single profile
export async function getProfile(id: string): Promise<BufferProfile> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get(`/profiles/${id}.json`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch profile ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch profile ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get updates for a profile (pending, sent, etc.)
export async function getUpdates(profileId?: string, count = 20, page = 1, status: 'pending' | 'sent' = 'pending'): Promise<BufferUpdate[]> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const params: any = { count, page }
    if (profileId) {
      params.profile_id = profileId
    }
    
    const endpoint = status === 'sent' ? '/updates/sent.json' : '/updates/pending.json'
    const response = await bufferApi.get(endpoint, { params })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch updates: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch updates: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get all scheduled posts
export async function getScheduledPosts(profileId?: string): Promise<ScheduledPost[]> {
  try {
    const updates = await getUpdates(profileId, 50, 1, 'pending')
    
    return updates.map(update => ({
      id: update.id,
      text: update.text,
      profile_ids: update.profile_ids,
      scheduled_at: new Date(update.scheduled_at * 1000),
      status: update.status,
      media: update.media,
      created_at: new Date(update.created_at * 1000),
      updated_at: new Date(update.updated_at * 1000),
    }))
  } catch (error) {
    if (error instanceof BufferAPIError) {
      throw error
    }
    throw new BufferAPIError(`Failed to fetch scheduled posts: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get a single update
export async function getUpdate(id: string): Promise<BufferUpdate> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get(`/updates/${id}.json`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch update ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch update ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Create a new update
export async function createUpdate(updateData: CreateUpdateData): Promise<BufferUpdate> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.post('/updates/create.json', updateData)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to create update: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to create update: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Update an existing update
export async function updateUpdate(id: string, updateData: Partial<CreateUpdateData>): Promise<BufferUpdate> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.post(`/updates/${id}/update.json`, updateData)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to update update ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to update update ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Delete an update
export async function deleteUpdate(id: string): Promise<void> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    await bufferApi.post(`/updates/${id}/destroy.json`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to delete update ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to delete update ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Share an update now
export async function shareUpdate(id: string): Promise<void> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    await bufferApi.post(`/updates/${id}/share.json`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to share update ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to share update ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Move an update to the top of the queue
export async function moveUpdateToTop(id: string): Promise<void> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    await bufferApi.post(`/updates/${id}/move_to_top.json`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to move update ${id} to top: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to move update ${id} to top: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get update interactions
export async function getUpdateInteractions(id: string): Promise<any> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get(`/updates/${id}/interactions.json`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch interactions for update ${id}: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch interactions for update ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get user info
export async function getUserInfo(): Promise<any> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get('/user.json')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch user info: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch user info: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get configuration
export async function getConfiguration(): Promise<any> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    const response = await bufferApi.get('/info/configuration.json')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new BufferAPIError(
        `Failed to fetch configuration: ${error.response?.data?.message || error.message}`,
        error.response?.status,
        error.response?.data
      )
    }
    throw new BufferAPIError(`Failed to fetch configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to schedule a post
export async function schedulePost(
  text: string, 
  profileIds: string[], 
  scheduledAt: Date,
  media?: {
    photo?: string
    video?: string
    thumbnail?: string
    description?: string
    link?: string
  }
): Promise<BufferUpdate> {
  const updateData: CreateUpdateData = {
    text,
    profile_ids: profileIds,
    scheduled_at: Math.floor(scheduledAt.getTime() / 1000), // Convert to Unix timestamp
    media,
  }
  
  return createUpdate(updateData)
}

// Helper function to post immediately
export async function postNow(
  text: string, 
  profileIds: string[],
  media?: {
    photo?: string
    video?: string
    thumbnail?: string
    description?: string
    link?: string
  }
): Promise<BufferUpdate> {
  const updateData: CreateUpdateData = {
    text,
    profile_ids: profileIds,
    media,
  }
  
  return createUpdate(updateData)
}

// Helper function to format platform names
export function getPlatformDisplayName(service: string): string {
  const platformMap: Record<string, string> = {
    'twitter': 'Twitter',
    'facebook': 'Facebook',
    'linkedin': 'LinkedIn',
    'instagram': 'Instagram',
    'pinterest': 'Pinterest',
    'google': 'Google+',
    'tumblr': 'Tumblr',
  }
  
  return platformMap[service.toLowerCase()] || service
}

// Helper function to get platform icon
export function getPlatformIcon(service: string): string {
  const iconMap: Record<string, string> = {
    'twitter': '🐦',
    'facebook': '📘',
    'linkedin': '💼',
    'instagram': '📷',
    'pinterest': '📌',
    'google': '🔍',
    'tumblr': '📝',
  }
  
  return iconMap[service.toLowerCase()] || '📱'
} 

// Get Buffer analytics summary for recent posts
export async function getBufferAnalyticsSummary(): Promise<{
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  averageEngagement: number
  recentPosts: Array<{
    id: string
    text: string
    platforms: string[]
    likes: number
    comments: number
    shares: number
    sent_at: Date
  }>
}> {
  try {
    if (!isBufferConfigured()) {
      throw new BufferAPIError('Buffer API not configured. Please set BUFFER_ACCESS_TOKEN environment variable.')
    }

    // Get recent sent posts
    const sentUpdates = await getUpdates(undefined, 20, 1, 'sent')
    
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    const recentPosts = []

    // Get interactions for each post
    for (const update of sentUpdates) {
      try {
        const interactions = await getUpdateInteractions(update.id)
        
        // Sum up interactions across all platforms
        const likes = interactions?.likes || 0
        const comments = interactions?.comments || 0
        const shares = interactions?.shares || 0
        
        totalLikes += likes
        totalComments += comments
        totalShares += shares
        
        recentPosts.push({
          id: update.id,
          text: update.text,
          platforms: update.profile_ids,
          likes,
          comments,
          shares,
          sent_at: new Date(update.sent_at * 1000)
        })
      } catch (error) {
        console.warn(`Failed to get interactions for post ${update.id}:`, error)
        // Continue with other posts even if one fails
      }
    }
    
    const totalPosts = sentUpdates.length
    const averageEngagement = totalPosts > 0 ? (totalLikes + totalComments + totalShares) / totalPosts : 0
    
    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagement,
      recentPosts
    }
  } catch (error) {
    if (error instanceof BufferAPIError) {
      throw error
    }
    throw new BufferAPIError(`Failed to get Buffer analytics summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Mock Buffer analytics for development/testing
export const mockBufferAnalytics = {
  totalPosts: 15,
  totalLikes: 342,
  totalComments: 89,
  totalShares: 156,
  averageEngagement: 39.1,
  recentPosts: [
    {
      id: '1',
      text: 'Excited to share our latest insights on retirement planning strategies! 💼📈 #FinancialPlanning #Retirement',
      platforms: ['linkedin', 'twitter'],
      likes: 45,
      comments: 12,
      shares: 23,
      sent_at: new Date('2024-01-25T10:00:00Z')
    },
    {
      id: '2',
      text: 'Market update: Key trends to watch in Q1 2024. Stay informed with our expert analysis. 📊',
      platforms: ['linkedin', 'facebook'],
      likes: 38,
      comments: 8,
      shares: 15,
      sent_at: new Date('2024-01-24T15:30:00Z')
    },
    {
      id: '3',
      text: 'Tax season is here! Don\'t miss our comprehensive guide to maximizing your returns. 📋💰',
      platforms: ['twitter', 'facebook'],
      likes: 52,
      comments: 18,
      shares: 31,
      sent_at: new Date('2024-01-23T12:00:00Z')
    }
  ]
}

// Helper function to use mock data when API is not available
export async function getBufferAnalyticsSummaryWithFallback(): Promise<{
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  averageEngagement: number
  recentPosts: Array<{
    id: string
    text: string
    platforms: string[]
    likes: number
    comments: number
    shares: number
    sent_at: Date
  }>
}> {
  try {
    // Try to fetch from real API first
    return await getBufferAnalyticsSummary()
  } catch (error) {
    console.warn('Using mock Buffer analytics due to API error:', error)
    // Return mock data as fallback
    return mockBufferAnalytics
  }
} 