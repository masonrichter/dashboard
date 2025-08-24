'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, TagIcon, UserIcon } from '@heroicons/react/24/outline'

interface CopperContactSummary {
  id: number
  name: string
  emails: { email: string; category: string }[]
  tags: string[]
}

interface CopperTag {
  id: number
  name: string
}

interface MailerLiteGroup {
  id: number
  name: string
}

interface MailerLiteSubscriber {
  email: string
  fields: {
    name?: string
  }
}

const fetchCopperTags = async (): Promise<CopperTag[]> => {
  const response = await fetch('/api/copper/tags')
  if (!response.ok) throw new Error('Failed to fetch Copper tags')
  return response.json()
}

const fetchAllCopperContacts = async (): Promise<CopperContactSummary[]> => {
  const response = await fetch('/api/copper/search/all-people')
  if (!response.ok) throw new Error('Failed to fetch all Copper contacts')
  return response.json()
}

const fetchMailerLiteGroups = async (): Promise<MailerLiteGroup[]> => {
  const response = await fetch('/api/mailerlite/groups')
  if (!response.ok) throw new Error('Failed to fetch MailerLite groups')
  return response.json()
}

const addSubscribersToGroup = async (
  groupId: number,
  subscribers: MailerLiteSubscriber[]
): Promise<any> => {
  const response = await fetch('/api/mailerlite/subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, subscribers }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to add subscribers')
  }
  return response.json()
}

export default function TagExplorer() {
  const [tags, setTags] = useState<CopperTag[]>([])
  const [contacts, setContacts] = useState<CopperContactSummary[]>([])
  const [mailerLiteGroups, setMailerLiteGroups] = useState<MailerLiteGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, contactsData, groupsData] = await Promise.all([
          fetchCopperTags(),
          fetchAllCopperContacts(),
          fetchMailerLiteGroups(),
        ])
        setTags(tagsData)
        setContacts(contactsData)
        setMailerLiteGroups(groupsData)
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load data from APIs.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSyncToMailerLite = async () => {
    if (!selectedTagId || !selectedGroupId) {
      setErrorMessage('Please select a Copper tag and a MailerLite group.')
      return
    }
    setIsSending(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const subscribers = filteredContacts
        .filter((contact) => contact.emails && contact.emails.length > 0)
        .map((contact) => ({
          email: contact.emails[0].email,
          fields: { name: contact.name },
        }))

      if (subscribers.length === 0) {
        setErrorMessage(
          'No contacts with email addresses found for the selected tag.'
        )
        setIsSending(false)
        return
      }

      await addSubscribersToGroup(selectedGroupId, subscribers)
      setSuccessMessage(
        `Successfully synced ${subscribers.length} contacts to MailerLite!`
      )
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sync.')
    } finally {
      setIsSending(false)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const hasSelectedTag =
      selectedTagId === null || contact.tags.some(tag => tag === tags.find(t => t.id === selectedTagId)?.name)
    
    const contactEmail = contact.emails?.[0]?.email || '';

    const matchesSearch = searchTerm === '' ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return hasSelectedTag && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading data...</span>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Tag Explorer</h2>
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Tag Explorer</h2>
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Window - Tag and Group Selection Only */}
        <div className="space-y-6">
          <div>
            <label htmlFor="tag-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Copper Tag
            </label>
            <select
              id="tag-select"
              value={selectedTagId || ''}
              onChange={(e) => setSelectedTagId(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            {selectedTagId && (
              <div className="mt-2 bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Selected Tag:</p>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  <TagIcon className="h-4 w-4 mr-1" />
                  {tags.find(t => t.id === selectedTagId)?.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 mb-2">
              MailerLite Group for Sync
            </label>
            <select
              id="group-select"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="" disabled>Select a group...</option>
              {mailerLiteGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {selectedGroupId && (
              <div className="mt-2 bg-green-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Target Group:</p>
                <p className="text-sm text-gray-900">{mailerLiteGroups.find(g => g.id === selectedGroupId)?.name}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Contacts
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or tag..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncToMailerLite}
            disabled={isSending || filteredContacts.length === 0 || !selectedGroupId}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSending || filteredContacts.length === 0 || !selectedGroupId
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {isSending ? 'Syncing...' : 'Sync to MailerLite'}
          </button>
        </div>

        {/* Right Window - Summary Statistics Only */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Contact Summary
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{filteredContacts.length}</p>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {filteredContacts.filter(c => c.emails && c.emails.length > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">With Email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}