import axios from 'axios'

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com/api'

const mailerliteApi = axios.create({
  baseURL: MAILERLITE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export interface MailerLiteSubscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed' | 'unconfirmed'
  source: string
  sent: number
  opened_count: number
  click_count: number
  open_rate: number
  click_rate: number
  ip_address: string
  subscribed_at: string
  unsubscribed_at?: string
  updated_at: string
  created_at: string
  fields: Record<string, any>
  groups: string[]
  opted_in_at: string
  optin_ip: string
}

export interface MailerLiteCampaign {
  id: string
  name: string
  type: 'regular' | 'ab' | 'rss'
  status: 'draft' | 'outbox' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  subject: string
  from_name: string
  from_email: string
  reply_to: string
  content: {
    html: string
    plain: string
  }
  send_time: string
  created_at: string
  updated_at: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  unsubscribed_count: number
  bounced_count: number
  complained_count: number
  opened_rate: number
  clicked_rate: number
  unsubscribed_rate: number
  bounced_rate: number
  complained_rate: number
}

export interface MailerLiteGroup {
  id: string
  name: string
  total: number
  active: number
  unsubscribed: number
  unconfirmed: number
  bounced: number
  junk: number
  created_at: string
  updated_at: string
}

export interface MailerLiteSegment {
  id: string
  name: string
  total: number
  created_at: string
  updated_at: string
  conditions: Array<{
    field: string
    operator: string
    value: string
  }>
}

export interface CreateCampaignData {
  name: string
  type: 'regular' | 'ab' | 'rss'
  subject: string
  from_name: string
  from_email: string
  reply_to: string
  content: {
    html: string
    plain: string
  }
  emails?: string[]
  groups?: string[]
  send_time?: string
}

export interface MailerLiteTemplate {
  id: string
  name: string
  subject: string
  content: {
    html: string
    plain: string
  }
  type: 'regular' | 'ab' | 'rss'
  status: 'draft' | 'outbox' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  created_at: string
  updated_at: string
  thumbnail_url?: string
  category?: string
  from_name?: string
  from_email?: string
  reply_to?: string
}

export interface MailerLiteCampaignStats {
  id: string
  name: string
  subject: string
  status: 'draft' | 'outbox' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  sent_at: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  unsubscribed_count: number
  bounced_count: number
  complained_count: number
  opened_rate: number
  clicked_rate: number
  unsubscribed_rate: number
  bounced_rate: number
  complained_rate: number
  created_at: string
  updated_at: string
}

// Get all subscribers
export async function getSubscribers(limit = 100, offset = 0): Promise<MailerLiteSubscriber[]> {
  try {
    const response = await mailerliteApi.get('/subscribers', {
      params: { limit, offset }
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching subscribers from MailerLite:', error)
    throw error
  }
}

// Get a single subscriber
export async function getSubscriber(id: string): Promise<MailerLiteSubscriber> {
  try {
    const response = await mailerliteApi.get(`/subscribers/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching subscriber ${id} from MailerLite:`, error)
    throw error
  }
}

// Create a new subscriber
export async function createSubscriber(email: string, fields?: Record<string, any>, groups?: string[]): Promise<MailerLiteSubscriber> {
  try {
    const response = await mailerliteApi.post('/subscribers', {
      email,
      fields,
      groups,
    })
    return response.data.data
  } catch (error) {
    console.error('Error creating subscriber in MailerLite:', error)
    throw error
  }
}

// Update a subscriber
export async function updateSubscriber(id: string, data: Partial<MailerLiteSubscriber>): Promise<MailerLiteSubscriber> {
  try {
    const response = await mailerliteApi.put(`/subscribers/${id}`, data)
    return response.data.data
  } catch (error) {
    console.error(`Error updating subscriber ${id} in MailerLite:`, error)
    throw error
  }
}

// Delete a subscriber
export async function deleteSubscriber(id: string): Promise<void> {
  try {
    await mailerliteApi.delete(`/subscribers/${id}`)
  } catch (error) {
    console.error(`Error deleting subscriber ${id} from MailerLite:`, error)
    throw error
  }
}

// Get all campaigns
export async function getCampaigns(limit = 100, offset = 0): Promise<MailerLiteCampaign[]> {
  try {
    const response = await mailerliteApi.get('/campaigns', {
      params: { limit, offset }
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching campaigns from MailerLite:', error)
    throw error
  }
}

// Get a single campaign
export async function getCampaign(id: string): Promise<MailerLiteCampaign> {
  try {
    const response = await mailerliteApi.get(`/campaigns/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching campaign ${id} from MailerLite:`, error)
    throw error
  }
}

// Create a new campaign
export async function createCampaign(campaignData: CreateCampaignData): Promise<MailerLiteCampaign> {
  try {
    console.log('Creating campaign with data:', JSON.stringify(campaignData, null, 2))
    const response = await mailerliteApi.post('/campaigns', campaignData)
    return response.data.data
  } catch (error) {
    console.error('Error creating campaign in MailerLite:', error)
    throw error
  }
}

// Update a campaign
export async function updateCampaign(id: string, campaignData: Partial<CreateCampaignData>): Promise<MailerLiteCampaign> {
  try {
    const response = await mailerliteApi.put(`/campaigns/${id}`, campaignData)
    return response.data.data
  } catch (error) {
    console.error(`Error updating campaign ${id} in MailerLite:`, error)
    throw error
  }
}

// Send a campaign
export async function sendCampaign(id: string): Promise<void> {
  try {
    await mailerliteApi.post(`/campaigns/${id}/send`)
  } catch (error) {
    console.error(`Error sending campaign ${id} in MailerLite:`, error)
    throw error
  }
}

// Schedule a campaign
export async function scheduleCampaign(id: string, sendTime: string): Promise<void> {
  try {
    await mailerliteApi.post(`/campaigns/${id}/schedule`, { send_time: sendTime })
  } catch (error) {
    console.error(`Error scheduling campaign ${id} in MailerLite:`, error)
    throw error
  }
}

// Get campaign analytics
export async function getCampaignAnalytics(id: string): Promise<any> {
  try {
    const response = await mailerliteApi.get(`/campaigns/${id}/reports`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching analytics for campaign ${id} from MailerLite:`, error)
    throw error
  }
}

// Get all groups
export async function getGroups(limit = 100, offset = 0): Promise<MailerLiteGroup[]> {
  try {
    const response = await mailerliteApi.get('/groups', {
      params: { limit, offset }
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching groups from MailerLite:', error)
    throw error
  }
}

// Get all segments
export async function getSegments(limit = 100, offset = 0): Promise<MailerLiteSegment[]> {
  try {
    const response = await mailerliteApi.get('/segments', {
      params: { limit, offset }
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching segments from MailerLite:', error)
    throw error
  }
}

// Get combined groups and segments for dropdown
export async function getGroupsAndSegments(): Promise<{
  groups: MailerLiteGroup[]
  segments: MailerLiteSegment[]
}> {
  try {
    const [groups, segments] = await Promise.all([
      getGroups(),
      getSegments()
    ])
    
    return { groups, segments }
  } catch (error) {
    console.error('Error fetching groups and segments from MailerLite:', error)
    throw error
  }
}

// Get subscriber count for a specific group
export async function getGroupSubscriberCount(groupId: string): Promise<number> {
  try {
    const group = await mailerliteApi.get(`/groups/${groupId}`)
    return group.data.data.total
  } catch (error) {
    console.error(`Error fetching subscriber count for group ${groupId}:`, error)
    return 0
  }
}

// Get subscriber count for a specific segment
export async function getSegmentSubscriberCount(segmentId: string): Promise<number> {
  try {
    const segment = await mailerliteApi.get(`/segments/${segmentId}`)
    return segment.data.data.total
  } catch (error) {
    console.error(`Error fetching subscriber count for segment ${segmentId}:`, error)
    return 0
  }
}

// Create a new group
export async function createGroup(name: string): Promise<MailerLiteGroup> {
  try {
    const response = await mailerliteApi.post('/groups', { name })
    return response.data.data
  } catch (error) {
    console.error('Error creating group in MailerLite:', error)
    throw error
  }
}

// Add subscriber to group
export async function addSubscriberToGroup(subscriberId: string, groupId: string): Promise<void> {
  try {
    await mailerliteApi.post(`/groups/${groupId}/subscribers`, {
      subscribers: [{ id: subscriberId }]
    })
  } catch (error) {
    console.error(`Error adding subscriber ${subscriberId} to group ${groupId} in MailerLite:`, error)
    throw error
  }
}

// Add multiple subscribers to group
export async function addSubscribersToGroup(subscriberIds: string[], groupId: string): Promise<void> {
  try {
    const subscribers = subscriberIds.map(id => ({ id }))
    await mailerliteApi.post(`/groups/${groupId}/subscribers`, {
      subscribers
    })
  } catch (error) {
    console.error(`Error adding subscribers to group ${groupId} in MailerLite:`, error)
    throw error
  }
}

// Add subscribers by email to group
export async function addSubscribersByEmailToGroup(emails: string[], groupId: string): Promise<void> {
  try {
    const subscribers = emails.map(email => ({ email }))
    await mailerliteApi.post(`/groups/${groupId}/subscribers`, {
      subscribers
    })
  } catch (error) {
    console.error(`Error adding subscribers by email to group ${groupId} in MailerLite:`, error)
    throw error
  }
}

// Sync Copper contacts to MailerLite group
export async function syncCopperContactsToGroup(
  contacts: Array<{ email: string; name?: string; fields?: Record<string, any> }>,
  groupName: string,
  groupId?: string
): Promise<{ groupId: string; addedCount: number; errors: string[] }> {
  try {
    let targetGroupId = groupId
    let addedCount = 0
    const errors: string[] = []

    // Create group if not provided
    if (!targetGroupId) {
      try {
        const newGroup = await createGroup(groupName)
        targetGroupId = newGroup.id
      } catch (error) {
        console.error('Error creating group:', error)
        throw new Error(`Failed to create group "${groupName}"`)
      }
    }

    // Add subscribers in batches (MailerLite has limits)
    const batchSize = 100
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      
      try {
        const subscribers = batch.map(contact => ({
          email: contact.email,
          fields: {
            name: contact.name || '',
            ...contact.fields
          }
        }))

        await mailerliteApi.post(`/groups/${targetGroupId}/subscribers`, {
          subscribers
        })

        addedCount += batch.length
      } catch (error) {
        console.error(`Error adding batch ${Math.floor(i / batchSize) + 1}:`, error)
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error}`)
      }
    }

    return {
      groupId: targetGroupId,
      addedCount,
      errors
    }
  } catch (error) {
    console.error('Error syncing Copper contacts to MailerLite:', error)
    throw error
  }
}

// Get or create group by name
export async function getOrCreateGroup(groupName: string): Promise<MailerLiteGroup> {
  try {
    // First try to find existing group
    const groups = await getGroups(1000) // Get more groups to search through
    const existingGroup = groups.find(group => 
      group.name.toLowerCase() === groupName.toLowerCase()
    )
    
    if (existingGroup) {
      return existingGroup
    }
    
    // Create new group if not found
    return await createGroup(groupName)
  } catch (error) {
    console.error('Error getting or creating group:', error)
    throw error
  }
}

// Remove subscriber from group
export async function removeSubscriberFromGroup(subscriberId: string, groupId: string): Promise<void> {
  try {
    await mailerliteApi.delete(`/groups/${groupId}/subscribers/${subscriberId}`)
  } catch (error) {
    console.error(`Error removing subscriber ${subscriberId} from group ${groupId} in MailerLite:`, error)
    throw error
  }
}

// Get all templates
export async function getTemplates(limit = 100, offset = 0): Promise<MailerLiteTemplate[]> {
  try {
    const response = await mailerliteApi.get('/templates', {
      params: { limit, offset }
    })
    
    // Transform the response to match our expected structure
    const templates = response.data.data?.map((template: any) => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: {
        html: template.html || template.content?.html || template.plain_text || '',
        plain: template.plain_text || template.content?.plain || ''
      },
      type: template.type || 'regular',
      status: template.status || 'draft',
      created_at: template.created_at,
      updated_at: template.updated_at,
      thumbnail_url: template.screenshot_url,
      category: template.category
    })) || []
    
    return templates
  } catch (error) {
    console.error('Error fetching templates from MailerLite:', error)
    throw error
  }
}

// Get a single template
export async function getTemplate(id: string): Promise<MailerLiteTemplate> {
  try {
    const response = await mailerliteApi.get(`/templates/${id}`)
    const template = response.data.data
    
    // Transform the response to match our expected structure
    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: {
        html: template.html || template.content?.html || template.plain_text || '',
        plain: template.plain_text || template.content?.plain || ''
      },
      type: template.type || 'regular',
      status: template.status || 'draft',
      created_at: template.created_at,
      updated_at: template.updated_at,
      thumbnail_url: template.screenshot_url,
      category: template.category
    }
  } catch (error) {
    console.error(`Error fetching template ${id} from MailerLite:`, error)
    throw error
  }
}

// Create campaign from template and send to groups
export async function createAndSendCampaignFromTemplate(
  templateId: string,
  campaignName: string,
  subject: string,
  groupIds: string[],
  segmentIds: string[] = [],
  sendTime?: string
): Promise<MailerLiteCampaign> {
  try {
    // First, get the template to use its content
    const template = await getTemplate(templateId)
    
    // Create the campaign data
    const campaignData: CreateCampaignData = {
      name: campaignName,
      type: 'regular',
      subject: subject,
      from_name: template.from_name || 'Glenn Financial Services',
      from_email: template.from_email || 'noreply@glennfinancial.com',
      reply_to: template.reply_to || 'support@glennfinancial.com',
      content: {
        html: template.content?.html || '',
        plain: template.content?.plain || ''
      },
      groups: groupIds,
      send_time: sendTime
    }

    // Create the campaign
    const campaign = await createCampaign(campaignData)

    // If send time is provided, schedule it; otherwise send immediately
    if (sendTime) {
      await scheduleCampaign(campaign.id, sendTime)
    } else {
      await sendCampaign(campaign.id)
    }

    return campaign
  } catch (error) {
    console.error('Error creating and sending campaign from template:', error)
    throw error
  }
}

// Create campaign with custom content and send to groups
export async function createAndSendCustomCampaign(
  campaignName: string,
  subject: string,
  htmlContent: string,
  plainContent: string,
  groupIds: string[],
  segmentIds: string[] = [],
  sendTime?: string,
  fromName?: string,
  fromEmail?: string,
  replyTo?: string
): Promise<MailerLiteCampaign> {
  try {
    const campaignData: CreateCampaignData = {
      name: campaignName,
      type: 'regular',
      subject: subject,
      from_name: fromName || 'Glenn Financial Services',
      from_email: fromEmail || 'noreply@glennfinancial.com',
      reply_to: replyTo || 'support@glennfinancial.com',
      content: {
        html: htmlContent,
        plain: plainContent
      },
      groups: groupIds,
      send_time: sendTime
    }

    // Create the campaign
    const campaign = await createCampaign(campaignData)

    // If send time is provided, schedule it; otherwise send immediately
    if (sendTime) {
      await scheduleCampaign(campaign.id, sendTime)
    } else {
      await sendCampaign(campaign.id)
    }

    return campaign
  } catch (error) {
    console.error('Error creating and sending custom campaign:', error)
    throw error
  }
}

// Get campaign statistics
export async function getCampaignStats(campaignId: string): Promise<any> {
  try {
    const response = await mailerliteApi.get(`/campaigns/${campaignId}/reports`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching campaign stats for ${campaignId}:`, error)
    throw error
  }
}

// Duplicate a template
export async function duplicateTemplate(templateId: string, newName: string): Promise<MailerLiteTemplate> {
  try {
    const response = await mailerliteApi.post(`/templates/${templateId}/duplicate`, {
      name: newName
    })
    return response.data.data
  } catch (error) {
    console.error(`Error duplicating template ${templateId}:`, error)
    throw error
  }
}

// Get recent campaigns with stats
export async function getRecentCampaignsWithStats(limit = 20): Promise<MailerLiteCampaignStats[]> {
  try {
    // Get recent campaigns
    const campaigns = await getCampaigns(limit)
    
    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const stats = await getCampaignStats(campaign.id)
          return {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            sent_at: campaign.send_time || '',
            recipients_count: campaign.recipients_count,
            opened_count: campaign.opened_count,
            clicked_count: campaign.clicked_count,
            unsubscribed_count: campaign.unsubscribed_count,
            bounced_count: campaign.bounced_count,
            complained_count: campaign.complained_count,
            opened_rate: campaign.opened_rate,
            clicked_rate: campaign.clicked_rate,
            unsubscribed_rate: campaign.unsubscribed_rate,
            bounced_rate: campaign.bounced_rate,
            complained_rate: campaign.complained_rate,
            created_at: campaign.created_at,
            updated_at: campaign.updated_at
          }
        } catch (error) {
          console.error(`Error fetching stats for campaign ${campaign.id}:`, error)
          // Return campaign without stats if stats fetch fails
          return {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            sent_at: campaign.send_time || '',
            recipients_count: campaign.recipients_count,
            opened_count: 0,
            clicked_count: 0,
            unsubscribed_count: 0,
            bounced_count: 0,
            complained_count: 0,
            opened_rate: 0,
            clicked_rate: 0,
            unsubscribed_rate: 0,
            bounced_rate: 0,
            complained_rate: 0,
            created_at: campaign.created_at,
            updated_at: campaign.updated_at
          }
        }
      })
    )
    
    return campaignsWithStats
  } catch (error) {
    console.error('Error fetching recent campaigns with stats:', error)
    throw error
  }
}

// Get campaign performance summary
export async function getCampaignPerformanceSummary(): Promise<{
  totalCampaigns: number
  totalSent: number
  averageOpenRate: number
  averageClickRate: number
  totalOpens: number
  totalClicks: number
  totalUnsubscribes: number
  totalBounces: number
}> {
  try {
    const campaigns = await getRecentCampaignsWithStats(100)
    
    const sentCampaigns = campaigns.filter(c => c.status === 'sent')
    const totalCampaigns = campaigns.length
    const totalSent = sentCampaigns.length
    
    if (totalSent === 0) {
      return {
        totalCampaigns,
        totalSent,
        averageOpenRate: 0,
        averageClickRate: 0,
        totalOpens: 0,
        totalClicks: 0,
        totalUnsubscribes: 0,
        totalBounces: 0
      }
    }
    
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.opened_count, 0)
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.clicked_count, 0)
    const totalUnsubscribes = sentCampaigns.reduce((sum, c) => sum + c.unsubscribed_count, 0)
    const totalBounces = sentCampaigns.reduce((sum, c) => sum + c.bounced_count, 0)
    
    const averageOpenRate = sentCampaigns.reduce((sum, c) => sum + c.opened_rate, 0) / totalSent
    const averageClickRate = sentCampaigns.reduce((sum, c) => sum + c.clicked_rate, 0) / totalSent
    
    return {
      totalCampaigns,
      totalSent,
      averageOpenRate,
      averageClickRate,
      totalOpens,
      totalClicks,
      totalUnsubscribes,
      totalBounces
    }
  } catch (error) {
    console.error('Error fetching campaign performance summary:', error)
    throw error
  }
}

// Mock data for development/testing
export const mockGroups: MailerLiteGroup[] = [
  {
    id: '1',
    name: 'Active Clients',
    total: 45,
    active: 42,
    unsubscribed: 2,
    unconfirmed: 1,
    bounced: 0,
    junk: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Prospects',
    total: 28,
    active: 25,
    unsubscribed: 3,
    unconfirmed: 0,
    bounced: 0,
    junk: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z',
  },
  {
    id: '3',
    name: 'Newsletter Subscribers',
    total: 1250,
    active: 1180,
    unsubscribed: 60,
    unconfirmed: 10,
    bounced: 0,
    junk: 0,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
  },
]

export const mockSegments: MailerLiteSegment[] = [
  {
    id: '1',
    name: 'High Value Clients',
    total: 12,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    conditions: [
      { field: 'aum', operator: 'greater_than', value: '500000' }
    ],
  },
  {
    id: '2',
    name: 'Retirement Planning Interest',
    total: 18,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z',
    conditions: [
      { field: 'interests', operator: 'contains', value: 'retirement' }
    ],
  },
  {
    id: '3',
    name: 'Recent Subscribers',
    total: 35,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
    conditions: [
      { field: 'subscribed_at', operator: 'after', value: '2024-01-01' }
    ],
  },
]

export const mockTemplates: MailerLiteTemplate[] = [
  {
    id: '1',
    name: 'Welcome Series - Day 1',
    subject: 'Welcome to Glenn Financial Services',
    content: {
      html: '<h1>Welcome!</h1><p>Thank you for choosing Glenn Financial Services...</p>',
      plain: 'Welcome! Thank you for choosing Glenn Financial Services...'
    },
    type: 'regular',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    category: 'Onboarding'
  },
  {
    id: '2',
    name: 'Monthly Newsletter Template',
    subject: 'Your Monthly Financial Update',
    content: {
      html: '<h1>Monthly Update</h1><p>Here\'s what\'s happening in the financial world...</p>',
      plain: 'Monthly Update: Here\'s what\'s happening in the financial world...'
    },
    type: 'regular',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z',
    category: 'Newsletter'
  },
  {
    id: '3',
    name: 'Market Update Alert',
    subject: 'Important Market Update',
    content: {
      html: '<h1>Market Update</h1><p>Recent market developments that may affect your portfolio...</p>',
      plain: 'Market Update: Recent market developments that may affect your portfolio...'
    },
    type: 'regular',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
    category: 'Updates'
  },
  {
    id: '4',
    name: 'Retirement Planning Guide',
    subject: 'Your Retirement Planning Roadmap',
    content: {
      html: '<h1>Retirement Planning</h1><p>Let\'s plan your retirement together...</p>',
      plain: 'Retirement Planning: Let\'s plan your retirement together...'
    },
    type: 'regular',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    category: 'Education'
  }
]

export const mockCampaignStats: MailerLiteCampaignStats[] = [
  {
    id: '1',
    name: 'Q4 Newsletter',
    subject: 'Q4 2023 Market Review & 2024 Outlook',
    status: 'sent',
    sent_at: '2024-01-15T10:00:00Z',
    recipients_count: 1250,
    opened_count: 856,
    clicked_count: 154,
    unsubscribed_count: 12,
    bounced_count: 8,
    complained_count: 2,
    opened_rate: 68.5,
    clicked_rate: 12.3,
    unsubscribed_rate: 0.96,
    bounced_rate: 0.64,
    complained_rate: 0.16,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'New Year Planning',
    subject: 'Financial Planning for 2024',
    status: 'sent',
    sent_at: '2024-01-08T14:30:00Z',
    recipients_count: 980,
    opened_count: 623,
    clicked_count: 89,
    unsubscribed_count: 8,
    bounced_count: 5,
    complained_count: 1,
    opened_rate: 63.6,
    clicked_rate: 9.1,
    unsubscribed_rate: 0.82,
    bounced_rate: 0.51,
    complained_rate: 0.10,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-08T14:30:00Z'
  },
  {
    id: '3',
    name: 'Market Update Alert',
    subject: 'Important Market Update - January 2024',
    status: 'sent',
    sent_at: '2024-01-22T09:15:00Z',
    recipients_count: 1450,
    opened_count: 1015,
    clicked_count: 203,
    unsubscribed_count: 15,
    bounced_count: 12,
    complained_count: 3,
    opened_rate: 70.0,
    clicked_rate: 14.0,
    unsubscribed_rate: 1.03,
    bounced_rate: 0.83,
    complained_rate: 0.21,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-22T09:15:00Z'
  },
  {
    id: '4',
    name: 'Retirement Planning Guide',
    subject: 'Your Retirement Planning Roadmap',
    status: 'sent',
    sent_at: '2024-01-12T16:45:00Z',
    recipients_count: 750,
    opened_count: 488,
    clicked_count: 67,
    unsubscribed_count: 6,
    bounced_count: 4,
    complained_count: 1,
    opened_rate: 65.1,
    clicked_rate: 8.9,
    unsubscribed_rate: 0.80,
    bounced_rate: 0.53,
    complained_rate: 0.13,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    name: 'Tax Season Reminder',
    subject: 'Tax Season 2024 - Important Deadlines',
    status: 'scheduled',
    sent_at: '',
    recipients_count: 1100,
    opened_count: 0,
    clicked_count: 0,
    unsubscribed_count: 0,
    bounced_count: 0,
    complained_count: 0,
    opened_rate: 0,
    clicked_rate: 0,
    unsubscribed_rate: 0,
    bounced_rate: 0,
    complained_rate: 0,
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  }
]

// Helper function to use mock data when API is not available
export async function getGroupsAndSegmentsWithFallback(): Promise<{
  groups: MailerLiteGroup[]
  segments: MailerLiteSegment[]
}> {
  try {
    // Try to fetch from real API first
    return await getGroupsAndSegments()
  } catch (error) {
    console.warn('Using mock data due to API error:', error)
    // Return mock data as fallback
    return {
      groups: mockGroups,
      segments: mockSegments,
    }
  }
} 

// Helper function to use mock data when API is not available
export async function getTemplatesWithFallback(): Promise<MailerLiteTemplate[]> {
  try {
    // Try to fetch from real API first
    return await getTemplates()
  } catch (error) {
    console.warn('Using mock templates due to API error:', error)
    // Return mock data as fallback
    return mockTemplates
  }
} 

// Helper function to use mock data when API is not available
export async function getRecentCampaignsWithStatsWithFallback(): Promise<MailerLiteCampaignStats[]> {
  try {
    // Try to fetch from real API first
    return await getRecentCampaignsWithStats()
  } catch (error) {
    console.warn('Using mock campaign stats due to API error:', error)
    // Return mock data as fallback
    return mockCampaignStats
  }
}

// Helper function to use mock data when API is not available
export async function getCampaignPerformanceSummaryWithFallback(): Promise<{
  totalCampaigns: number
  totalSent: number
  averageOpenRate: number
  averageClickRate: number
  totalOpens: number
  totalClicks: number
  totalUnsubscribes: number
  totalBounces: number
}> {
  try {
    // Try to fetch from real API first
    return await getCampaignPerformanceSummary()
  } catch (error) {
    console.warn('Using mock performance summary due to API error:', error)
    // Calculate from mock data
    const sentCampaigns = mockCampaignStats.filter(c => c.status === 'sent')
    const totalCampaigns = mockCampaignStats.length
    const totalSent = sentCampaigns.length
    
    if (totalSent === 0) {
      return {
        totalCampaigns,
        totalSent,
        averageOpenRate: 0,
        averageClickRate: 0,
        totalOpens: 0,
        totalClicks: 0,
        totalUnsubscribes: 0,
        totalBounces: 0
      }
    }
    
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.opened_count, 0)
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.clicked_count, 0)
    const totalUnsubscribes = sentCampaigns.reduce((sum, c) => sum + c.unsubscribed_count, 0)
    const totalBounces = sentCampaigns.reduce((sum, c) => sum + c.bounced_count, 0)
    
    const averageOpenRate = sentCampaigns.reduce((sum, c) => sum + c.opened_rate, 0) / totalSent
    const averageClickRate = sentCampaigns.reduce((sum, c) => sum + c.clicked_rate, 0) / totalSent
    
    return {
      totalCampaigns,
      totalSent,
      averageOpenRate,
      averageClickRate,
      totalOpens,
      totalClicks,
      totalUnsubscribes,
      totalBounces
    }
  }
} 