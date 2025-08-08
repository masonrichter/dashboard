'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, TagIcon } from '@heroicons/react/24/outline'

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="tag-select" className="block text-sm font-medium text-gray-700">
            Select Copper Tag
          </label>
          <select
            id="tag-select"
            value={selectedTagId || ''}
            onChange={(e) => setSelectedTagId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
            MailerLite Group for Sync
          </label>
          <select
            id="group-select"
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" disabled>Select a group...</option>
            {mailerLiteGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contacts by name, email, or tag..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtered Contacts ({filteredContacts.length})</h3>
        <button
          onClick={handleSyncToMailerLite}
          disabled={isSending || filteredContacts.length === 0 || !selectedGroupId}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSending || filteredContacts.length === 0 || !selectedGroupId
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isSending ? 'Syncing...' : 'Sync to MailerLite'}
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <li key={contact.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{contact.emails?.[0]?.email || 'No Email'}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {contact.tags && contact.tags.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {contact.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No contacts found for this tag or search term.</p>
        )}
      </div>
    </div>
  )
}