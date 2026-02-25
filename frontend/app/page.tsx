export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TaxFlowAI</h1>
          <div className="space-x-4">
            <a href="/login" className="text-gray-700 hover:text-indigo-600">Login</a>
            <a href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Tax Document Management for Canadians
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered classification for T4, RL-1, T5, and all your tax forms. 
            Automatic organization, secure storage, and instant retrieval.
          </p>
          <a href="/login" className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700">
            Start Free Trial
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Classification</h3>
            <p className="text-gray-600">Automatically categorize tax documents using OpenAI</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Storage</h3>
            <p className="text-gray-600">Bank-level encryption with Supabase</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Email Notifications</h3>
            <p className="text-gray-600">Stay updated on document processing</p>
          </div>
        </div>
      </main>
    </div>
  );
}
