import { NextRequest, NextResponse } from 'next/server'

// Blog posts data (same as main feed but blog-only)
const blogPosts = [
  {
    id: 1,
    title: "Melhores Épocas para Viajar dos EUA para o Brasil",
    description: "Para brasileiros nos EUA: descubra quando é mais barato e qual a melhor época para encontrar promoções de passagens aéreas para o Brasil.",
    date: "2024-01-15",
    category: "Dicas de Viagem",
    author: "Equipe Fly2Any",
    slug: "melhores-epocas-viajar-eua-brasil",
    tags: ["passagens", "economia", "planejamento"],
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Documentos para Brasileiros Entrarem no Brasil",
    description: "Guia completo sobre RG, passaporte e documentos necessários para brasileiros residentes nos EUA voltarem ao Brasil.",
    date: "2024-01-12",
    category: "Documentação",
    author: "Maria Silva",
    slug: "documentos-brasileiros-entrarem-brasil",
    tags: ["documentos", "passaporte", "rg"],
    readTime: "8 min"
  },
  {
    id: 3,
    title: "Como Encontrar Passagens Baratas EUA-Brasil",
    description: "Estratégias comprovadas para brasileiros nos EUA conseguirem passagens aéreas com os melhores preços para o Brasil.",
    date: "2024-01-10",
    category: "Economia",
    author: "João Santos",
    slug: "passagens-baratas-eua-brasil",
    tags: ["economia", "promoções", "dicas"],
    readTime: "6 min"
  },
  {
    id: 4,
    title: "Destinos Imperdíveis no Brasil para Quem Mora nos EUA",
    description: "Os lugares que brasileiros nos EUA mais sentem saudade e devem visitar nas próximas férias no Brasil.",
    date: "2024-01-08",
    category: "Destinos Brasil",
    author: "Ana Costa",
    slug: "destinos-imperdiveis-brasil-eua",
    tags: ["destinos", "turismo", "saudade"],
    readTime: "7 min"
  },
  {
    id: 5,
    title: "Seguro Viagem para o Brasil: Vale a Pena?",
    description: "Tudo que brasileiros nos EUA precisam saber sobre seguro viagem para o Brasil e quando compensa contratar.",
    date: "2024-01-05",
    category: "Seguro",
    author: "Carlos Lima",
    slug: "seguro-viagem-brasil-vale-pena",
    tags: ["seguro", "proteção", "saúde"],
    readTime: "4 min"
  },
  {
    id: 6,
    title: "Melhores Companhias Aéreas para Voos EUA-Brasil",
    description: "Comparativo completo das principais companhias aéreas que operam na rota Estados Unidos-Brasil, focado em brasileiros nos EUA.",
    date: "2024-01-03",
    category: "Dicas de Viagem",
    author: "Equipe Fly2Any",
    slug: "melhores-companhias-aereas-eua-brasil",
    tags: ["companhias", "voos", "comparativo"],
    readTime: "6 min"
  }
];

function generateBlogRSSFeed() {
  const baseUrl = 'https://fly2any.com'
  const currentDate = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  
  <channel>
    <title>Fly2Any Blog - Guias de Viagem Brasil-EUA</title>
    <link>${baseUrl}/blog</link>
    <description>Dicas exclusivas, guias completos e estratégias para brasileiros nos EUA viajarem para o Brasil de forma inteligente e econômica.</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <generator>Fly2Any Blog RSS Generator</generator>
    <managingEditor>blog@fly2any.com (Equipe Blog Fly2Any)</managingEditor>
    <webMaster>tech@fly2any.com (Fly2Any Tech)</webMaster>
    <category>Travel Blog</category>
    <category>Brazilian Travel Guide</category>
    <category>USA Brazil Travel Tips</category>
    <ttl>240</ttl>
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>2</sy:updateFrequency>
    <image>
      <url>${baseUrl}/images/blog-logo-rss.png</url>
      <title>Fly2Any Blog</title>
      <link>${baseUrl}/blog</link>
      <width>144</width>
      <height>144</height>
      <description>Blog Fly2Any - Guias de viagem para brasileiros nos EUA</description>
    </image>
    <atom:link href="${baseUrl}/feeds/blog" rel="self" type="application/rss+xml" />
    
    ${blogPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[
        <div style="margin-bottom: 20px;">
          <h2>${post.title}</h2>
          <p><strong>Por:</strong> ${post.author} | <strong>Tempo de leitura:</strong> ${post.readTime}</p>
          <p><strong>Categoria:</strong> ${post.category}</p>
          <p>${post.description}</p>
          <p><strong>Tags:</strong> ${post.tags.map(tag => `#${tag}`).join(', ')}</p>
          <p><a href="${baseUrl}/blog/${post.slug}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leia o artigo completo →</a></p>
        </div>
      ]]></content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author}]]></dc:creator>
      <category><![CDATA[${post.category}]]></category>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('')}
    </item>`).join('')}
    
  </channel>
</rss>`
}

export async function GET(request: NextRequest) {
  try {
    const rssContent = generateBlogRSSFeed()
    
    return new NextResponse(rssContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // Cache for 30 min, CDN for 1 hour
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })
  } catch (error) {
    console.error('Error generating blog RSS feed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}