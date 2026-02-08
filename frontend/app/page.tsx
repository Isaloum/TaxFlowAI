import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
              T
            </div>
            <span className="text-xl font-bold text-gray-900">TaxSyncQC</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Streamline Your Tax
            <span className="block text-blue-600">Accounting Workflow</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            TaxSyncQC is the comprehensive platform designed for Quebec accountants
            to manage clients, automate tax calculations, and synchronize data seamlessly.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Client Management</h3>
              <p className="text-sm text-gray-600">
                Efficiently manage all your clients and their tax information in one place.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">🧮</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Tax Automation</h3>
              <p className="text-sm text-gray-600">
                Automate complex tax calculations with Quebec-specific rules and regulations.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Data Sync</h3>
              <p className="text-sm text-gray-600">
                Seamlessly synchronize data across platforms for accurate reporting.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
          <p>&copy; 2024 TaxSyncQC. Professional tax accounting platform for Quebec.</p>
        </div>
      </footer>
    </div>
  );
}
