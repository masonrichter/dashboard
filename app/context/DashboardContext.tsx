'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  CopperContactSummary, 
  CopperCompanySummary, 
  CopperOpportunitySummary, 
  CopperActivitySummary 
} from '@/lib/copper'

// Types for the dashboard state
interface DashboardState {
  // Tag management
  selectedTags: string[]
  availableTags: string[]
  tagCounts: Record<string, number>
  
  // Client management
  selectedClients: string[]
  allClients: CopperContactSummary[]
  filteredClients: CopperContactSummary[]
  
  // CRM data
  contacts: CopperContactSummary[]
  companies: CopperCompanySummary[]
  opportunities: CopperOpportunitySummary[]
  activities: CopperActivitySummary[]
  loading: boolean
  searchTerm: string
  
  // UI state
  activeView: 'contacts' | 'companies' | 'opportunities' | 'activities' | 'tags' | 'analytics'
  sidebarOpen: boolean
  mobileMenuOpen: boolean
}

interface DashboardContextType extends DashboardState {
  // Tag actions
  setSelectedTags: (tags: string[]) => void
  addSelectedTag: (tag: string) => void
  removeSelectedTag: (tag: string) => void
  clearSelectedTags: () => void
  setAvailableTags: (tags: string[]) => void
  setTagCounts: (counts: Record<string, number>) => void
  
  // Client actions
  setSelectedClients: (clients: string[]) => void
  addSelectedClient: (clientId: string) => void
  removeSelectedClient: (clientId: string) => void
  clearSelectedClients: () => void
  setAllClients: (clients: CopperContactSummary[]) => void
  setFilteredClients: (clients: CopperContactSummary[]) => void
  
  // CRM actions
  setContacts: (contacts: CopperContactSummary[]) => void
  setCompanies: (companies: CopperCompanySummary[]) => void
  setOpportunities: (opportunities: CopperOpportunitySummary[]) => void
  setActivities: (activities: CopperActivitySummary[]) => void
  setLoading: (loading: boolean) => void
  setSearchTerm: (term: string) => void
  
  // UI actions
  setActiveView: (view: 'contacts' | 'companies' | 'opportunities' | 'activities' | 'tags' | 'analytics') => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  
  // Utility functions
  getClientById: (id: string) => CopperContactSummary | undefined
  getCompanyById: (id: number) => CopperCompanySummary | undefined
  getOpportunityById: (id: number) => CopperOpportunitySummary | undefined
  getActivityById: (id: number) => CopperActivitySummary | undefined
  getContactsByTags: (tags: string[]) => CopperContactSummary[]
  getCompaniesByTags: (tags: string[]) => CopperCompanySummary[]
  getOpportunitiesByTags: (tags: string[]) => CopperOpportunitySummary[]
  filterContactsBySearch: (term: string) => CopperContactSummary[]
  filterCompaniesBySearch: (term: string) => CopperCompanySummary[]
  filterOpportunitiesBySearch: (term: string) => CopperOpportunitySummary[]
  filterActivitiesBySearch: (term: string) => CopperActivitySummary[]
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    // Tag management
    selectedTags: [],
    availableTags: [],
    tagCounts: {},
    
    // Client management
    selectedClients: [],
    allClients: [],
    filteredClients: [],
    
    // CRM data
    contacts: [],
    companies: [],
    opportunities: [],
    activities: [],
    loading: false,
    searchTerm: '',
    
    // UI state
    activeView: 'contacts',
    sidebarOpen: false,
    mobileMenuOpen: false,
  })

  // Tag actions
  const setSelectedTags = (tags: string[]) => {
    setState(prev => ({ ...prev, selectedTags: tags }))
  }

  const addSelectedTag = (tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) ? prev.selectedTags : [...prev.selectedTags, tag]
    }))
  }

  const removeSelectedTag = (tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag)
    }))
  }

  const clearSelectedTags = () => {
    setState(prev => ({ ...prev, selectedTags: [] }))
  }

  const setAvailableTags = (tags: string[]) => {
    setState(prev => ({ ...prev, availableTags: tags }))
  }

  const setTagCounts = (counts: Record<string, number>) => {
    setState(prev => ({ ...prev, tagCounts: counts }))
  }

  // Client actions
  const setSelectedClients = (clients: string[]) => {
    setState(prev => ({ ...prev, selectedClients: clients }))
  }

  const addSelectedClient = (clientId: string) => {
    setState(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId) ? prev.selectedClients : [...prev.selectedClients, clientId]
    }))
  }

  const removeSelectedClient = (clientId: string) => {
    setState(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.filter(id => id !== clientId)
    }))
  }

  const clearSelectedClients = () => {
    setState(prev => ({ ...prev, selectedClients: [] }))
  }

  const setAllClients = (clients: CopperContactSummary[]) => {
    setState(prev => ({ ...prev, allClients: clients }))
  }

  const setFilteredClients = (clients: CopperContactSummary[]) => {
    setState(prev => ({ ...prev, filteredClients: clients }))
  }

  // CRM actions
  const setContacts = (contacts: CopperContactSummary[]) => {
    setState(prev => ({ ...prev, contacts }))
  }

  const setCompanies = (companies: CopperCompanySummary[]) => {
    setState(prev => ({ ...prev, companies }))
  }

  const setOpportunities = (opportunities: CopperOpportunitySummary[]) => {
    setState(prev => ({ ...prev, opportunities }))
  }

  const setActivities = (activities: CopperActivitySummary[]) => {
    setState(prev => ({ ...prev, activities }))
  }

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }

  const setSearchTerm = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }))
  }

  // UI actions
  const setActiveView = (view: 'contacts' | 'companies' | 'opportunities' | 'activities' | 'tags' | 'analytics') => {
    setState(prev => ({ ...prev, activeView: view }))
  }

  const setSidebarOpen = (open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }))
  }

  const setMobileMenuOpen = (open: boolean) => {
    setState(prev => ({ ...prev, mobileMenuOpen: open }))
  }

  // Utility functions
  const getClientById = (id: string): CopperContactSummary | undefined => {
    return state.allClients.find(client => client.id.toString() === id)
  }

  const getCompanyById = (id: number): CopperCompanySummary | undefined => {
    return state.companies.find(company => company.id === id)
  }

  const getOpportunityById = (id: number): CopperOpportunitySummary | undefined => {
    return state.opportunities.find(opportunity => opportunity.id === id)
  }

  const getActivityById = (id: number): CopperActivitySummary | undefined => {
    return state.activities.find(activity => activity.id === id)
  }

  const getContactsByTags = (tags: string[]): CopperContactSummary[] => {
    if (tags.length === 0) return state.contacts
    
    return state.contacts.filter(contact => 
      tags.every(tag => contact.tags.includes(tag))
    )
  }

  const getCompaniesByTags = (tags: string[]): CopperCompanySummary[] => {
    if (tags.length === 0) return state.companies
    
    return state.companies.filter(company => 
      tags.every(tag => company.tags.includes(tag))
    )
  }

  const getOpportunitiesByTags = (tags: string[]): CopperOpportunitySummary[] => {
    if (tags.length === 0) return state.opportunities
    
    return state.opportunities.filter(opportunity => 
      tags.every(tag => opportunity.tags.includes(tag))
    )
  }

  const filterContactsBySearch = (term: string): CopperContactSummary[] => {
    if (!term.trim()) return state.contacts
    
    const searchLower = term.toLowerCase()
    return state.contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  const filterCompaniesBySearch = (term: string): CopperCompanySummary[] => {
    if (!term.trim()) return state.companies
    
    const searchLower = term.toLowerCase()
    return state.companies.filter(company => 
      company.name.toLowerCase().includes(searchLower) ||
      company.email.toLowerCase().includes(searchLower) ||
      company.city.toLowerCase().includes(searchLower) ||
      company.state.toLowerCase().includes(searchLower) ||
      company.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  const filterOpportunitiesBySearch = (term: string): CopperOpportunitySummary[] => {
    if (!term.trim()) return state.opportunities
    
    const searchLower = term.toLowerCase()
    return state.opportunities.filter(opportunity => 
      opportunity.name.toLowerCase().includes(searchLower) ||
      opportunity.companyName.toLowerCase().includes(searchLower) ||
      opportunity.primaryContactName.toLowerCase().includes(searchLower) ||
      opportunity.status.toLowerCase().includes(searchLower) ||
      opportunity.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  const filterActivitiesBySearch = (term: string): CopperActivitySummary[] => {
    if (!term.trim()) return state.activities
    
    const searchLower = term.toLowerCase()
    return state.activities.filter(activity => 
      activity.type.toLowerCase().includes(searchLower) ||
      activity.details.toLowerCase().includes(searchLower) ||
      activity.parentType.toLowerCase().includes(searchLower)
    )
  }

  // Auto-filter contacts when selected tags change
  useEffect(() => {
    const filtered = getContactsByTags(state.selectedTags)
    setFilteredClients(filtered)
  }, [state.selectedTags, state.contacts])

  const contextValue: DashboardContextType = {
    ...state,
    setSelectedTags,
    addSelectedTag,
    removeSelectedTag,
    clearSelectedTags,
    setAvailableTags,
    setTagCounts,
    setSelectedClients,
    addSelectedClient,
    removeSelectedClient,
    clearSelectedClients,
    setAllClients,
    setFilteredClients,
    setContacts,
    setCompanies,
    setOpportunities,
    setActivities,
    setLoading,
    setSearchTerm,
    setActiveView,
    setSidebarOpen,
    setMobileMenuOpen,
    getClientById,
    getCompanyById,
    getOpportunityById,
    getActivityById,
    getContactsByTags,
    getCompaniesByTags,
    getOpportunitiesByTags,
    filterContactsBySearch,
    filterCompaniesBySearch,
    filterOpportunitiesBySearch,
    filterActivitiesBySearch,
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

// Convenience hooks for specific parts of the dashboard
export function useTags() {
  const context = useDashboard()
  return {
    selectedTags: context.selectedTags,
    availableTags: context.availableTags,
    tagCounts: context.tagCounts,
    addSelectedTag: context.addSelectedTag,
    removeSelectedTag: context.removeSelectedTag,
    clearSelectedTags: context.clearSelectedTags,
    setAvailableTags: context.setAvailableTags,
    setTagCounts: context.setTagCounts,
  }
}

export function useClients() {
  const context = useDashboard()
  return {
    selectedClients: context.selectedClients,
    allClients: context.allClients,
    filteredClients: context.filteredClients,
    addSelectedClient: context.addSelectedClient,
    removeSelectedClient: context.removeSelectedClient,
    clearSelectedClients: context.clearSelectedClients,
    setAllClients: context.setAllClients,
    getClientById: context.getClientById,
  }
}

export function useCRM() {
  const context = useDashboard()
  return {
    contacts: context.contacts,
    companies: context.companies,
    opportunities: context.opportunities,
    activities: context.activities,
    loading: context.loading,
    searchTerm: context.searchTerm,
    setContacts: context.setContacts,
    setCompanies: context.setCompanies,
    setOpportunities: context.setOpportunities,
    setActivities: context.setActivities,
    setLoading: context.setLoading,
    setSearchTerm: context.setSearchTerm,
    getContactsByTags: context.getContactsByTags,
    getCompaniesByTags: context.getCompaniesByTags,
    getOpportunitiesByTags: context.getOpportunitiesByTags,
    filterContactsBySearch: context.filterContactsBySearch,
    filterCompaniesBySearch: context.filterCompaniesBySearch,
    filterOpportunitiesBySearch: context.filterOpportunitiesBySearch,
    filterActivitiesBySearch: context.filterActivitiesBySearch,
  }
} 