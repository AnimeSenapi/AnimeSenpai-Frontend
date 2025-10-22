export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-md mx-auto text-center">
          {/* Loading Animation */}
          <div className="glass rounded-2xl p-12">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-brand-primary-400/20 border-t-brand-primary-400 rounded-full animate-spin mx-auto mb-8"></div>

            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
            <p className="text-gray-300 mb-8">Please wait while we load your content</p>

            {/* Loading Dots Animation */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
