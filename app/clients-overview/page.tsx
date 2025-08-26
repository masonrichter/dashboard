'use client'

import { useEffect, useState, useMemo } from 'react'
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

interface CopperContact {
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
  birthday: string | null
  anniversary: string | null
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1']

// Mock data for non-birthday sections
const mockClients: Client[] = [
  {
    id: 1,
    name: "John Smith",
    household: "Smith Family",
    account: "IRA-001",
    aum: 2500000,
    rmd: 85000,
    distributionsYtd: 85000,
    remainingRmd: 0,
    birthday: "1955-03-15",
    anniversary: "1980-06-20",
    events: []
  },
  {
    id: 2,
    name: "Sarah Johnson",
    household: "Johnson Family",
    account: "401K-002",
    aum: 1800000,
    rmd: 62000,
    distributionsYtd: 45000,
    remainingRmd: 17000,
    birthday: "1958-07-22",
    anniversary: "1985-09-10",
    events: []
  },
  {
    id: 3,
    name: "Michael Brown",
    household: "Brown Family",
    account: "IRA-003",
    aum: 3200000,
    rmd: 110000,
    distributionsYtd: 110000,
    remainingRmd: 0,
    birthday: "1952-11-08",
    anniversary: "1978-04-15",
    events: []
  },
  {
    id: 4,
    name: "Lisa Davis",
    household: "Davis Family",
    account: "403B-004",
    aum: 1400000,
    rmd: 48000,
    distributionsYtd: 48000,
    remainingRmd: 0,
    birthday: "1960-01-30",
    anniversary: "1982-12-05",
    events: []
  },
  {
    id: 5,
    name: "Robert Wilson",
    household: "Wilson Family",
    account: "IRA-005",
    aum: 4100000,
    rmd: 140000,
    distributionsYtd: 95000,
    remainingRmd: 45000,
    birthday: "1949-05-12",
    anniversary: "1975-08-25",
    events: []
  },
  {
    id: 6,
    name: "Jennifer Garcia",
    household: "Garcia Family",
    account: "401K-006",
    aum: 2200000,
    rmd: 75000,
    distributionsYtd: 75000,
    remainingRmd: 0,
    birthday: "1956-09-18",
    anniversary: "1983-03-12",
    events: []
  },
  {
    id: 7,
    name: "David Martinez",
    household: "Martinez Family",
    account: "IRA-007",
    aum: 2800000,
    rmd: 95000,
    distributionsYtd: 70000,
    remainingRmd: 25000,
    birthday: "1953-12-03",
    anniversary: "1981-07-08",
    events: []
  },
  {
    id: 8,
    name: "Patricia Anderson",
    household: "Anderson Family",
    account: "403B-008",
    aum: 1600000,
    rmd: 55000,
    distributionsYtd: 55000,
    remainingRmd: 0,
    birthday: "1959-02-14",
    anniversary: "1984-10-30",
    events: []
  },
  {
    id: 9,
    name: "James Taylor",
    household: "Taylor Family",
    account: "IRA-009",
    aum: 3500000,
    rmd: 120000,
    distributionsYtd: 120000,
    remainingRmd: 0,
    birthday: "1951-06-25",
    anniversary: "1979-11-18",
    events: []
  },
  {
    id: 10,
    name: "Mary Thomas",
    household: "Thomas Family",
    account: "401K-010",
    aum: 1900000,
    rmd: 65000,
    distributionsYtd: 40000,
    remainingRmd: 25000,
    birthday: "1957-04-07",
    anniversary: "1986-01-22",
    events: []
  }
]

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Annual Review Meeting",
    date: "2025-09-15",
    type: "custom",
    clientId: 1
  },
  {
    id: 2,
    title: "Portfolio Rebalancing",
    date: "2025-09-20",
    type: "custom",
    clientId: 3
  },
  {
    id: 3,
    title: "Tax Planning Session",
    date: "2025-09-25",
    type: "custom",
    clientId: 5
  }
]

export default function ClientsOverviewPage() {
  const [copperContacts, setCopperContacts] = useState<CopperContact[]>([])
  const [loading, setLoading] = useState(true)
  const [birthdayPage, setBirthdayPage] = useState(0) // Add pagination state for birthdays
  const [anniversaryPage, setAnniversaryPage] = useState(0) // Add pagination state for anniversaries

  // Fetch Copper contacts on component mount
  useEffect(() => {
    async function fetchCopperContacts() {
      try {
        const response = await fetch('/api/copper/people')
        if (response.ok) {
          const data = await response.json()
          setCopperContacts(data)
        } else {
          console.error('Failed to fetch Copper contacts')
        }
      } catch (error) {
        console.error('Error fetching Copper contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCopperContacts()
  }, [])

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalAUM = mockClients.reduce((sum, client) => sum + client.aum, 0)
    const totalHouseholds = new Set(mockClients.map(client => client.household)).size
    const totalAccounts = mockClients.length
    const averageAUMPerHousehold = totalAUM / totalHouseholds
    const averageAUMPerAccount = totalAUM / totalAccounts
    const rmdClients = mockClients.filter(client => client.rmd > 0)
    
    // Get upcoming birthdays from Copper contacts (next 365 days to ensure we have enough for all pages)
    const today = new Date()
    const oneYearFromNow = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)
    
    console.log('Debugging birthdays:', {
      totalContacts: copperContacts.length,
      contactsWithBirthdays: copperContacts.filter(contact => contact.birthday).length,
      today: today.toISOString(),
      oneYearFromNow: oneYearFromNow.toISOString()
    })
    
    const allUpcomingBirthdays = copperContacts
      .filter(contact => contact.birthday)
      .map(contact => {
        // Parse birthday string (format: YYYY-MM-DD)
        const [year, month, day] = contact.birthday!.split('-').map(Number)
        const birthday = new Date(year, month - 1, day)
        
        // Skip if birthday is invalid or in the future (more than 100 years from now)
        const currentYear = today.getFullYear()
        if (year > currentYear + 100 || year < 1900) {
          return null
        }
        
        // Create next birthday date using the same month and day as the original birthday
        const nextBirthday = new Date(today.getFullYear(), month - 1, day)
        
        // If this year's birthday has already passed, use next year
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1)
        }
        
        // Calculate days until birthday (using UTC to avoid timezone issues)
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
        const nextBirthdayUTC = new Date(Date.UTC(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()))
        const daysUntil = Math.ceil((nextBirthdayUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24))
        
        // Debug logging for first few birthdays
        if (contact.id <= 5) {
          console.log(`Birthday calculation for ${contact.name}:`, {
            originalBirthday: contact.birthday,
            parsedYear: year,
            parsedMonth: month,
            parsedDay: day,
            nextBirthday: nextBirthday.toISOString(),
            todayUTC: todayUTC.toISOString(),
            nextBirthdayUTC: nextBirthdayUTC.toISOString(),
            daysUntil
          })
        }
        
        return {
          id: contact.id,
          name: contact.name,
          birthday: contact.birthday!,
          daysUntil
        }
      })
      .filter(birthday => birthday !== null && birthday.daysUntil <= 365)
      .sort((a, b) => a!.daysUntil - b!.daysUntil)
    
    console.log('Processed birthdays:', {
      totalUpcoming: allUpcomingBirthdays.length,
      firstFew: allUpcomingBirthdays.slice(0, 5).map(b => b ? { name: b.name, birthday: b.birthday, daysUntil: b.daysUntil } : null)
    })
    
    // Get paginated birthdays (3 per page)
    const birthdaysPerPage = 3
    const startIndex = birthdayPage * birthdaysPerPage
    const upcomingBirthdays = allUpcomingBirthdays.slice(startIndex, startIndex + birthdaysPerPage)
    
    // Ensure we always have exactly 3 items per page
    const paddedBirthdays = Array.from({ length: birthdaysPerPage }, (_, index) => {
      return upcomingBirthdays[index] || null
    })
    
    console.log(`Page ${birthdayPage + 1} birthdays:`, {
      startIndex,
      endIndex: startIndex + birthdaysPerPage,
      upcomingBirthdays: upcomingBirthdays.length,
      paddedBirthdays: paddedBirthdays.length,
      birthdays: paddedBirthdays.map(b => b ? { name: b.name, birthday: b.birthday } : 'null')
    })
    
    // Get upcoming anniversaries from Copper contacts (next 365 days)
    const allUpcomingAnniversaries = copperContacts
      .filter(contact => contact.anniversary)
      .map(contact => {
        // Parse anniversary string (format: YYYY-MM-DD)
        const [year, month, day] = contact.anniversary!.split('-').map(Number)
        const anniversary = new Date(year, month - 1, day)
        
        // Skip if anniversary is invalid or in the future (more than 100 years from now)
        const currentYear = today.getFullYear()
        if (year > currentYear + 100 || year < 1900) {
          return null
        }
        
        // Create next anniversary date using the same month and day as the original anniversary
        const nextAnniversary = new Date(today.getFullYear(), month - 1, day)
        
        // If this year's anniversary has already passed, use next year
        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(today.getFullYear() + 1)
        }
        
        // Calculate days until anniversary (using UTC to avoid timezone issues)
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
        const nextAnniversaryUTC = new Date(Date.UTC(nextAnniversary.getFullYear(), nextAnniversary.getMonth(), nextAnniversary.getDate()))
        const daysUntil = Math.ceil((nextAnniversaryUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24))
        
        // Debug logging for first few anniversaries
        if (contact.id <= 5) {
          console.log(`Anniversary calculation for ${contact.name}:`, {
            originalAnniversary: contact.anniversary,
            parsedYear: year,
            parsedMonth: month,
            parsedDay: day,
            nextAnniversary: nextAnniversary.toISOString(),
            todayUTC: todayUTC.toISOString(),
            nextAnniversaryUTC: nextAnniversaryUTC.toISOString(),
            daysUntil
          })
        }
        
        return {
          id: contact.id,
          name: contact.name,
          anniversary: contact.anniversary!,
          daysUntil
        }
      })
      .filter(anniversary => anniversary !== null && anniversary.daysUntil <= 365)
      .sort((a, b) => a!.daysUntil - b!.daysUntil)
    
    console.log('Processed anniversaries:', {
      totalUpcoming: allUpcomingAnniversaries.length,
      firstFew: allUpcomingAnniversaries.slice(0, 5).map(a => a ? { name: a.name, anniversary: a.anniversary, daysUntil: a.daysUntil } : null)
    })
    
    // Get paginated anniversaries (3 per page)
    const anniversariesPerPage = 3
    const anniversaryStartIndex = anniversaryPage * anniversariesPerPage
    const upcomingAnniversaries = allUpcomingAnniversaries.slice(anniversaryStartIndex, anniversaryStartIndex + anniversariesPerPage)
    
    // Ensure we always have exactly 3 items per page
    const paddedAnniversaries = Array.from({ length: anniversariesPerPage }, (_, index) => {
      return upcomingAnniversaries[index] || null
    })
    
    console.log(`Page ${anniversaryPage + 1} anniversaries:`, {
      startIndex: anniversaryStartIndex,
      endIndex: anniversaryStartIndex + anniversariesPerPage,
      upcomingAnniversaries: upcomingAnniversaries.length,
      paddedAnniversaries: paddedAnniversaries.length,
      anniversaries: paddedAnniversaries.map(a => a ? { name: a.name, anniversary: a.anniversary } : 'null')
    })
    
    // Get upcoming events (next 30 days)
    const upcomingEvents = mockEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= today && eventDate <= oneYearFromNow
    })
    
    return {
      totalAUM,
      totalHouseholds,
      totalAccounts,
      averageAUMPerHousehold,
      averageAUMPerAccount,
      rmdClients,
      upcomingBirthdays: paddedBirthdays,
      upcomingAnniversaries: paddedAnniversaries,
      upcomingEvents
    }
  }, [copperContacts, birthdayPage, anniversaryPage])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    // Parse the date as a local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format birthday (month and day only)
  const formatBirthday = (dateString: string) => {
    try {
      // Parse the date as a local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting birthday:', dateString, error);
      return 'Error';
    }
  }

  // Format anniversary (month and day only)
  const formatAnniversary = (dateString: string) => {
    try {
      // Parse the date as a local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting anniversary:', dateString, error);
      return 'Error';
    }
  }
  
  // Calculate days until event
  const daysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day for consistent calculations

    // Parse the date as a local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    let eventDate = new Date(today.getFullYear(), month - 1, day);
    
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Ensure we don't return negative days
  }

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Overview</h1>
          <p className="text-gray-600 mt-2">Loading client data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Overview</h1>
        <p className="text-gray-600 mt-2">Comprehensive view of client assets, distributions, and upcoming events.</p>
      </div>

      {/* Upcoming Events Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Birthdays</h3>
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 text-sm">🎂</span>
            </div>
          </div>
          <div className="space-y-4">
            {summaryData.upcomingBirthdays.map((birthday, index) => {
              if (!birthday) {
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-lg">-</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400">No upcoming birthday</div>
                        <div className="text-xs text-gray-400">-</div>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={birthday.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-white rounded-lg border border-pink-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold leading-none text-center">
                        {formatBirthday(birthday.birthday)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{birthday.name}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        {formatBirthday(birthday.birthday)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                      {birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} days`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setBirthdayPage(Math.max(0, birthdayPage - 1))}
              disabled={birthdayPage === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                birthdayPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50 hover:border-pink-300 shadow-sm'
              }`}
            >
              ← Previous
            </button>
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map((page) => (
                <button
                  key={page}
                  onClick={() => setBirthdayPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                    birthdayPage === page
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setBirthdayPage(Math.min(2, birthdayPage + 1))}
              disabled={birthdayPage === 2}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                birthdayPage === 2
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50 hover:border-pink-300 shadow-sm'
              }`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Upcoming Anniversaries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Anniversaries</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💍</span>
            </div>
          </div>
          <div className="space-y-4">
            {summaryData.upcomingAnniversaries.map((anniversary, index) => {
              if (!anniversary) {
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-lg">-</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400">No upcoming anniversary</div>
                        <div className="text-xs text-gray-400">-</div>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={anniversary.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold leading-none text-center">
                        {formatAnniversary(anniversary.anniversary)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{anniversary.name}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        {formatAnniversary(anniversary.anniversary)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {anniversary.daysUntil === 0 ? 'Today!' : `${anniversary.daysUntil} days`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setAnniversaryPage(Math.max(0, anniversaryPage - 1))}
              disabled={anniversaryPage === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                anniversaryPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
              }`}
            >
              ← Previous
            </button>
            <div className="flex items-center space-x-2">
              {[0, 1, 2].map((page) => (
                <button
                  key={page}
                  onClick={() => setAnniversaryPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                    anniversaryPage === page
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAnniversaryPage(Math.min(2, anniversaryPage + 1))}
              disabled={anniversaryPage === 2}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                anniversaryPage === 2
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
              }`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">📅</span>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">-</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-400">No upcoming event</div>
                    <div className="text-xs text-gray-400">-</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client AUM Info Soon Message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client AUM Info Soon...</h3>
          <p className="text-gray-600">Detailed client AUM information will be available here shortly.</p>
        </div>
      </div>
    </div>
  )
}