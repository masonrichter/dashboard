export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading communication...</span>
      </div>
    </div>
  )
}


