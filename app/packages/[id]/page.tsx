'use client';

import { useState } from 'react';
// Using native <img> with onError fallback to avoid Next Image failures when files are missing
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CountdownTimer } from '@/components/conversion/CountdownTimer';
import { TrustBadges } from '@/components/conversion/TrustBadges';
import LiveActivityFeed from '@/components/conversion/LiveActivityFeed';
import { ScarcityIndicator } from '@/components/conversion/ScarcityIndicator';

// Portugal Douro Valley Package Data - Bilingual
const currentLanguage = 'en' as 'en' | 'pt'; // Default to English, will be set by language selector

const packageDataEN = {
  id: '315077',
  name: 'Unforgettable 5 Days in Porto',
  subtitle: 'Porto Wine & Authentic Douro Valley Experience',
  destination: 'Porto & Douro Valley, Portugal',
  departure: 'Boston, USA',
  duration: '5 days / 4 nights',
  price: 1299,
  originalPrice: 1599,
  savings: 300,
  rating: 4.8,
  reviewCount: 189,
  spotsLeft: 6,
  groupSize: 'Small group (max 16 travelers)',
  difficulty: 'Easy',
  ageRange: '18-80',
  includes: [
    'Round-trip flights from Boston to Porto',
    '4 nights accommodation in charming hotels',
    'Daily breakfast included',
    '3 dinners with authentic Portuguese cuisine',
    'Local guide specialized in Portuguese culture',
    'Walking tour through historic Porto center',
    'Complete Douro Valley tour',
    'Panoramic cruise on the Douro River',
    'Wine tastings at 3 family-owned vineyards',
    'Traditional Portuguese lunch with bacalhau',
    'Port wine tasting in traditional cellars',
    'Live Fado music experience',
    'Visit to historic azulejos and monuments',
    'All transportation between destinations',
    '24/7 Fly2Any support',
    'Travel insurance included'
  ],
  highlights: [
    'Explore historic Porto with local guide',
    'Tour the Douro Valley wine region',
    'Premium tastings at family vineyards',
    'Breathtaking Douro River cruise',
    'Authentic Portuguese gastronomic experiences',
    'Small group for personalized attention',
    'UNESCO World Heritage sites',
    'Visit to traditional Port wine cellars',
    'Unique architecture with Portuguese azulejos',
    'Fado culture and local traditions',
    'Dramatic Douro Valley landscapes',
    'Excellent Portuguese enogastronomy'
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Porto - Welcome to Portugal',
      description: 'Arrive at Porto Airport and transfer to your charming hotel in the historic center. Meet your guide and fellow travelers for a welcome briefing. Evening free to explore the vibrant Ribeira district along the Douro River. Suggestion: try a pastel de nata at a traditional pastry shop.',
      activities: ['Airport transfer', 'Hotel check-in', 'Welcome briefing', 'Free exploration of Ribeira', 'Traditional pastel de nata']
    },
    {
      day: 2,
      title: 'Discover Porto & Port Wine',
      description: 'Walking tour through Porto\'s historic center, visiting iconic sites including São Bento Station, Clérigos Tower, and Livraria Lello. Afternoon dedicated to traditional Port wine cellars in Vila Nova de Gaia with tasting session. Dinner at authentic Portuguese restaurant with regional specialties.',
      activities: ['City walking tour', 'Port wine cellar visit', 'Wine tasting', 'Traditional Portuguese dinner', 'Azulejo architecture']
    },
    {
      day: 3,
      title: 'Douro Valley Experience',
      description: 'Full-day excursion to the stunning Douro Valley. Visit family-owned vineyards for premium wine tastings, enjoy panoramic viewpoints overlooking terraced vineyards, and savor a traditional Portuguese lunch at a local quinta. Return to Porto in the evening.',
      activities: ['Vineyard visits', 'Premium wine tastings', 'Panoramic viewpoints', 'Traditional lunch at quinta', 'Douro landscapes']
    },
    {
      day: 4,
      title: 'Douro River Cruise & Free Time',
      description: 'Morning panoramic cruise along the Douro River, offering breathtaking views of the valley. Afternoon free for personal exploration - optional activities include visiting museums, shopping for local crafts, or relaxing at a riverside café. Farewell dinner with local specialties and live Fado experience.',
      activities: ['Douro River cruise', 'Free time for exploration', 'Farewell dinner', 'Live Fado performance', 'Gastronomic specialties']
    },
    {
      day: 5,
      title: 'Departure & Last Memories',
      description: 'Enjoy final Portuguese breakfast before transfer to Porto Airport. Optional extension available for those wishing to explore Lisbon or the Algarve region. Take with you the Portuguese saudade.',
      activities: ['Final breakfast', 'Airport transfer', 'Optional extensions available', 'Portuguese saudade']
    }
  ],
  reviews: [
    {
      name: 'Maria S.',
      rating: 5,
      date: '2024-11-10',
      comment: 'Absolutely magical experience! The Douro Valley is breathtaking and our guide was incredibly knowledgeable. The wine tastings were exceptional and the small group size made it very personal. Highly recommend this tour!'
    },
    {
      name: 'James T.',
      rating: 5,
      date: '2024-10-25',
      comment: 'Perfect balance of guided activities and free time. The river cruise was stunning, and the food experiences were authentic and delicious. Fly2Any made everything seamless from booking to the end of the trip.'
    },
    {
      name: 'Sophie L.',
      rating: 4,
      date: '2024-10-12',
      comment: 'Beautiful tour with excellent organization. The hotels were charming and well-located. Only minor suggestion would be more time at the vineyards, but overall an amazing Portuguese experience.'
    }
  ],
  importantInfo: {
    startPoint: 'Porto, Portugal',
    endPoint: 'Porto, Portugal',
    physicalRating: 'Easy - Suitable for all fitness levels',
    accommodation: '4-star hotels in central locations',
    meals: '4 breakfasts, 3 dinners included',
    transport: 'Private minibus, walking, river cruise',
    groupSize: 'Maximum 16 travelers',
    ageRequirement: '18+ years old',
    visaInfo: 'Check visa requirements for Portugal',
    insurance: 'Travel insurance included',
    cancellation: 'Free cancellation up to 30 days before departure'
  }
};

const packageDataPT = {
  id: '315077',
  name: 'Saudade Portuguesa: 5 Dias no Porto',
  subtitle: 'Vinho do Porto & Experiência Autêntica no Vale do Douro',
  destination: 'Porto & Vale do Douro, Portugal',
  departure: 'Boston, EUA',
  duration: '5 dias / 4 noites',
  price: 1299,
  originalPrice: 1599,
  savings: 300,
  rating: 4.8,
  reviewCount: 189,
  spotsLeft: 6,
  groupSize: 'Grupo pequeno (máximo 16 viajantes)',
  difficulty: 'Fácil',
  ageRange: '18-80',
  includes: [
    'Voos de ida e volta de Boston para o Porto',
    '4 noites de hospedagem em hotéis charmosos',
    'Café da manhã diário incluído',
    '3 jantares com autêntica gastronomia portuguesa',
    'Guia local especializado em cultura portuguesa',
    'Tour a pé pelo centro histórico do Porto',
    'Tour completo pelo Vale do Douro',
    'Cruzeiro panorâmico pelo Rio Douro',
    'Degustações de vinho em 3 quintas familiares',
    'Almoço tradicional português com bacalhau',
    'Prova de vinho do Porto em caves tradicionais',
    'Experiência de Fado ao vivo',
    'Visita a azulejos históricos e monumentos',
    'Todos os transportes entre destinos',
    'Suporte Fly2Any 24/7',
    'Seguro de viagem incluído'
  ],
  highlights: [
    'Explorar o Porto histórico com guia local',
    'Tour pela região vinícola do Vale do Douro',
    'Degustações premium em quintas familiares',
    'Cruzeiro deslumbrante pelo Rio Douro',
    'Experiências gastronômicas autênticas portuguesas',
    'Grupo pequeno para atenção personalizada',
    'Sítios do Patrimônio Mundial da UNESCO',
    'Visita às caves tradicionais de vinho do Porto',
    'Arquitetura única com azulejos portugueses',
    'Cultura do Fado e tradições locais',
    'Paisagens dramáticas do Vale do Douro',
    'Enogastronomia portuguesa de excelência'
  ],
  itinerary: [
    {
      day: 1,
      title: 'Chegada ao Porto - Bem-vindo a Portugal',
      description: 'Chegue ao Aeroporto do Porto e transfer para o seu hotel charmoso no centro histórico. Encontro com o seu guia e companheiros de viagem para um briefing de boas-vindas. Tarde livre para explorar o vibrante bairro da Ribeira junto ao Rio Douro. Sugestão: experimente um pastel de nata numa pastelaria tradicional.',
      activities: ['Transfer do aeroporto', 'Check-in no hotel', 'Briefing de boas-vindas', 'Exploração livre da Ribeira', 'Pastel de nata tradicional']
    },
    {
      day: 2,
      title: 'Descobrir o Porto & Vinho do Porto',
      description: 'Tour a pé pelo centro histórico do Porto, visitando locais icônicos incluindo a Estação de São Bento, Torre dos Clérigos e Livraria Lello. Tarde dedicada às caves tradicionais de vinho do Porto em Vila Nova de Gaia com sessão de degustação. Jantar em restaurante português autêntico com especialidades regionais.',
      activities: ['Tour a pé pela cidade', 'Visita às caves de vinho do Porto', 'Degustação de vinhos', 'Jantar tradicional português', 'Arquitetura dos azulejos']
    },
    {
      day: 3,
      title: 'Experiência no Vale do Douro',
      description: 'Excursão de dia inteiro ao deslumbrante Vale do Douro. Visite quintas familiares para degustações premium de vinhos, desfrute de miradouros panorâmicos sobre os vinhedos em socalcos e saboreie um almoço tradicional português numa quinta local. Regresso ao Porto ao final do dia.',
      activities: ['Visitas a quintas familiares', 'Degustações de vinhos premium', 'Miradouros panorâmicos', 'Almoço tradicional na quinta', 'Paisagens do Douro']
    },
    {
      day: 4,
      title: 'Cruzeiro no Rio Douro & Tempo Livre',
      description: 'Cruzeiro panorâmico matinal pelo Rio Douro, oferecendo vistas deslumbrantes do vale. Tarde livre para exploração pessoal - atividades opcionais incluem visitar museus, comprar artesanato local ou relaxar num café à beira-rio. Jantar de despedida com especialidades locais e experiência de Fado ao vivo.',
      activities: ['Cruzeiro pelo Rio Douro', 'Tempo livre para exploração', 'Jantar de despedida', 'Fado ao vivo', 'Especialidades gastronómicas']
    },
    {
      day: 5,
      title: 'Partida & Últimas Memórias',
      description: 'Desfrute do último pequeno-almoço português antes do transfer para o Aeroporto do Porto. Extensão opcional disponível para quem deseja explorar Lisboa ou a região do Algarve. Leve consigo a saudade portuguesa.',
      activities: ['Pequeno-almoço final', 'Transfer para o aeroporto', 'Extensões opcionais disponíveis', 'Saudade portuguesa']
    }
  ],
  reviews: [
    {
      name: 'Maria S.',
      rating: 5,
      date: '2024-11-10',
      comment: 'Experiência absolutamente mágica! O Vale do Douro é deslumbrante e nosso guia era incrivelmente conhecedor. As degustações de vinho foram excepcionais e o grupo pequeno tornou tudo muito pessoal. Recomendo muito este tour!'
    },
    {
      name: 'James T.',
      rating: 5,
      date: '2024-10-25',
      comment: 'Equilíbrio perfeito entre atividades guiadas e tempo livre. O cruzeiro pelo rio foi espetacular e as experiências gastronômicas foram autênticas e deliciosas. A Fly2Any tornou tudo perfeito desde a reserva até o final da viagem.'
    },
    {
      name: 'Sophie L.',
      rating: 4,
      date: '2024-10-12',
      comment: 'Tour lindo com excelente organização. Os hotéis eram charmosos e bem localizados. Única sugestão seria mais tempo nas vinhas, mas no geral uma experiência portuguesa incrível.'
    }
  ],
  importantInfo: {
    startPoint: 'Porto, Portugal',
    endPoint: 'Porto, Portugal',
    physicalRating: 'Fácil - Adequado para todos os níveis de condição física',
    accommodation: 'Hotéis de 4 estrelas em localizações centrais',
    meals: '4 pequenos-almoços, 3 jantares incluídos',
    transport: 'Autocarro privado, caminhadas, cruzeiro fluvial',
    groupSize: 'Máximo 16 viajantes',
    ageRequirement: 'Maiores de 18 anos',
    visaInfo: 'Verifique os requisitos de visto para Portugal',
    insurance: 'Seguro de viagem incluído',
    cancellation: 'Cancelamento gratuito até 30 dias antes da partida'
  }
};

// Select package data based on language
const packageData = currentLanguage === 'pt' ? packageDataPT : packageDataEN;

export default function PackageDetailPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const dealEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  const packageImages: { src: string; fallback: string; caption: string }[] = [
    { 
      src: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Vista panorâmica do Vale do Douro' : 'Panoramic view of Douro Valley'
    },
    { 
      src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Ponte Dom Luís I no Porto' : 'Dom Luís I Bridge in Porto'
    },
    { 
      src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Cruzeiro pelo Rio Douro' : 'Cruise on Douro River'
    },
    { 
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Vinhos do Porto em caves tradicionais' : 'Port wines in traditional cellars'
    },
    { 
      src: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Azulejos portugueses na Estação de São Bento' : 'Portuguese azulejos at São Bento Station'
    },
    { 
      src: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Quartos com vista para o rio' : 'Rooms with river view'
    },
    { 
      src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Terraços com piscina no Vale do Douro' : 'Terraces with pool in Douro Valley'
    },
    { 
      src: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Restaurantes com gastronomia portuguesa' : 'Restaurants with Portuguese cuisine'
    },
    { 
      src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Jantares com especialidades regionais' : 'Dinners with regional specialties'
    },
    { 
      src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      fallback: '/fly2any-logo.png', 
      caption: currentLanguage === 'pt' ? 'Bares com vinhos portugueses' : 'Bars with Portuguese wines'
    },
  ];

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-red-50/20 to-yellow-50/10">
      {/* Hero Section */}
      <section className="relative text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1590077428593-a55bb07c4665?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 via-red-900/50 to-yellow-600/40"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-900">
                  🍷 {currentLanguage === 'pt' ? 'Vinho & Cultura' : 'Wine & Culture'}
                </span>
                <span className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                  ⚡ {currentLanguage === 'pt' ? `Apenas ${packageData.spotsLeft} vagas` : `Only ${packageData.spotsLeft} Spots Left`}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                {packageData.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-2 font-medium drop-shadow">
                {packageData.subtitle}
              </p>
              <p className="text-lg text-white/90 mb-2">
                ✈️ {currentLanguage === 'pt' ? 'Partida de' : 'Departing from'} {packageData.departure}
              </p>
              <p className="text-lg text-white/80 mb-6">
                {packageData.destination} · {packageData.duration}
              </p>
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-2xl drop-shadow">★</span>
                  <span className="text-xl font-bold text-white drop-shadow">{packageData.rating}</span>
                  <span className="text-white/90 drop-shadow">({packageData.reviewCount} {currentLanguage === 'pt' ? 'avaliações' : 'reviews'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/90">👥</span>
                  <span className="font-semibold text-white drop-shadow">{packageData.groupSize}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="text-lg px-8 py-4 font-bold bg-white text-blue-700 hover:bg-white/90 shadow-xl"
                  onClick={handleBookNow}
                >
                  🎯 {currentLanguage === 'pt' ? 'Reservar Agora - Economize $' : 'Book Now - Save $'}{packageData.savings}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 font-bold border-white text-white hover:bg-white/20 shadow-lg"
                >
                  📞 {currentLanguage === 'pt' ? 'Fale com um Especialista Fly2Any' : 'Talk to a Fly2Any Expert'}
                </Button>
              </div>
            </div>
            <div className="relative lg:sticky lg:top-24">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-sm text-white/80 line-through mb-1">
                    ${packageData.originalPrice}
                  </div>
                  <div className="text-5xl font-bold mb-2 text-white drop-shadow">
                    ${packageData.price}
                  </div>
                  <div className="text-green-300 font-bold text-lg drop-shadow">
                    {currentLanguage === 'pt' ? 'Economize $' : 'Save $'}{packageData.savings}!
                  </div>
                  <div className="text-white/90 text-sm mt-2">
                    {currentLanguage === 'pt' ? 'por pessoa (voos incluídos)' : 'per person (flights included)'}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">{currentLanguage === 'pt' ? 'Duração' : 'Duration'}</span>
                    <span className="font-semibold text-white">{packageData.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">{currentLanguage === 'pt' ? 'Partida' : 'Departure'}</span>
                    <span className="font-semibold text-white">{packageData.departure}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">{currentLanguage === 'pt' ? 'Tamanho do grupo' : 'Group size'}</span>
                    <span className="font-semibold text-white">{packageData.groupSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">{currentLanguage === 'pt' ? 'Dificuldade' : 'Difficulty'}</span>
                    <span className="font-semibold text-white">{packageData.difficulty}</span>
                  </div>
                  <div className="border-t border-white/30 pt-3">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>{currentLanguage === 'pt' ? 'Total' : 'Total'}</span>
                      <span>${packageData.price}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="text-lg px-8 py-4 font-bold bg-white text-blue-700 hover:bg-white/90 shadow-xl mt-6 w-full"
                  onClick={handleBookNow}
                >
                  {currentLanguage === 'pt' ? 'Reservar Agora' : 'Reserve Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'pt' ? 'Descubra Portugal Através das Nossas Lentes' : 'Discover Portugal Through Our Lens'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {currentLanguage === 'pt' ? 'Explore os socalcos do Douro, cruzeiros pelo rio e paisagens que inspiram saudade.' : 'Explore the Douro terraces, river cruises, and landscapes that inspire saudade.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packageImages.map((img, index) => (
            <div
              key={index}
              className={`relative h-72 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedImage === index ? 'ring-4 ring-blue-500 shadow-2xl' : 'hover:scale-105 shadow-lg'
              }`}
              onClick={() => { setSelectedImage(index); setLightboxIndex(index); setLightboxOpen(true); }}
            >
              <img
                src={img.src}
                alt={img.caption}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallbackApplied) {
                    target.src = '/fly2any-logo.png';
                    target.dataset.fallbackApplied = 'true';
                  }
                }}
              />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                  {img.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setLightboxIndex((lightboxIndex + 1) % packageImages.length);
            if (e.key === 'ArrowLeft') setLightboxIndex((lightboxIndex - 1 + packageImages.length) % packageImages.length);
          }}
          tabIndex={-1}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            ✕
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + packageImages.length) % packageImages.length); }}
          >
            ‹
          </button>
          <div className="relative w-[90vw] max-w-5xl h-[70vh]">
            <img
              src={packageImages[lightboxIndex].src}
              alt={packageImages[lightboxIndex].caption}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallbackApplied) {
                  target.src = '/fly2any-logo.png';
                  target.dataset.fallbackApplied = 'true';
                }
              }}
            />
            <div className="absolute bottom-3 left-0 right-0 text-center text-white/90">
              <div className="inline-block bg-black/50 px-3 py-1.5 rounded-full text-sm">
                {packageImages[lightboxIndex].caption}
              </div>
            </div>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % packageImages.length); }}
          >
            ›
          </button>
        </div>
      )}

      {/* Package Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'pt' ? 'Por Que Escolher Esta Experiência Portuguesa?' : 'Why Choose This Portugal Experience?'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLanguage === 'pt' ? 'Mergulhe na rica cultura, paisagens deslumbrantes e vinhos de classe mundial do Vale do Douro português' : 'Immerse yourself in the rich culture, stunning landscapes, and world-class wines of Portugal\'s Douro Valley'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packageData.highlights.map((highlight, index) => (
            <Card key={index} variant="elevated" padding="lg" className="text-center hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">
                {index === 0 && '🏰'}
                {index === 1 && '🍇'}
                {index === 2 && '🍷'}
                {index === 3 && '⛵'}
                {index === 4 && '🍽️'}
                {index === 5 && '👥'}
                {index === 6 && '🏆'}
                {index === 7 && '🏛️'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight}</h3>
            </Card>
          ))}
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'pt' ? 'Tudo Incluído para Sua Aventura Portuguesa' : 'Everything Included for Your Portugal Adventure'}
            </h2>
            <p className="text-xl text-gray-600">
              {currentLanguage === 'pt' ? 'Sem custos ocultos - cuidamos de todos os detalhes' : 'No hidden costs - we\'ve taken care of all the details'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {packageData.includes.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <span className="text-gray-800 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Itinerary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'pt' ? 'Seu Roteiro de 5 Dias em Portugal' : 'Your 5-Day Portugal Itinerary'}
          </h2>
          <p className="text-xl text-gray-600">
            {currentLanguage === 'pt' ? 'Cuidadosamente elaborado para maximizar sua experiência portuguesa' : 'Carefully crafted to maximize your Portuguese experience'}
          </p>
        </div>
        <div className="space-y-6 max-w-4xl mx-auto">
          {packageData.itinerary.map((day) => (
            <Card
              key={day.day}
              variant="elevated"
              padding="lg"
              className={`cursor-pointer transition-all duration-300 ${
                expandedDay === day.day ? 'ring-2 ring-amber-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {day.day}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {day.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{day.description}</p>
                  {expandedDay === day.day && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{currentLanguage === 'pt' ? 'Atividades:' : 'Activities:'}</h4>
                      <div className="flex flex-wrap gap-2">
                        {day.activities.map((activity, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-2xl transition-transform duration-300">
                  {expandedDay === day.day ? '▲' : '▼'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Important Information */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'pt' ? 'Informações Importantes' : 'Important Information'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Object.entries(packageData.importantInfo).map(([key, value]) => (
              <Card key={key} variant="elevated" padding="lg" className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-gray-600">{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'pt' ? 'O Que os Viajantes Dizem Sobre Esta Experiência' : 'What Travelers Say About This Experience'}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl text-yellow-400">★</div>
            <div>
              <div className="text-2xl font-bold">{packageData.rating}/5</div>
              <div className="text-gray-600">{currentLanguage === 'pt' ? 'Baseado em' : 'Based on'} {packageData.reviewCount} {currentLanguage === 'pt' ? 'avaliações' : 'reviews'}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packageData.reviews.map((review, index) => (
            <Card key={index} variant="elevated" padding="lg" className="hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                <span className="text-gray-600 text-sm">{review.date}</span>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-4">{review.comment}</p>
              <div className="font-semibold text-gray-900">{review.name}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {currentLanguage === 'pt' ? 'Pronto para Sua Inesquecível Aventura Portuguesa?' : 'Ready for Your Unforgettable Portugal Adventure?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {currentLanguage === 'pt' ? 'Não perca esta incrível oportunidade de explorar o deslumbrante Vale do Douro de Portugal. Apenas' : 'Don\'t miss out on this incredible opportunity to explore Portugal\'s stunning Douro Valley. Only'} {packageData.spotsLeft} {currentLanguage === 'pt' ? 'vagas restantes a este preço exclusivo!' : 'spots remaining at this exclusive price!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              className="text-lg px-8 py-4 font-bold bg-white text-amber-600 hover:bg-white/90"
              onClick={handleBookNow}
            >
              🎯 {currentLanguage === 'pt' ? 'Garanta Sua Vaga Agora' : 'Secure Your Spot Now'}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 font-bold border-white text-white hover:bg-white/10"
            >
              📞 {currentLanguage === 'pt' ? 'Ligue: +1 (315) 306-1646' : 'Call: +1 (315) 306-1646'}
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{currentLanguage === 'pt' ? 'Garantia de Melhor Preço' : 'Best Price Guarantee'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{currentLanguage === 'pt' ? 'Suporte Fly2Any 24/7' : '24/7 Fly2Any Support'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{currentLanguage === 'pt' ? 'Cancelamento Gratuito Até 30 Dias' : 'Free Cancellation Up to 30 Days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{currentLanguage === 'pt' ? 'Experiência em Grupo Pequeno' : 'Small Group Experience'}</span>
            </div>
          </div>
          <div className="mt-10">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">{currentLanguage === 'pt' ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}</h3>
          <div className="space-y-4">
            <Card variant="outlined" padding="lg">
              <h4 className="font-semibold text-gray-900 mb-2">{currentLanguage === 'pt' ? 'As passagens aéreas estão incluídas?' : 'Is airfare included?'}</h4>
              <p className="text-gray-600">{currentLanguage === 'pt' ? 'Sim, este pacote especial inclui voos de ida e volta da cidade de partida especificada.' : 'Yes, this special package includes round-trip flights from the specified departure city.'}</p>
            </Card>
            <Card variant="outlined" padding="lg">
              <h4 className="font-semibold text-gray-900 mb-2">{currentLanguage === 'pt' ? 'Posso alterar as datas depois?' : 'Can I change dates later?'}</h4>
              <p className="text-gray-600">{currentLanguage === 'pt' ? 'Oferecemos opções de alteração flexíveis. Entre em contato com nossa equipe e cuidaremos disso.' : 'We offer flexible change options. Contact our team and we will take care of it.'}</p>
            </Card>
            <Card variant="outlined" padding="lg">
              <h4 className="font-semibold text-gray-900 mb-2">{currentLanguage === 'pt' ? 'Qual é a sua política de cancelamento?' : 'What is your cancellation policy?'}</h4>
              <p className="text-gray-600">{currentLanguage === 'pt' ? 'Cancelamento gratuito até 30 dias antes da partida. Após isso, aplicam-se as políticas padrão do fornecedor.' : 'Free cancellation up to 30 days before departure. After that, standard supplier policies apply.'}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden">
        <div className="bg-white border-t border-gray-200 shadow-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">{currentLanguage === 'pt' ? 'A partir de' : 'From'}</div>
            <div className="text-xl font-bold text-gray-900">${packageData.price} <span className="text-sm font-normal text-gray-500 line-through ml-2">${packageData.originalPrice}</span></div>
          </div>
          <Button onClick={handleBookNow} className="bg-amber-600 hover:bg-amber-700 text-white">{currentLanguage === 'pt' ? 'Reservar' : 'Book'}</Button>
        </div>
      </div>

      {/* Booking modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBookingModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold mb-2">{currentLanguage === 'pt' ? 'Reserve seu lugar' : 'Hold your spot'}</h3>
            <p className="text-gray-600 mb-4">{currentLanguage === 'pt' ? 'Nenhum pagamento agora. Um especialista Fly2Any confirmará os detalhes.' : 'No payment now. A Fly2Any expert will confirm details.'}</p>
            <form className="space-y-3">
              <input className="w-full border rounded-lg px-3 py-2" placeholder={currentLanguage === 'pt' ? 'Nome completo' : 'Full name'} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" />
              <input className="w-full border rounded-lg px-3 py-2" placeholder={currentLanguage === 'pt' ? 'Telefone' : 'Phone'} />
            </form>
            <div className="flex gap-3 mt-6">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setShowBookingModal(false)}>{currentLanguage === 'pt' ? 'Solicitar Reserva' : 'Request Booking'}</Button>
              <Button variant="ghost" onClick={() => setShowBookingModal(false)}>{currentLanguage === 'pt' ? 'Cancelar' : 'Cancel'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
