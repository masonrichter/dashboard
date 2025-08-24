import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { 
  getGroupsAndSegmentsWithFallback
} from '../../../lib/mailerlite';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

// 🚀 NEW: Function to fetch all subscribers with pagination
const getAllSubscribers = async () => {
    let allSubscribers: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await axios.get(`${MAILERLITE_API_URL}/subscribers`, {
            params: { page },
            headers: {
                'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = response.data.data;
        allSubscribers = allSubscribers.concat(data);

        // Check if there are more pages to fetch
        const currentPage = response.data.meta.current_page;
        const lastPage = response.data.meta.last_page;
        hasMore = currentPage < lastPage;
        
        if (hasMore) {
            page++;
        }
    }
    
    return allSubscribers;
};

export async function GET(request: NextRequest) {
  try {
    // Fetch all MailerLite analytics data
    const groupsAndSegments = await getGroupsAndSegmentsWithFallback();
    
    // 🚀 NEW: Fetch all individual subscribers
    const allSubscribers = await getAllSubscribers();
    
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
          return group;
        }
      })
    );

    // Get a list of all 'sent' campaigns
    const campaignsResponse = await axios.get(`${MAILERLITE_API_URL}/campaigns?filter[status]=sent`, {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const sentCampaigns = campaignsResponse.data.data;

    const campaignsWithDetails = await Promise.all(
      sentCampaigns.map(async (campaign: any) => {
        try {
          const response = await axios.get(`${MAILERLITE_API_URL}/campaigns/${campaign.id}`, {
            headers: {
              'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          return response.data.data;
        } catch (error) {
          console.error(`Error fetching campaign ${campaign.id}:`, error);
          return null;
        }
      })
    ).then(results => results.filter(campaign => campaign !== null));
    
    const totalCampaigns = campaignsWithDetails.length;
    
    const performanceSummary = {
      totalCampaigns,
      totalSent: totalCampaigns,
      totalOpens: campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.opens_count || 0), 0),
      totalClicks: campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.clicks_count || 0), 0),
      totalUnsubscribes: campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.unsubscribes_count || 0), 0),
      totalBounces: campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.hard_bounces_count || 0) + (c.stats?.soft_bounces_count || 0), 0),
      averageOpenRate: totalCampaigns > 0 ? (campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.open_rate?.float || 0), 0) / totalCampaigns) * 100 : 0,
      averageClickRate: totalCampaigns > 0 ? (campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.click_rate?.float || 0), 0) / totalCampaigns) * 100 : 0
    };

    const totalSubscribers = groupsAndSegments.groups.reduce((sum, group) => sum + (group.active || 0) + (group.unsubscribed || 0) + (group.unconfirmed || 0) + (group.bounced || 0), 0);
    const activeSubscribers = groupsAndSegments.groups.reduce((sum, group) => sum + (group.active || 0), 0);
    const unsubscribedCount = groupsAndSegments.groups.reduce((sum, group) => sum + (group.unsubscribed || 0), 0);

    const recentCampaignPerformance = campaignsWithDetails.slice(0, 5).map((campaign) => {
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

    const engagementTrends = campaignsWithDetails.length > 0 ? {
      averageOpenRate: (campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.open_rate?.float || 0), 0) / campaignsWithDetails.length) * 100,
      averageClickRate: (campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.click_rate?.float || 0), 0) / campaignsWithDetails.length) * 100,
      averageUnsubscribeRate: (campaignsWithDetails.reduce((sum, c) => sum + (c.stats?.unsubscribe_rate?.float || 0), 0) / campaignsWithDetails.length) * 100,
      averageBounceRate: (campaignsWithDetails.reduce((sum, c) => sum + ((c.stats?.hard_bounce_rate?.float || 0) + (c.stats?.soft_bounce_rate?.float || 0)), 0) / campaignsWithDetails.length) * 100
    } : {
      averageOpenRate: 0,
      averageClickRate: 0,
      averageUnsubscribeRate: 0,
      averageBounceRate: 0
    };

    const analyticsData = {
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
      
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: unsubscribedCount,
        groups: groupsAndSegments.groups.length,
        segments: groupsAndSegments.segments.length
      },
      
      recentCampaigns: recentCampaignPerformance,
      
      engagementTrends,
      
      groups: groupsWithDetails.map(group => ({
        id: group.id,
        name: group.name,
        total: group.active + group.unsubscribed + group.unconfirmed + group.bounced,
        active: group.active || 0,
        unsubscribed: group.unsubscribed || 0,
        unconfirmed: group.unconfirmed || 0,
        bounced: group.bounced || 0
      })),
      
      campaignStatus: {
        draft: 0,
        scheduled: 0,
        sent: campaignsWithDetails.length,
        sending: 0
      },
      
      // 🚀 NEW: Add the full list of all individual subscribers to the response
      allSubscribers: allSubscribers.map(subscriber => ({
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        date_created: subscriber.date_created,
        // You can add more fields here if needed
      }))
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