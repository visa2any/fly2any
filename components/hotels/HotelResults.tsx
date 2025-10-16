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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-4"></div>
          <p className="text-xl text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏨</div>
        <p className="text-xl text-gray-600">{t.noResults}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.results} ({hotels.length})
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-500"
          >
            {/* Hotel Image */}
            <div className="relative h-48 bg-gray-200">
              {hotel.images && hotel.images[0] ? (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🏨
                </div>
              )}
              {hotel.rating && (
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-gray-900">{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {hotel.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {hotel.address}
              </p>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    ${hotel.price.total}
                  </div>
                  <div className="text-xs text-gray-500">{t.perNight}</div>
                </div>
                <button
                  onClick={() => onSelectHotel(hotel)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                >
                  {t.selectHotel} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
