export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛒 Shop App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to the Shop Management System
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a 
              href="/admin/dashboard" 
              className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-3xl mb-2">📊</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">Manage orders, products, and view analytics</p>
            </a>
            
            <a 
              href="/test" 
              className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-3xl mb-2">🧪</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Page</h2>
              <p className="text-gray-600">Verify system functionality</p>
            </a>
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-semibold">✅ Next.js</div>
                <div className="text-gray-600">Running</div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-semibold">🎨 Tailwind</div>
                <div className="text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-semibold">📱 UI</div>
                <div className="text-gray-600">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
