'use client';

/**
 * AirlineLogosMarquee - Level-6 Ultra-Premium
 * Glassmorphism infinite scroll of major airline logos
 */

const AIRLINES = [
  { name: 'American Airlines', logo: 'https://logo.clearbit.com/aa.com' },
  { name: 'Delta', logo: 'https://logo.clearbit.com/delta.com' },
  { name: 'United', logo: 'https://logo.clearbit.com/united.com' },
  { name: 'Southwest', logo: 'https://logo.clearbit.com/southwest.com' },
  { name: 'JetBlue', logo: 'https://logo.clearbit.com/jetblue.com' },
  { name: 'Alaska Airlines', logo: 'https://logo.clearbit.com/alaskaair.com' },
  { name: 'Spirit', logo: 'https://logo.clearbit.com/spirit.com' },
  { name: 'British Airways', logo: 'https://logo.clearbit.com/britishairways.com' },
  { name: 'Lufthansa', logo: 'https://logo.clearbit.com/lufthansa.com' },
  { name: 'Air France', logo: 'https://logo.clearbit.com/airfrance.com' },
  { name: 'KLM', logo: 'https://logo.clearbit.com/klm.com' },
  { name: 'Emirates', logo: 'https://logo.clearbit.com/emirates.com' },
  { name: 'Qatar Airways', logo: 'https://logo.clearbit.com/qatarairways.com' },
  { name: 'Singapore Airlines', logo: 'https://logo.clearbit.com/singaporeair.com' },
  { name: 'Turkish Airlines', logo: 'https://logo.clearbit.com/turkishairlines.com' },
  { name: 'Cathay Pacific', logo: 'https://logo.clearbit.com/cathaypacific.com' },
  { name: 'ANA', logo: 'https://logo.clearbit.com/ana.co.jp' },
  { name: 'Qantas', logo: 'https://logo.clearbit.com/qantas.com' },
  { name: 'Air Canada', logo: 'https://logo.clearbit.com/aircanada.com' },
  { name: 'LATAM', logo: 'https://logo.clearbit.com/latam.com' },
  { name: 'Iberia', logo: 'https://logo.clearbit.com/iberia.com' },
  { name: 'Virgin Atlantic', logo: 'https://logo.clearbit.com/virginatlantic.com' },
  { name: 'Etihad', logo: 'https://logo.clearbit.com/etihad.com' },
  { name: 'Korean Air', logo: 'https://logo.clearbit.com/koreanair.com' },
];

export function AirlineLogosMarquee() {
  return (
    <div className="w-full py-3 md:py-4">
      {/* Glassmorphism container */}
      <div
        className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black/30 to-transparent z-10 pointer-events-none" />

        {/* Marquee track */}
        <div className="flex overflow-hidden py-3 md:py-4 group">
          {/* First set */}
          <div
            className="flex items-center gap-8 md:gap-12 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ minWidth: 'max-content' }}
          >
            {AIRLINES.map((airline, i) => (
              <div
                key={`a-${i}`}
                className="flex-shrink-0 flex items-center justify-center h-8 md:h-10 px-2 opacity-80 hover:opacity-100 transition-opacity duration-200"
                title={airline.name}
              >
                <img
                  src={airline.logo}
                  alt={airline.name}
                  className="h-6 md:h-8 w-auto object-contain"
                  style={{
                    filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                    maxWidth: '80px',
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Duplicate set for seamless loop */}
          <div
            className="flex items-center gap-8 md:gap-12 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ minWidth: 'max-content' }}
            aria-hidden="true"
          >
            {AIRLINES.map((airline, i) => (
              <div
                key={`b-${i}`}
                className="flex-shrink-0 flex items-center justify-center h-8 md:h-10 px-2 opacity-80 hover:opacity-100 transition-opacity duration-200"
              >
                <img
                  src={airline.logo}
                  alt=""
                  className="h-6 md:h-8 w-auto object-contain"
                  style={{
                    filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                    maxWidth: '80px',
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle label */}
      <p className="text-center text-white/50 text-[10px] md:text-xs mt-2 font-medium tracking-wide">
        Compare 500+ Airlines Worldwide
      </p>
    </div>
  );
}

export default AirlineLogosMarquee;
