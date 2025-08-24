'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  UsersIcon, 
  HomeIcon, 
  CreditCardIcon, 
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GiftIcon,
  HeartIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface DisplayContact {
  id: number
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  title: string
  address: string
  city: string
  tags: string[]
  lastModified: string
  details: string
  websites: string[]
  customFields: any[]
}

interface Client {
  id: number
  name: string
  household: string
  account: string
  aum: number
  rmd: number
  distributionsYtd: number
  remainingRmd: number
  birthday: string
  anniversary: string
  events: Event[]
}

interface Event {
  id: number
  title: string
  date: string
  type: 'birthday' | 'anniversary' | 'custom'
  clientId?: number
}

interface AUMData {
  totalAUM: number
  totalHouseholds: number
  totalAccounts: number
  averageAUMPerHousehold: number
  averageAUMPerAccount: number
  topHouseholds: Client[]
  topAccounts: Client[]
  rmdClients: Client[]
  upcomingBirthdays: Client[]
  upcomingAnniversaries: Client[]
  upcomingEvents: Event[]
}

async function fetchContactsFromAPI(): Promise<DisplayContact[]> {
  const response = await fetch('/api/copper/people', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function updateContactInAPI(contactId: number, data: Partial<DisplayContact>) {
  const response = await fetch(`/api/copper/people`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, id: contactId }),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
  }
  return response.json()
}

export default function ClientsPage() {
  const [contacts, setContacts] = useState<DisplayContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<DisplayContact | null>(null)
  const [editingModal, setEditingModal] = useState(false)
  const [editedModalContact, setEditedModalContact] = useState<Partial<DisplayContact>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await fetchContactsFromAPI()
        setContacts(data)
        if (data.length === 0) {
          setError('No contacts found in Copper CRM.')
        }
        
        // Check if there's a clientId in the URL and open that client's modal
        const clientId = searchParams.get('clientId')
        if (clientId) {
          const contact = data.find(c => c.id.toString() === clientId)
          if (contact) {
            setSelectedContact(contact)
            setEditedModalContact(contact)
          }
        }
      } catch (err) {
        setError('Failed to fetch contacts from Copper CRM.')
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [searchParams])

  const handleCardClick = (contact: DisplayContact) => {
    setSelectedContact(contact)
    setEditedModalContact(contact)
  }

  const handleCloseModal = () => {
    setSelectedContact(null)
    setEditingModal(false)
    setEditedModalContact({})
  }

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedModalContact(prev => ({ ...prev, [name]: value }))
  }

  const handleModalSave = async () => {
    try {
      if (selectedContact) {
        await updateContactInAPI(selectedContact.id, editedModalContact)
        
        setContacts(contacts.map(c => 
          c.id === selectedContact.id ? { ...c, ...editedModalContact } as DisplayContact : c
        ))
        
        setSelectedContact({ ...selectedContact, ...editedModalContact } as DisplayContact)
        setEditingModal(false)
      }
    } catch (err) {
      setError('Failed to save contact changes.')
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const searchTermLower = searchTerm.toLowerCase()
    
    // Create an array of all searchable strings for the contact
    const searchableStrings = [
      contact.name,
      contact.email,
      contact.company,
      ...(contact.tags || [])
    ].filter(Boolean).map(s => String(s).toLowerCase());
    
    // Check if the search term is included in any of the searchable strings
    return searchTermLower === '' || searchableStrings.some(s => s.includes(searchTermLower));
  })

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Current Customers</h1>
        <p className="text-gray-600">Loading current customers from Copper CRM...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Current Customers</h1>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Current Customers</h1>
      <p className="text-gray-600 mb-6">
        Showing {filteredContacts.length} of {contacts.length} current customers
      </p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, company, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {filteredContacts.length === 0 ? (
        <p className="text-gray-500">No current customers found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleCardClick(contact)}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {contact.name}
                  </h3>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">
                    {contact.email || 'No email'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">
                    {contact.phone || 'No phone number'}
                  </p>
                </div>

                {contact.company && (
                  <div>
                    <p className="text-gray-500 text-sm">
                      {contact.company}
                    </p>
                  </div>
                )}
                
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{contact.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: {contact.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-size Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold mb-4">{selectedContact.name}</h2>
            
            <div className="space-y-4">
              {editingModal ? (
                <>
                  <label className="block">
                    <span className="text-gray-700">Name:</span>
                    <input type="text" name="name" value={editedModalContact.name || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Email:</span>
                    <input type="email" name="email" value={editedModalContact.email || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Phone:</span>
                    <input type="tel" name="phone" value={editedModalContact.phone || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Company:</span>
                    <input type="text" name="company" value={editedModalContact.company || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Title:</span>
                    <input type="text" name="title" value={editedModalContact.title || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Address:</span>
                    <input type="text" name="address" value={editedModalContact.address || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">City:</span>
                    <input type="text" name="city" value={editedModalContact.city || ''} onChange={handleModalChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                  </label>
                  <label className="block">
                    <span className="text-gray-700">Details:</span>
                    <textarea name="details" value={editedModalContact.details || ''} onChange={handleModalChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    <p className="text-xs text-gray-500 mt-1">Extra information added here will be synced to the Google Sheets "Clients" tab</p>
                  </label>
                  <div className="flex justify-end gap-2 mt-4">
                    <button 
                      onClick={handleModalSave} 
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Company:</strong> {selectedContact.company || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedContact.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedContact.phone || 'N/A'}</p>
                  <p><strong>Title:</strong> {selectedContact.title || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedContact.address || 'N/A'}</p>
                  <p><strong>City:</strong> {selectedContact.city || 'N/A'}</p>
                  <p><strong>Last Modified:</strong> {selectedContact.lastModified || 'N/A'}</p>
                  <p><strong>Details:</strong> {selectedContact.details || 'N/A'}</p>
                  {selectedContact.details && (
                    <p className="text-xs text-gray-500 mt-1">✓ Details synced to Google Sheets</p>
                  )}
                  {selectedContact.websites && selectedContact.websites.length > 0 && (
                    <div>
                      <strong>Websites:</strong>
                      <ul>
                        {selectedContact.websites.map((site, index) => (
                          <li key={index} className="text-sm text-blue-500 underline">{site}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setEditingModal(true)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium">
                      Edit Details
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}