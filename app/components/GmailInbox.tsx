'use client'

import { useState } from 'react'
import { 
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PaperClipIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useGmail } from '@/app/hooks/useGmail'
import { EmailSummary } from '@/lib/google'

interface GmailInboxProps {
  accessToken?: string
  maxResults?: number
  query?: string
}

export default function GmailInbox({ accessToken, maxResults = 10, query = 'in:inbox' }: GmailInboxProps) {
  const {
    emails,
    loading,
    error,
    isAuthenticated,
    markAsRead,
    markAsUnread,
    deleteEmail,
    refreshEmails,
    clearError
  } = useGmail({ accessToken, maxResults, query })

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch {
      return 'Unknown'
    }
  }

  const handleEmailClick = async (email: EmailSummary) => {
    setSelectedEmail(email.id)
    
    // Mark as read if it's unread
    if (!email.isRead) {
      await markAsRead(email.id)
    }
  }

  const handleMarkAsRead = async (emailId: string, isRead: boolean) => {
    if (isRead) {
      await markAsUnread(emailId)
    } else {
      await markAsRead(emailId)
    }
  }

  const handleDeleteEmail = async (emailId: string) => {
    if (confirm('Are you sure you want to delete this email?')) {
      await deleteEmail(emailId)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gmail Not Connected</h3>
          <p className="text-sm text-gray-500">
            Please provide a valid Gmail access token to view your inbox.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gmail Inbox</h2>
          <p className="text-sm text-gray-500">
            {emails.length} emails • {emails.filter(e => !e.isRead).length} unread
          </p>
        </div>
        
        <button
          onClick={refreshEmails}
          disabled={loading}
          className="btn-secondary flex items-center"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error loading emails</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading emails...</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-sm text-gray-500">
              {query === 'in:inbox' ? 'Your inbox is empty.' : `No emails match the query: ${query}`}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedEmail === email.id
                    ? 'border-primary-500 bg-primary-50'
                    : email.isRead
                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {email.isRead ? (
                        <EnvelopeOpenIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                      )}
                      
                      <span className={`text-sm font-medium truncate ${
                        email.isRead ? 'text-gray-900' : 'text-blue-900'
                      }`}>
                        {email.subject}
                      </span>
                      
                      {email.hasAttachments && (
                        <PaperClipIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="truncate">{email.sender}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{email.senderEmail}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {email.snippet}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(email.date)}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(email.id, email.isRead)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {email.isRead ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEmail(email.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete email"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {emails.find(e => e.id === selectedEmail) && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {emails.find(e => e.id === selectedEmail)?.subject}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {emails.find(e => e.id === selectedEmail)?.sender} 
                      &lt;{emails.find(e => e.id === selectedEmail)?.senderEmail}&gt;
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {emails.find(e => e.id === selectedEmail)?.date}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {emails.find(e => e.id === selectedEmail)?.snippet}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 