const fs = require('fs');
const path = require('path');

// Define all FlightResults translations
const flightResultsTranslations = {
  en: {
    FlightResults: {
      modifySearch: 'Modify Search',
      showPriceInsights: 'Show Price Insights',
      hidePriceInsights: 'Hide Price Insights',
      searching: 'Searching for the best flights...',
      noResults: 'No flights found',
      noResultsDesc: "We couldn't find any flights matching your search criteria. Try adjusting your filters or search parameters.",
      error: 'Error loading flights',
      errorDesc: 'We encountered an issue while searching for flights. Please try again.',
      retry: 'Retry Search',
      loadMore: 'Load More Flights',
      loading: 'Loading...',
      loadingMore: 'Loading more flights...',
      allResultsLoaded: 'All {total} flights loaded',
      showingResults: 'Showing {count} of {total} flights',
    },
  },
  pt: {
    FlightResults: {
      modifySearch: 'Modificar Busca',
      showPriceInsights: 'Mostrar Insights de Preço',
      hidePriceInsights: 'Ocultar Insights de Preço',
      searching: 'Procurando os melhores voos...',
      noResults: 'Nenhum voo encontrado',
      noResultsDesc: 'Não encontramos voos que correspondam aos seus critérios de busca. Tente ajustar seus filtros ou parâmetros de busca.',
      error: 'Erro ao carregar voos',
      errorDesc: 'Encontramos um problema ao procurar voos. Por favor, tente novamente.',
      retry: 'Tentar Novamente',
      loadMore: 'Carregar Mais Voos',
      loading: 'Carregando...',
      loadingMore: 'Carregando mais voos...',
      allResultsLoaded: 'Todos os {total} voos carregados',
      showingResults: 'Mostrando {count} de {total} voos',
    },
  },
  es: {
    FlightResults: {
      modifySearch: 'Modificar Búsqueda',
      showPriceInsights: 'Mostrar Insights de Precio',
      hidePriceInsights: 'Ocultar Insights de Precio',
      searching: 'Buscando los mejores vuelos...',
      noResults: 'No se encontraron vuelos',
      noResultsDesc: 'No pudimos encontrar vuelos que coincidan con sus criterios de búsqueda. Intente ajustar sus filtros o parámetros de búsqueda.',
      error: 'Error al cargar vuelos',
      errorDesc: 'Encontramos un problema al buscar vuelos. Por favor, inténtelo de nuevo.',
      retry: 'Reintentar Búsqueda',
      loadMore: 'Cargar Más Vuelos',
      loading: 'Cargando...',
      loadingMore: 'Cargando más vuelos...',
      allResultsLoaded: 'Todos los {total} vuelos cargados',
      showingResults: 'Mostrando {count} de {total} vuelos',
    },
  },
};

// Read and update each language file
['en', 'pt', 'es'].forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);

  try {
    // Read existing content
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Merge with new translations
    const updated = {
      ...existing,
      ...flightResultsTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added FlightResults translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ FlightResults translations added to all language files!');
