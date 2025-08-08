'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  EnvelopeIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { 
  getRecentCampaignsWithStatsWithFallback,
  getCampaignPerformanceSummaryWithFallback,
  MailerLiteCampaignStats
} from '@/lib/mailerlite'
import { format } from 'date-fns'

export default function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<MailerLiteCampaignStats[]>([])
  const [performanceSummary, setPerformanceSummary] = useState<{
    totalCampaigns: number
    totalSent: number
    averageOpenRate: number
    averageClickRate: number
    totalOpens: number
    totalClicks: number
    totalUnsubscribes: number
    totalBounces: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadCampaignData()
  }, [selectedTimeframe])

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      const [campaignsData, summaryData] = await Promise.all([
        getRecentCampaignsWithStatsWithFallback(),
        getCampaignPerformanceSummaryWithFallback()
      ])
      
      // Filter campaigns by timeframe
      const filteredCampaigns = filterCampaignsByTimeframe(campaignsData, selectedTimeframe)
      setCampaigns(filteredCampaigns)
      setPerformanceSummary(summaryData)
    } catch (error) {
      console.error('Error loading campaign data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCampaignsByTimeframe = (campaigns: MailerLiteCampaignStats[], timeframe: string) => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeframe) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case 'all':
      default:
        return campaigns
    }
    
    return campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.created_at)
      return campaignDate >= cutoffDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRateColor = (rate: number, type: 'open' | 'click') => {
    const thresholds = type === 'open' 
      ? { good: 25, excellent: 40 }
      : { good: 3, excellent: 8 }
    
    if (rate >= thresholds.excellent) return 'text-green-600'
    if (rate >= thresholds.good) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not sent'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Campaign Analytics</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Timeframe:</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {performanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">{performanceSummary.totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(performanceSummary.averageOpenRate)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CursorArrowRaysIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(performanceSummary.averageClickRate)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Opens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(performanceSummary.totalOpens)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unsubscribes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounces
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(campaign.sent_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.recipients_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getRateColor(campaign.opened_rate, 'open')}`}>
                        {formatPercentage(campaign.opened_rate)}
                      </span>
                      {campaign.opened_rate > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({formatNumber(campaign.opened_count)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getRateColor(campaign.clicked_rate, 'click')}`}>
                        {formatPercentage(campaign.clicked_rate)}
                      </span>
                      {campaign.clicked_rate > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({formatNumber(campaign.clicked_count)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <UserMinusIcon className="h-4 w-4 text-red-500 mr-1" />
                      {formatNumber(campaign.unsubscribed_count)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({formatPercentage(campaign.unsubscribed_rate)})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                      {formatNumber(campaign.bounced_count)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({formatPercentage(campaign.bounced_rate)})
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-8">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No campaigns match the selected timeframe.
            </p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Campaigns */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Campaigns</h3>
            <div className="space-y-3">
              {campaigns
                .filter(c => c.status === 'sent')
                .sort((a, b) => b.opened_rate - a.opened_rate)
                .slice(0, 3)
                .map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">#{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(campaign.sent_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatPercentage(campaign.opened_rate)}</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Engagement Trends */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Opens</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.opened_count, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Clicks</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.clicked_count, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Unsubscribes</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.unsubscribed_count, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bounces</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(campaigns.reduce((sum, c) => sum + c.bounced_count, 0))}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Overall Health</span>
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 