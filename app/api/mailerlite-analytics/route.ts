import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { 
  getGroupsAndSegmentsWithFallback
} from '../../../lib/mailerlite';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

export async function GET(request: NextRequest) {
  try {
    // Fetch all MailerLite analytics data
    const groupsAndSegments = await getGroupsAndSegmentsWithFallback();

    // Get detailed group information
    const groupsWithDetails = await Promise.all(
      groupsAndSegments.groups.map(async (group) => {
        try {
          const response = await axios.get(`${MAILERLITE_API_URL}/groups/${group.id}`, {
            headers: {
              'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          return response.data.data;
        } catch (error) {
          console.error(`Error fetching group ${group.id}:`, error);
          return group; // Return original group data if fetch fails
        }
      })
    );

    // Since the campaigns list API is not working, fetch the known campaigns by ID
    const knownCampaignIds = ['161771333175215881', '161677425152886267']; // Sunday Night and Avista Test Campaign
    
    const campaigns = await Promise.all(
      knownCampaignIds.map(async (id) => {
        try {
          const response = await axios.get(`${MAILERLITE_API_URL}/campaigns/${id}`, {
            headers: {
              'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          return response.data.data;
        } catch (error) {
          console.error(`Error fetching campaign ${id}:`, error);
          return null;
        }
      })
    ).then(results => results.filter(campaign => campaign !== null));
    
    console.log('Campaigns Array:', campaigns);

    // Calculate performance summary from real campaign data
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    const totalSent = sentCampaigns.length;
    
    const performanceSummary = {
      totalCampaigns,
      totalSent,
      totalOpens: sentCampaigns.reduce((sum, c) => sum + (c.stats?.opens_count || 0), 0),
      totalClicks: sentCampaigns.reduce((sum, c) => sum + (c.stats?.clicks_count || 0), 0),
      totalUnsubscribes: sentCampaigns.reduce((sum, c) => sum + (c.stats?.unsubscribes_count || 0), 0),
      totalBounces: sentCampaigns.reduce((sum, c) => sum + (c.stats?.hard_bounces_count || 0) + (c.stats?.soft_bounces_count || 0), 0),
      averageOpenRate: totalSent > 0 ? (sentCampaigns.reduce((sum, c) => sum + (c.stats?.open_rate?.float || 0), 0) / totalSent) * 100 : 0,
      averageClickRate: totalSent > 0 ? (sentCampaigns.reduce((sum, c) => sum + (c.stats?.click_rate?.float || 0), 0) / totalSent) * 100 : 0
    };

    // Calculate subscriber metrics from groups data
    const totalSubscribers = groupsAndSegments.groups.reduce((sum, group) => sum + (group.active || 0) + (group.unsubscribed || 0) + (group.unconfirmed || 0) + (group.bounced || 0), 0);
    const activeSubscribers = groupsAndSegments.groups.reduce((sum, group) => sum + (group.active || 0), 0);
    const unsubscribedCount = groupsAndSegments.groups.reduce((sum, group) => sum + (group.unsubscribed || 0), 0);

    // Get recent campaign performance (last 5 campaigns)
    const recentCampaignPerformance = campaigns.slice(0, 5).map((campaign) => {
      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.emails?.[0]?.subject || 'No subject',
        status: campaign.status,
        sentAt: campaign.finished_at || '',
        recipients: campaign.stats?.sent || 0,
        opens: campaign.stats?.opens_count || 0,
        clicks: campaign.stats?.clicks_count || 0,
        openRate: (campaign.stats?.open_rate?.float || 0) * 100,
        clickRate: (campaign.stats?.click_rate?.float || 0) * 100,
        unsubscribes: campaign.stats?.unsubscribes_count || 0,
        bounces: (campaign.stats?.hard_bounces_count || 0) + (campaign.stats?.soft_bounces_count || 0)
      };
    });

    // Calculate engagement trends
    const engagementTrends = sentCampaigns.length > 0 ? {
      averageOpenRate: (sentCampaigns.reduce((sum, c) => sum + (c.stats?.open_rate?.float || 0), 0) / sentCampaigns.length) * 100,
      averageClickRate: (sentCampaigns.reduce((sum, c) => sum + (c.stats?.click_rate?.float || 0), 0) / sentCampaigns.length) * 100,
      averageUnsubscribeRate: (sentCampaigns.reduce((sum, c) => sum + (c.stats?.unsubscribe_rate?.float || 0), 0) / sentCampaigns.length) * 100,
      averageBounceRate: (sentCampaigns.reduce((sum, c) => sum + ((c.stats?.hard_bounce_rate?.float || 0) + (c.stats?.soft_bounce_rate?.float || 0)), 0) / sentCampaigns.length) * 100
    } : {
      averageOpenRate: 0,
      averageClickRate: 0,
      averageUnsubscribeRate: 0,
      averageBounceRate: 0
    };

    const analyticsData = {
      // Overall performance summary
      performance: {
        totalCampaigns: performanceSummary.totalCampaigns,
        totalSent: performanceSummary.totalSent,
        totalOpens: performanceSummary.totalOpens,
        totalClicks: performanceSummary.totalClicks,
        totalUnsubscribes: performanceSummary.totalUnsubscribes,
        totalBounces: performanceSummary.totalBounces,
        averageOpenRate: performanceSummary.averageOpenRate,
        averageClickRate: performanceSummary.averageClickRate
      },
      
      // Subscriber metrics
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: unsubscribedCount,
        groups: groupsAndSegments.groups.length,
        segments: groupsAndSegments.segments.length
      },
      
      // Recent campaign performance
      recentCampaigns: recentCampaignPerformance,
      
      // Engagement trends
      engagementTrends,
      
      // Group breakdown
      groups: groupsWithDetails.map(group => ({
        id: group.id,
        name: group.name,
        total: group.active + group.unsubscribed + group.unconfirmed + group.bounced,
        active: group.active || 0,
        unsubscribed: group.unsubscribed || 0,
        unconfirmed: group.unconfirmed || 0,
        bounced: group.bounced || 0
      })),
      
      // Campaign status breakdown
      campaignStatus: {
        draft: campaigns.filter(c => c.status === 'draft').length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        sent: campaigns.filter(c => c.status === 'sent').length,
        sending: campaigns.filter(c => c.status === 'sending').length
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Error fetching MailerLite analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MailerLite analytics', details: error.message },
      { status: 500 }
    );
  }
}
