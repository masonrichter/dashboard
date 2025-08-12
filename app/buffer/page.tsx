import BufferScheduler from '@/app/components/BufferScheduler';
import { DashboardProvider } from '@/app/context/DashboardContext';

export default function BufferPage() {
  return (
    <DashboardProvider>
        <div className="space-y-8 p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Schedule and manage social media posts through Buffer.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BufferScheduler />
                {/* You can add another component here for showing recent posts, etc. */}
            </div>
        </div>
    </DashboardProvider>
  );
}