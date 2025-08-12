'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline'


interface AUMData {
  totalAUM: number
  monthlyGrowth: number
  clientCount: number
  averageAccountSize: number
  topPerformers: Array<{
    name: string
    aum: number
    growth: number
    performance: number
  }>
  monthlyTrends: Array<{
    month: string
    aum: number
    growth: number
  }>
  assetAllocation: Array<{
    category: string
    percentage: number
    value: number
  }>
  recentTransactions: Array<{
    id: string
    client: string
    type: 'deposit' | 'withdrawal' | 'transfer'
    amount: number
    date: string
    status: 'completed' | 'pending' | 'failed'
  }>
}

const mockAUMData: AUMData = {
  totalAUM: 28475000,
  monthlyGrowth: 4.2,
  clientCount: 127,
  averageAccountSize: 224212,
  topPerformers: [
    { name: 'John Smith', aum: 2150000, growth: 12.5, performance: 8.7 },
    { name: 'Sarah Johnson', aum: 1890000, growth: 9.3, performance: 7.2 },
    { name: 'Michael Brown', aum: 1650000, growth: 15.1, performance: 11.4 },
    { name: 'Emily Davis', aum: 1420000, growth: 6.8, performance: 5.9 },
    { name: 'David Wilson', aum: 1280000, growth: 8.9, performance: 6.3 },
  ],
  monthlyTrends: [
    { month: 'Jan', aum: 26500000, growth: 2.1 },
    { month: 'Feb', aum: 26800000, growth: 1.1 },
    { month: 'Mar', aum: 27200000, growth: 1.5 },
    { month: 'Apr', aum: 27500000, growth: 1.1 },
    { month: 'May', aum: 27800000, growth: 1.1 },
    { month: 'Jun', aum: 28100000, growth: 1.1 },
    { month: 'Jul', aum: 28475000, growth: 1.3 },
  ],
  assetAllocation: [
    { category: 'Equities', percentage: 45, value: 12813750 },
    { category: 'Fixed Income', percentage: 30, value: 8542500 },
    { category: 'Cash & Equivalents', percentage: 15, value: 4271250 },
    { category: 'Alternative Investments', percentage: 10, value: 2847500 },
  ],
  recentTransactions: [
    { id: 'TXN001', client: 'John Smith', type: 'deposit', amount: 50000, date: '2024-01-15', status: 'completed' },
    { id: 'TXN002', client: 'Sarah Johnson', type: 'withdrawal', amount: 25000, date: '2024-01-14', status: 'completed' },
    { id: 'TXN003', client: 'Michael Brown', type: 'deposit', amount: 75000, date: '2024-01-13', status: 'pending' },
    { id: 'TXN004', client: 'Emily Davis', type: 'transfer', amount: 30000, date: '2024-01-12', status: 'completed' },
    { id: 'TXN005', client: 'David Wilson', type: 'deposit', amount: 40000, date: '2024-01-11', status: 'completed' },
  ]
}



export default function AUMPage() {
  const [aumData, setAumData] = useState<AUMData>(mockAUMData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchAUMData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAUMData(true)
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchAUMData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const response = await fetch('/api/aum')
      if (!response.ok) {
        throw new Error('Failed to fetch AUM data')
      }
      const data = await response.json()
      setAumData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching AUM data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch AUM data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets Under Management</h1>
            <p className="text-gray-600">Track and manage client portfolios</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading AUM data from Google Sheets...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets Under Management</h1>
            <p className="text-gray-600">Track and manage client portfolios</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => fetchAUMData()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Under Management</h1>
          <p className="text-gray-600">Track and manage client portfolios from Google Sheets</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {refreshing && <span className="ml-2 text-blue-600">🔄 Refreshing...</span>}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchAUMData()}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total AUM</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(aumData.totalAUM)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{aumData.clientCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Account Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(aumData.averageAccountSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top AUM List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Top AUM</h3>
        <div className="space-y-3">
          {aumData.topPerformers.map((performer, index) => (
            <div key={performer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{performer.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(performer.aum)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
