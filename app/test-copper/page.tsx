'use client'

import { useState, useEffect } from 'react'
import { getContactsWithFallback, getCompaniesWithFallback } from '@/lib/copper'

export default function TestCopperPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testCopperAPI()
  }, [])

  const testCopperAPI = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Testing Copper API...')
      
      // Test contacts
      const contactsData = await getContactsWithFallback()
      setContacts(contactsData)
      console.log('Contacts loaded:', contactsData.length)

      // Test companies
      const companiesData = await getCompaniesWithFallback()
      setCompanies(companiesData)
      console.log('Companies loaded:', companiesData.length)

    } catch (err) {
      setError('Failed to test Copper API')
      console.error('Copper API test error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Copper API</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Copper API Test Results</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contacts ({contacts.length})</h2>
            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="border-b pb-2">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                    <p className="text-xs text-gray-500">Tags: {contact.tags.join(', ')}</p>
                  </div>
                ))}
                {contacts.length > 5 && (
                  <p className="text-sm text-gray-500">... and {contacts.length - 5} more</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No contacts found</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Companies ({companies.length})</h2>
            {companies.length > 0 ? (
              <div className="space-y-2">
                {companies.slice(0, 5).map((company) => (
                  <div key={company.id} className="border-b pb-2">
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-gray-600">{company.email}</p>
                    <p className="text-sm text-gray-600">{company.city}, {company.state}</p>
                    <p className="text-xs text-gray-500">Tags: {company.tags.join(', ')}</p>
                  </div>
                ))}
                {companies.length > 5 && (
                  <p className="text-sm text-gray-500">... and {companies.length - 5} more</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No companies found</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={testCopperAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  )
} 