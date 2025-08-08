import type { Metadata } from 'next'
import './styles/globals.css'
import { DashboardProvider } from './context/DashboardContext'
import Layout from './components/Layout'

export const metadata: Metadata = {
  title: 'Glenn Dashboard',
  description: 'Client management dashboard with CRM, email, and social media integrations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DashboardProvider>
          <Layout>
            {children}
          </Layout>
        </DashboardProvider>
      </body>
    </html>
  )
} 