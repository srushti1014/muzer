"use client"

export default function Loader() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Simple spinning circle */}
          <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-400 rounded-full animate-spin"></div>
          
          {/* Loading text */}
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    </div>
  )
}
