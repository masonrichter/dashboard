'use client'

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  status: string;
  created_at: string;
}

interface CampaignSelectorProps {
  onCampaignSelect?: (campaign: Campaign | null) => void;
  placeholder?: string;
  className?: string;
}

export default function CampaignSelector({ 
  onCampaignSelect, 
  placeholder = "Select a campaign...",
  className = ""
}: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mailerlite/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsOpen(false);
    if (onCampaignSelect) {
      onCampaignSelect(campaign);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-red-300 rounded-md bg-red-50">
          <p className="text-red-600 text-sm">Error loading campaigns: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selectedCampaign ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCampaign ? selectedCampaign.name : placeholder}
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {campaigns.length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">No campaigns available</div>
          ) : (
            <div className="py-1">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => handleCampaignSelect(campaign)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
