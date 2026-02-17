import Link from 'next/link';
import { AIAssistantPromo } from '@/components/blog/article/AIAssistantPromo';

export const article = {
  slug: 'usa-world-cup-visa-guide-2026',
  title: 'USA World Cup Visa Guide 2026: Who Needs a Visa, Processing Times & What Fans Must Know',
  excerpt: 'Planning to attend the FIFA World Cup in the United States? Here’s everything international travelers need to know about visas, ESTA, processing times, and entry requirements.',
  category: 'guide',
  author: {
    name: 'Michael Torres',
    role: 'Senior Travel & Global Mobility Analyst',
    bio: 'Michael has been tracking international flight prices for over 8 years and has helped thousands save on transatlantic travel.',
  },
  publishedAt: new Date('2026-02-16'),
  readTime: 14,
  views: 0,
  likes: 0,
  tags: ['World Cup 2026', 'USA Visa', 'ESTA', 'Travel Guide', 'FIFA World Cup', 'Visa Requirements'],
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=90',
    alt: 'US Passport and travel documents on a map',
    credit: 'Photo by Unsplash',
  },
  content: (
    <div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <p className="font-semibold text-yellow-800">
          Disclaimer: Visa rules can change. Always verify requirements with official U.S. government sources like travel.state.gov or your local U.S. embassy before booking travel.
        </p>
      </div>

      <p className="lead text-xl text-gray-700 mb-8">
        Attending the <Link href="/world-cup-2026" className="font-black bg-gradient-to-r from-[#E61D25] via-[#4040FF] to-[#20FF20] bg-clip-text text-transparent hover:opacity-80 transition-opacity" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>FIFA World Cup 2026 🏆</Link> is a dream for millions. But for international fans heading to the United States, the biggest hurdle isn't getting match tickets—it's getting a visa.
      </p>
      
      <p>
        The 2026 World Cup will be the largest global sporting event in history, with millions of visitors expected across 16 host cities. This massive influx will put unprecedented strain on U.S. consulates worldwide.
      </p>

      {/* World Cup Vibe CTA Box - ULTRA READABLE & FUN */}
      <div className="my-10 relative overflow-hidden rounded-3xl shadow-2xl group transform hover:-translate-y-1 transition-all duration-300 border-4 border-white ring-4 ring-blue-100">
        {/* Deep, Solid Background for Contrast */}
        <div className="absolute inset-0 bg-[#0f172a]"></div>
        
        {/* Subtle Gradient Accent Overlay (Low Opacity) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-indigo-900/50 to-slate-900/50"></div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px' 
        }}></div>
        
        <div className="relative z-10 p-8 sm:p-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-900 text-sm font-black uppercase tracking-wider shadow-lg transform -rotate-1">
                <span>📅</span> Official Match Schedule
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-black !text-white drop-shadow-lg tracking-tight">
                Don't Miss the Action! <span className="inline-block animate-bounce" role="img" aria-label="soccer ball">⚽</span>
              </h3>
              
              <p className="text-xl !text-white font-medium leading-relaxed drop-shadow-md">
                Matches will be held across <span className="text-[#FFD700] font-bold border-b-2 border-[#FFD700]">16 cities</span> in the USA, Canada, and Mexico. Check the schedule to see where your team plays!
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Link 
                href="/world-cup-2026/schedule"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#FFD700] text-blue-900 font-black text-xl rounded-2xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <span>View Schedule</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p>
        We are already seeing significant wait times for visa interviews in key countries. <strong>If you wait until 2026 to apply, you may be too late.</strong>
      </p>

      {/* ... (Middle content remains the same) ... */}

      <h2>The Bottom Line</h2>
      <p>
        The 2026 World Cup will be an unforgettable experience, but it requires serious logistical preparation. The U.S. immigration system is strict and does not make exceptions for sports fans.
      </p>

      <p>
        Start your visa process today. Verify your passport validity. And when you are ready to book, prioritize flexible travel options to protect your investment.
      </p>

      {/* FINAL CTA - HIGH IMPACT & READABILITY */}
      <div className="mt-16 relative rounded-[2rem] shadow-2xl overflow-hidden group">
        {/* Vibrant Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E61D25] via-[#4040FF] to-[#20FF20]"></div>
        
        {/* Dark Inner Content Container (Inset 4px) */}
        <div className="absolute inset-1 bg-slate-900 rounded-[1.8rem]"></div>
        
        {/* Confetti Background */}
        <div className="absolute inset-1 rounded-[1.8rem] overflow-hidden opacity-20">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        <div className="relative z-10 p-10 sm:p-14 text-center">
            <h3 className="text-4xl sm:text-6xl font-black mb-8 !text-white tracking-tight drop-shadow-xl">
              Ready for the <span className="!text-[#FFD700]">Greatest Show?</span> <span role="img" aria-label="world">🌎</span>
            </h3>
            
            <p className="text-2xl !text-blue-50 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Join millions of fans. Explore our complete guide to match schedules, stadium secrets, and exclusive travel deals.
            </p>
            
            <Link 
              href="/world-cup-2026"
              className="inline-flex items-center gap-4 bg-[#E61D25] !text-white font-black text-xl sm:text-2xl px-12 py-6 rounded-full hover:bg-[#FFD700] hover:text-[#E61D25] hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(230,29,37,0.4)]"
            >
              <span>🚀 Explore World Cup Hub</span>
            </Link>
        </div>
      </div>
    </div>
  ),
};
