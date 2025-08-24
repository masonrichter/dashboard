'use client'

import { useEffect, useMemo, useState } from 'react'
import { 
  EnvelopeIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  UserGroupIcon,
  TagIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UsersIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

type Contact = {
  id: number
  name: string
  email: string
  tags: string[]
}

type MLGroup = {
  id: string
  name: string
  total: number
}

type Campaign = {
  id: string
  name: string
  subject: string
  status: string
  sent_at: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  opened_rate: number
  clicked_rate: number
}

type Step = 'search' | 'select' | 'filter' | 'create'

export default function MailerPage() {
  // Data
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<MLGroup[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('search')

  // MailerLite form fields
  const [groupName, setGroupName] = useState<string>('')
  const [emailSubject, setEmailSubject] = useState<string>('')
  const [emailContent, setEmailContent] = useState<string>('')

  // Copper selection
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'any' | 'all'>('any')
  const [sending, setSending] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Load all data
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)

        const [contactsRes, groupsRes, campaignsRes] = await Promise.all([
          fetch('/api/copper/people'),
          fetch('https://connect.mailerlite.com/api/groups', {
            headers: {
              'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZDE3YTM1NDMyZjNkZTY2MjIwYTYzMDdiZGI0MWU5ZmRkZjc5NTQxNTJjYmQ4NGViMjU0N2Y4NzBhYTRmZTAxMTRhYzNhYTJmNjcwN2UyYmYiLCJpYXQiOjE3NTQ2MTcwMTYuMTI0MTEyLCJuYmYiOjE3NTQ2MTcwMTYuMTI0MTE0LCJleHAiOjQ5MTAyOTA2MTYuMTIxMTMzLCJzdWIiOiIxNzIzMzIxIiwic2NvcGVzIjpbXX0.mcBthQZ6ZlYSq5psf7D8o_1JqVgAfqNHg1cDcBKTyOcZeQqRoFuIsldEFy4mYMhzmmMka6asm9yWIQyWAAlBnboL_DWm_vDnyre6lHPOBVvNLo2f9F2k-2Oc235uLEHnIX1VJizxBRs6uUNjUbcP9FWpe3e1owLFwmfjZc69Il8p6SMAuwkR7RmA9sspKqkY5HaCg2qkBFx0h4D3GwoAEW6JRghEADRwL_4eGdEtZ7eRR7ON5cJiNGK9vNGtYzyT4VbVgYBd9ChkpHGdSrW_b1dtlIXMCPOl87t-1hZD2L3iHAsoCiHxlT-zkpJS9TGli_704VI-bL1hrHP9VO6yskTHZgxP3HlqZxvG_ZZWpd3I1eG1wTQqtd7AEbDuEk82pnaVwzav-o-Owso0KKz0jy7lSSg0-Ynbii4xJS3C2TN4AqYTM3r2-Hzyjt383m0XBrm_TzyEFpxi0dl6N9VwPvJtB7gZY3XyHibz7UwOWX7M0ZnmNX-dJQcca8S1MMS1g9oI7qCwsIhbusp5Js_ndFITChiTdDe51zB4V3vbyhyjbwAxqJA0Eqd-rteJCvpnqXBD6FIyajfH5nMFaZQznWzdsTwvMQVH2sjZbLmkU4kYFVXwBBo7G0rTanbbQXfwLzldJo3WY0yDMn4BLFrY26jXaEOcnOXIBEzS7yeYBd0`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }),
          fetch('/api/mailerlite/campaigns')
        ])

        if (!contactsRes.ok) throw new Error('Failed to fetch Copper contacts')
        if (!groupsRes.ok) throw new Error('Failed to fetch MailerLite groups')
        if (!campaignsRes.ok) throw new Error('Failed to fetch MailerLite campaigns')

        const contactsData: Contact[] = await contactsRes.json()
        const groupsData = (await groupsRes.json()).data.map((group: any) => ({
          id: group.id,
          name: group.name,
          total: group.subscribers_count
        }))

        const rawCampaigns = await campaignsRes.json()
        const campaignsData: Campaign[] = (rawCampaigns || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          subject: c.subject || 'No subject',
          status: c.status,
          sent_at: c.finished_at || c.send_time || '',
          recipients_count: c.recipients_count ?? 0,
          opened_count: c.opened_count ?? 0,
          clicked_count: c.clicked_count ?? 0,
          opened_rate: c.opened_rate ?? 0,
          clicked_rate: c.clicked_rate ?? 0,
        }))

        if (!mounted) return
        setContacts(contactsData)
        setGroups(groupsData)
        setCampaigns(campaignsData)

      } catch (e: any) {
        if (!mounted) return
        setError(e.message || 'Failed to load data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    contacts.forEach(c => {
      if (c.tags?.length) {
        c.tags.forEach(tag => tags.add(tag))
      } else {
        tags.add('No Tag')
      }
    })
    return Array.from(tags).sort()
  }, [contacts])

  // Filter contacts based on search, tags, and filter type
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      if (filterType === 'any') {
        filtered = filtered.filter(c => 
          c.tags?.some(tag => selectedTags.includes(tag)) || 
          (c.tags?.length === 0 && selectedTags.includes('No Tag'))
        )
      } else { // 'all'
        filtered = filtered.filter(c => 
          selectedTags.every(tag => 
            c.tags?.includes(tag) || (tag === 'No Tag' && (!c.tags || c.tags.length === 0))
          )
        )
      }
    }

    return filtered
  }, [contacts, searchQuery, selectedTags, filterType])

  // Copper selection handlers
  const toggleContact = (id: number) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const selectAllFiltered = () => {
    const ids = filteredContacts.map(c => c.id)
    setSelectedContactIds(prev => Array.from(new Set([...prev, ...ids])))
  }

  const clearSelection = () => {
    setSelectedContactIds([])
  }

  // Step navigation
  const nextStep = () => {
    const steps: Step[] = ['search', 'select', 'filter', 'create']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Step[] = ['search', 'select', 'filter', 'create']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  // Send via the Make.com webhook
  const handleSend = async () => {
    if (!groupName || selectedContactIds.length === 0) {
      alert('Please fill out a group name and select at least one contact.')
      return
    }
    
    const emailsToSend = contacts
      .filter(contact => selectedContactIds.includes(contact.id))
      .map(contact => contact.email)

    setSending('loading')
    try {
      const res = await fetch('https://hook.us2.make.com/6pn4r8sxaci5dq7gfcr233bbztwo6xis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName,
          emails: emailsToSend,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to send with unknown error.')
      }
      
      setSending('success')
      alert('Success!')
    } catch (e: any) {
      console.error('Send failed:', e)
      setSending('error')
      alert(`Send failed: ${e.message}`)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your campaign dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Campaigns</h1>
          <p className="text-gray-600 text-lg">Create targeted email campaigns for your clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT BOX: Step-by-Step Process */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CursorArrowRaysIcon className="h-6 w-6 mr-3 text-blue-600" />
              Campaign Creation Steps
            </h2>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                {['search', 'select', 'filter', 'create'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === step 
                        ? 'bg-blue-600 text-white' 
                        : index < ['search', 'select', 'filter', 'create'].indexOf(currentStep)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < ['search', 'select', 'filter', 'create'].indexOf(currentStep)
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col">
              {/* Step 1: Search by Names or Tags */}
              {currentStep === 'search' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Step 1: Search by Names or Tags</h3>
                    <p className="text-gray-600">Search for contacts by name, email, or select tags to filter your audience.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                        placeholder="Search clients by name, email, or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Or select tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {allTags.slice(0, 12).map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        {allTags.length > 12 && (
                          <span className="px-3 py-2 text-sm text-gray-500">+{allTags.length - 12} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={nextStep}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
                    >
                      <span>Continue to Step 2</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Pick Names/Tags */}
              {currentStep === 'select' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Review Selected Filters</h3>
                    <p className="text-gray-600">Review your selected tags and choose how to filter the results.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    {selectedTags.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Selected tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map(tag => (
                            <span key={tag} className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                              {tag}
                              <button
                                onClick={() => toggleTag(tag)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <TagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No tags selected</p>
                        <p className="text-sm">Go back to step 1 to select tags</p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-3">Filter type:</p>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="any"
                            checked={filterType === 'any'}
                            onChange={(e) => setFilterType(e.target.value as 'any' | 'all')}
                            className="mr-2"
                          />
                          <span className="text-sm">Any tag (contacts with any of the selected tags)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="all"
                            checked={filterType === 'all'}
                            onChange={(e) => setFilterType(e.target.value as 'any' | 'all')}
                            className="mr-2"
                          />
                          <span className="text-sm">All tags (contacts with all selected tags)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300"
                    >
                      <span>Continue to Step 3</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Any or All */}
              {currentStep === 'filter' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Step 3: Review Filtered Results</h3>
                    <p className="text-gray-600">Review the contacts that match your criteria and select your recipients.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-purple-800">Filtered Contacts</span>
                        <span className="text-2xl font-bold text-purple-600">{filteredContacts.length}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={selectAllFiltered}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                          >
                            Select All ({filteredContacts.length})
                          </button>
                          <button
                            onClick={clearSelection}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="text-sm text-purple-700">
                          <p>Selected: <span className="font-semibold">{selectedContactIds.length}</span> contacts</p>
                        </div>
                      </div>
                    </div>

                    {filteredContacts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No contacts match your current filters</p>
                        <p className="text-sm">Try adjusting your search or tag selection</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={selectedContactIds.length === 0}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Step 4</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Email Creation */}
              {currentStep === 'create' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Step 4: Create Email Campaign</h3>
                    <p className="text-gray-600">Create your email campaign and send it to {selectedContactIds.length} selected recipients.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                        placeholder="Enter group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                        placeholder="Enter email subject..."
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 resize-none"
                        placeholder="Enter your email content..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending === 'loading' || !groupName || selectedContactIds.length === 0}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {sending === 'loading' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-5 w-5" />
                          <span>Send Campaign ({selectedContactIds.length} recipients)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sending === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Failed to send campaign. Please try again.</p>
                    </div>
                  )}
                  {sending === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Campaign sent successfully!</p>
                      <a 
                        href="https://dashboard.mailerlite.com/campaigns/status/draft" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-800 underline mt-1 inline-block"
                      >
                        View in MailerLite Dashboard
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT BOX: Live People Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UsersIcon className="h-6 w-6 mr-3 text-green-600" />
              Live People Preview
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Contacts</p>
                    <p className="text-2xl font-bold text-blue-800">{contacts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Selected</p>
                    <p className="text-2xl font-bold text-green-800">{selectedContactIds.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Results */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Filtered Results</h3>
                <span className="text-sm text-gray-500">{filteredContacts.length} contacts</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No contacts match your current filters</p>
                    <p className="text-sm">Try adjusting your search or tag selection</p>
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedContactIds.includes(contact.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleContact(contact.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedContactIds.includes(contact.id)}
                              onChange={() => toggleContact(contact.id)}
                              className="rounded text-green-600 h-4 w-4"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-medium text-gray-900">{contact.name}</span>
                            {selectedContactIds.includes(contact.id) && (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 ml-6">{contact.email}</p>
                          {contact.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-6 mt-1">
                              {contact.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex space-x-2">
                <button
                  onClick={selectAllFiltered}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}