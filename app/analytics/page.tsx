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
  const [mailerLiteData, setMailerLiteData] = useState<MailerLiteAnalyticsData | null>(null);
  const [mailerLiteLoading, setMailerLiteLoading] = useState(true);
  const [mailerLiteError, setMailerLiteError] = useState<string | null>(null);
  const [groupsPage, setGroupsPage] = useState(1);
  const groupsPerPage = 6;

  // GA removed

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

  if (mailerLiteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading MailerLite analytics...</span>
      </div>
    );
  }

  if (mailerLiteError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{mailerLiteError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!mailerLiteData) {
    return <div className="p-6 text-center text-gray-500">No MailerLite analytics available.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header removed per request */}

      {/* Tab Navigation removed */}

      {/* Google Analytics content removed */}

      {/* MailerLite Analytics Content */}
      <div className="space-y-8">
          {/* MailerLite Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Campaign Analytics</h2>
            </div>
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

            {/* Groups and Engagement Trends (shortened + pagination) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscriber Groups</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {mailerLiteData.groups
                    .slice((groupsPage - 1) * groupsPerPage, groupsPage * groupsPerPage)
                    .map((group, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[220px]">{group.name}</p>
                          <p className="text-xs text-gray-500">{formatNumber(group.total)} subscribers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatNumber(group.active)} active</p>
                          <p className="text-xs text-gray-500">{formatNumber(group.unsubscribed)} unsubscribed</p>
                        </div>
                      </div>
                    ))}
                </div>
                {Math.ceil(mailerLiteData.groups.length / groupsPerPage) > 1 && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <button
                      onClick={() => setGroupsPage(p => Math.max(1, p - 1))}
                      disabled={groupsPage === 1}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-gray-600">
                      Page {groupsPage} of {Math.ceil(mailerLiteData.groups.length / groupsPerPage)}
                    </span>
                    <button
                      onClick={() => setGroupsPage(p => Math.min(Math.ceil(mailerLiteData.groups.length / groupsPerPage), p + 1))}
                      disabled={groupsPage === Math.ceil(mailerLiteData.groups.length / groupsPerPage)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Engagement Trends</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Open Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageOpenRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Click Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageClickRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Unsub Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageUnsubscribeRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Bounce Rate</span>
                    <span className="text-sm font-semibold">{formatPercentage(mailerLiteData.engagementTrends.averageBounceRate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}