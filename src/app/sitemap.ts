import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fly2any.com'
  const currentDate = new Date()
  
  // Main page with language alternates
  const mainPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/es`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pt`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
  ]

  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}/sobre`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/como-funciona`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/politica-privacidade`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos-uso`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // 🚀 US MARKET DOMINATION - High Priority Routes
  const usMarketPages = [
    // Core US Flight Search Pages (Target: "cheap flights", "flight deals")
    {
      url: `${baseUrl}/flights`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 1.0, // Maximum priority for main search
    },
    {
      url: `${baseUrl}/cheap-flights`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.98,
    },
    {
      url: `${baseUrl}/flight-deals`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.98,
    },
    {
      url: `${baseUrl}/best-flight-prices`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.98,
    },
    
    // Top US Domestic Routes (High-Volume Keywords)
    {
      url: `${baseUrl}/flights/new-york-los-angeles`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.97,
    },
    {
      url: `${baseUrl}/flights/new-york-miami`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.97,
    },
    {
      url: `${baseUrl}/flights/los-angeles-new-york`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.97,
    },
    {
      url: `${baseUrl}/flights/chicago-los-angeles`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/flights/atlanta-new-york`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/flights/dallas-los-angeles`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    
    // Top US International Routes
    {
      url: `${baseUrl}/flights/new-york-london`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/flights/los-angeles-tokyo`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/flights/miami-sao-paulo`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96,
    },
    {
      url: `${baseUrl}/flights/new-york-paris`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.95,
    },
    
    // City-specific Landing Pages (Major US Markets)
    {
      url: `${baseUrl}/flights-from-new-york`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/flights-from-los-angeles`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/flights-from-chicago`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.94,
    },
    {
      url: `${baseUrl}/flights-from-miami`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.94,
    },
    {
      url: `${baseUrl}/flights-from-dallas`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.94,
    },
    {
      url: `${baseUrl}/flights-from-atlanta`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.94,
    },
    {
      url: `${baseUrl}/flights-from-san-francisco`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93,
    },
    {
      url: `${baseUrl}/flights-from-denver`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93,
    },
    {
      url: `${baseUrl}/flights-from-seattle`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93,
    },
    {
      url: `${baseUrl}/flights-from-boston`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93,
    },
  ]

  // Service pages (alta prioridade para SEO)
  const servicePages = [
    // Portuguese routes (existing)
    {
      url: `${baseUrl}/voos-brasil-eua`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/voos-miami-sao-paulo`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/voos-new-york-rio-janeiro`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    // English routes (for American market)
    {
      url: `${baseUrl}/en/flights-to-brazil`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/en/flights-miami-sao-paulo`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/en/brazil-travel-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/brazil-hotels`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/car-rental-brazil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/travel-insurance-brazil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Spanish routes (for Latino market)
    {
      url: `${baseUrl}/es/vuelos-brasil`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/es/vuelos-miami-sao-paulo`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/es/guia-viaje-brasil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/es/hoteles-brasil`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/es/alquiler-autos-brasil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/es/seguro-viaje-brasil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Legacy Portuguese service pages
    {
      url: `${baseUrl}/hoteis-brasil`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aluguel-carros-brasil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seguro-viagem-brasil`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Cotação pages (existentes)
  const cotacaoPages = [
    {
      url: `${baseUrl}/cotacao/voos`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cotacao/hoteis`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cotacao/carros`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cotacao/passeios`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cotacao/seguro`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // 🎯 US Travel Blog Posts (SEO Content Marketing)
  const usBlogPosts = [
    {
      url: `${baseUrl}/blog/best-time-book-flights-usa`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/cheapest-flights-from-new-york`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/flight-deals-alert-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.84,
    },
    {
      url: `${baseUrl}/blog/domestic-flights-usa-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.84,
    },
    {
      url: `${baseUrl}/blog/international-flights-from-usa`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.83,
    },
    {
      url: `${baseUrl}/blog/airline-comparison-usa`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.82,
    },
    {
      url: `${baseUrl}/blog/travel-tips-american-travelers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.81,
    },
    {
      url: `${baseUrl}/blog/business-travel-flights-usa`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.80,
    },
  ]

  // Blog posts (será expandido dinamicamente)
  const blogPosts = [
    {
      url: `${baseUrl}/blog/melhores-voos-brasil-eua`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/como-economizar-passagens-aereas`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/documentos-viagem-brasil-eua`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // 🎯 ULTRATHINK: SERVICE AREA BUSINESS - Online-Only SEO Strategy
  // Import city and neighborhood data for comprehensive sitemap generation
  const { brazilianDiaspora } = require('@/lib/data/brazilian-diaspora')
  const { brazilianNeighborhoods } = require('@/lib/data/brazilian-neighborhoods')
  
  const communityPages: MetadataRoute.Sitemap = []
  
  // 1. PRIORITY BOOST: Brazilian City Community Pages (Service Area Focus)
  brazilianDiaspora.forEach((city: any) => {
    const basePriority = city.priority === 'ultra-high' ? 0.98 : 
                        city.priority === 'high' ? 0.95 : 0.90
    
    // Higher priority for community service pages
    // Portuguese (default and explicit)
    communityPages.push(
      {
        url: `${baseUrl}/cidade/${city.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const, // Increased frequency for community engagement
        priority: basePriority,
      },
      {
        url: `${baseUrl}/pt/cidade/${city.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: basePriority,
      }
    )
    
    // English (Service Area Business focus)
    communityPages.push({
      url: `${baseUrl}/en/city/${city.id}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: basePriority - 0.02, // Minimal reduction for SAB strategy
    })
    
    // Spanish (Latino community engagement)
    communityPages.push({
      url: `${baseUrl}/es/ciudad/${city.id}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: basePriority - 0.02,
    })

    // 🚀 NEW: Community Service Pages (Online-Only Focus)
    communityPages.push(
      {
        url: `${baseUrl}/community/${city.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: basePriority + 0.01, // Higher than city pages
      },
      {
        url: `${baseUrl}/virtual-consultation/${city.id}`,
        lastModified: currentDate,
        changeFrequency: 'hourly' as const,
        priority: basePriority + 0.02, // Highest priority for virtual services
      },
      {
        url: `${baseUrl}/brazilian-community/${city.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: basePriority,
      }
    )
  })

  // 2. NEW: Hyperlocal Neighborhood Pages (Service Area Expansion)
  brazilianNeighborhoods.forEach((neighborhood: any) => {
    const neighborhoodPriority = neighborhood.priority === 'ultra-high' ? 0.92 :
                                 neighborhood.priority === 'high' ? 0.88 : 0.83
    
    // Trilingual neighborhood pages
    communityPages.push(
      {
        url: `${baseUrl}/neighborhood/${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: neighborhoodPriority,
      },
      {
        url: `${baseUrl}/pt/bairro/${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: neighborhoodPriority,
      },
      {
        url: `${baseUrl}/en/neighborhood/${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: neighborhoodPriority - 0.03,
      },
      {
        url: `${baseUrl}/es/barrio/${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: neighborhoodPriority - 0.03,
      }
    )

    // Service-specific neighborhood pages
    communityPages.push(
      {
        url: `${baseUrl}/virtual-travel-${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: neighborhoodPriority + 0.02,
      },
      {
        url: `${baseUrl}/brazilian-travel-${neighborhood.id}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: neighborhoodPriority + 0.01,
      }
    )
  })

  // 3. COMMUNITY ENGAGEMENT CONTENT (Online-Only Strategy)
  const communityEngagementPages = [
    {
      url: `${baseUrl}/brazilian-community-events`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.94,
    },
    {
      url: `${baseUrl}/virtual-brazil-travel-consultation`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.96, // High priority for virtual services
    },
    {
      url: `${baseUrl}/brazilian-cultural-calendar`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93,
    },
    {
      url: `${baseUrl}/community-testimonials`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.91,
    },
    {
      url: `${baseUrl}/brazilian-diaspora-travel-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.92,
    },
    {
      url: `${baseUrl}/whatsapp-travel-support`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95, // High priority for instant communication
    }
  ]

  return [...mainPages, ...staticPages, ...usMarketPages, ...servicePages, ...cotacaoPages, ...usBlogPosts, ...blogPosts, ...communityPages, ...communityEngagementPages]
}