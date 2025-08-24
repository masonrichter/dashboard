'use client'

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  EyeIcon,
  UsersIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  active_subscribers_count: number;
  total_subscribers_count: number;
}

interface CampaignContent {
  id: string;
  html: string;
  plain_text: string;
  subject: string;
  from_name: string;
  from_email: string;
  reply_to: string;
}

interface AdvancedEmailEditorProps {
  onSend: (emailData: any) => void;
  onCancel: () => void;
  initialRecipients?: string[];
}

export default function AdvancedEmailEditor({ onSend, onCancel, initialRecipients = [] }: AdvancedEmailEditorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignContent, setCampaignContent] = useState<CampaignContent | null>(null);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [tagline, setTagline] = useState('');
  const [readMore, setReadMore] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fromName, setFromName] = useState('Your Name');
  const [fromEmail, setFromEmail] = useState('your-email@domain.com');
  const [replyTo, setReplyTo] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchGroups();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mailerlite/campaigns?status=draft');
      if (response.ok) {
        const campaignsData = await response.json();
        setCampaigns(campaignsData);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Error loading campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/mailerlite/groups');
      if (response.ok) {
        const groupsData = await response.json();
        setGroups(groupsData);
      } else {
        setError('Failed to fetch groups');
      }
    } catch (err) {
      setError('Error loading groups');
    }
  };

  const handleCampaignSelect = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowTemplateSelector(false);
    
    try {
      const response = await fetch(`/api/mailerlite/campaigns/${campaign.id}/content`);
      if (response.ok) {
        const content = await response.json();
        setCampaignContent(content);
        setSubject(content.subject || campaign.subject);
        setHtmlContent(content.html || '');
        setPlainTextContent(content.plain_text || '');
        setFromName(content.from_name || fromName);
        setFromEmail(content.from_email || fromEmail);
        setReplyTo(content.reply_to || '');
        setTitle('');
        setTagline('');
        setReadMore('');
        setPdfFile(null);
      }
    } catch (err) {
      setError('Error loading campaign content');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setReadMore(file.name);
    } else if (file) {
      setError('Please select a PDF file');
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!htmlContent.trim()) {
      setError('Please enter content');
      return;
    }

    if (selectedGroups.length === 0 && initialRecipients.length === 0) {
      setError('Please select at least one group or provide recipients');
      return;
    }

    const emailData = {
      subject: subject.trim(),
      title: title.trim(),
      htmlContent,
      plainTextContent,
      tagline: tagline.trim(),
      readMore: readMore.trim(),
      pdfFile,
      fromName,
      fromEmail,
      replyTo,
      templateId: selectedCampaign?.id,
      groupIds: selectedGroups.length > 0 ? selectedGroups : undefined,
      recipients: initialRecipients.length > 0 ? initialRecipients : undefined
    };

    onSend(emailData);
  };

  const renderPreview = () => {
    let previewHtml = htmlContent;
    
    // Create a simple preview with the new fields
    const previewHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">${title || 'Title'}</h1>
        <p style="font-style: italic; color: #7f8c8d; margin-bottom: 20px;">${tagline || 'Tagline'}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
          ${htmlContent || 'Content will appear here...'}
        </div>
        ${readMore ? `
        <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>📄 Read More:</strong> 
          <a href="#" style="color: #e74c3c; text-decoration: none; font-weight: bold;">${readMore}</a>
        </div>
        ` : ''}
      </div>
    `;

    return (
      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="mb-4">
          <strong>Subject:</strong> {subject}
        </div>
        <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
      </div>
    );
  };

  const getTotalRecipients = () => {
    if (selectedGroups.length > 0) {
      return selectedGroups.reduce((total, groupId) => {
        const group = groups.find(g => g.id === groupId);
        return total + (group?.active_subscribers_count || 0);
      }, 0);
    }
    return initialRecipients.length;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading email editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <EnvelopeIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Advanced Email Editor</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <EyeIcon className="h-4 w-4" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Template (Optional)
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="w-full p-3 border border-slate-300 rounded-lg text-left hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className={selectedCampaign ? 'text-slate-900' : 'text-slate-500'}>
                    {selectedCampaign ? selectedCampaign.name : 'Choose a template...'}
                  </span>
                  <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                </div>
              </button>
              
              {showTemplateSelector && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedCampaign(null);
                        setCampaignContent(null);
                        setShowTemplateSelector(false);
                        setSubject('');
                        setTitle('');
                        setHtmlContent('');
                        setPlainTextContent('');
                        setTagline('');
                        setReadMore('');
                        setPdfFile(null);
                      }}
                      className="w-full p-2 text-left hover:bg-slate-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                        <span>Start from scratch</span>
                      </div>
                    </button>
                  </div>
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => handleCampaignSelect(campaign)}
                      className="w-full p-3 text-left hover:bg-slate-50 border-t border-slate-100"
                    >
                      <div className="font-medium text-slate-900">{campaign.name}</div>
                      <div className="text-sm text-slate-600">{campaign.subject}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject..."
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email title..."
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tagline (optional)..."
            />
          </div>

          {/* From Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reply To (Optional)
              </label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="reply@domain.com"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Content (HTML) *
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={8}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email content... (HTML supported)"
            />
          </div>

          {/* Read More - PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Read More - PDF Upload
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={readMore}
                  onChange={(e) => setReadMore(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PDF file name or URL..."
                />
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload-advanced"
                />
                <label
                  htmlFor="pdf-upload-advanced"
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  <span>Upload PDF</span>
                </label>
              </div>
            </div>
            {pdfFile && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700 text-sm">
                  <CheckIcon className="h-4 w-4" />
                  <span>PDF uploaded: {pdfFile.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Recipients
            </label>
            <div className="relative">
              <button
                onClick={() => setShowGroupSelector(!showGroupSelector)}
                className="w-full p-3 border border-slate-300 rounded-lg text-left hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">
                    {selectedGroups.length > 0 
                      ? `${selectedGroups.length} group(s) selected (${getTotalRecipients()} recipients)`
                      : initialRecipients.length > 0 
                        ? `${initialRecipients.length} individual recipients`
                        : 'Select groups...'
                    }
                  </span>
                  <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                </div>
              </button>
              
              {showGroupSelector && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="p-3">
                    <div className="text-sm font-medium text-slate-700 mb-2">Select Groups:</div>
                    {groups.map((group) => (
                      <label key={group.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="rounded text-blue-600 h-4 w-4 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{group.name}</div>
                          <div className="text-xs text-slate-500">
                            {group.active_subscribers_count} active subscribers
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recipients Summary */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">
              <strong>Total Recipients:</strong> {getTotalRecipients()} people
            </div>
            {selectedGroups.length > 0 && (
              <div className="text-xs text-slate-500 mt-1">
                Groups: {selectedGroups.map(id => groups.find(g => g.id === id)?.name).join(', ')}
              </div>
            )}
            {initialRecipients.length > 0 && (
              <div className="text-xs text-slate-500 mt-1">
                Individual: {initialRecipients.slice(0, 3).join(', ')}
                {initialRecipients.length > 3 && ` and ${initialRecipients.length - 3} more...`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={!subject.trim() || !title.trim() || !htmlContent.trim() || (selectedGroups.length === 0 && initialRecipients.length === 0)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send to {getTotalRecipients()} recipients
        </button>
      </div>
    </div>
  );
}
