import { NextRequest, NextResponse } from 'next/server'

// Blog posts data (in production, this would come from your database/CMS)
const blogPosts = [
  {
    id: 1,
    title: "Melhores Épocas para Viajar dos EUA para o Brasil",
    description: "Para brasileiros nos EUA: descubra quando é mais barato e qual a melhor época para encontrar promoções de passagens aéreas para o Brasil.",
    date: "2024-01-15",
    category: "Dicas de Viagem",
    author: "Equipe Fly2Any",
    slug: "melhores-epocas-viajar-eua-brasil"
  },
  {
    id: 2,
    title: "Documentos para Brasileiros Entrarem no Brasil",
    description: "Guia completo sobre RG, passaporte e documentos necessários para brasileiros residentes nos EUA voltarem ao Brasil.",
    date: "2024-01-12",
    category: "Documentação",
    author: "Maria Silva",
    slug: "documentos-brasileiros-entrarem-brasil"
  },
  {
    id: 3,
    title: "Como Encontrar Passagens Baratas EUA-Brasil",
    description: "Estratégias comprovadas para brasileiros nos EUA conseguirem passagens aéreas com os melhores preços para o Brasil.",
    date: "2024-01-10",
    category: "Economia",
    author: "João Santos",
    slug: "passagens-baratas-eua-brasil"
  },
  {
    id: 4,
    title: "Destinos Imperdíveis no Brasil para Quem Mora nos EUA",
    description: "Os lugares que brasileiros nos EUA mais sentem saudade e devem visitar nas próximas férias no Brasil.",
    date: "2024-01-08",
    category: "Destinos Brasil",
    author: "Ana Costa",
    slug: "destinos-imperdiveis-brasil-eua"
  },
  {
    id: 5,
    title: "Seguro Viagem para o Brasil: Vale a Pena?",
    description: "Tudo que brasileiros nos EUA precisam saber sobre seguro viagem para o Brasil e quando compensa contratar.",
    date: "2024-01-05",
    category: "Seguro",
    author: "Carlos Lima",
    slug: "seguro-viagem-brasil-vale-pena"
  },
  {
    id: 6,
    title: "Melhores Companhias Aéreas para Voos EUA-Brasil",
    description: "Comparativo completo das principais companhias aéreas que operam na rota Estados Unidos-Brasil, focado em brasileiros nos EUA.",
    date: "2024-01-03",
    category: "Dicas de Viagem",
    author: "Equipe Fly2Any",
    slug: "melhores-companhias-aereas-eua-brasil"
  }
];

// Travel deals and flight promotions data
const promotionalContent = [
  {
    id: 'promo-1',
    title: "Promoção Flash: Miami-São Paulo a partir de $520",
    description: "Oportunidade única! Passagens de Miami para São Paulo com desconto especial para brasileiros nos EUA. Válido até o final do mês.",
    date: new Date().toISOString().split('T')[0],
    category: "Promoções",
    author: "Fly2Any Ofertas",
    slug: "promocao-miami-sao-paulo-520"
  },
  {
    id: 'promo-2', 
    title: "Nova York-Rio: Tarifas Especiais para Dezembro",
    description: "Aproveite as tarifas promocionais para as festas de fim de ano. Voos diretos e com conexão disponíveis.",
    date: new Date().toISOString().split('T')[0],
    category: "Ofertas Especiais",
    author: "Fly2Any Ofertas",
    slug: "nova-york-rio-tarifas-dezembro"
  }
];

function generateRSSFeed() {
  const baseUrl = 'https://fly2any.com'
  const currentDate = new Date().toISOString()
  
  // Combine blog posts and promotional content, sort by date
  const allContent = [...blogPosts, ...promotionalContent].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  
  <channel>
    <title>Fly2Any - Viagens Brasil-EUA | Blog e Ofertas</title>
    <link>${baseUrl}</link>
    <description>Guias de viagem, dicas e ofertas exclusivas para brasileiros nos EUA viajarem para o Brasil. Encontre as melhores passagens, hotéis e dicas de viagem.</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <generator>Fly2Any RSS Feed Generator</generator>
    <managingEditor>contato@fly2any.com (Equipe Fly2Any)</managingEditor>
    <webMaster>tech@fly2any.com (Fly2Any Tech)</webMaster>
    <category>Travel</category>
    <category>Brazilian Travel</category>
    <category>USA-Brazil Flights</category>
    <ttl>60</ttl>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>${baseUrl}/images/logo-rss.png</url>
      <title>Fly2Any</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>Fly2Any - Especialistas em viagens Brasil-EUA</description>
    </image>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    
    ${allContent.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug || post.id}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug || post.id}</guid>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[
        <p>${post.description}</p>
        <p><strong>Categoria:</strong> ${post.category}</p>
        <p><a href="${baseUrl}/blog/${post.slug || post.id}">Leia o artigo completo</a></p>
      ]]></content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author}]]></dc:creator>
      <category><![CDATA[${post.category}]]></category>
    </item>`).join('')}
    
  </channel>
</rss>`
}

export async function GET(request: NextRequest) {
  try {
    const rssContent = generateRSSFeed()
    
    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}