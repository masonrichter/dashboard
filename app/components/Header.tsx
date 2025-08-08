'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  EnvelopeIcon,
  ShareIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { useDashboard } from '@/app/context/DashboardContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Tags', href: '/tags', icon: TagIcon },
  { name: 'AUM', href: '/aum', icon: CurrencyDollarIcon },
  { name: 'Campaigns', href: '/mailerlite/campaign', icon: EnvelopeIcon }, 
  { name: 'Social Media', href: '/buffer', icon: ShareIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
]

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { mobileMenuOpen, setMobileMenuOpen } = useDashboard()

  return (
    <>
      {/* Mobile menu */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
                  <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">Glenn Dashboard</h1>
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-1">
                      <li>
                        <ul role="list" className="space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={`
                                  flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                  ${pathname === item.href 
                                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                  }
                                `}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left section */}
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-500 hover:text-gray-700 lg:hidden transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Glenn Dashboard</h1>
            </div>
          </div>

          {/* Center section - Desktop Navigation */}
          <nav className="hidden lg:flex lg:flex-1 lg:justify-center lg:max-w-2xl">
            <ul className="flex items-center space-x-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative
                      ${pathname === item.href 
                        ? 'text-primary-700 bg-primary-50 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
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

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

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