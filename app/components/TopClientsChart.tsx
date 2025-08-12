'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TopPerformer {
  name: string
  aum: number
  growth: number
  performance: number
}

// Fallback mock data in case API fails
const mockTopPerformers: TopPerformer[] = [
  { name: 'John Smith', aum: 2150000, growth: 12.5, performance: 8.7 },
  { name: 'Sarah Johnson', aum: 1890000, growth: 9.3, performance: 7.2 },
  { name: 'Michael Brown', aum: 1650000, growth: 15.1, performance: 11.4 },
  { name: 'Emily Davis', aum: 1420000, growth: 6.8, performance: 5.9 },
  { name: 'David Wilson', aum: 1280000, growth: 8.9, performance: 6.3 },
]

export default function TopClientsChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M')
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(mockTopPerformers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTopPerformers() {
      try {
        setLoading(true)
        const response = await fetch('/api/aum')
        if (!response.ok) {
          throw new Error('Failed to fetch AUM data')
        }
        const data = await response.json()
        setTopPerformers(data.topPerformers || mockTopPerformers)
      } catch (err) {
        console.error('Error fetching top performers:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setTopPerformers(mockTopPerformers)
      } finally {
        setLoading(false)
      }
    }
    fetchTopPerformers()
  }, [])

  // Get top 5 performers for the chart
  const chartData = topPerformers.slice(0, 5).map((performer, index) => ({
    name: performer.name,
    value: performer.aum / 1000000, // Convert to millions for display
    rank: index + 1,
    growth: performer.growth
  }))

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading top performers...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Failed to load top performers data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Clients by AUM</h3>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="6M">6 Months</option>
          <option value="1Y">1 Year</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => [`$${value}M`, 'AUM']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Showing {chartData.length} top performing clients by AUM</p>
      </div>
    </div>
  )
}