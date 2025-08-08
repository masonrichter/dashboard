'use client'

import { useState, useEffect } from 'react'
import { 
  PaperAirplaneIcon, 
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ChevronDownIcon,
  TagIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { 
  getGroupsAndSegmentsWithFallback, 
  MailerLiteGroup, 
  MailerLiteSegment,
  MailerLiteTemplate,
  syncCopperContactsToGroup,
  getOrCreateGroup,
  getTemplatesWithFallback,
  createAndSendCampaignFromTemplate,
  createAndSendCustomCampaign
} from '@/lib/mailerlite'
import { getContactsByTag, getAllTags, CopperContactSummary } from '@/lib/copper'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent'
  recipients: number
  sentAt?: string
  openRate?: number
  clickRate?: number
}

const recentCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Q4 Newsletter',
    subject: 'Q4 2023 Market Review',
    status: 'sent',
    recipients: 1250,
    sentAt: '2024-01-15',
    openRate: 68.5,
    clickRate: 12.3,
  },
  {
    id: '2',
    name: 'New Year Planning',
    subject: 'Financial Planning for 2024',
    status: 'scheduled',
    recipients: 980,
  },
]

export default function MailerLiteSender() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [campaignName, setCampaignName] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [scheduleDate, setScheduleDate] = useState('')
  const [groups, setGroups] = useState<MailerLiteGroup[]>([])
  const [segments, setSegments] = useState<MailerLiteSegment[]>([])
  const [templates, setTemplates] = useState<MailerLiteTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false)
  const [showSegmentsDropdown, setShowSegmentsDropdown] = useState(false)
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false)
  
  // Sync functionality states
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTagsForSync, setSelectedTagsForSync] = useState<string[]>([])
  const [syncGroupName, setSyncGroupName] = useState('')
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    message: string
    addedCount?: number
    errors?: string[]
  } | null>(null)

  // Campaign sending states
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [campaignResult, setCampaignResult] = useState<{
    success: boolean
    message: string
    campaignId?: string
  } | null>(null)
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<MailerLiteTemplate | null>(null)

  // Load groups, segments, and templates on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Load available tags when sync modal opens
  useEffect(() => {
    if (showSyncModal) {
      loadAvailableTags()
    }
  }, [showSyncModal])

  // Update subject and content when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setSubject(template.subject)
        setContent(template.content?.html || '')
      }
    }
  }, [selectedTemplate, templates])

  const loadData = async () => {
    try {
      setLoading(true)
      const [groupsData, templatesData] = await Promise.all([
        getGroupsAndSegmentsWithFallback(),
        getTemplatesWithFallback()
      ])
      setGroups(groupsData.groups)
      setSegments(groupsData.segments)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTags = async () => {
    try {
      const tags = await getAllTags()
      setAvailableTags(tags)
    } catch (error) {
      console.error('Error loading available tags:', error)
      setAvailableTags([])
    }
  }

  const handleSendCampaign = async () => {
    if (getSelectedRecipientsCount() === 0) {
      setCampaignResult({
        success: false,
        message: 'Please select at least one group or segment to send to.'
      })
      return
    }

    if (!campaignName.trim() || !subject.trim() || !content.trim()) {
      setCampaignResult({
        success: false,
        message: 'Please fill in all required fields: Campaign Name, Subject, and Content.'
      })
      return
    }

    setSendingCampaign(true)
    setCampaignResult(null)

    try {
      let campaign

      if (selectedTemplate) {
        // Send using template
        campaign = await createAndSendCampaignFromTemplate(
          selectedTemplate,
          campaignName,
          subject,
          selectedGroups,
          selectedSegments,
          scheduleDate || undefined
        )
      } else {
        // Send using custom content
        campaign = await createAndSendCustomCampaign(
          campaignName,
          subject,
          content,
          content.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
          selectedGroups,
          selectedSegments,
          scheduleDate || undefined
        )
      }

      setCampaignResult({
        success: true,
        message: scheduleDate 
          ? `Campaign "${campaignName}" scheduled successfully for ${new Date(scheduleDate).toLocaleString()}`
          : `Campaign "${campaignName}" sent successfully to ${getSelectedRecipientsCount()} recipients`,
        campaignId: campaign.id
      })

      // Reset form
      setCampaignName('')
      setSubject('')
      setContent('')
      setSelectedTemplate('')
      setSelectedGroups([])
      setSelectedSegments([])
      setScheduleDate('')

      // Refresh data
      await loadData()

    } catch (error) {
      console.error('Error sending campaign:', error)
      setCampaignResult({
        success: false,
        message: `Error sending campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleSyncContacts = async () => {
    if (selectedTagsForSync.length === 0 || !syncGroupName.trim()) {
      setSyncResult({
        success: false,
        message: 'Please select at least one tag and enter a group name.'
      })
      return
    }

    setSyncLoading(true)
    setSyncResult(null)

    try {
      // Get contacts for all selected tags
      const allContacts: CopperContactSummary[] = []
      const seenEmails = new Set<string>()

      for (const tag of selectedTagsForSync) {
        const contacts = await getContactsByTag(tag)
        for (const contact of contacts) {
          if (contact.email && !seenEmails.has(contact.email)) {
            seenEmails.add(contact.email)
            allContacts.push(contact)
          }
        }
      }

      if (allContacts.length === 0) {
        setSyncResult({
          success: false,
          message: 'No contacts found with the selected tags.'
        })
        return
      }

      // Prepare contacts for MailerLite
      const mailerliteContacts = allContacts.map(contact => ({
        email: contact.email,
        name: contact.name,
        fields: {
          company: contact.company || '',
          tags: contact.tags.join(', '),
          last_contact: contact.lastModified
        }
      }))

      // Sync to MailerLite
      const result = await syncCopperContactsToGroup(mailerliteContacts, syncGroupName)

      setSyncResult({
        success: true,
        message: `Successfully synced ${result.addedCount} contacts to group "${syncGroupName}"`,
        addedCount: result.addedCount,
        errors: result.errors
      })

      // Refresh groups list
      await loadData()

    } catch (error) {
      console.error('Error syncing contacts:', error)
      setSyncResult({
        success: false,
        message: `Error syncing contacts: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setSyncLoading(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    )
  }

  const toggleTagForSync = (tag: string) => {
    setSelectedTagsForSync(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearAllRecipients = () => {
    setSelectedGroups([])
    setSelectedSegments([])
  }

  const getSelectedRecipientsCount = () => {
    const groupCount = selectedGroups.reduce((total, groupId) => {
      const group = groups.find(g => g.id === groupId)
      return total + (group?.total || 0)
    }, 0)
    
    const segmentCount = selectedSegments.reduce((total, segmentId) => {
      const segment = segments.find(s => s.id === segmentId)
      return total + (segment?.total || 0)
    }, 0)
    
    return groupCount + segmentCount
  }

  const resetSyncModal = () => {
    setSelectedTagsForSync([])
    setSyncGroupName('')
    setSyncResult(null)
    setShowSyncModal(false)
  }

  const previewTemplateContent = (template: MailerLiteTemplate) => {
    setPreviewTemplate(template)
    setShowTemplatePreview(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Campaigns</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSyncModal(true)}
            className="btn-secondary flex items-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Sync Copper Contacts
          </button>
          <span className="text-sm text-gray-500">
            <UsersIcon className="inline h-4 w-4 mr-1" />
            {getSelectedRecipientsCount()} recipients selected
          </span>
        </div>
      </div>

      {/* Campaign Result Alert */}
      {campaignResult && (
        <div className={`p-4 rounded-lg ${
          campaignResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            campaignResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {campaignResult.message}
          </p>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sync Copper Contacts to MailerLite</h3>
              <button
                onClick={resetSyncModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tag Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Copper Tags
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableTags.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTagsForSync.includes(tag)}
                        onChange={() => toggleTagForSync(tag)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
                {selectedTagsForSync.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedTagsForSync.join(', ')}
                  </p>
                )}
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MailerLite Group Name
                </label>
                <input
                  type="text"
                  value={syncGroupName}
                  onChange={(e) => setSyncGroupName(e.target.value)}
                  className="input-field"
                  placeholder="Enter group name (will be created if it doesn't exist)"
                />
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div className={`p-3 rounded-lg ${
                  syncResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    syncResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {syncResult.message}
                  </p>
                  {syncResult.addedCount && (
                    <p className="text-xs text-green-600 mt-1">
                      Added {syncResult.addedCount} contacts to the group.
                    </p>
                  )}
                  {syncResult.errors && syncResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 font-medium">Errors:</p>
                      <ul className="text-xs text-red-600 mt-1 space-y-1">
                        {syncResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={resetSyncModal}
                  className="btn-secondary"
                  disabled={syncLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSyncContacts}
                  disabled={syncLoading || selectedTagsForSync.length === 0 || !syncGroupName.trim()}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Sync Contacts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Template Preview: {previewTemplate.name}</h3>
              <button
                onClick={() => setShowTemplatePreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <p className="text-sm text-gray-900">{previewTemplate.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content:</label>
                <div 
                  className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: previewTemplate.content?.html || 
                           previewTemplate.html || 
                           '<p>No HTML content available for this template.</p>' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Campaign */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="input-field"
                placeholder="Enter campaign name"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      {selectedTemplate 
                        ? templates.find(t => t.id === selectedTemplate)?.name || 'Select Template'
                        : 'Select Template (Optional)'
                      }
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {showTemplatesDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">Templates</h4>
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate('')}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <label 
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedTemplate(template.id)
                              setShowTemplatesDropdown(false)
                            }}
                          >
                            <input
                              type="radio"
                              name="template"
                              checked={selectedTemplate === template.id}
                              onChange={() => {
                                setSelectedTemplate(template.id)
                                setShowTemplatesDropdown(false)
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">{template.name}</div>
                              <div className="text-xs text-gray-500">{template.category || 'No category'}</div>
                            </div>
                          </label>
                          <button
                            type="button"
                            onClick={() => previewTemplateContent(template)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
                placeholder="Enter subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="input-field"
                placeholder="Enter email content (HTML supported)"
              />
            </div>

            {/* Recipients Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Recipients
              </label>
              
              {/* Groups Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGroupsDropdown(!showGroupsDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      {selectedGroups.length > 0 
                        ? `${selectedGroups.length} group${selectedGroups.length !== 1 ? 's' : ''} selected`
                        : 'Select Groups'
                      }
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {showGroupsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">Groups</h4>
                        {selectedGroups.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedGroups([])}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      {groups.map((group) => (
                        <label key={group.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => toggleGroup(group.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{group.name}</div>
                            <div className="text-xs text-gray-500">{group.total} subscribers</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Segments Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSegmentsDropdown(!showSegmentsDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      {selectedSegments.length > 0 
                        ? `${selectedSegments.length} segment${selectedSegments.length !== 1 ? 's' : ''} selected`
                        : 'Select Segments'
                      }
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {showSegmentsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">Segments</h4>
                        {selectedSegments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedSegments([])}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      {segments.map((segment) => (
                        <label key={segment.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSegments.includes(segment.id)}
                            onChange={() => toggleSegment(segment.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                            <div className="text-xs text-gray-500">{segment.total} subscribers</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Recipients Display */}
              {(selectedGroups.length > 0 || selectedSegments.length > 0) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Selected Recipients</span>
                    <button
                      type="button"
                      onClick={clearAllRecipients}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {selectedGroups.map((groupId) => {
                      const group = groups.find(g => g.id === groupId)
                      return group ? (
                        <div key={`group-${groupId}`} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">📧 {group.name}</span>
                          <span className="text-gray-500">{group.total} subscribers</span>
                        </div>
                      ) : null
                    })}
                    {selectedSegments.map((segmentId) => {
                      const segment = segments.find(s => s.id === segmentId)
                      return segment ? (
                        <div key={`segment-${segmentId}`} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">🏷️ {segment.name}</span>
                          <span className="text-gray-500">{segment.total} subscribers</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleSendCampaign}
              disabled={sendingCampaign || getSelectedRecipientsCount() === 0}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingCampaign ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Sending Campaign...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {scheduleDate ? 'Schedule Campaign' : 'Send Campaign'} ({getSelectedRecipientsCount()} recipients)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h3>
          
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{campaign.recipients} recipients</span>
                      {campaign.sentAt && (
                        <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                
                {campaign.openRate && campaign.clickRate && (
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <span className="flex items-center">
                      <ChartBarIcon className="h-3 w-3 mr-1" />
                      Open: {campaign.openRate}%
                    </span>
                    <span className="flex items-center">
                      <ChartBarIcon className="h-3 w-3 mr-1" />
                      Click: {campaign.clickRate}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showGroupsDropdown || showSegmentsDropdown || showTemplatesDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowGroupsDropdown(false)
            setShowSegmentsDropdown(false)
            setShowTemplatesDropdown(false)
          }}
        />
      )}
    </div>
  )
} 