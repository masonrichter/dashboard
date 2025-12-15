'use client'

import { Fragment } from 'react'
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  EnvelopeIcon,
  ShareIcon, 
  ChartBarIcon, 
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'

const navigation = [
  { name: 'Clients', href: '/clients-overview', icon: UsersIcon },
  { name: 'Communication', href: '/communication', icon: EnvelopeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left section */}
          <div className="flex items-center gap-x-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Avista Network Dashboard</h1>
            </div>
          </div>

          {/* Center section - Desktop Navigation */}
          <nav className="flex flex-1 justify-center max-w-2xl">
            <ul className="flex items-center space-x-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      console.log('Click detected for:', item.href)
                      window.location.href = item.href
                    }}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative cursor-pointer
                      ${pathname === item.href 
                        ? 'text-blue-700 bg-blue-50 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                    style={{ pointerEvents: 'auto', zIndex: 100 }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-x-4">
            {/* Date */}
            <div className="hidden sm:flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {format(new Date(), 'EEEE, MMMM d')}
              </span>
            </div>



            {/* Profile */}
            <div className="flex items-center gap-x-3 pl-4 border-l border-gray-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">G</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-gray-900">Glenn</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}