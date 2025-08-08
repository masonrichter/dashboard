'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { TrendingUpIcon } from '@heroicons/react/24/solid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function AUMPage() {
  const [aumData, setAumData] = useState<AUMData>(mockAUMData)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  const [loading, setLoading] = useState(false)

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

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600'
      case 'withdrawal': return 'text-red-600'
      case 'transfer': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Under Management</h1>
          <p className="text-gray-600">Track and manage client portfolios</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="ALL">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Growth</p>
              <p className={`text-2xl font-bold ${getGrowthColor(aumData.monthlyGrowth)}`}>
                {formatPercentage(aumData.monthlyGrowth)}
              </p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUM Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AUM Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aumData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'AUM']}
                labelFormatter={(label) => `${label} 2024`}
              />
              <Line type="monotone" dataKey="aum" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={aumData.assetAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {aumData.assetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  formatCurrency(props.payload.value),
                  props.payload.category
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {aumData.topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(performer.aum)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getGrowthColor(performer.growth)}`}>
                    {formatPercentage(performer.growth)}
                  </p>
                  <p className="text-xs text-gray-500">{performer.performance.toFixed(1)}% return</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {aumData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{transaction.client}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                    {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
