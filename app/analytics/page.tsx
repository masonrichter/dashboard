'use client'

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  UsersIcon, 
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  pageViews: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  visitors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  topPages: { page: string; views: number; visitors: number }[];
  trafficSources: { source: string; visitors: number; percentage: number }[];
  deviceTypes: { device: string; visitors: number; percentage: number }[];
  recentActivity: { time: string; event: string; page: string; visitor: string }[];
}

interface MailerLiteAnalyticsData {
  performance: {
    totalCampaigns: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    totalUnsubscribes: number;
    totalBounces: number;
    averageOpenRate: number;
    averageClickRate: number;
  };
  subscribers: {
    total: number;
    active: number;
    unsubscribed: number;
    groups: number;
    segments: number;
  };
  recentCampaigns: Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    sentAt: string;
    recipients: number;
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
    unsubscribes: number;
    bounces: number;
  }>;
  engagementTrends: {
    averageOpenRate: number;
    averageClickRate: number;
    averageUnsubscribeRate: number;
    averageBounceRate: number;
  };
  groups: Array<{
    id: string;
    name: string;
    total: number;
    active: number;
    unsubscribed: number;
    unconfirmed: number;
    bounced: number;
  }>;
  campaignStatus: {
    draft: number;
    scheduled: number;
    sent: number;
    sending: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [mailerLiteData, setMailerLiteData] = useState<MailerLiteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mailerLiteLoading, setMailerLiteLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mailerLiteError, setMailerLiteError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'google' | 'mailerlite'>('google');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/google-analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch Google Analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMailerLiteData = async () => {
      try {
        setMailerLiteLoading(true);
        setMailerLiteError(null);
        const response = await fetch('/api/mailerlite-analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch MailerLite analytics data');
        }
        const data = await response.json();
        setMailerLiteData(data);
      } catch (err: any) {
        setMailerLiteError(err.message);
      } finally {
        setMailerLiteLoading(false);
      }
    };
    fetchMailerLiteData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not sent';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Google Analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return <div className="p-6 text-center text-gray-500">No analytics data available.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics data from multiple sources</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'google'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Google Analytics
          </button>
          <button
            onClick={() => setActiveTab('mailerlite')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mailerlite'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            MailerLite Analytics
          </button>
        </nav>
      </div>

      {/* Google Analytics Tab Content */}
      {activeTab === 'google' && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Page Views Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.pageViews.today)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.visitors.today)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.pageViews.total)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.visitors.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-lg font-semibold text-gray-900">{formatNumber(analyticsData.pageViews.thisWeek)} views</p>
              <p className="text-sm text-gray-500">{formatNumber(analyticsData.visitors.thisWeek)} visitors</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-lg font-semibold text-gray-900">{formatNumber(analyticsData.pageViews.thisMonth)} views</p>
              <p className="text-sm text-gray-500">{formatNumber(analyticsData.visitors.thisMonth)} visitors</p>
            </div>
                         <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">All Time</p>
              <p className="text-lg font-semibold text-gray-900">{formatNumber(analyticsData.pageViews.total)} views</p>
              <p className="text-sm text-gray-500">{formatNumber(analyticsData.visitors.total)} visitors</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topPages}>
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
                data={analyticsData.trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {analyticsData.trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string, props: any) => [
                `${formatNumber(props.payload.visitors)} visitors`,
                props.payload.source
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Types and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <div className="space-y-4">
            {analyticsData.deviceTypes.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{device.device}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(device.visitors)}</p>
                  <p className="text-xs text-gray-500">{device.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
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

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.topPages.map((page, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{page.page}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(page.views)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(page.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.trafficSources.map((source, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{source.source}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(source.visitors)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{source.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}

      {/* MailerLite Analytics Tab Content */}
      {activeTab === 'mailerlite' && (
        <div className="space-y-8">
          {/* MailerLite Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Campaign Analytics</h2>
              <p className="text-gray-600">MailerLite campaign performance and subscriber insights</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Refresh Data
            </button>
          </div>
                {mailerLiteLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading MailerLite analytics...</span>
          </div>
        ) : mailerLiteError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{mailerLiteError}</p>
          </div>
        ) : mailerLiteData ? (
          <>
            {/* MailerLite Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(mailerLiteData.performance.totalCampaigns)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(mailerLiteData.subscribers.total)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <EyeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(mailerLiteData.performance.averageOpenRate)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(mailerLiteData.performance.averageClickRate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Performance and Subscriber Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Sent</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.performance.totalSent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Opens</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.performance.totalOpens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Clicks</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.performance.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Unsubscribes</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.performance.totalUnsubscribes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Bounces</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.performance.totalBounces)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Subscribers</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.subscribers.active)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unsubscribed</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.subscribers.unsubscribed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Groups</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.subscribers.groups)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Segments</span>
                    <span className="text-sm font-semibold">{formatNumber(mailerLiteData.subscribers.segments)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mailerLiteData.recentCampaigns.map((campaign, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                              <p className="text-xs text-gray-500">{campaign.subject}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(campaign.sentAt)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(campaign.recipients)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(campaign.openRate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercentage(campaign.clickRate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={`https://app.mailerlite.com/campaigns/${campaign.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                              View More Campaign Info
                            </a>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Groups and Engagement Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Groups</h3>
                <div className="space-y-4">
                  {mailerLiteData.groups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-sm text-gray-500">{formatNumber(group.total)} subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(group.active)} active</p>
                        <p className="text-xs text-gray-500">{formatNumber(group.unsubscribed)} unsubscribed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Open Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageOpenRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Click Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageClickRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Unsubscribe Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageUnsubscribeRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Bounce Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageBounceRate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
        </div>
      )}
    </div>
  );
}