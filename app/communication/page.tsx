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
  ArrowLeftIcon,
  ShareIcon,
  PhotoIcon,
  VideoCameraIcon
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

type Template = {
  id: string
  name: string
  subject: string
  content: string
  thumbnail: string
  created_at: string
  updated_at: string
}

type Step = 'select' | 'filter' | 'compose'
type Tab = 'email' | 'social'

export default function CommunicationPage() {
  // Data
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<MLGroup[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('select')
  
  // Debug current step changes
  useEffect(() => {
    console.log('Current step changed to:', currentStep)
  }, [currentStep])

  // Debug URL changes
  useEffect(() => {
    console.log('URL changed to:', window.location.href)
  }, [])
  const [activeTab, setActiveTab] = useState<Tab>('email')

  // MailerLite form fields
  const [groupName, setGroupName] = useState<string>('')

  // Social Media form fields
  const [socialContent, setSocialContent] = useState<string>('')
  const [socialPlatforms, setSocialPlatforms] = useState<('linkedin' | 'twitter' | 'facebook')[]>(['linkedin', 'twitter', 'facebook'])
  const [socialImageUrl, setSocialImageUrl] = useState<string>('')
  const [socialScheduleDate, setSocialScheduleDate] = useState<string>('')

  // Copper selection
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [manuallyDeselectedIds, setManuallyDeselectedIds] = useState<number[]>([])
  const [autoDeselectedByAllFilter, setAutoDeselectedByAllFilter] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'any' | 'all'>('any')
  const [searchMode, setSearchMode] = useState<'tags' | 'name'>('tags')
  const [sending, setSending] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  
  // Scrollable recipients list (no pagination needed)

  // Load all data
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)

        const [contactsRes, groupsRes, campaignsRes, templatesRes] = await Promise.all([
          fetch('/api/copper/people'),
          fetch('https://connect.mailerlite.com/api/groups', {
            headers: {
              'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZDE3YTM1NDMyZjNkZTY2MjIwYTYzMDdiZGI0MWU5ZmRkZjc5NTQxNTJjYmQ4NGViMjU0N2Y4NzBhYTRmZTAxMTRhYzNhYTJmNjcwN2UyYmYiLCJpYXQiOjE3NTQ2MTcwMTYuMTI0MTEyLCJuYmYiOjE3NTQ2MTcwMTYuMTI0MTE0LCJleHAiOjQ5MTAyOTA2MTYuMTIxMTMzLCJzdWIiOiIxNzIzMzIxIiwic2NvcGVzIjpbXX0.mcBthQZ6ZlYSq5psf7D8o_1JqVgAfqNHg1cDcBKTyOcZeQqRoFuIsldEFy4mYMhzmmMka6asm9yWIQyWAAlBnboL_DWm_vDnyre6lHPOBVvNLo2f9F2k-2Oc235uLEHnIX1VJizxBRs6uUNjUbcP9FWpe3e1owLFwmfjZc69Il8p6SMAuwkR7RmA9sspKqkY5HaCg2qkBFx0h4D3GwoAEW6JRghEADRwL_4eGdEtZ7eRR7ON5cJiNGK9vNGtYzyT4VbVgYBd9ChkpHGdSrW_b1dtlIXMCPOl87t-1hZD2L3iHAsoCiHxlT-zkpJS9TGli_704VI-bL1hrHP9VO6yskTHZgxP3HlqZxvG_ZZWpd3I1eG1wTQqtd7AEbDuEk82pnaVwzav-o-Owso0KKz0jy7lSSg0-Ynbii4xJS3C2TN4AqYTM3r2-Hzyjt383m0XBrm_TzyEFpxi0dl6N9VwPvJtB7gZY3XyHibz7UwOWX7M0ZnmNX-dJQcca8S1MMS1g9oI7qCwsIhbusp5Js_ndFITChiTdDe51zB4V3vbyhyjbwAxqJA0Eqd-rteJCvpnqXBD6FIyajfH5nMFaZQznWzdsTwvMQVH2sjZbLmkU4kYFVXwBBo7G0rTanbbQXfwLzldJo3WY0yDMn4BLFrY26jXaEOcnOXIBEzS7yeYBd0`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }),
          fetch('/api/mailerlite/campaigns'),
          fetch('/api/mailerlite/templates')
        ])

        if (!contactsRes.ok) throw new Error('Failed to fetch Copper contacts')
        if (!groupsRes.ok) throw new Error('Failed to fetch MailerLite groups')
        if (!campaignsRes.ok) throw new Error('Failed to fetch MailerLite campaigns')
        if (!templatesRes.ok) throw new Error('Failed to fetch MailerLite templates')

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

        const templatesData: Template[] = await templatesRes.json()
        console.log('Templates loaded:', templatesData)

        if (!mounted) return
        setContacts(contactsData)
        setGroups(groupsData)
        setCampaigns(campaignsData)
        setTemplates(templatesData)

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
      // In Step 2, automatically use 'any' filter type
      const effectiveFilterType = currentStep === 'select' ? 'any' : filterType
      
      if (effectiveFilterType === 'any') {
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
    } else {
      // Return empty array when no tags are selected
      filtered = []
    }

    return filtered
  }, [contacts, searchQuery, selectedTags, filterType, currentStep])

  // Auto-select contacts when using tag filtering
  useEffect(() => {
    if (searchMode === 'tags') {
      if (selectedTags.length > 0) {
        // Only auto-select NEW contacts that weren't previously selected
        // This preserves manual deselections when new tags are added
        const filteredIds = filteredContacts.map(c => c.id)
        setSelectedContactIds(prev => {
          // Get the set of currently selected IDs
          const currentSelected = new Set(prev)
          // Add new filtered IDs that weren't previously selected and aren't manually deselected
          filteredIds.forEach(id => {
            if (!manuallyDeselectedIds.includes(id)) {
              currentSelected.add(id)
            }
          })
          return Array.from(currentSelected)
        })
      } else {
        // Clear selection when no tags are selected
        setSelectedContactIds([])
        setManuallyDeselectedIds([])
        setAutoDeselectedByAllFilter([])
      }
    }
  }, [filteredContacts, searchMode, selectedTags, manuallyDeselectedIds])

  // Clear selection when switching to name search mode
  useEffect(() => {
    if (searchMode === 'name') {
      setSelectedContactIds([])
    }
  }, [searchMode])

  // Copper selection handlers
  const toggleContact = (id: number) => {
    setSelectedContactIds(prev => {
      if (prev.includes(id)) {
        // When deselecting, add to manually deselected list
        setManuallyDeselectedIds(prevDeselected => [...prevDeselected, id])
        return prev.filter(x => x !== id)
      } else {
        // When selecting, remove from manually deselected list
        setManuallyDeselectedIds(prevDeselected => prevDeselected.filter(x => x !== id))
        return [...prev, id]
      }
    })
  }



  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      
      // Update selected contacts based on the new tag selection
      if (prev.includes(tag)) {
        // Tag was removed - remove contacts that only had this tag
        setSelectedContactIds(currentSelected => {
          return currentSelected.filter(contactId => {
            const contact = contacts.find(c => c.id === contactId)
            if (!contact) return false
            
            // Keep contact if it has other selected tags
            if (filterType === 'any') {
              // For 'any' filter: keep if contact has ANY of the remaining selected tags
              return newTags.some(selectedTag => 
                contact.tags?.includes(selectedTag) || 
                (selectedTag === 'No Tag' && (!contact.tags || contact.tags.length === 0))
              )
            } else {
              // For 'all' filter: keep if contact has ALL of the remaining selected tags
              return newTags.every(selectedTag => 
                contact.tags?.includes(selectedTag) || 
                (selectedTag === 'No Tag' && (!contact.tags || contact.tags.length === 0))
              )
            }
          })
        })
      } else {
        // Tag was added - add contacts that match the new tag selection
        const newMatchingContacts = contacts.filter(contact => {
          if (filterType === 'any') {
            // For 'any' filter: include if contact has ANY of the selected tags
            return newTags.some(selectedTag => 
              contact.tags?.includes(selectedTag) || 
              (selectedTag === 'No Tag' && (!contact.tags || contact.tags.length === 0))
            )
          } else {
            // For 'all' filter: include if contact has ALL of the selected tags
            return newTags.every(selectedTag => 
              contact.tags?.includes(selectedTag) || 
              (selectedTag === 'No Tag' && (!contact.tags || contact.tags.length === 0))
            )
          }
        })
        
        setSelectedContactIds(currentSelected => {
          const newSelection = new Set(currentSelected)
          newMatchingContacts.forEach(contact => {
            // Only add if not manually deselected
            if (!manuallyDeselectedIds.includes(contact.id)) {
              newSelection.add(contact.id)
            }
          })
          return Array.from(newSelection)
        })
      }
      
      return newTags
    })
  }

  const handleFilterTypeChange = (newFilterType: 'any' | 'all') => {
    setFilterType(newFilterType)
    
    if (newFilterType === 'all') {
      // If switching to 'all' filter, automatically deselect contacts that don't match
      const contactsToKeep = contacts.filter(contact => {
        // Check if contact has ALL selected tags
        return selectedTags.every(tag => 
          contact.tags?.includes(tag) || (tag === 'No Tag' && (!contact.tags || contact.tags.length === 0))
        )
      })
      
      const idsToKeep = contactsToKeep.map(c => c.id)
      
      // Update selected contacts to only include those that match ALL tags
      setSelectedContactIds(prev => {
        const automaticallyDeselected = prev.filter(id => !idsToKeep.includes(id))
        
        // Track which contacts were automatically deselected by the ALL filter
        if (automaticallyDeselected.length > 0) {
          setAutoDeselectedByAllFilter(automaticallyDeselected)
        }
        
        return prev.filter(id => idsToKeep.includes(id))
      })
    } else if (newFilterType === 'any') {
      // If switching to 'any' filter, restore only contacts that were automatically deselected by 'all' filter
      setSelectedContactIds(prev => {
        const newSelection = new Set(prev)
        
        // Add back only contacts that were automatically deselected by ALL filter
        autoDeselectedByAllFilter.forEach(id => {
          newSelection.add(id)
        })
        
        return Array.from(newSelection)
      })
      
      // Clear the auto-deselected list since we've restored them
      setAutoDeselectedByAllFilter([])
    }
  }

  const selectAllFiltered = () => {
    const ids = filteredContacts.map(c => c.id)
    setSelectedContactIds(prev => {
      const newSelection = new Set(prev)
      // Add all filtered IDs except manually deselected ones
      ids.forEach(id => {
        if (!manuallyDeselectedIds.includes(id)) {
          newSelection.add(id)
        }
      })
      return Array.from(newSelection)
    })
  }

  const clearSelection = () => {
    setSelectedContactIds([])
    setManuallyDeselectedIds([])
  }

  // Calculate how many contacts would be selected when "Select All" is clicked
  const getSelectAllCount = () => {
    const allIds = filteredContacts.map(c => c.id)
    return allIds.filter(id => !manuallyDeselectedIds.includes(id)).length
  }

  // Calculate how many contacts would be selected based on current filter type
  const getStep2RecipientCount = () => {
    if (selectedTags.length === 0) return 0
    
    // Calculate contacts that match the current filter type
    let matchingContacts: Contact[] = []
    
    if (filterType === 'any') {
      matchingContacts = contacts.filter(c => 
        c.tags?.some(tag => selectedTags.includes(tag)) || 
        (c.tags?.length === 0 && selectedTags.includes('No Tag'))
      )
    } else { // 'all'
      matchingContacts = contacts.filter(c => 
        selectedTags.every(tag => 
          c.tags?.includes(tag) || (tag === 'No Tag' && (!c.tags || c.tags.length === 0))
        )
      )
    }
    
    // Return the count of matching contacts that aren't manually deselected
    // Note: autoDeselectedByAllFilter contacts are not counted as "manually deselected" for this calculation
    return matchingContacts.filter(c => !manuallyDeselectedIds.includes(c.id)).length
  }

  // Get all selected contacts for scrollable list (excluding manually deselected)
  const getSelectedContacts = () => {
    return contacts.filter(c => 
      selectedContactIds.includes(c.id) && !manuallyDeselectedIds.includes(c.id)
    )
  }

  // Handle checkbox toggle for recipients
  const handleRecipientToggle = (contactId: number) => {
    setSelectedContactIds(prev => {
      if (prev.includes(contactId)) {
        // Unchecking - remove from selection and add to manually deselected
        setManuallyDeselectedIds(prevDeselected => [...prevDeselected, contactId])
        return prev.filter(id => id !== contactId)
      } else {
        // Checking - add to selection and remove from manually deselected
        setManuallyDeselectedIds(prevDeselected => prevDeselected.filter(id => id !== contactId))
        return [...prev, contactId]
      }
    })
  }

  // Step navigation
  const nextStep = () => {
    console.log('nextStep called, currentStep:', currentStep, 'searchMode:', searchMode)
    console.log('Current URL:', window.location.href)
    const steps: Step[] = ['select', 'filter', 'compose']
    const currentIndex = steps.indexOf(currentStep)
    
    // Skip Step 2 (filter) if using name search
    if (currentStep === 'select' && searchMode === 'name') {
      console.log('Skipping to compose step')
      setCurrentStep('compose')
      return
    }
    
    if (currentIndex < steps.length - 1) {
      const nextStepName = steps[currentIndex + 1]
      console.log('Moving to next step:', nextStepName)
      setCurrentStep(nextStepName)
    }
  }

  const prevStep = () => {
    const steps: Step[] = ['select', 'filter', 'compose']
    const currentIndex = steps.indexOf(currentStep)
    
    // Skip Step 2 (filter) if using name search
    if (currentStep === 'compose' && searchMode === 'name') {
      setCurrentStep('select')
      return
    }
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }





  // Social Media posting function
  const handleSocialPost = async () => {
    if (!socialContent.trim()) {
      alert('Please enter content for your social media post.')
      return
    }

    if (!socialScheduleDate) {
      alert('Please select a schedule date and time.')
      return
    }

    setSending('loading')
    try {
      const platformFlags = {
        linkedin: socialPlatforms.includes('linkedin'),
        twitter: socialPlatforms.includes('twitter'),
        facebook: socialPlatforms.includes('facebook'),
      }

      const platformProfileIds = {
        linkedin: '67357e79da2e3cb64c862ad5',
        twitter: '673bfc3cda2e3cb64ca1c588',
        facebook: '67357f9fda2e3cb64c93a3d9'
      }

      // Send JSON data instead of FormData
      const postData = {
        text: socialContent,
        image_url: socialImageUrl || '',
        linkedin: platformFlags.linkedin,
        twitter: platformFlags.twitter,
        facebook: platformFlags.facebook,
        scheduleDate: socialScheduleDate,
        scheduled: true,
        timestamp: new Date().toISOString(),
        from: 'Glenn Financial Services Dashboard',
        platforms: socialPlatforms,
        profileIds: platformProfileIds,
        selectedProfileIds: socialPlatforms.map(platform => platformProfileIds[platform])
      }

      const response = await fetch('/api/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.text()
      console.log('Make.com webhook response:', result)
      
      setSending('success')
      
      alert(`Social media post scheduled successfully for LinkedIn, Twitter/X, and Facebook!\n\nScheduled for: ${socialScheduleDate}\n\nMake.com webhook response: ${result}`)
      
      // Clear form
      setSocialContent('')
      setSocialImageUrl('')
      setSocialPlatforms(['linkedin', 'twitter', 'facebook'])
      setSocialScheduleDate('')
      
    } catch (e: any) {
      console.error('Social post failed:', e)
      setSending('error')
      alert(`Failed to post to social media: ${e.message}`)
    }
  }

  // Removed automatic MailerLite group creation functionality



  // New function to send selected contacts to MailerLite as a group
  const handleSendToMailerLite = async () => {
    // Get the final filtered contacts (excluding manually deselected)
    const finalSelectedContacts = getSelectedContacts()
    
    if (finalSelectedContacts.length === 0) {
      alert('Please select at least one contact to send to MailerLite.')
      return
    }

    setSending('loading')
    try {
      // Use the final filtered contacts
      const selectedContacts = finalSelectedContacts
      
      // Prepare data for Make.com webhook
      const validContacts = selectedContacts.filter(contact => contact.email)
      
      const webhookData = {
        groupName: groupName || `Contacts from Copper (${finalSelectedContacts.length})`,
        emails: validContacts.map(contact => contact.email),
        subscriberList: validContacts.map(contact => ({
          email: contact.email,
          name: contact.name || '',
          tags: contact.tags ? contact.tags.join(', ') : ''
        })),
        // Alternative format for Make.com
        subscribers: validContacts.map(contact => contact.email),
        subscriberData: validContacts.map(contact => ({
          email: contact.email,
          fields: {
            name: contact.name || '',
            tags: contact.tags ? contact.tags.join(', ') : ''
          }
        })),
        timestamp: new Date().toISOString(),
        source: 'Glenn Financial Services Dashboard',
        contactCount: finalSelectedContacts.length,
        emailCount: validContacts.length,
        debug: {
          totalSelected: finalSelectedContacts.length,
          validEmails: validContacts.length,
          sampleEmails: validContacts.slice(0, 3).map(c => c.email)
        }
      }

      // Send to Make.com webhook
      const response = await fetch('https://hook.us2.make.com/6pn4r8sxaci5dq7gfcr233bbztwo6xis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        throw new Error(`Make.com webhook failed with status: ${response.status}`)
      }

      const result = await response.text()
      console.log('Make.com webhook response:', result)
      
      setSending('success')
      
      alert(`Contacts sent to MailerLite successfully!\n\nGroup Name: ${webhookData.groupName}\nContacts: ${webhookData.contactCount}\nValid Emails: ${webhookData.emailCount}\nSample Emails: ${webhookData.debug.sampleEmails.join(', ')}\n\nOpening MailerLite dashboard...`)
      
      // Automatically open MailerLite campaigns dashboard
      window.open('https://dashboard.mailerlite.com/campaigns/status/draft', '_blank')
      
      // Clear form for next use
      setGroupName('')
      setSelectedContactIds([]) // Clear selected contacts after sending
      setManuallyDeselectedIds([])
      setAutoDeselectedByAllFilter([])
      
    } catch (e: any) {
      console.error('Send to MailerLite failed:', e)
      setSending('error')
      alert(`Failed to send contacts to MailerLite: ${e.message}`)
    }
  }

  if (loading) return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your campaign dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Communication Hub</h1>
          <p className="text-gray-600 text-lg">Manage email campaigns and social media posts</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Email Campaigns
                </div>
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'social'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Social Media
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'email' ? (
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
                {['select', 'filter', 'compose'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === step 
                        ? 'bg-blue-600 text-white' 
                        : index < ['select', 'filter', 'compose'].indexOf(currentStep)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < ['select', 'filter', 'compose'].indexOf(currentStep)
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
              {/* Step 1: Search/Select Based on Method */}
              {currentStep === 'select' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Step 1: Search and Select Tags
                    </h3>
                    <p className="text-gray-600">
                      Search for tags and select the ones you want to filter by.
                    </p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    {/* Show different content based on search mode */}
                    {searchMode === 'tags' ? (
                      <>
                        {/* Tag Search */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-sm font-medium text-gray-700 mb-3">Search tags:</p>
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                              placeholder="Type to search tags..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Tag Selection */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-sm font-medium text-gray-700 mb-3">Available tags:</p>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {allTags
                              .filter(tag => !searchQuery || tag.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    selectedTags.includes(tag)
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Name Search */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-sm font-medium text-gray-700 mb-3">Search by name or email:</p>
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
                              placeholder="Type names or email addresses..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          {searchQuery && (
                            <p className="text-sm text-gray-600 mt-2">
                              Searching for: <span className="font-medium">"{searchQuery}"</span>
                            </p>
                          )}
                        </div>

                        {/* Search Results and Selection */}
                        {searchQuery && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-blue-800">Found {filteredContacts.length} matching contacts</span>
                              <span className="text-2xl font-bold text-blue-600">{filteredContacts.length}</span>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={selectAllFiltered}
                                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                >
                                  Select All ({getSelectAllCount()})
                                </button>
                                <button
                                  onClick={clearSelection}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                                >
                                  Clear
                                </button>
                              </div>
                              
                              <div className="text-sm text-blue-700">
                                <p>Selected: <span className="font-semibold">{selectedContactIds.length}</span> contacts</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
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
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Continue to Step 2 button clicked')
                        nextStep()
                      }}
                      disabled={
                        (searchMode === 'tags' && selectedTags.length === 0) || 
                        (searchMode === 'name' && (!searchQuery.trim() || selectedContactIds.length === 0)) ||
                        (searchMode === 'tags' && selectedContactIds.length === 0)
                      }
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Step 2</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: ANY or ALL (Only for Tag Selection) */}
              {currentStep === 'filter' && searchMode === 'tags' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Choose Filter Type</h3>
                    <p className="text-gray-600">Select how you want to combine the selected tags to filter your contacts.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-purple-800">Selected Tags</span>
                        <span className="text-2xl font-bold text-purple-600">{selectedTags.length}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedTags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-start p-4 bg-white rounded-lg border-2 border-transparent hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            value="any"
                            checked={filterType === 'any'}
                            onChange={(e) => handleFilterTypeChange(e.target.value as 'any' | 'all')}
                            className="mr-4 mt-1"
                          />
                          <div>
                            <span className="text-lg font-semibold text-purple-900">ANY tag</span>
                            <p className="text-sm text-purple-700 mt-1">Include contacts that have ANY of the selected tags</p>
                            <p className="text-xs text-purple-500 mt-2">This will show contacts that match at least one of your selected tags</p>
                          </div>
                        </label>
                        
                        <label className="flex items-start p-4 bg-white rounded-lg border-2 border-transparent hover:border-purple-300 transition-all duration-200">
                          <input
                            type="radio"
                            value="all"
                            checked={filterType === 'all'}
                            onChange={(e) => handleFilterTypeChange(e.target.value as 'any' | 'all')}
                            className="mr-4 mt-1"
                          />
                          <div>
                            <span className="text-lg font-semibold text-purple-900">ALL tags</span>
                            <p className="text-sm text-purple-700 mt-1">Include contacts that have ALL of the selected tags</p>
                            <p className="text-xs text-purple-500 mt-2">This will show only contacts that match all of your selected tags</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Selected Recipients</span>
                        <span className="text-2xl font-bold text-blue-600">{getStep2RecipientCount()}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Recipients that will receive your email with {filterType.toUpperCase()} filter
                      </p>
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
                      disabled={getStep2RecipientCount() === 0}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Step 3</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Send to MailerLite */}
              {currentStep === 'compose' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Step 3: Send to MailerLite
                    </h3>
                    <p className="text-gray-600">
                      Send your selected contacts to MailerLite for email campaigns.
                    </p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-200 shadow-sm">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserGroupIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          Ready to Send to MailerLite
                        </h4>
                        
                        <p className="text-gray-600 mb-6">
                          Your selected contacts will be sent to MailerLite where you can create and manage email campaigns.
                        </p>
                        
                                                 <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-medium text-gray-700">Selected Contacts</span>
                             <span className="text-2xl font-bold text-blue-600">{selectedContactIds.length}</span>
                           </div>
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-700">Filter Type</span>
                             <span className="text-sm font-semibold text-purple-600 uppercase">
                               {searchMode === 'tags' ? filterType : 'name search'}
                             </span>
                           </div>
                           {searchMode === 'tags' && selectedTags.length > 0 && (
                             <div className="mt-2">
                               <span className="text-sm font-medium text-gray-700">Tags: </span>
                               <span className="text-sm text-purple-600">
                                 {selectedTags.join(', ')}
                               </span>
                             </div>
                           )}
                         </div>
                         
                         {/* Group Name Input */}
                         <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             MailerLite Group Name
                           </label>
                           <input
                             type="text"
                             className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                             placeholder="Enter group name (optional)..."
                             value={groupName}
                             onChange={(e) => setGroupName(e.target.value)}
                           />
                           <p className="text-xs text-gray-500 mt-1">
                             Leave blank to use default name: "Contacts from Copper ({selectedContactIds.length})"
                           </p>
                         </div>
                        
                        <button
                          onClick={handleSendToMailerLite}
                          disabled={sending === 'loading'}
                          className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                          {sending === 'loading' ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              <span>Sending to MailerLite...</span>
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="h-6 w-6" />
                              <span>Send {selectedContactIds.length} Contacts to MailerLite</span>
                            </>
                          )}
                        </button>
                        
                        <p className="text-xs text-gray-500 mt-4">
                          You'll be able to create email campaigns in the MailerLite dashboard once the contacts are synced.
                        </p>
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
                  </div>

                  {sending === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Failed to send contacts to MailerLite. Please try again.</p>
                    </div>
                  )}
                  {sending === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        Contacts sent to MailerLite successfully!
                      </p>
                      <a 
                        href="https://dashboard.mailerlite.com/subscribers" 
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

          {/* RIGHT BOX: Recipients & Campaign Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UsersIcon className="h-6 w-6 mr-3 text-green-600" />
              Recipients
            </h2>

            {/* Selected Tags at Top */}
            {searchMode === 'tags' && selectedTags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipients Summary */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-800">Selected Recipients</span>
                <span className="text-3xl font-bold text-blue-600">{selectedContactIds.length}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {searchMode === 'tags' 
                  ? `Contacts with ${selectedTags.length} selected tag(s) using ${filterType.toUpperCase()} filter`
                  : `Contacts matching "${searchQuery}"`
                }
              </p>
            </div>



            {/* Scrollable Recipients List */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recipients</h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-48">
                {selectedContactIds.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No recipients selected</p>
                    <p className="text-sm">Use the left panel to select your recipients</p>
                  </div>
                ) : (
                  getSelectedContacts().map((contact: Contact) => (
                    <div key={contact.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => handleRecipientToggle(contact.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>



              {/* Recipients count info */}
              {selectedContactIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    Showing all {selectedContactIds.length} selected recipients
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        ) : (
          /* SOCIAL MEDIA TAB */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT BOX: Social Media Creation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ShareIcon className="h-6 w-6 mr-3 text-green-600" />
                Social Media Post
              </h2>

              <div className="flex-1 flex flex-col space-y-6">
                {/* Platform Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">📱 Automatic Platform Distribution</h3>
                  <p className="text-sm text-blue-700">
                    All posts automatically go to LinkedIn, Twitter/X, and Facebook
                  </p>
                </div>

                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Text</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 resize-none"
                    placeholder="Write your social media post text..."
                    value={socialContent}
                    onChange={(e) => setSocialContent(e.target.value)}
                  />
                </div>

                {/* Image Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attach Image URL</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      value={socialImageUrl}
                      onChange={(e) => setSocialImageUrl(e.target.value)}
                    />
                    {socialImageUrl && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Image URL: {socialImageUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300"
                    value={socialScheduleDate}
                    onChange={(e) => setSocialScheduleDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">Select when you want this post to be published</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                <button
                  onClick={handleSocialPost}
                  disabled={
                    sending === 'loading' || 
                    !socialContent.trim() ||
                    !socialScheduleDate
                  }
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {sending === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <ShareIcon className="h-5 w-5" />
                      <span>
                        Schedule Post
                        <span className="text-xs block">(LinkedIn, Twitter/X, Facebook)</span>
                      </span>
                    </>
                  )}
                </button>
              </div>

              {sending === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Failed to post. Please try again.</p>
                </div>
              )}
              {sending === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Post scheduled successfully!
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT BOX: Social Media Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <EyeIcon className="h-6 w-6 mr-3 text-green-600" />
                Post Preview
              </h2>

              <div className="flex-1 flex flex-col">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Platform</span>
                    <span className="text-lg font-bold text-green-600">LinkedIn, Twitter/X, Facebook</span>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">GF</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Glenn Financial Services</div>
                      <div className="text-sm text-gray-500">Just now</div>
                    </div>
                  </div>
                  
                  {socialContent ? (
                    <div className="text-gray-900 whitespace-pre-wrap">{socialContent}</div>
                  ) : (
                    <div className="text-gray-400 italic">Your post content will appear here...</div>
                  )}
                  
                  {socialImageUrl && (
                    <div className="mt-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                        📷 Image URL: {socialImageUrl}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
