import GmailInbox from '../components/GmailInbox'
import { 
  EnvelopeIcon,
  CogIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

export default function Email() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600">
          Manage your email campaigns and communications.
        </p>
      </div>
      {/* Email content will go here */}
    </div>
  )
} 