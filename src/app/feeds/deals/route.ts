import { NextRequest, NextResponse } from 'next/server'

// Travel deals and promotional content data
const travelDeals = [
  {
    id: 'deal-001',
    title: "⚡ FLASH SALE: Miami-São Paulo a partir de $520",
    description: "Oportunidade imperdível! Passagens de Miami para São Paulo com desconto especial para brasileiros nos EUA. Tarifas válidas para viagens até março. Reserve já!",
    date: new Date().toISOString().split('T')[0],
    category: "Promoções Flash",
    author: "Fly2Any Ofertas",
    slug: "flash-sale-miami-sao-paulo-520",
    price: "$520",
    validUntil: "2024-02-15",
    route: "MIA-GRU",
    airline: "Múltiplas cias"
  },
  {
    id: 'deal-002',
    title: "🎄 ESPECIAL NATAL: Nova York-Rio a partir de $680",
    description: "Tarifas especiais para as festas de fim de ano! Voos diretos e com conexão disponíveis. Ideal para quem quer passar o Natal e Ano Novo no Brasil.",
    date: new Date().toISOString().split('T')[0],
    category: "Ofertas Sazonais",
    author: "Fly2Any Ofertas",  
    slug: "especial-natal-nova-york-rio-680",
    price: "$680",
    validUntil: "2024-01-31",
    route: "NYC-RJ",
    airline: "American, LATAM"
  },
  {
    id: 'deal-003',
    title: "✈️ MEGA PROMOÇÃO: Los Angeles-Brasília $750",
    description: "Conecte a Costa Oeste dos EUA com o coração do Brasil! Passagens promocionais para brasileiros na Califórnia com excelentes horários.",
    date: new Date().toISOString().split('T')[0],
    category: "Mega Promoções",
    author: "Fly2Any Ofertas",
    slug: "mega-promocao-los-angeles-brasilia-750",
    price: "$750",
    validUntil: "2024-02-28",
    route: "LAX-BSB",
    airline: "United, Copa"
  },
  {
    id: 'deal-004',
    title: "🏨 COMBO: Voo + Hotel em São Paulo por $899",
    description: "Pacote completo! Voo de qualquer cidade dos EUA + 3 noites em hotel 4* no centro de São Paulo. Perfeito para negócios ou turismo.",
    date: new Date().toISOString().split('T')[0],
    category: "Pacotes Combo",
    author: "Fly2Any Ofertas",
    slug: "combo-voo-hotel-sao-paulo-899",
    price: "$899",
    validUntil: "2024-03-15",
    route: "USA-GRU",
    airline: "Várias opções"
  },
  {
    id: 'deal-005',
    title: "🎯 ÚLTIMA HORA: Orlando-Salvador $595",
    description: "Aproveite essa oportunidade única! De Orlando direto para o coração da Bahia. Perfeito para quem está na Flórida e quer curtir as praias brasileiras.",
    date: new Date().toISOString().split('T')[0],
    category: "Última Hora",
    author: "Fly2Any Ofertas",
    slug: "ultima-hora-orlando-salvador-595",
    price: "$595", 
    validUntil: "2024-01-20",
    route: "MCO-SSA",
    airline: "Copa, Avianca"
  }
];

function generateDealsRSSFeed() {
  const baseUrl = 'https://fly2any.com'
  const currentDate = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:media="http://search.yahoo.com/mrss/">
  
  <channel>
    <title>Fly2Any Ofertas - Promoções EUA-Brasil 🔥</title>
    <link>${baseUrl}/ofertas</link>
    <description>🚨 ALERTAS DE OFERTAS! As melhores promoções de passagens EUA-Brasil atualizadas em tempo real. Brasileiros nos EUA, não percam essas oportunidades!</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <generator>Fly2Any Deals Alert System</generator>
    <managingEditor>ofertas@fly2any.com (Fly2Any Ofertas)</managingEditor>
    <webMaster>tech@fly2any.com (Fly2Any Tech)</webMaster>
    <category>Travel Deals</category>
    <category>Flight Promotions</category>
    <category>USA Brazil Offers</category>
    <ttl>15</ttl>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>4</sy:updateFrequency>
    <image>
      <url>${baseUrl}/images/deals-logo-rss.png</url>
      <title>Fly2Any Ofertas</title>
      <link>${baseUrl}/ofertas</link>
      <width>144</width>
      <height>144</height>
      <description>Ofertas Fly2Any - Promoções EUA-Brasil</description>
    </image>
    <atom:link href="${baseUrl}/feeds/deals" rel="self" type="application/rss+xml" />
    
    ${travelDeals.map(deal => `
    <item>
      <title><![CDATA[${deal.title}]]></title>
      <link>${baseUrl}/ofertas/${deal.slug}</link>
      <guid isPermaLink="true">${baseUrl}/ofertas/${deal.slug}</guid>
      <description><![CDATA[${deal.description} 💰 A partir de ${deal.price} - Válido até ${new Date(deal.validUntil).toLocaleDateString('pt-BR')}]]></description>
      <content:encoded><![CDATA[
        <div style="background: linear-gradient(135deg, #ff6b6b, #feca57); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px;">🔥 ${deal.title.replace(/⚡|🎄|✈️|🏨|🎯/g, '')}</h2>
          <div style="display: flex; gap: 20px; margin: 15px 0; flex-wrap: wrap;">
            <div><strong>💰 Preço:</strong> ${deal.price}</div>
            <div><strong>✈️ Rota:</strong> ${deal.route}</div>
            <div><strong>🏢 Companhias:</strong> ${deal.airline}</div>
            <div><strong>⏰ Válido até:</strong> ${new Date(deal.validUntil).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">${deal.description}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${baseUrl}/cotacao/voos?from=${deal.route.split('-')[0]}&to=${deal.route.split('-')[1]}" 
             style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            🚀 APROVEITAR OFERTA AGORA
          </a>
        </div>
        <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px;">
          <p style="margin: 0; font-size: 14px; color: #1565c0;"><strong>💡 Dica:</strong> Ofertas por tempo limitado. Reserve já para garantir o melhor preço!</p>
        </div>
      ]]></content:encoded>
      <pubDate>${new Date(deal.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${deal.author}]]></dc:creator>
      <category><![CDATA[${deal.category}]]></category>
      <category><![CDATA[Travel Deals]]></category>
      <category><![CDATA[${deal.route}]]></category>
      <media:content type="text/html" medium="text">
        <![CDATA[
          <div style="color: #ff6b6b; font-weight: bold; font-size: 18px;">${deal.price}</div>
          <div style="color: #666;">${deal.route} • ${deal.airline}</div>
        ]]>
      </media:content>
    </item>`).join('')}
    
  </channel>
</rss>`
}

export async function GET(request: NextRequest) {
  try {
    const rssContent = generateDealsRSSFeed()
    
    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=1800', // Cache for 15 min, CDN for 30 min
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })
  } catch (error) {
    console.error('Error generating deals RSS feed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}