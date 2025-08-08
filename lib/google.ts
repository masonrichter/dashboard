import axios from 'axios'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
  created: string
  updated: string
  status: string
}

export interface CreateEventData {
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
}

// Google OAuth functions
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets',
    access_type: 'offline',
    prompt: 'consent',
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<any> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    })
    
    return response.data
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    throw error
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<any> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    })
    
    return response.data
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw error
  }
}

// Google Calendar API functions
export async function getCalendarEvents(
  accessToken: string, 
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 10
): Promise<GoogleCalendarEvent[]> {
  try {
    const params: any = {
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    }
    
    if (timeMin) params.timeMin = timeMin
    if (timeMax) params.timeMax = timeMax
    
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params,
      }
    )
    
    return response.data.items
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    throw error
  }
}

export async function createCalendarEvent(
  accessToken: string,
  eventData: CreateEventData,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  try {
    const response = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      eventData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  eventData: Partial<CreateEventData>,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  try {
    const response = await axios.put(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      eventData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  try {
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

export async function getCalendarList(accessToken: string): Promise<any[]> {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    return response.data.items
  } catch (error) {
    console.error('Error fetching calendar list:', error)
    throw error
  }
}

// Google Sheets API functions
export async function readSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    return response.data.values || []
  } catch (error) {
    console.error('Error reading sheet:', error)
    throw error
  }
}

export async function writeSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  try {
    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        values,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          valueInputOption: 'RAW',
        },
      }
    )
  } catch (error) {
    console.error('Error writing to sheet:', error)
    throw error
  }
}

export async function appendToSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  try {
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`,
      {
        values,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
        },
      }
    )
  } catch (error) {
    console.error('Error appending to sheet:', error)
    throw error
  }
}

export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<any> {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error fetching spreadsheet metadata:', error)
    throw error
  }
}

// Client data management with Google Sheets
export interface ClientData {
  id: string
  name: string
  email: string
  company?: string
  aum?: string
  nextMeeting?: string
  notes?: string
  customFields?: Record<string, string>
  lastUpdated: string
  tags: string[]
}

// Find client row in Google Sheet
export async function findClientRow(
  accessToken: string,
  spreadsheetId: string,
  clientId: string
): Promise<number | null> {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clients!A:A`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    const values = response.data.values || []
    const rowIndex = values.findIndex((row: any[]) => row[0] === clientId)
    
    return rowIndex >= 0 ? rowIndex + 1 : null // +1 because sheets are 1-indexed
  } catch (error) {
    console.error('Error finding client row:', error)
    throw error
  }
}

// Read client data from Google Sheet
export async function readClientData(
  accessToken: string,
  spreadsheetId: string,
  clientId: string
): Promise<ClientData | null> {
  try {
    const rowIndex = await findClientRow(accessToken, spreadsheetId, clientId)
    if (!rowIndex) return null
    
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clients!A${rowIndex}:Z${rowIndex}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    const values = response.data.values?.[0] || []
    if (values.length < 4) return null
    
    return {
      id: values[0] || '',
      name: values[1] || '',
      email: values[2] || '',
      company: values[3] || '',
      aum: values[4] || '',
      nextMeeting: values[5] || '',
      notes: values[6] || '',
      customFields: values[7] ? JSON.parse(values[7]) : {},
      lastUpdated: values[8] || new Date().toISOString(),
      tags: values[9] ? values[9].split(',').map((tag: string) => tag.trim()) : []
    }
  } catch (error) {
    console.error('Error reading client data:', error)
    throw error
  }
}

// Update client data in Google Sheet
export async function updateClientData(
  accessToken: string,
  spreadsheetId: string,
  clientData: Partial<ClientData>
): Promise<void> {
  try {
    if (!clientData.id) {
      throw new Error('Client ID is required for update')
    }
    
    const rowIndex = await findClientRow(accessToken, spreadsheetId, clientData.id)
    if (!rowIndex) {
      throw new Error('Client not found in sheet')
    }
    
    // Prepare the update data
    const updateData = [
      clientData.id || '',
      clientData.name || '',
      clientData.email || '',
      clientData.company || '',
      clientData.aum || '',
      clientData.nextMeeting || '',
      clientData.notes || '',
      clientData.customFields ? JSON.stringify(clientData.customFields) : '',
      new Date().toISOString(),
      clientData.tags ? clientData.tags.join(', ') : ''
    ]
    
    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clients!A${rowIndex}:J${rowIndex}`,
      {
        values: [updateData]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          valueInputOption: 'RAW',
        },
      }
    )
  } catch (error) {
    console.error('Error updating client data:', error)
    throw error
  }
}

// Add new client to Google Sheet
export async function addClientToSheet(
  accessToken: string,
  spreadsheetId: string,
  clientData: Omit<ClientData, 'lastUpdated'>
): Promise<void> {
  try {
    const newRowData = [
      clientData.id,
      clientData.name,
      clientData.email,
      clientData.company || '',
      clientData.aum || '',
      clientData.nextMeeting || '',
      clientData.notes || '',
      clientData.customFields ? JSON.stringify(clientData.customFields) : '',
      new Date().toISOString(),
      clientData.tags ? clientData.tags.join(', ') : ''
    ]
    
    await appendToSheet(accessToken, spreadsheetId, 'Clients!A:J', [newRowData])
  } catch (error) {
    console.error('Error adding client to sheet:', error)
    throw error
  }
}

// Get all clients from Google Sheet
export async function getAllClientsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<ClientData[]> {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clients!A2:J`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    const values = response.data.values || []
    return values.map((row: any[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      company: row[3] || '',
      aum: row[4] || '',
      nextMeeting: row[5] || '',
      notes: row[6] || '',
      customFields: row[7] ? JSON.parse(row[7]) : {},
      lastUpdated: row[8] || new Date().toISOString(),
      tags: row[9] ? row[9].split(',').map((tag: string) => tag.trim()) : []
    }))
  } catch (error) {
    console.error('Error getting all clients from sheet:', error)
    throw error
  }
}

// Create or update Google Sheet headers
export async function initializeClientSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<void> {
  try {
    const headers = [
      'Client ID',
      'Name',
      'Email',
      'Company',
      'AUM',
      'Next Meeting',
      'Notes',
      'Custom Fields',
      'Last Updated',
      'Tags'
    ]
    
    await writeSheet(accessToken, spreadsheetId, 'Clients!A1:J1', [headers])
  } catch (error) {
    console.error('Error initializing client sheet:', error)
    throw error
  }
}

// Gmail API Types and Interfaces
export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  historyId: string
  internalDate: string
  payload: {
    partId: string
    mimeType: string
    filename: string
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      attachmentId: string
      size: number
    }
    parts?: Array<{
      partId: string
      mimeType: string
      filename: string
      headers: Array<{
        name: string
        value: string
      }>
      body: {
        attachmentId?: string
        size: number
        data?: string
      }
    }>
  }
  sizeEstimate: number
  raw: string
}

export interface GmailMessageList {
  messages: Array<{
    id: string
    threadId: string
  }>
  nextPageToken?: string
  resultSizeEstimate: number
}

export interface EmailSummary {
  id: string
  subject: string
  sender: string
  senderEmail: string
  date: string
  snippet: string
  isRead: boolean
  hasAttachments: boolean
}

// Gmail API Functions
export async function getGmailMessages(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'in:inbox'
): Promise<GmailMessageList> {
  try {
    const response = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          maxResults,
          q: query,
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error fetching Gmail messages:', error)
    throw error
  }
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessage> {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          format: 'full',
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error fetching Gmail message:', error)
    throw error
  }
}

export async function getGmailMessagesWithDetails(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'in:inbox'
): Promise<EmailSummary[]> {
  try {
    // Get message list
    const messageList = await getGmailMessages(accessToken, maxResults, query)
    
    if (!messageList.messages || messageList.messages.length === 0) {
      return []
    }

    // Get detailed information for each message
    const messagePromises = messageList.messages.map(message => 
      getGmailMessage(accessToken, message.id)
    )
    
    const messages = await Promise.all(messagePromises)
    
    // Process and format the messages
    return messages.map(message => {
      const headers = message.payload.headers
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)'
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
      const date = headers.find(h => h.name === 'Date')?.value || ''
      
      // Extract email from "Name <email@domain.com>" format
      const emailMatch = from.match(/<(.+?)>/)
      const senderEmail = emailMatch ? emailMatch[1] : from
      const senderName = emailMatch ? from.replace(/<.+?>/, '').trim() : from
      
      // Check if message is read
      const isRead = !message.labelIds.includes('UNREAD')
      
      // Check for attachments
      const hasAttachments = message.payload.parts?.some(part => 
        part.filename && part.filename.length > 0
      ) || false
      
      return {
        id: message.id,
        subject,
        sender: senderName,
        senderEmail,
        date,
        snippet: message.snippet,
        isRead,
        hasAttachments
      }
    })
  } catch (error) {
    console.error('Error fetching Gmail messages with details:', error)
    throw error
  }
}

export async function markMessageAsRead(
  accessToken: string,
  messageId: string
): Promise<void> {
  try {
    await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        removeLabelIds: ['UNREAD']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw error
  }
}

export async function markMessageAsUnread(
  accessToken: string,
  messageId: string
): Promise<void> {
  try {
    await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        addLabelIds: ['UNREAD']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error marking message as unread:', error)
    throw error
  }
}

export async function deleteGmailMessage(
  accessToken: string,
  messageId: string
): Promise<void> {
  try {
    await axios.delete(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
  } catch (error) {
    console.error('Error deleting Gmail message:', error)
    throw error
  }
}

// Helper functions
export function formatDateTime(date: Date, timeZone: string = 'America/New_York'): string {
  return date.toISOString()
}

export function parseDateTime(dateTimeString: string): Date {
  return new Date(dateTimeString)
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

export function addHoursToDate(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000)
}

export function addDaysToDate(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 3600000)
} 

export interface TaskItem {
  id: string
  title: string
  description?: string
  dueDate: string
  dueTime?: string
  location?: string
  isCompleted: boolean
  calendarEventId: string
  calendarId: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  created: string
  updated: string
}

// Task management functions
export async function getUpcomingTasks(
  accessToken: string,
  calendarId: string = 'primary',
  maxResults: number = 20
): Promise<TaskItem[]> {
  try {
    const now = new Date()
    const timeMin = now.toISOString()
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    
    const events = await getCalendarEvents(accessToken, calendarId, timeMin, timeMax, maxResults)
    
    return events.map(event => ({
      id: `task-${event.id}`,
      title: event.summary || 'Untitled Task',
      description: event.description,
      dueDate: event.start.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : '',
      dueTime: event.start.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[1].substring(0, 5) : undefined,
      location: event.location,
      isCompleted: false, // Default to false, will be managed locally
      calendarEventId: event.id,
      calendarId: calendarId,
      attendees: event.attendees,
      created: event.created,
      updated: event.updated
    }))
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error)
    throw error
  }
}

export async function markTaskAsCompleted(
  accessToken: string,
  taskId: string,
  isCompleted: boolean,
  calendarId: string = 'primary'
): Promise<void> {
  try {
    // Extract the actual calendar event ID from the task ID
    const calendarEventId = taskId.replace('task-', '')
    
    // For now, we'll just update the event description to mark completion
    // In a real implementation, you might want to use a different approach
    const event = await getCalendarEvent(accessToken, calendarEventId, calendarId)
    
    const updatedDescription = isCompleted 
      ? `${event.description || ''}\n\n✅ Completed on ${new Date().toLocaleDateString()}`
      : (event.description || '').replace(/\n\n✅ Completed on .*$/, '')
    
    await updateCalendarEvent(accessToken, calendarEventId, {
      description: updatedDescription
    }, calendarId)
  } catch (error) {
    console.error('Error marking task as completed:', error)
    throw error
  }
}

export async function getCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    throw error
  }
}

export async function createTask(
  accessToken: string,
  taskData: {
    title: string
    description?: string
    dueDate: string
    dueTime?: string
    location?: string
  },
  calendarId: string = 'primary'
): Promise<TaskItem> {
  try {
    const startDateTime = taskData.dueTime 
      ? `${taskData.dueDate}T${taskData.dueTime}:00`
      : taskData.dueDate
    
    const endDateTime = taskData.dueTime 
      ? `${taskData.dueDate}T${taskData.dueTime}:00`
      : taskData.dueDate
    
    const eventData: CreateEventData = {
      summary: taskData.title,
      description: taskData.description,
      location: taskData.location,
      start: {
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
    
    const event = await createCalendarEvent(accessToken, eventData, calendarId)
    
    return {
      id: `task-${event.id}`,
      title: event.summary || 'Untitled Task',
      description: event.description,
      dueDate: event.start.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : '',
      dueTime: event.start.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[1].substring(0, 5) : undefined,
      location: event.location,
      isCompleted: false,
      calendarEventId: event.id,
      calendarId: calendarId,
      attendees: event.attendees,
      created: event.created,
      updated: event.updated
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
} 

// Calculate total AUM from client data
export async function calculateTotalAUM(
  accessToken: string,
  spreadsheetId: string
): Promise<{ totalAUM: number; clientCount: number; averageAUM: number }> {
  try {
    const clients = await getAllClientsFromSheet(accessToken, spreadsheetId)
    
    let totalAUM = 0
    let validAUMCount = 0
    
    clients.forEach(client => {
      if (client.aum) {
        // Parse AUM value - handle different formats like "$1,234,567" or "1234567"
        const aumString = client.aum.replace(/[$,]/g, '')
        const aumValue = parseFloat(aumString)
        
        if (!isNaN(aumValue)) {
          totalAUM += aumValue
          validAUMCount++
        }
      }
    })
    
    const averageAUM = validAUMCount > 0 ? totalAUM / validAUMCount : 0
    
    return {
      totalAUM,
      clientCount: clients.length,
      averageAUM
    }
  } catch (error) {
    console.error('Error calculating total AUM:', error)
    throw error
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
} 