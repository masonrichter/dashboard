'use client'

import { useState, useEffect } from 'react'
import { 
  TagIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { 
  getAllTags, 
  getContactsByTag, 
  getContactCountByTag,
  CopperContactSummary 
} from '@/lib/copper'
import { useTags } from '@/app/context/DashboardContext'

export default function TagExplorer() {
  const { 
    selectedTags, 
    availableTags, 
    tagCounts, 
    addSelectedTag, 
    removeSelectedTag, 
    clearSelectedTags,
    setAvailableTags,
    setTagCounts
  } = useTags()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [contacts, setContacts] = useState<CopperContactSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    if (selectedTag) {
      loadContactsForTag(selectedTag)
    } else {
      setContacts([])
    }
  }, [selectedTag])

  const loadTags = async () => {
    try {
      setLoading(true)
      const [tagsData, countsData] = await Promise.all([
        getAllTags(),
        getContactCountByTag()
      ])
      setAvailableTags(tagsData)
      setTagCounts(countsData)
    } catch (error) {
      console.error('Error loading tags:', error)
      setAvailableTags([])
      setTagCounts({})
    } finally {
      setLoading(false)
    }
  }

  const loadContactsForTag = async (tagName: string) => {
    try {
      setContactsLoading(true)
      const contactsData = await getContactsByTag(tagName)
      setContacts(contactsData)
    } catch (error) {
      console.error(`Error loading contacts for tag ${tagName}:`, error)
      setContacts([])
    } finally {
      setContactsLoading(false)
    }
  }

  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName)
    setSearchTerm('')
    setSelectedCategory('all')
    
    // Sync with global tag context
    if (selectedTags.includes(tagName)) {
      removeSelectedTag(tagName)
    } else {
      addSelectedTag(tagName)
    }
  }

  const clearSelection = () => {
    setSelectedTag(null)
    setContacts([])
    setSearchTerm('')
    setSelectedCategory('all')
    clearSelectedTags()
  }

  const getTagCategory = (tagName: string): string => {
    const lowerTag = tagName.toLowerCase()
    
    if (lowerTag.includes('client') || lowerTag.includes('active') || lowerTag.includes('prospect')) {
      return 'Client Status'
    }
    if (lowerTag.includes('high') || lowerTag.includes('value') || lowerTag.includes('premium')) {
      return 'Value Tier'
    }
    if (lowerTag.includes('retirement') || lowerTag.includes('planning') || lowerTag.includes('investment')) {
      return 'Service Interest'
    }
    if (lowerTag.includes('newsletter') || lowerTag.includes('email') || lowerTag.includes('marketing')) {
      return 'Communication'
    }
    if (lowerTag.includes('referral') || lowerTag.includes('partner') || lowerTag.includes('affiliate')) {
      return 'Referral'
    }
    
    return 'Other'
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Client Status':
        return 'bg-blue-100 text-blue-800'
      case 'Value Tier':
        return 'bg-green-100 text-green-800'
      case 'Service Interest':
        return 'bg-purple-100 text-purple-800'
      case 'Communication':
        return 'bg-orange-100 text-orange-800'
      case 'Referral':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      contact.tags.some(tag => getTagCategory(tag) === selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(availableTags.map(getTagCategory)))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Tag Explorer</h2>
        <div className="flex items-center space-x-3">
          {selectedTags.length > 0 && (
            <div className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected for CRM filtering
            </div>
          )}
          {selectedTag && (
            <button
              onClick={clearSelection}
              className="btn-secondary flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Clear Selection
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tags List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All Tags</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTag === tag
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : selectedTags.includes(tag)
                      ? 'border-primary-300 bg-primary-25 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{tag}</span>
                      {selectedTags.includes(tag) && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Active Filter
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {tagCounts[tag] || 0}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagCategory(tag) === 'Other' ? 'bg-gray-100 text-gray-800' : getCategoryColor(getTagCategory(tag))}`}>
                      {getTagCategory(tag)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {availableTags.length === 0 && (
              <div className="text-center py-8">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No tags are available in your Copper CRM.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Display */}
        <div className="lg:col-span-2">
          <div className="card">
            {selectedTag ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Contacts with tag: <span className="text-primary-600">{selectedTag}</span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {contacts.length} total contacts
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(getTagCategory(selectedTag))}`}>
                    {getTagCategory(selectedTag)}
                  </span>
                </div>

                {/* Search and Filter */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contacts List */}
                {contactsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{contact.email}</span>
                            </div>
                            
                            {contact.company && (
                              <div className="flex items-center space-x-2 mb-3">
                                <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{contact.company}</span>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(getTagCategory(tag))}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right text-xs text-gray-500">
                            <div>Last modified:</div>
                            <div>{new Date(contact.lastModified).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!contactsLoading && filteredContacts.length === 0 && (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'No contacts match your current filters.'
                        : `No contacts found with the tag "${selectedTag}".`
                      }
                    </p>
                  </div>
                )}

                {!contactsLoading && filteredContacts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Showing {filteredContacts.length} of {contacts.length} contacts
                      {searchTerm && ` matching "${searchTerm}"`}
                      {selectedCategory !== 'all' && ` in category "${selectedCategory}"`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a tag</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click on a tag from the list to view all contacts with that tag.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tag Categories Summary */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tag Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.filter(cat => cat !== 'all').map((category) => {
            const categoryTags = availableTags.filter(tag => getTagCategory(tag) === category)
            const totalContacts = categoryTags.reduce((sum, tag) => sum + (tagCounts[tag] || 0), 0)
            
            return (
              <div key={category} className="text-center p-3 border border-gray-200 rounded-lg">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(category)}`}>
                  {category}
                </div>
                <div className="text-sm text-gray-600">{categoryTags.length} tags</div>
                <div className="text-lg font-semibold text-gray-900">{totalContacts}</div>
                <div className="text-xs text-gray-500">contacts</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 