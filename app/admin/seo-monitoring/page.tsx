import { SEOMonitoringDashboard } from '@/components/admin/SEOMonitoringDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Monitoring | Fly2Any Admin',
  description: 'Monitor SEO health, indexation status, schema validation, and search engine rankings',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Admin SEO Monitoring Page
 *
 * Comprehensive SEO health monitoring dashboard for administrators
 *
 * Features:
 * - Real-time SEO health score
 * - Indexation status tracking
 * - Schema markup validation
 * - Performance metrics (Core Web Vitals)
 * - Keyword ranking trends
 * - AI search visibility (ChatGPT, Perplexity, Claude)
 * - Technical SEO alerts
 * - Sitemap & robots.txt status
 *
 * @access Admin only
 */
export default function AdminSEOMonitoringPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            SEO Monitoring Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              View Sitemap
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              View Robots.txt
            </a>
          </div>
        </div>
        <p className="text-gray-600 text-lg">
          Monitor SEO performance, track indexation, and optimize search engine visibility
        </p>
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">SEO System Status</h3>
              <p className="text-sm text-blue-800">
                Your SEO infrastructure is production-ready with <strong>100,000+ programmatic pages</strong>,
                comprehensive schema markup, and AI search optimization (ChatGPT, Perplexity, Claude).
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-green-700 border border-green-200">
                  ✓ Sitemap Active
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-green-700 border border-green-200">
                  ✓ 15+ Schema Types
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-green-700 border border-green-200">
                  ✓ AI Bots Configured
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-green-700 border border-green-200">
                  ✓ Multi-language (EN/PT/ES)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Monitoring Dashboard Component */}
      <SEOMonitoringDashboard />

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <h3 className="font-semibold text-gray-900">Google Search Console</h3>
          </div>
          <p className="text-sm text-gray-600">Monitor indexation, rankings, and crawl errors</p>
        </a>

        <a
          href="https://www.bing.com/webmasters"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌐</span>
            <h3 className="font-semibold text-gray-900">Bing Webmaster Tools</h3>
          </div>
          <p className="text-sm text-gray-600">Track Bing search performance</p>
        </a>

        <a
          href="https://validator.schema.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <h3 className="font-semibold text-gray-900">Schema Validator</h3>
          </div>
          <p className="text-sm text-gray-600">Validate structured data markup</p>
        </a>

        <a
          href="https://pagespeed.web.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-400 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚡</span>
            <h3 className="font-semibold text-gray-900">PageSpeed Insights</h3>
          </div>
          <p className="text-sm text-gray-600">Test Core Web Vitals performance</p>
        </a>
      </div>

      {/* SEO Resources */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          SEO Resources & Documentation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Implementation Docs</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• SEO_FINAL_IMPLEMENTATION_SUMMARY.md</li>
              <li>• SEO_DEPLOYMENT_CHECKLIST.md</li>
              <li>• SEO_QUICK_START_GUIDE.md</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Key Pages</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/flights/jfk-to-lax" className="text-blue-600 hover:underline">
                  Flight Routes (100,000+)
                </a>
              </li>
              <li>
                <a href="/destinations/new-york" className="text-blue-600 hover:underline">
                  Destinations (100+)
                </a>
              </li>
              <li>
                <a href="/airlines/delta-air-lines" className="text-blue-600 hover:underline">
                  Airlines (50+)
                </a>
              </li>
              <li>
                <a href="/blog" className="text-blue-600 hover:underline">
                  Travel Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Schema Types</h3>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-white rounded text-xs border">Organization</span>
              <span className="px-2 py-1 bg-white rounded text-xs border">Flight</span>
              <span className="px-2 py-1 bg-white rounded text-xs border">Destination</span>
              <span className="px-2 py-1 bg-white rounded text-xs border">Article</span>
              <span className="px-2 py-1 bg-white rounded text-xs border">FAQ</span>
              <span className="px-2 py-1 bg-white rounded text-xs border">+10 more</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
