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
    <div className="w-screen relative overflow-hidden -mx-4 py-3">
      {/* Marquee track - full width slow scroll */}
      <div className="flex overflow-hidden">
        <div
          className="flex items-center gap-12 md:gap-16 animate-marquee-slow"
          style={{ minWidth: 'max-content' }}
        >
          {AIRLINES.map((airline, i) => (
            <img
              key={`a-${i}`}
              src={airline.logo}
              alt={airline.name}
              title={airline.name}
              className="h-4 md:h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              style={{ maxWidth: '60px' }}
              loading="lazy"
            />
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div
          className="flex items-center gap-12 md:gap-16 animate-marquee-slow"
          style={{ minWidth: 'max-content' }}
          aria-hidden="true"
        >
          {AIRLINES.map((airline, i) => (
            <img
              key={`b-${i}`}
              src={airline.logo}
              alt=""
              className="h-4 md:h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              style={{ maxWidth: '60px' }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AirlineLogosMarquee;
