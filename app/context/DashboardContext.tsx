'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Action {
  type: string
  payload?: any
}

interface BufferPost {
  id: string
  text: string
  media: string | null
  scheduled_at: string
  profile_id: string
}

interface BufferProfile {
  id: string
  service: string
  avatar_url: string
  service_username: string
}

interface CopperContactSummary {
  id: number
  name: string
  emails: { email: string; category: string }[]
  tags: string[]
}

interface DashboardState {
  currentCustomerCount: number
  totalClients: number
  bufferProfiles: BufferProfile[]
  recentPosts: BufferPost[]
  activeClients: CopperContactSummary[]
  contacts: CopperContactSummary[]
}

const initialState: DashboardState = {
  currentCustomerCount: 0,
  totalClients: 0,
  bufferProfiles: [],
  recentPosts: [],
  activeClients: [],
  contacts: [],
}

const DashboardContext = createContext<{
  state: DashboardState
  dispatch: React.Dispatch<Action>
  fetchDashboardData: () => Promise<void>
}>({
  state: initialState,
  dispatch: () => null,
  fetchDashboardData: async () => {},
})

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_DASHBOARD_DATA':
      return { ...state, ...action.payload }
    case 'ADD_CONTACTS':
      return { ...state, contacts: action.payload }
    default:
      return state
  }
}

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  const fetchDashboardData = useCallback(async () => {
    try {
      const [profilesResponse, contactsResponse] = await Promise.all([
        fetch('/api/buffer/profiles'),
        fetch('/api/copper/search/all-people'),
      ])
      const profilesData = await profilesResponse.json()
      const contactsData = await contactsResponse.json()
      
      const newActiveClients = contactsData.slice(0, 5);

      dispatch({
        type: 'SET_DASHBOARD_DATA',
        payload: {
          bufferProfiles: profilesData,
          totalClients: contactsData.length,
          activeClients: newActiveClients,
          contacts: contactsData,
        },
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <DashboardContext.Provider value={{ state, dispatch, fetchDashboardData }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

export const searchContacts = (searchTerm: string) => {
  const { state } = useDashboard();
  const searchLower = searchTerm.toLowerCase();

  return state.contacts.filter(contact => {
    const contactEmail = contact.emails?.[0]?.email || '';

    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contactEmail.toLowerCase().includes(searchLower) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })
}