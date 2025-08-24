'use client'

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

interface EmailEditorProps {
  recipients: string[];
  onSend: (emailData: any) => void;
  onCancel: () => void;
}

export default function EmailEditor({ recipients, onSend, onCancel }: EmailEditorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagline, setTagline] = useState('');
  const [readMore, setReadMore] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mailerlite/templates');
      if (response.ok) {
        const templatesData = await response.json();
        setTemplates(templatesData);
      } else {
        setError('Failed to fetch templates');
      }
    } catch (err) {
      setError('Error loading templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setSubject(template.subject || '');
    setContent(template.content || '');
    setTitle('');
    setTagline('');
    setReadMore('');
    setPdfFile(null);
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

  const handleSend = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content');
      return;
    }

    const emailData = {
      subject: subject.trim(),
      title: title.trim(),
      content: content.trim(),
      tagline: tagline.trim(),
      readMore: readMore.trim(),
      pdfFile,
      recipients,
      fromName: 'Your Name', // Make this configurable
      fromEmail: 'your-email@domain.com', // Make this configurable
      templateId: selectedTemplate?.id
    };

    onSend(emailData);
  };

  const renderPreview = () => {
    let previewContent = content;
    
    // Create a simple preview with the new fields
    const previewHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">${title || 'Title'}</h1>
        <p style="font-style: italic; color: #7f8c8d; margin-bottom: 20px;">${tagline || 'Tagline'}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
          ${content || 'Content will appear here...'}
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading templates...</span>
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
          <h2 className="text-xl font-semibold text-slate-900">Email Editor</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setSubject('');
                  setTitle('');
                  setContent('');
                  setTagline('');
                  setReadMore('');
                  setPdfFile(null);
                }}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  !selectedTemplate 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Start from scratch</span>
                </div>
              </button>
              
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate?.id === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{template.name}</div>
                  <div className="text-sm text-slate-600 mt-1">{template.subject}</div>
                </button>
              ))}
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

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
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

          {/* Recipients Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">
              <strong>Recipients:</strong> {recipients.length} people
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {recipients.slice(0, 3).join(', ')}
              {recipients.length > 3 && ` and ${recipients.length - 3} more...`}
            </div>
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
          disabled={!subject.trim() || !title.trim() || !content.trim()}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send to {recipients.length} recipients
        </button>
      </div>
    </div>
  );
}
