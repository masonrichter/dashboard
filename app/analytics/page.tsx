// app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import CampaignAnalytics from '../components/CampaignAnalytics';
import DashboardSummary from '../components/DashboardSummary';

type SummaryData = {
  totalAUM: string;
  totalCampaigns: number;
  activeClients: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Here you would fetch any necessary data for your analytics page
    const fetchData = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockData: SummaryData = {
          totalAUM: '$28,475,000',
          totalCampaigns: 12,
          activeClients: 127
        };
        setData(mockData);
      } catch (err) {
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <p className="mb-4">This page displays a summary of your campaign and social media performance.</p>
      
      {/* Example usage of your imported components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data && <DashboardSummary data={data} />}
        <CampaignAnalytics />
      </div>
      
      {/* You can add other components or content here */}
    </div>
  );
}