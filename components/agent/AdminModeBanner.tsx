// components/agent/AdminModeBanner.tsx
// Banner to show when admin is accessing agent portal

export default function AdminModeBanner() {
  return (
    <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-4 py-3 shadow-lg" role="banner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-white/30 rounded-full" aria-hidden="true">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">🛡️ Admin Mode Active</p>
            <p className="text-xs text-white/90">
              You're viewing the agent portal as a superadmin. This is a test account.
            </p>
          </div>
        </div>

        <a
          href="/admin"
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-secondary-600"
          aria-label="Return to admin portal"
        >
          Return to Admin
        </a>
      </div>
    </div>
  );
}
