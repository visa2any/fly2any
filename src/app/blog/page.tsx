import type { Metadata } from "next";
import Link from "next/link";
import { CalendarIcon, UsersIcon, ArrowRightIcon, FlightIcon, PhoneIcon, MailIcon, ChatIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import NewsletterCapture from '@/components/NewsletterCapture';

export const metadata: Metadata = {
  title: "Blog | Dicas de Viagem EUA-Brasil - Fly2Any",
  description: "Dicas exclusivas para brasileiros nos EUA visitarem o Brasil. Documentos, passagens, melhores épocas para viajar, destinos imperdíveis e muito mais.",
  keywords: "blog viagem eua brasil, dicas viagem, passagens baratas, documentos viagem, brasileiros eua, destinos brasil",
  openGraph: {
    title: "Blog | Dicas de Viagem EUA-Brasil - Fly2Any",
    description: "Dicas exclusivas para brasileiros nos EUA visitarem o Brasil",
    url: "https://fly2any.com/blog",
  },
};

const blogPosts = [
  {
    id: 1,
    title: "Melhores Épocas para Viajar dos EUA para o Brasil",
    excerpt: "Para brasileiros nos EUA: descubra quando é mais barato e qual a melhor época para encontrar promoções de passagens aéreas para o Brasil.",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Dicas de Viagem",
    featured: true,
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop",
    tags: ["passagens", "economia", "planejamento"],
    author: "Equipe Fly2Any"
  },
  {
    id: 2,
    title: "Documentos para Brasileiros Entrarem no Brasil",
    excerpt: "Guia completo sobre RG, passaporte e documentos necessários para brasileiros residentes nos EUA voltarem ao Brasil.",
    date: "2024-01-12",
    readTime: "8 min",
    category: "Documentação",
    featured: true,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    tags: ["documentos", "passaporte", "rg"],
    author: "Maria Silva"
  },
  {
    id: 3,
    title: "Como Encontrar Passagens Baratas EUA-Brasil",
    excerpt: "Estratégias comprovadas para brasileiros nos EUA conseguirem passagens aéreas com os melhores preços para o Brasil.",
    date: "2024-01-10",
    readTime: "6 min",
    category: "Economia",
    featured: false,
    image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=400&fit=crop",
    tags: ["economia", "promoções", "dicas"],
    author: "João Santos"
  },
  {
    id: 4,
    title: "Destinos Imperdíveis no Brasil para Quem Mora nos EUA",
    excerpt: "Os lugares que brasileiros nos EUA mais sentem saudade e devem visitar nas próximas férias no Brasil.",
    date: "2024-01-08",
    readTime: "7 min",
    category: "Destinos Brasil",
    featured: false,
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop",
    tags: ["destinos", "turismo", "saudade"],
    author: "Ana Costa"
  },
  {
    id: 5,
    title: "Seguro Viagem para o Brasil: Vale a Pena?",
    excerpt: "Tudo que brasileiros nos EUA precisam saber sobre seguro viagem para o Brasil e quando compensa contratar.",
    date: "2024-01-05",
    readTime: "4 min",
    category: "Seguro",
    featured: false,
    image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=800&h=400&fit=crop",
    tags: ["seguro", "proteção", "saúde"],
    author: "Carlos Lima"
  },
  {
    id: 6,
    title: "Melhores Companhias Aéreas para Voos EUA-Brasil",
    excerpt: "Comparativo completo das principais companhias aéreas que operam na rota Estados Unidos-Brasil, focado em brasileiros nos EUA.",
    date: "2024-01-03",
    readTime: "6 min",
    category: "Dicas de Viagem",
    featured: false,
    image: "https://images.unsplash.com/photo-1544207240-1f9e12af8ea8?w=800&h=400&fit=crop",
    tags: ["companhias", "voos", "comparativo"],
    author: "Equipe Fly2Any"
  }
];

const categories = [
  { name: "Dicas de Viagem", count: 18 },
  { name: "Documentação", count: 12 },
  { name: "Economia", count: 8 },
  { name: "Destinos Brasil", count: 15 },
  { name: "Seguro", count: 6 },
  { name: "Brasileiros nos EUA", count: 14 }
];

export default function Blog() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div style={{ 
      minHeight: '100vh'
    }}>
      {/* Header Global */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #713f12 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Logo size="sm" variant="logo-only" /><span style={{ fontWeight: 700, fontSize: "18px", color: "white" }}>Fly2Any</span></div>
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link href="/" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link href="/voos-brasil-eua" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FlightIcon style={{ width: '14px', height: '14px' }} />
              Voos
            </Link>
            <Link href="/como-funciona" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Como Funciona
            </Link>
            <Link href="/blog" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </Link>
            <Link href="/faq" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ
            </Link>
            <Link href="/sobre" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sobre
            </Link>
            <Link href="/contato" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <PhoneIcon style={{ width: '14px', height: '14px' }} />
              Contato
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '80px 0',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #713f12 100%)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
            Blog <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fly2Any</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', maxWidth: '768px', margin: '0 auto 32px auto' }}>
            Guias e dicas exclusivas para brasileiros nos EUA viajarem para o Brasil
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.name}
                href={`/blog/categoria/${cat.name.toLowerCase().replace(' ', '-')}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        
        {/* Featured Post - Magazine Style */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '40px',
            fontFamily: 'Poppins, sans-serif'
          }}>Artigo em Destaque</h2>
          
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '400px' }}>
              <div style={{
                backgroundImage: `url('${featuredPost.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              
              <div style={{ padding: '40px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <span style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {featuredPost.category}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    <CalendarIcon style={{ width: '16px', height: '16px' }} />
                    {new Date(featuredPost.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    <UsersIcon style={{ width: '16px', height: '16px' }} />
                    {featuredPost.readTime}
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '16px',
                  lineHeight: '1.3',
                  fontFamily: 'Poppins, sans-serif'
                }}>{featuredPost.title}</h3>
                
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}>{featuredPost.excerpt}</p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {featuredPost.tags.map(tag => (
                      <span key={tag} style={{
                        background: '#f3f4f6',
                        color: '#6b7280',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/blog/${featuredPost.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#2563eb',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ler artigo
                    <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid - Clean Cards */}
        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '40px',
            fontFamily: 'Poppins, sans-serif'
          }}>Todos os Artigos</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {otherPosts.map((post) => (
              <article key={post.id} style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  height: '200px',
                  backgroundImage: `url('${post.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {post.category}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#9ca3af',
                      fontSize: '12px'
                    }}>
                      <CalendarIcon style={{ width: '14px', height: '14px' }} />
                      {new Date(post.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#9ca3af',
                      fontSize: '12px'
                    }}>
                      <UsersIcon style={{ width: '14px', height: '14px' }} />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    fontFamily: 'Poppins, sans-serif'
                  }}>{post.title}</h3>
                  
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '20px',
                    lineHeight: '1.5',
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{post.excerpt}</p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '6px'
                    }}>
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          background: '#f3f4f6',
                          color: '#9ca3af',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link 
                      href={`/blog/${post.id}`}
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Ler mais
                      <ArrowRightIcon style={{ width: '14px', height: '14px' }} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <NewsletterCapture variant="horizontal" showWhatsApp={true} />
        </div>
      </div>

      {/* Footer Global */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(3, 7, 18, 0.95))',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '80px 0 40px 0',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '64px'
          }}>
            <div>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Logo size="sm" variant="logo-only" /><span style={{ fontWeight: 700, fontSize: "18px", color: "white" }}>Fly2Any</span></div>
              </Link>
              <p style={{
                color: 'rgba(219, 234, 254, 0.8)',
                marginTop: '16px',
                lineHeight: '1.6'
              }}>
                Especialistas em viagens EUA-Brasil há mais de 10 anos. 
                Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                <a href="https://wa.me/551151944717" style={{
                  color: 'rgba(219, 234, 254, 0.8)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s'
                }}>
                  <PhoneIcon style={{ width: '20px', height: '20px' }} />
                  WhatsApp
                </a>
                <a href="/contato" style={{
                  color: 'rgba(219, 234, 254, 0.8)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s'
                }}>
                  <MailIcon style={{ width: '20px', height: '20px' }} />
                  Enviar mensagem
                </a>
                <a href="https://wa.me/551151944717" style={{
                  color: 'rgba(219, 234, 254, 0.8)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s'
                }}>
                  <ChatIcon style={{ width: '20px', height: '20px' }} />
                  WhatsApp 24/7
                </a>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '24px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>Nossos Serviços</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>✈️ Passagens Aéreas</Link>
                <Link href="/" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>🏨 Hotéis no Brasil</Link>
                <Link href="/" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>🚗 Aluguel de Carros</Link>
                <Link href="/" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>🗺️ Passeios e Tours</Link>
                <Link href="/" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>🛡️ Seguro Viagem</Link>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '24px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>Suporte</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/como-funciona" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Como Funciona</Link>
                <Link href="/faq" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>FAQ</Link>
                <Link href="/contato" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Contato</Link>
                <Link href="/sobre" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Sobre Nós</Link>
                <Link href="/blog" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Blog</Link>
              </div>
              
              <div style={{ marginTop: '32px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#10b981',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    🔒 SSL Certificado
                  </div>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#3b82f6',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    ⭐ 4.9/5 Estrelas
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '24px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/politica-privacidade" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Política de Privacidade</Link>
                <Link href="/termos-uso" style={{ color: 'rgba(219, 234, 254, 0.8)', textDecoration: 'none' }}>Termos de Uso</Link>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div>
              <p style={{ 
                margin: 0,
                color: 'rgba(147, 197, 253, 0.8)',
                fontSize: '14px'
              }}>
                &copy; 2024 Fly2Any. Todos os direitos reservados.
              </p>
              <p style={{
                margin: '4px 0 0 0',
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '12px'
              }}>
                Conectando brasileiros aos EUA ao Brasil há mais de 10 anos.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{
                color: 'rgba(147, 197, 253, 0.6)',
                fontSize: '12px'
              }}>
                Feito com ❤️ para brasileiros
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}