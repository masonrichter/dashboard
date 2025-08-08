'use client'

import { useState } from 'react'

export default function BufferPoster() {
  const [postContent, setPostContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [sending, setSending] = useState(false)

  const handlePost = async () => {
    if (!postContent) {
      alert('Please enter post content.')
      return
    }

    setSending(true)
    try {
      // Hardcoded list of platforms to post to
      const platforms = ['facebook', 'linkedin', 'instagram']

      // NOTE: Replace this URL with the unique URL from your Make.com webhook
      const response = await fetch('https://hook.us2.make.com/qhqg2pvypyxucfr4hiuor1b3gghcubn8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent,
          imageUrl,
          scheduledDate,
          platforms, // This will now always send all three platforms
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post to Buffer.')
      }

      alert('Post sent to Buffer via Make.com!')
      setPostContent('')
      setImageUrl('')
      setScheduledDate('')
    } catch (error) {
      console.error('Error sending post:', error)
      alert('Failed to send post.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-gray-900">New Social Media Post</h3>
      
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-700">Image Link (Optional):</p>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Paste an image URL here"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
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