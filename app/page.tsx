'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { EnvelopeIcon, UserPlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import DashboardSummary from './components/DashboardSummary'
import ClientCard from './components/ClientCard'
import BufferPoster from './components/BufferScheduler'
import TopClientsChart from './components/TopClientsChart'

interface DisplayContact {
  id: number
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  title: string
  address: string
  city: string
  tags: string[]
  lastModified: string
  details: string
  websites: string[]
  customFields: any[]
}

const isDataStale = (timestamp: number) => {
  const now = new Date().getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - timestamp) > twentyFourHours;
};

// Function to shuffle an array (moved outside the component)
const shuffleArray = (array: DisplayContact[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function HomePage() {
  const [contacts, setContacts] = useState<DisplayContact[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [aumData, setAumData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContactsFromAPI = useCallback(async () => {
    const response = await fetch('/api/copper/people', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }, [])

  const fetchCampaignsFromAPI = useCallback(async () => {
    const response = await fetch('/api/mailerlite/campaigns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }, [])

  const fetchAUMFromAPI = useCallback(async () => {
    const response = await fetch('/api/aum', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }, [])

  useEffect(() => {
    async function getData() {
      const storedData = localStorage.getItem('recentClientsData');
      const now = new Date().getTime();

      if (storedData) {
        const { clients, timestamp } = JSON.parse(storedData);
        if (!isDataStale(timestamp)) {
          setContacts(clients);
        }
      }

      try {
        // Fetch contacts, campaigns, and AUM data
        const [contactsData, campaignsData, aumData] = await Promise.all([
          fetchContactsFromAPI(),
          fetchCampaignsFromAPI(),
          fetchAUMFromAPI()
        ]);

        // Process contacts
        if (!storedData || isDataStale(JSON.parse(storedData).timestamp)) {
          const shuffledClients = shuffleArray(contactsData);
          localStorage.setItem('recentClientsData', JSON.stringify({
            clients: shuffledClients,
            timestamp: now,
          }));
          setContacts(shuffledClients);
        }

        // Process campaigns
        setCampaigns(campaignsData);
        
        // Process AUM data
        setAumData(aumData);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [fetchContactsFromAPI, fetchCampaignsFromAPI, fetchAUMFromAPI]);

  const dashboardData = {
    totalAUM: aumData ? `$${(aumData.totalAUM / 1000000).toFixed(1)}M` : '$100,000,000',
    totalCampaigns: campaigns.length,
    activeClients: contacts.length,
    socialEngagement: 0,
  }

  const recentClients = contacts.slice(0, 3);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your business.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading clients...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your business.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
}
  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your business.</p>
        </div>
      </div>

      <DashboardSummary data={dashboardData} />

      {/* Recent Clients Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </div>

      {/* Quick Actions, Posting & Analytics, Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Left column for Quick Actions and Posting */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="https://app.copper.com/companies/588013/app#/browse/list/people/default" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 w-full group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <UserPlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-base font-medium text-gray-900">Add New Client</p>
              </a>
              <Link href="/mailerlite/campaign" className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 w-full group">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-base font-medium text-gray-900">Send Campaign</p>
              </Link>
              <Link href="/buffer" className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 w-full group">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-base font-medium text-gray-900">Schedule Post</p>
              </Link>
            </div>
          </div>

          <BufferPoster />
        </div>

        {/* Right column for Analytics and Charts */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Analytics</h2>
            <div className="text-gray-400 text-sm">
                Analytics data will be displayed here.
            </div>
          </div>

          <TopClientsChart />
        </div>
      </div>
    </div>
  )
}