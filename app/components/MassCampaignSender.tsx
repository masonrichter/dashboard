'use client'
import React, { useState, useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  type: string
  created_at: string
  updated_at: string
  sent_at?: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  opened_rate: number
  clicked_rate: number
  unsubscribed_count: number
  bounce_count: number
}

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

// Client-side function to fetch data from your API routes
const fetchCampaigns = async (): Promise<Campaign[]> => {
  const response = await fetch('/api/mailerlite/campaigns?status=draft')
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  return response.json()
}

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

const sendCampaign = async (campaignId: string, recipients: any) => {
  const response = await fetch(`/api/mailerlite/campaigns/${campaignId}/actions/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipients),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to send campaign')
  }

  return response.json()
}

export default function MassCampaignSender() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [mailerLiteGroups, setMailerLiteGroups] = useState<MailerLiteGroup[]>([])
  const [copperTags, setCopperTags] = useState<CopperTag[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [recipientType, setRecipientType] = useState<'group' | 'tag'>('group')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignsData, groups, tags] = await Promise.all([
          fetchCampaigns(),
          fetchMailerLiteGroups(),
          fetchCopperTags()
        ])
        setCampaigns(campaignsData)
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
    if (!selectedCampaign) {
      setErrorMessage('Please select a campaign to send.')
      return
    }

    if (recipientType === 'group' && !selectedGroup) {
      setErrorMessage('Please select a MailerLite group.')
      return
    }

    if (recipientType === 'tag' && !selectedTag) {
      setErrorMessage('Please select a Copper tag.')
      return
    }

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      let recipients: any = {}

      if (recipientType === 'group') {
        recipients = {
          groups: [selectedGroup?.toString()],
          emails: []
        }
      } else {
        // For tag-based sending, we need to get the contacts first
        const contacts = await getContactsByTag(selectedTag!)
        const emailList = contacts
          .filter(contact => contact.emails && contact.emails.length > 0)
          .map(contact => contact.emails[0].email)
        
        if (emailList.length === 0) {
          setErrorMessage('No valid contacts with email addresses found for the selected tag.')
          setIsSending(false)
          return
        }
        
        recipients = {
          groups: [],
          emails: emailList
        }
      }

      const result = await sendCampaign(selectedCampaign, recipients)
      setSuccessMessage(
        `Campaign sent successfully! Check your MailerLite dashboard for tracking.`
      )
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading campaigns...</span>
      </div>
    )
  }

  if (errorMessage && !isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          Mass Campaign Sender
        </h2>
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          Mass Campaign Sender
        </h2>
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Campaign Selection */}
          <div>
            <label
              htmlFor="campaign"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Select Campaign Draft *
            </label>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No campaign drafts found.</p>
                <p className="text-sm">Create a campaign draft in MailerLite first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <label
                    key={campaign.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCampaign === campaign.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="campaign"
                      value={campaign.id}
                      checked={selectedCampaign === campaign.id}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {campaign.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(campaign.created_at)}
                        </div>
                        {campaign.recipients_count > 0 && (
                          <div className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            {campaign.recipients_count} recipients
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Recipient Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipient Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="group"
                  checked={recipientType === 'group'}
                  onChange={(e) => setRecipientType(e.target.value as 'group')}
                  className="mr-2"
                />
                <span className="text-sm">MailerLite Group</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="tag"
                  checked={recipientType === 'tag'}
                  onChange={(e) => setRecipientType(e.target.value as 'tag')}
                  className="mr-2"
                />
                <span className="text-sm">Copper Tag</span>
              </label>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            {recipientType === 'group' ? (
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="" disabled>
                    Select a group...
                  </option>
                  {mailerLiteGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.active_subscribers_count} subscribers)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
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
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || !selectedCampaign}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSending || !selectedCampaign
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Campaign...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Campaign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
