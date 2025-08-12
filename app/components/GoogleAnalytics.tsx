'use client'

import { useState, useEffect } from 'react'
import { 
  EyeIcon, 
  UsersIcon, 
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface GoogleAnalyticsData {
  pageViews: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  visitors: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  topPages: Array<{
    page: string
    views: number
    visitors: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  deviceTypes: Array<{
    device: string
    visitors: number
    percentage: number
  }>
  recentActivity: Array<{
    time: string
    event: string
    page: string
    visitor: string
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function GoogleAnalytics() {
  const [data, setData] = useState<GoogleAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGoogleAnalytics()
  }, [])

  const fetchGoogleAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/google-analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch Google Analytics data')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      console.error('Error fetching Google Analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch Google Analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Google Analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchGoogleAnalytics}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time analytics data from your website</p>
        </div>
        <button
          onClick={fetchGoogleAnalytics}
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Page Views Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.pageViews.today)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Visitors Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.visitors.today)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.pageViews.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DevicePhoneMobileIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.visitors.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topPages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="page" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Views']} />
              <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {data.trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string, props: any) => [
                `${props.payload.visitors} visitors`,
                props.payload.source
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{activity.event}</p>
                  <p className="text-sm text-gray-500">{activity.page}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                <p className="text-xs text-gray-500">{activity.visitor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
