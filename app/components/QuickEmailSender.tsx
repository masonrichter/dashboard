'use client'

import React, { useState, useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
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

export default function QuickEmailSender() {
  const [mailerLiteGroups, setMailerLiteGroups] = useState<MailerLiteGroup[]>([])
  const [copperTags, setCopperTags] = useState<CopperTag[]>([])
  const [recipientType, setRecipientType] = useState<'group' | 'tag' | 'individual'>('group')
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [individualEmails, setIndividualEmails] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsResponse, tagsResponse] = await Promise.all([
          fetch('/api/mailerlite/groups'),
          fetch('/api/copper/tags')
        ])
        
        if (groupsResponse.ok) {
          const groups = await groupsResponse.json()
          setMailerLiteGroups(groups)
        }
        
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json()
          setCopperTags(tags)
        }
      } catch (err) {
        setErrorMessage('Failed to load data. Please check API connections.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSend = async () => {
    if (!senderName || !senderEmail || !subject || !content) {
      setErrorMessage('Please fill in all required fields.')
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

    if (recipientType === 'individual' && !individualEmails.trim()) {
      setErrorMessage('Please enter at least one email address.')
      return
    }

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Parse individual emails if that option is selected
      let recipients: string[] = []
      if (recipientType === 'individual') {
        recipients = individualEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0)
      }

      const response = await fetch('/api/mailerlite/quick-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          groupId: selectedGroup,
          tagId: selectedTag,
          recipients,
          senderName,
          senderEmail,
          subject,
          content
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }

      setSuccessMessage('Email sent successfully!')
      
      // Reset form
      setSubject('')
      setContent('')
      setSelectedGroup(null)
      setSelectedTag(null)
      setIndividualEmails('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                MailerLite Group
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="tag"
                  checked={recipientType === 'tag'}
                  onChange={(e) => setRecipientType(e.target.value as 'tag')}
                  className="mr-2"
                />
                Copper Tag
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="individual"
                  checked={recipientType === 'individual'}
                  onChange={(e) => setRecipientType(e.target.value as 'individual')}
                  className="mr-2"
                />
                Individual Emails
              </label>
            </div>
          </div>

          {recipientType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select MailerLite Group
              </label>
              <select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose a group...</option>
                {mailerLiteGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.active_subscribers_count} subscribers)
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'tag' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Copper Tag
              </label>
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose a tag...</option>
                {copperTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses
              </label>
              <textarea
                value={individualEmails}
                onChange={(e) => setIndividualEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g., john@example.com, jane@example.com)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>
          )}
        </div>

        {/* Sender Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Email
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject line"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your email content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={isSending}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </button>
      </div>
    </div>
  )
}
