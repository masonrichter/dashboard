'use client'

import { useEffect, useState } from 'react'

type FeedItem = {
  id: number
  // Assuming a feed item has a type, details, and an associated person
  type: string
  details: string
  person?: {
    name?: string
  }
}

export default function CopperFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/api/copper/feed')
        if (!res.ok) {
          throw new Error('Failed to fetch Copper feed')
        }
        const data = await res.json()
        setFeed(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  if (loading) return <div className="p-4 text-center">Loading feed...</div>
  if (error) return <div className="p-4 text-red-500 text-center">Error: {error}</div>
  if (feed.length === 0) return <div className="p-4 text-center text-gray-500">No recent feed items found.</div>

  return (
    <div className="space-y-4">
      {feed.map((item) => (
        <div key={item.id} className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{item.type}</p>
          <p className="text-gray-600 mt-1">{item.details}</p>
          {item.person?.name && (
            <p className="text-xs text-gray-400 mt-2">Associated with: {item.person.name}</p>
          )}
        </div>
      ))}
    </div>
  )
}