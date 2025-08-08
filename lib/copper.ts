// lib/copper.ts
import axios from 'axios'

const copperApi = axios.create({
  baseURL: process.env.COPPER_BASE_URL || 'https://api.copper.com/developer_api/v1',
  headers: {
    'X-PW-AccessToken': process.env.COPPER_API_KEY!,
    'X-PW-Application': 'developer_api',
    'X-PW-UserEmail': process.env.COPPER_USER_EMAIL!,
    'Content-Type': 'application/json',
  },
})

// Types and interfaces
export interface CopperContact {
  id: number
  name: string
  emails: Array<{ email: string; category: string }>
  phone_numbers: Array<{ number: string; category: string }>
  company_name: string
  tags: string[]
  date_created: number
  date_modified: number
}

export interface CopperContactSummary {
  id: number
  name: string
  emails: Array<{ email: string; category: string }>
  phone_numbers: Array<{ number: string; category: string }>
  company_name: string
  tags: string[]
  date_created: number
  date_modified: number
}

export interface CopperCompanySummary {
  id: number
  name: string
  tags: string[]
  date_created: number
  date_modified: number
}

export interface CopperOpportunitySummary {
  id: number
  name: string
  tags: string[]
  date_created: number
  date_modified: number
}

export interface CopperActivitySummary {
  id: number
  type: string
  tags: string[]
  date_created: number
  date_modified: number
}

// Fetch all contacts with basic info
export async function getContacts(): Promise<CopperContact[]> {
  try {
    console.log('🔄 Fetching contacts using search endpoint...')
    
    // Use the /people/search endpoint with empty search to get all contacts
    // The person_filter_id parameter is not supported, so we'll get all contacts first
    const response = await copperApi.post('/people/search', {})
    
    console.log(`✅ Successfully fetched ${response.data.length} contacts`)
    
    if (response.data.length > 0) {
      console.log('📋 First contact sample:', {
        id: response.data[0].id,
        name: response.data[0].name,
        emails: response.data[0].emails?.length || 0
      })
    }
    
    return response.data
  } catch (error) {
    console.error('❌ Error fetching contacts from Copper:', error)
    
    // Fallback: try different endpoints if the search fails
    const endpoints = ['/people', '/contacts', '/v1/people', '/v2/people']
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying fallback endpoint: ${endpoint}`)
        const response = await copperApi.get(endpoint)
        console.log(`✅ Fallback successful at ${endpoint}:`, response.data.length, 'items')
        return response.data
      } catch (fallbackError) {
        console.log(`❌ Fallback endpoint ${endpoint} failed:`, (fallbackError as any).response?.status)
      }
    }
    
    // If all endpoints fail, return empty array
    console.log('❌ All endpoints failed, returning empty array')
    return []
  }
}

// Fallback functions with error handling
export async function getContactsWithFallback(): Promise<CopperContactSummary[]> {
  try {
    const contacts = await getContacts()
    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      emails: contact.emails,
      phone_numbers: contact.phone_numbers,
      company_name: contact.company_name,
      tags: contact.tags,
      date_created: contact.date_created,
      date_modified: contact.date_modified
    }))
  } catch (error) {
    console.error('Error in getContactsWithFallback:', error)
    return []
  }
}

export async function getCompaniesWithFallback(): Promise<CopperCompanySummary[]> {
  try {
    const response = await copperApi.get('/companies')
    return response.data.map((company: any) => ({
      id: company.id,
      name: company.name,
      tags: company.tags || [],
      date_created: company.date_created,
      date_modified: company.date_modified
    }))
  } catch (error) {
    console.error('Error in getCompaniesWithFallback:', error)
    return []
  }
}

export async function getOpportunitiesWithFallback(): Promise<CopperOpportunitySummary[]> {
  try {
    const response = await copperApi.get('/opportunities')
    return response.data.map((opportunity: any) => ({
      id: opportunity.id,
      name: opportunity.name,
      tags: opportunity.tags || [],
      date_created: opportunity.date_created,
      date_modified: opportunity.date_modified
    }))
  } catch (error) {
    console.error('Error in getOpportunitiesWithFallback:', error)
    return []
  }
}

export async function getActivitiesWithFallback(): Promise<CopperActivitySummary[]> {
  try {
    const response = await copperApi.get('/activities')
    return response.data.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      tags: activity.tags || [],
      date_created: activity.date_created,
      date_modified: activity.date_modified
    }))
  } catch (error) {
    console.error('Error in getActivitiesWithFallback:', error)
    return []
  }
}

// Tag-related functions
export async function getAllTags(): Promise<string[]> {
  try {
    const contacts = await getContactsWithFallback()
    const allTags = new Set<string>()
    
    contacts.forEach(contact => {
      contact.tags.forEach(tag => allTags.add(tag))
    })
    
    return Array.from(allTags).sort()
  } catch (error) {
    console.error('Error in getAllTags:', error)
    return []
  }
}

export async function getContactCountByTag(): Promise<Record<string, number>> {
  try {
    const contacts = await getContactsWithFallback()
    const tagCounts: Record<string, number> = {}
    
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    return tagCounts
  } catch (error) {
    console.error('Error in getContactCountByTag:', error)
    return {}
  }
}

export async function getContactsByTag(tagName: string): Promise<CopperContactSummary[]> {
  try {
    const contacts = await getContactsWithFallback()
    return contacts.filter(contact => contact.tags.includes(tagName))
  } catch (error) {
    console.error('Error in getContactsByTag:', error)
    return []
  }
}

// Search functions
export async function searchContacts(query: string): Promise<CopperContactSummary[]> {
  try {
    if (!query.trim()) {
      return await getContactsWithFallback()
    }
    
    const response = await copperApi.post('/people/search', {
      query: query
    })
    
    return response.data.map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      emails: contact.emails,
      phone_numbers: contact.phone_numbers,
      company_name: contact.company_name,
      tags: contact.tags,
      date_created: contact.date_created,
      date_modified: contact.date_modified
    }))
  } catch (error) {
    console.error('Error in searchContacts:', error)
    return []
  }
}

// Utility functions for client management
export async function getClientCustomFields(clientId: number): Promise<any> {
  try {
    const response = await copperApi.get(`/people/${clientId}/custom_fields`)
    return response.data
  } catch (error) {
    console.error('Error in getClientCustomFields:', error)
    return {}
  }
}

export async function saveClientCustomFields(clientId: number, customFields: any): Promise<boolean> {
  try {
    await copperApi.put(`/people/${clientId}/custom_fields`, customFields)
    return true
  } catch (error) {
    console.error('Error in saveClientCustomFields:', error)
    return false
  }
}

export async function updateClientTags(clientId: number, tags: string[]): Promise<boolean> {
  try {
    await copperApi.put(`/people/${clientId}`, { tags })
    return true
  } catch (error) {
    console.error('Error in updateClientTags:', error)
    return false
  }
}