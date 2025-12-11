'use client';

interface Hotel {
  id: string;
  name: string;
  rating: number;
  address: string;
  images: string[];
  price: {
    total: number;
    currency: string;
  };
  amenities: string[];
  description?: string;
}

interface HotelResultsProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
  isLoading: boolean;
  lang: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    results: 'Search Results',
    noResults: 'No hotels found. Try different search criteria.',
    loading: 'Searching hotels...',
    perNight: 'per night',
    rating: 'Rating',
    selectHotel: 'Select Hotel',
    viewDetails: 'View Details',
  },
  pt: {
    results: 'Resultados da Busca',
    noResults: 'Nenhum hotel encontrado. Tente outros critérios de busca.',
    loading: 'Buscando hotéis...',
    perNight: 'por noite',
    rating: 'Avaliação',
    selectHotel: 'Selecionar Hotel',
    viewDetails: 'Ver Detalhes',
  },
  es: {
    results: 'Resultados de Búsqueda',
    noResults: 'No se encontraron hoteles. Intente con otros criterios de búsqueda.',
    loading: 'Buscando hoteles...',
    perNight: 'por noche',
    rating: 'Calificación',
    selectHotel: 'Seleccionar Hotel',
    viewDetails: 'Ver Detalles',
  },
};

export default function HotelResults({ hotels, onSelectHotel, isLoading, lang }: HotelResultsProps) {
  const t = content[lang];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-neutral-200 mb-4"
            style={{ borderTopColor: '#EF4136' }}
          />
          <p className="text-lg text-[#86868b] font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 opacity-50">🏨</div>
        <p className="text-lg text-[#86868b] font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{t.noResults}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {t.results} <span className="text-[#86868b] font-medium">({hotels.length})</span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hotels.map((hotel) => (
          <article
            key={hotel.id}
            className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.985]"
            style={{
              boxShadow: '0 4px 20px -6px rgba(0,0,0,0.12), 0 1px 4px -2px rgba(0,0,0,0.08)',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)'
            }}
          >
            {/* Hotel Image */}
            <div className="relative h-48 bg-neutral-100">
              {hotel.images && hotel.images[0] ? (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
                  🏨
                </div>
              )}
              {hotel.rating && (
                <div
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-xl backdrop-blur-sm text-white font-bold text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-secondary-400">★</span>
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="p-4">
              <h3 className="text-base font-semibold text-[#1d1d1f] mb-1.5 line-clamp-2 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {hotel.name}
              </h3>

              <p className="text-sm text-[#86868b] mb-3 line-clamp-2">
                {hotel.address}
              </p>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hotel.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-[10px] bg-neutral-100 text-[#86868b] px-2 py-0.5 rounded-md font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <div>
                  <div className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                    ${hotel.price.total}
                  </div>
                  <div className="text-[10px] text-[#86868b]">{t.perNight}</div>
                </div>
                <button
                  onClick={() => onSelectHotel(hotel)}
                  className="text-white font-semibold py-2 px-4 rounded-xl transition-all text-sm active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #EF4136 0%, #DC3A30 100%)',
                    boxShadow: '0 4px 12px -3px rgba(239,65,54,0.35)'
                  }}
                >
                  {t.selectHotel}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
