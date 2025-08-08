'use client'
import React, { useState, useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface MailerLiteGroup {
  id: number
  name: string
  active_subscribers_count: number
}

interface CopperTag {
  id: number
  name: string
}

interface CopperContactSummary {
  id: number
  name: string
  emails: { email: string; category: string }[]
  tags: string[]
}

interface MailerLiteSubscriber {
  email: string
  fields?: {
    name?: string
  }
}

// Client-side function to fetch data from your API routes
const fetchMailerLiteGroups = async (): Promise<MailerLiteGroup[]> => {
  const response = await fetch('/api/mailerlite/groups')
  if (!response.ok) {
    throw new Error('Failed to fetch MailerLite groups')
  }
  return response.json()
}

const fetchCopperTags = async (): Promise<CopperTag[]> => {
  const response = await fetch('/api/copper/tags')
  if (!response.ok) {
    throw new Error('Failed to fetch Copper tags')
  }
  return response.json()
}

const getContactsByTag = async (tagId: number): Promise<CopperContactSummary[]> => {
  const response = await fetch('/api/copper/search/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId: tagId }),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch contacts from Copper')
  }
  return response.json()
}

const addSubscribersToGroup = async (
  groupId: number,
  subscribers: MailerLiteSubscriber[]
) => {
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

export default function MailerLiteSender() {
  const [mailerLiteGroups, setMailerLiteGroups] = useState<MailerLiteGroup[]>([])
  const [copperTags, setCopperTags] = useState<CopperTag[]>([])
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const groups = await fetchMailerLiteGroups()
        const tags = await fetchCopperTags()
        setMailerLiteGroups(groups)
        setCopperTags(tags)
      } catch (err) {
        setErrorMessage('Failed to load data. Please check API connections.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSend = async () => {
    if (!selectedTag || !selectedGroup) {
      setErrorMessage('Please select both a Copper tag and a MailerLite group.')
      return
    }

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const contacts = await getContactsByTag(selectedTag)
      const subscribers: MailerLiteSubscriber[] = []
      const seenEmails = new Set()

      for (const contact of contacts) {
        if (contact.emails && contact.emails.length > 0 && !seenEmails.has(contact.emails[0].email)) {
          seenEmails.add(contact.emails[0].email)
          subscribers.push({
            email: contact.emails[0].email,
            fields: {
              name: contact.name,
            },
          })
        }
      }

      if (subscribers.length === 0) {
        setErrorMessage('No valid contacts with email addresses found for the selected tag.')
        setIsSending(false)
        return
      }

      await addSubscribersToGroup(selectedGroup, subscribers)
      setSuccessMessage(
        `Successfully added ${subscribers.length} subscribers to the selected group!`
      )
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading data...</span>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Sync Copper Contacts to MailerLite
      </h2>
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="copper-tag"
            className="block text-sm font-medium text-gray-700"
          >
            Select Copper Tag
          </label>
          <select
            id="copper-tag"
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" disabled>
              Select a tag...
            </option>
            {copperTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="mailerlite-group"
            className="block text-sm font-medium text-gray-700"
          >
            Select MailerLite Group
          </label>
          <select
            id="mailerlite-group"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-30