'use client'

import { useState } from 'react'

export default function BufferScheduler() {
  const [postContent, setPostContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    
    // Auto-convert URL to .jpg or .png if it doesn't end with a supported image extension
    if (url && !url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i)) {
      let finalUrl = url
      
      // If URL ends with .avif, convert to .png
      if (url.toLowerCase().endsWith('.avif')) {
        finalUrl = url.replace(/\.avif$/i, '.png')
      }
      // For URLs without extensions, add .jpg
      else if (!url.includes('.')) {
        finalUrl = url + '.jpg'
      }
      // For URLs with other extensions, replace with .jpg
      else {
        finalUrl = url.replace(/\.[^/.]+$/, '.jpg')
      }
      
      setImageUrl(finalUrl)
    }
  }

  const handlePost = async () => {
    if (!postContent) {
      alert('Please enter post content.')
      return
    }

    setSending(true)
    setSuccess(null)
    setError(null)
    
    try {
      const platforms = ['facebook', 'linkedin', 'instagram']

      const platformFlags = {
        linkedin: true,
        instagram: true,
        facebook: true,
      }

      const postData: any = {
        postContent,
        scheduledDate,
        platforms,
        ...platformFlags,
      };

      if (imageUrl) {
        postData.media = {
          photo: imageUrl
        };
      }

      await sendPost(postData)
    } catch (err: any) {
      console.error('Error sending post:', err)
      setError(err.message || 'Failed to send post.')
      setSending(false)
    }
  }

  const sendPost = async (postData: any) => {
    try {
      const response = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post to Buffer.');
      }

      setSuccess('Post sent to Buffer via Make.com!')
      setPostContent('')
      setImageUrl('')
      setScheduledDate('')
    } catch (err: any) {
      throw err
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-gray-900">New Social Media Post</h3>
      {success && <div className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{success}</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded-lg">{error}</div>}

      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="What's on your mind? (Include your article link here)"
        className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-700">Image URL (Optional):</p>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="Paste image URL here (auto-converts to .jpg/.png)"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500">
          URLs without image extensions will automatically be converted to .jpg format
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-700">Schedule Date:</p>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handlePost}
        disabled={sending || !postContent}
        className="mt-2 w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
      >
        {sending ? 'Sending...' : 'Schedule Post'}
      </button>
    </div>
  )
}