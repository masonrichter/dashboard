'use client'

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface TagData {
  [tag: string]: Contact[];
}

export default function TagsPage() {
  const [tagData, setTagData] = useState<TagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/copper/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags from API');
        }
        const data = await response.json();
        setTagData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  const handleTagClick = (tag: string) => {
    setExpandedTag(tag === expandedTag ? null : tag);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading tags...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!tagData || Object.keys(tagData).length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500">No tags found for any customers.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Clients by Tag</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(tagData).map(([tag, contacts]) => {
          const isExpanded = expandedTag === tag;
          return (
            <div key={tag} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => handleTagClick(tag)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{tag}</h2>
                  <p className="text-sm text-gray-500">
                    {contacts.length} {contacts.length === 1 ? 'client' : 'clients'}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="p-4 space-y-3">
                    {contacts.map((contact, index) => (
                      <div 
                        key={contact.id} 
                        className={`pb-3 ${index !== contacts.length - 1 ? 'border-b border-gray-200' : ''}`}
                      >
                        <p className="font-medium text-gray-900 mb-1">{contact.name}</p>
                        <p className="text-sm text-gray-600 mb-1">
                          {contact.company || 'No company'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {contact.email || 'No email'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}