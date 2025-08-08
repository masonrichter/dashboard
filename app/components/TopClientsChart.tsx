'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Client {
  id: number
  name: string
  email: string
  company: string
  tags: string[]
  lastModified: string
}

const mockClients: Client[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    company: 'Smith Corp',
    tags: ['High Value', 'Retirement Planning'],
    lastModified: '2024-01-20T10:30:00Z',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    company: 'Johnson LLC',
    tags: ['Tax Planning', 'Estate Planning'],
    lastModified: '2024-01-18T14:15:00Z',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    company: 'Wilson Inc',
    tags: ['Prospect', 'High Value'],
    lastModified: '2024-01-15T09:45:00Z',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    company: 'Davis Holdings',
    tags: ['Real Estate', 'Prospect'],
    lastModified: '2024-01-22T11:00:00Z',
  },
  {
    id: 5,
    name: 'Chris Evans',
    email: 'chris@example.com',
    company: 'Evans & Co.',
    tags: ['High Value', 'Tax Planning'],
    lastModified: '2024-01-25T16:30:00Z',
  },
  {
    id: 6,
    name: 'Jessica Lee',
    email: 'jessica@example.com',
    company: 'Lee Solutions',
    tags: ['Retirement Planning'],
    lastModified: '2024-01-28T09:00:00Z',
  },
  {
    id: 7,
    name: 'David Brown',
    email: 'david@example.com',
    company: 'Brown Ventures',
    tags: ['Prospect', 'High Value'],
    lastModified: '2024-01-30T14:00:00Z',
  },
]

// Function to shuffle an array
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function TopClientsChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M')
  
  // Get 5 random clients for the chart
  const randomClients = shuffleArray(mockClients).slice(0, 5)
  
  // Convert to chart data format
  const chartData = randomClients.map((client, index) => ({
    name: client.name,
    value: Math.floor(Math.random() * 100) + 20, // Random value for demo
    rank: index + 1
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="6M">6 Months</option>
          <option value="1Y">1 Year</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Showing {chartData.length} top performing clients</p>
      </div>
    </div>
  )
}