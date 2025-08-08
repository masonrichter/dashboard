// app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import CampaignAnalytics from '../components/CampaignAnalytics';
import DashboardSummary from '../components/DashboardSummary';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Here you would fetch any necessary data for your analytics page
    const fetchData = async () => {
      try {
        // Example of fetching data from an API route
        // const response = await fetch('/api/analytics');
        // const result = await response.json();
        // setData(result);
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
        <DashboardSummary />
        <CampaignAnalytics />
      </div>
      
      {/* You can add other components or content here */}
    </div>
  );
}