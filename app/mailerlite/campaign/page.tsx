'use client'

import { useEffect, useMemo, useState } from 'react'
import { EnvelopeIcon, MagnifyingGlassIcon, ChevronDownIcon, EyeIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline'

type Contact = {
  id: number
  name: string
  email: string
  tags: string[]
}

type MLGroup = {
  id: string
  name: string
  total: number
}

type Campaign = {
  id: string
  name: string
  subject: string
  status: string
  sent_at: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  opened_rate: number
  clicked_rate: number
}

type Subscriber = {
  id: string
  email: string
  name: string
  status: string
  sent: number
  opens_count: number
  clicks_count: number
  open_rate: number
  click_rate: number
  subscribed_at: string
  created_at: string
  updated_at: string
  fields: Record<string, any>
}

type ContactsByTag = Record<string, Contact[]>

export default function MailerPage() {
  // Data
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<MLGroup[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // MailerLite form fields
  const [groupName, setGroupName] = useState<string>('')

  // Copper selection
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTags, setExpandedTags] = useState<string[]>([])
  const [sending, setSending] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')



  // Load all data
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)

        const [contactsRes, groupsRes, campaignsRes] = await Promise.all([
          fetch('/api/copper/people'),
          fetch('https://connect.mailerlite.com/api/groups', {
            headers: {
              'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZDE3YTM1NDMyZjNkZTY2MjIwYTYzMDdiZGI0MWU5ZmRkZjc5NTQxNTJjYmQ4NGViMjU0N2Y4NzBhYTRmZTAxMTRhYzNhYTJmNjcwN2UyYmYiLCJpYXQiOjE3NTQ2MTcwMTYuMTI0MTEyLCJuYmYiOjE3NTQ2MTcwMTYuMTI0MTE0LCJleHAiOjQ5MTAyOTA2MTYuMTIxMTMzLCJzdWIiOiIxNzIzMzIxIiwic2NvcGVzIjpbXX0.mcBthQZ6ZlYSq5psf7D8o_1JqVgAfqNHg1cDcBKTyOcZeQqRoFuIsldEFy4mYMhzmmMka6asm9yWIQyWAAlBnboL_DWm_vDnyre6lHPOBVvNLo2f9F2k-2Oc235uLEHnIX1VJizxBRs6uUNjUbcP9FWpe3e1owLFwmfjZc69Il8p6SMAuwkR7RmA9sspKqkY5HaCg2qkBFx0h4D3GwoAEW6JRghEADRwL_4eGdEtZ7eRR7ON5cJiNGK9vNGtYzyT4VbVgYBd9ChkpHGdSrW_b1dtlIXMCPOl87t-1hZD2L3iHAsoCiHxlT-zkpJS9TGli_704VI-bL1hrHP9VO6yskTHZgxP3HlqZxvG_ZZWpd3I1eG1wTQqtd7AEbDuEk82pnaVwzav-o-Owso0KKz0jy7lSSg0-Ynbii4xJS3C2TN4AqYTM3r2-Hzyjt383m0XBrm_TzyEFpxi0dl6N9VwPvJtB7gZY3XyHibz7UwOWX7M0ZnmNX-dJQcca8S1MMS1g9oI7qCwsIhbusp5Js_ndFITChiTdDe51zB4V3vbyhyjbwAxqJA0Eqd-rteJCvpnqXBD6FIyajfH5nMFaZQznWzdsTwvMQVH2sjZbLmkU4kYFVXwBBo7G0rTanbbQXfwLzldJo3WY0yDMn4BLFrY26jXaEOcnOXIBEzS7yeYBd0`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }),
          // Use dedicated endpoint that returns sent campaigns
          fetch('/api/mailerlite/campaigns')
        ])

        if (!contactsRes.ok) throw new Error('Failed to fetch Copper contacts')
        if (!groupsRes.ok) throw new Error('Failed to fetch MailerLite groups')
        if (!campaignsRes.ok) throw new Error('Failed to fetch MailerLite campaigns')

        const contactsData: Contact[] = await contactsRes.json()
        const groupsData = (await groupsRes.json()).data.map((group: any) => ({
          id: group.id,
          name: group.name,
          total: group.subscribers_count
        }))

        const rawCampaigns = await campaignsRes.json()
        console.log('Raw campaigns from API:', rawCampaigns)
        const campaignsData: Campaign[] = (rawCampaigns || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          subject: c.subject || 'No subject',
          status: c.status,
          sent_at: c.finished_at || c.send_time || '',
          recipients_count: c.recipients_count ?? 0,
          opened_count: c.opened_count ?? 0,
          clicked_count: c.clicked_count ?? 0,
          opened_rate: c.opened_rate ?? 0,
          clicked_rate: c.clicked_rate ?? 0,
        }))
        console.log('Normalized campaigns:', campaignsData)

        if (!mounted) return
        console.log('Setting campaigns:', campaignsData.length, 'campaigns')
        setContacts(contactsData)
        setGroups(groupsData)
        setCampaigns(campaignsData)


      } catch (e: any) {
        if (!mounted) return
        setError(e.message || 'Failed to load data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])



  // Group contacts by tag for the left panel
  const contactsByTag: ContactsByTag = useMemo(() => {
    const grouped: ContactsByTag = {}
    contacts.forEach(c => {
      const tags = c.tags?.length ? c.tags : ['No Tag']
      tags.forEach(t => {
        if (!grouped[t]) grouped[t] = []
        grouped[t].push(c)
      })
    })
    return grouped
  }, [contacts])

  // Filter by search query
  const filteredByTag: ContactsByTag = useMemo(() => {
    if (!searchQuery) return contactsByTag
    const grouped: ContactsByTag = {}
    Object.entries(contactsByTag).forEach(([tag, list]) => {
      const filtered = list.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      if (filtered.length) grouped[tag] = filtered
    })
    return grouped
  }, [contactsByTag, searchQuery])

  const entries = useMemo(() => Object.entries(filteredByTag), [filteredByTag])

  // Copper selection handlers
  const toggleContact = (id: number) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleTagAll = (tag: string) => {
    const ids = (filteredByTag[tag] || []).map(c => c.id)
    const allSelected = ids.every(id => selectedContactIds.includes(id))
    setSelectedContactIds(prev =>
      allSelected ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))
    )
  }

  const toggleExpand = (tag: string) => {
    setExpandedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }



  // Send via the Make.com webhook
  const handleSend = async () => {
    if (!groupName || selectedContactIds.length === 0) {
      alert('Please fill out a group name and select at least one contact.')
      return
    }
    
    const emailsToSend = contacts
      .filter(contact => selectedContactIds.includes(contact.id))
      .map(contact => contact.email)

    setSending('loading')
    try {
      const res = await fetch('https://hook.us2.make.com/6pn4r8sxaci5dq7gfcr233bbztwo6xis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName,
          emails: emailsToSend,
        }),
      })

      // The Make.com webhook returns a simple 'Accepted' or similar message,
      // not JSON. The 'res.ok' check is sufficient.
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to send with unknown error.')
      }
      
      setSending('success')
      alert('Success!')
    } catch (e: any) {
      console.error('Send failed:', e)
      setSending('error')
      alert(`Send failed: ${e.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not sent'
    try {
      // Handle the date format from MailerLite API (e.g., "2025-08-04 03:16:43")
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  const formatPercentage = (rate: number) => {
    // The API returns rates as decimals (e.g., 1.018 = 101.8%)
    return `${(rate * 100).toFixed(1)}%`
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">MailerLite Campaigns</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: Copper contacts */}
        <div className="md:col-span-2">
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm"
              placeholder="Search clients by name, email, or tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {entries.map(([tag, list]) => (
              <div key={tag} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(tag)}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 h-5 w-5"
                      checked={list.every(c => selectedContactIds.includes(c.id))}
                      onChange={() => toggleTagAll(tag)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h3 className="text-lg font-medium">{tag}</h3>
                    <span className="text-sm text-gray-500">({list.length})</span>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 ${expandedTags.includes(tag) ? 'rotate-180' : ''}`}
                  />
                </div>

                {expandedTags.includes(tag) && (
                  <div className="space-y-2 pl-6 mt-3">
                    {list.map(contact => (
                      <label key={contact.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 h-4 w-4"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                        />
                        <span className="text-sm text-gray-700">
                          {contact.name} — {contact.email || 'No email'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Send panel */}
        <div className="md:col-span-1">
          <div className="sticky top-8 bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-3">
            <h2 className="text-xl font-semibold">Create Group</h2>

            <label className="block text-sm font-medium">New Group Name</label>
            <input
              className="w-full p-2 border rounded mb-2"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., 'New Campaign Group'"
            />

            <button
              onClick={handleSend}
              disabled={sending === 'loading' || !groupName || selectedContactIds.length === 0}
              className="mt-2 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
            >
              {sending === 'loading' ? 'Sending…' : (
                <>
                  <EnvelopeIcon className="h-5 w-5" />
                  <span>Create Group & Add Subscribers</span>
                </>
              )}
            </button>

            {sending === 'error' && <p className="text-sm text-red-500">Failed to create group.</p>}
            {sending === 'success' && (
              <div className="mt-4">
                <p className="text-sm text-green-600">Group created and subscribers added successfully!</p>
                <a 
                  href="https://dashboard.mailerlite.com/campaigns/status/draft" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <span>Click here to create your campaign in MailerLite</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}