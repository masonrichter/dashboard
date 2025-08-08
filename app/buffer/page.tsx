import BufferScheduler from '../components/BufferScheduler'

export default function Buffer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media Scheduler</h1>
        <p className="text-gray-600">
          Schedule and manage your social media posts across multiple platforms.
        </p>
      </div>
      <BufferScheduler />
    </div>
  )
} 