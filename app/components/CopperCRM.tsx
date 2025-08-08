'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  TagIcon,
  EnvelopeIcon,
  UserIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  getContactsWithFallback, 
  getCompaniesWithFallback, 
  getOpportunitiesWithFallback, 
  getActivitiesWithFallback,
  searchContacts, 
  getAllTags, 
  getContactCountByTag,
  CopperContactSummary,
  CopperCompanySummary,
  CopperOpportunitySummary,
  CopperActivitySummary
} from '@/lib/copper'
import { useTags, useCRM } from '@/app/context/DashboardContext'

type TabType = 'people' | 'companies' | 'opportunities' | 'activities'

export default function CopperCRM() {
  const { selectedTags, addSelectedTag, removeSelectedTag, clearSelectedTags } = useTags()
  const { 
    contacts, 
    companies, 
    opportunities, 
    activities,
    loading, 
    searchTerm, 
    setContacts, 
    setCompanies,
    setOpportunities,
    setActivities,
    setLoading, 
    setSearchTerm 
  } = useCRM()
  
  const [activeTab, setActiveTab] = useState<TabType>('people')
  const [filteredContacts, setFilteredContacts] = useState<CopperContactSummary[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CopperCompanySummary[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<CopperOpportunitySummary[]>([])
  const [filteredActivities, setFilteredActivities] = useState<CopperActivitySummary[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({})
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Load all data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Load available tags and counts
  useEffect(() => {
    loadTagsAndCounts()
  }, [contacts])

  // Filter data when search term or selected tags change
  useEffect(() => {
    filterData()
  }, [contacts, companies, opportunities, activities, searchTerm, selectedTags])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Load all data types in parallel
      const [contactsData, companiesData, opportunitiesData, activitiesData] = await Promise.all([
        getContactsWithFallback(),
        getCompaniesWithFallback(),
        getOpportunitiesWithFallback(),
        getActivitiesWithFallback()
      ])
      
      setContacts(contactsData)
      setCompanies(companiesData)
      setOpportunities(opportunitiesData)
      setActivities(activitiesData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading Copper data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTagsAndCounts = async () => {
    try {
      const tags = await getAllTags()
      setAvailableTags(tags)
      
      const counts = await getContactCountByTag()
      setTagCounts(counts)
    } catch (error) {
      console.error('Error loading tags and counts:', error)
    }
  }

  const filterData = () => {
    // Filter contacts
    let filtered = contacts
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact => 
        selectedTags.every(tag => contact.tags.includes(tag))
      )
    }
    setFilteredContacts(filtered)

    // Filter companies
    let filteredCompanies = companies
    if (searchTerm) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTags.length > 0) {
      filteredCompanies = filteredCompanies.filter(company => 
        selectedTags.every(tag => company.tags.includes(tag))
      )
    }
    setFilteredCompanies(filteredCompanies)

    // Filter opportunities
    let filteredOpportunities = opportunities
    if (searchTerm) {
      filteredOpportunities = filteredOpportunities.filter(opportunity => 
        opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTags.length > 0) {
      filteredOpportunities = filteredOpportunities.filter(opportunity => 
        selectedTags.every(tag => opportunity.tags.includes(tag))
      )
    }
    setFilteredOpportunities(filteredOpportunities)

    // Filter activities
    let filteredActivities = activities
    if (searchTerm) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredActivities(filteredActivities)
  }

  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    
    if (query.trim() && activeTab === 'people') {
      try {
        const searchResults = await searchContacts(query)
        setFilteredContacts(searchResults)
      } catch (error) {
        console.error('Error searching contacts:', error)
        filterData()
      }
    } else {
      filterData()
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      removeSelectedTag(tag)
    } else {
      addSelectedTag(tag)
    }
  }

  const clearAllTags = () => {
    clearSelectedTags()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'people':
        return filteredContacts
      case 'companies':
        return filteredCompanies
      case 'opportunities':
        return filteredOpportunities
      case 'activities':
        return filteredActivities
      default:
        return []
    }
  }

  const getCurrentCount = () => {
    switch (activeTab) {
      case 'people':
        return contacts.length
      case 'companies':
        return companies.length
      case 'opportunities':
        return opportunities.length
      case 'activities':
        return activities.length
      default:
        return 0
    }
  }

  const getFilteredCount = () => {
    return getCurrentData().length
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Copper CRM</h2>
          <p className="text-sm text-gray-500 mt-1">
            {getFilteredCount()} of {getCurrentCount()} {activeTab}
            {selectedTags.length > 0 && (
              <span className="ml-2 text-primary-600">
                • Filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadAllData}
            className="btn-secondary flex items-center"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Last Refresh Info */}
      <div className="text-xs text-gray-500">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Tag Filter Notification */}
      {selectedTags.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center">
            <TagIcon className="h-5 w-5 text-primary-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-900">
                Active Tag Filters
              </p>
              <p className="text-sm text-primary-700 mt-1">
                Showing {activeTab} that have all of the following tags: {selectedTags.join(', ')}
              </p>
            </div>
            <button
              onClick={clearAllTags}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'people', name: 'People', icon: UserIcon, count: contacts.length },
            { id: 'companies', name: 'Companies', icon: BuildingOfficeIcon, count: companies.length },
            { id: 'opportunities', name: 'Opportunities', icon: CurrencyDollarIcon, count: opportunities.length },
            { id: 'activities', name: 'Activities', icon: ClockIcon, count: activities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters Row */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Tag Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter by Tags
              {selectedTags.length > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                  {selectedTags.length}
                </span>
              )}
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            </button>

            {/* Tag Dropdown */}
            {showTagDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Filter by Tags</h3>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={clearAllTags}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableTags.map((tag) => (
                      <label key={tag} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{tag}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({tagCounts[tag] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllTags}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {activeTab === 'people' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Company
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Tags
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No people found</p>
                        <p className="text-sm">
                          {searchTerm || selectedTags.length > 0 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No people available'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.email || (
                            <span className="text-gray-400 italic">No email</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.company || (
                            <span className="text-gray-400 italic">No company</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.length > 0 ? (
                            contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                  selectedTags.includes(tag)
                                    ? 'bg-primary-200 text-primary-900'
                                    : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                }`}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.lastModified)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'companies' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Company Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Tags
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No companies found</p>
                        <p className="text-sm">
                          {searchTerm || selectedTags.length > 0 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No companies available'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.email || (
                            <span className="text-gray-400 italic">No email</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.phone || (
                            <span className="text-gray-400 italic">No phone</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.city && company.state ? `${company.city}, ${company.state}` : (
                            <span className="text-gray-400 italic">No location</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {company.tags.length > 0 ? (
                            company.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                  selectedTags.includes(tag)
                                    ? 'bg-primary-200 text-primary-900'
                                    : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                }`}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(company.lastModified)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'opportunities' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Opportunity Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Company
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Contact
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Tags
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No opportunities found</p>
                        <p className="text-sm">
                          {searchTerm || selectedTags.length > 0 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No opportunities available'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {opportunity.companyName || (
                            <span className="text-gray-400 italic">No company</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {opportunity.primaryContactName || (
                            <span className="text-gray-400 italic">No contact</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(opportunity.monetaryValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          opportunity.status === 'Closed Won' 
                            ? 'bg-green-100 text-green-800'
                            : opportunity.status === 'Closed Lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {opportunity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opportunity.closeDate ? formatDate(opportunity.closeDate) : (
                          <span className="text-gray-400 italic">No date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {opportunity.tags.length > 0 ? (
                            opportunity.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                  selectedTags.includes(tag)
                                    ? 'bg-primary-200 text-primary-900'
                                    : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                }`}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">No tags</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'activities' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Activity Type
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No activities found</p>
                        <p className="text-sm">
                          {searchTerm 
                            ? 'Try adjusting your search criteria'
                            : 'No activities available'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.type === 'Call' 
                            ? 'bg-blue-100 text-blue-800'
                            : activity.type === 'Email'
                            ? 'bg-green-100 text-green-800'
                            : activity.type === 'Meeting'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {activity.details || (
                            <span className="text-gray-400 italic">No details</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {activity.parentType || (
                            <span className="text-gray-400 italic">Unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.activityDate ? formatDate(activity.activityDate) : (
                          <span className="text-gray-400 italic">No date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(activity.lastModified)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total People</p>
              <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Companies</p>
              <p className="text-2xl font-semibold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">{opportunities.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Activities</p>
              <p className="text-2xl font-semibold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showTagDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowTagDropdown(false)}
        />
      )}
    </div>
  )
} 