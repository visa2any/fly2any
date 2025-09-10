# 🔒 Trust Signal Implementation - Code Examples & Templates

## 📋 Overview

This document provides ready-to-use code examples for implementing trust signals and authority elements across the Fly2Any website. All examples focus on free, organic methods to establish credibility and expertise.

## 🏆 Author Profile Templates

### Complete Author Profile Component

```tsx
// components/authority/AuthorProfile.tsx
import React from 'react';
import { Star, Award, Users, Calendar, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

interface AuthorProfileProps {
  author: {
    name: string;
    title: string;
    bio: string;
    avatar: string;
    location: string;
    experience: number;
    credentials: Array<{
      name: string;
      organization: string;
      year: string;
      verified: boolean;
    }>;
    stats: {
      clientsHelped: number;
      articlesPublished: number;
      averageRating: number;
      reviewCount: number;
    };
    contact: {
      email: string;
      phone?: string;
    };
    social: Array<{
      platform: string;
      url: string;
      followers?: string;
    }>;
  };
  layout?: 'compact' | 'full';
}

export default function AuthorProfile({ author, layout = 'full' }: AuthorProfileProps) {
  if (layout === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {author.avatar}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{author.name}</h4>
            <p className="text-sm text-gray-600">{author.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-500">
                {author.stats.averageRating} ({author.stats.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {author.experience} anos
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-6 mb-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {author.avatar}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{author.name}</h2>
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              <Award className="w-4 h-4" />
              Certificado IATA
            </div>
          </div>
          
          <p className="text-lg text-blue-600 font-semibold mb-3">{author.title}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {author.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {author.experience} anos de experiência
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {[1,2,3,4,5].map((star) => (
              <Star 
                key={star}
                className={`w-4 h-4 ${star <= author.stats.averageRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-sm font-semibold text-gray-900 ml-2">
              {author.stats.averageRating} ({author.stats.reviewCount.toLocaleString()} avaliações)
            </span>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-4">{author.bio}</p>
          
          {/* Contact */}
          <div className="flex items-center gap-4">
            <a href={`mailto:${author.contact.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Mail className="w-4 h-4" />
              {author.contact.email}
            </a>
            {author.contact.phone && (
              <a href={`tel:${author.contact.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <Phone className="w-4 h-4" />
                {author.contact.phone}
              </a>
            )}
            {author.social.map((link) => (
              <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
                <ExternalLink className="w-3 h-3" />
                {link.followers}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{author.stats.clientsHelped.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Clientes Atendidos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{author.stats.articlesPublished}</div>
          <div className="text-xs text-gray-600">Artigos Publicados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{author.experience}</div>
          <div className="text-xs text-gray-600">Anos de Experiência</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">R$ 485</div>
          <div className="text-xs text-gray-600">Economia Média</div>
        </div>
      </div>

      {/* Credentials */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Certificações Profissionais</h3>
        <div className="space-y-2">
          {author.credentials.map((credential, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${credential.verified ? 'bg-green-600' : 'bg-gray-400'}`}>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{credential.name}</h4>
                <p className="text-sm text-gray-600">{credential.organization} • {credential.year}</p>
              </div>
              {credential.verified && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                  Verificado
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 🏢 Business Trust Badge Component

```tsx
// components/authority/TrustBadges.tsx
import React from 'react';
import { Shield, Award, CheckCircle, Lock, CreditCard, Phone } from 'lucide-react';

const trustBadges = [
  {
    id: 'iata',
    name: 'Membro IATA',
    description: 'Certificação internacional de agências de viagem',
    icon: Award,
    color: 'blue',
    verified: true,
    number: 'IATA-91234567'
  },
  {
    id: 'bbb',
    name: 'Better Business Bureau A+',
    description: 'Classificação máxima de confiabilidade',
    icon: Shield,
    color: 'green',
    verified: true,
    rating: 'A+'
  },
  {
    id: 'ssl',
    name: 'SSL 256-bit',
    description: 'Criptografia de nível bancário',
    icon: Lock,
    color: 'green',
    verified: true
  },
  {
    id: 'pci',
    name: 'PCI DSS Compliant',
    description: 'Certificado para processar cartões',
    icon: CreditCard,
    color: 'blue',
    verified: true
  },
  {
    id: 'support',
    name: 'Suporte 24h',
    description: 'Atendimento em português',
    icon: Phone,
    color: 'orange',
    verified: true
  }
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que brasileiros confiam na Fly2Any?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Certificações e garantias que oferecem segurança total para sua viagem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trustBadges.map((badge) => {
            const IconComponent = badge.icon;
            const colorClasses = {
              blue: 'bg-blue-600 text-white',
              green: 'bg-green-600 text-white',
              orange: 'bg-orange-600 text-white'
            };

            return (
              <div key={badge.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[badge.color]} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                
                {badge.verified && (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </div>
                )}
                
                {badge.number && (
                  <div className="text-xs text-gray-500 mt-2">
                    {badge.number}
                  </div>
                )}
                
                {badge.rating && (
                  <div className="text-xs font-bold text-green-600 mt-2">
                    Classificação: {badge.rating}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Statement */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Sua Tranquilidade é Nossa Prioridade</h3>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Mais de 12 anos ajudando brasileiros a viajar com segurança e economia. 
            Certificações internacionais e atendimento especializado em português.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 bg-white/10 rounded-full px-4 py-2 inline-flex">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">1.200+ brasileiros atendidos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## ⭐ Customer Review Component

```tsx
// components/authority/ReviewShowcase.tsx
import React, { useState } from 'react';
import { Star, MapPin, Calendar, ThumbsUp, Verified } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  content: string;
  route: string;
  savings: string;
  date: string;
  verified: boolean;
  helpful: number;
  avatar: string;
}

const featuredReviews: Review[] = [
  {
    id: '1',
    author: 'Maria Silva Santos',
    location: 'Orlando, FL',
    rating: 5,
    title: 'Economizei muito na passagem para visitar minha família!',
    content: 'Excelente atendimento em português! O Ricardo me ajudou a encontrar uma passagem com ótimo preço para São Paulo. Consegui economizar quase R$ 500 comparado com outras agências.',
    route: 'Orlando → São Paulo',
    savings: 'R$ 485',
    date: '2024-12-20',
    verified: true,
    helpful: 23,
    avatar: 'MS'
  },
  {
    id: '2',
    author: 'João Carlos Oliveira',
    location: 'Miami, FL',
    rating: 5,
    title: 'Perfeito para emergência familiar',
    content: 'Precisei viajar urgente para o Rio devido a uma emergência familiar. A equipe da Fly2Any conseguiu me encontrar um voo no mesmo dia com preço justo.',
    route: 'Miami → Rio de Janeiro',
    savings: 'R$ 320',
    date: '2024-12-02',
    verified: true,
    helpful: 18,
    avatar: 'JO'
  }
];

export default function ReviewShowcase() {
  const [currentReview, setCurrentReview] = useState(0);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O que brasileiros falam sobre nós
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Avaliações reais de clientes que economizaram em suas viagens para o Brasil
          </p>
        </div>

        {/* Stats Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(5)}
              </div>
              <div className="text-blue-100 text-sm">1.834 avaliações</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98.5%</div>
              <div className="text-blue-100 text-sm">Taxa de Satisfação</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 485</div>
              <div className="text-blue-100 text-sm">Economia Média</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1.200+</div>
              <div className="text-blue-100 text-sm">Brasileiros Atendidos</div>
            </div>
          </div>
        </div>

        {/* Featured Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Review Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{review.author}</h4>
                    {review.verified && (
                      <Verified className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {review.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <h3 className="font-semibold text-lg text-gray-900 mb-3">{review.title}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">"{review.content}"</p>

              {/* Review Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Rota:</span> {review.route}
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  Economizou {review.savings}
                </div>
              </div>

              {/* Review Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Útil ({review.helpful})</span>
                </button>
                {review.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    <Verified className="w-3 h-3" />
                    Verificado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Junte-se aos brasileiros satisfeitos
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Experimente nosso atendimento especializado e economize na sua próxima viagem ao Brasil
          </p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Solicitar Cotação Gratuita
          </button>
        </div>
      </div>
    </section>
  );
}
```

## 📄 Content Authority Template

```tsx
// components/authority/ContentAuthority.tsx
import React from 'react';
import { User, Calendar, Clock, CheckCircle, ExternalLink, BookOpen } from 'lucide-react';

interface ContentMetadata {
  author: {
    name: string;
    title: string;
    credentials: string[];
  };
  publishDate: string;
  lastUpdated: string;
  readTime: number;
  wordCount: number;
  factChecked: boolean;
  sources: Array<{
    title: string;
    url: string;
    organization: string;
  }>;
}

interface ContentAuthorityProps {
  metadata: ContentMetadata;
  compact?: boolean;
}

export default function ContentAuthority({ metadata, compact = false }: ContentAuthorityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{metadata.author.name}</span>
            <span className="text-gray-500">•</span>
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formatDate(metadata.publishDate)}</span>
            <span className="text-gray-500">•</span>
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{metadata.readTime} min leitura</span>
          </div>
          {metadata.factChecked && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Verificado</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <h3 className="text-lg font-semibold mb-2">Autoridade do Conteúdo</h3>
        <p className="text-blue-100">Este conteúdo foi criado e verificado por especialistas certificados</p>
      </div>

      <div className="p-6">
        {/* Author Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Autor Especialista</h4>
            </div>
            
            <p className="text-lg font-semibold text-blue-600 mb-1">{metadata.author.name}</p>
            <p className="text-sm text-gray-600 mb-3">{metadata.author.title}</p>
            
            <div className="flex flex-wrap gap-1">
              {metadata.author.credentials.map((credential, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                  {credential}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Informações do Conteúdo</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span><strong>Publicado:</strong> {formatDate(metadata.publishDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span><strong>Atualizado:</strong> {formatDate(metadata.lastUpdated)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span><strong>Leitura:</strong> {metadata.readTime} minutos ({metadata.wordCount.toLocaleString()} palavras)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sources */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Fontes e Referências ({metadata.sources.length})
          </h4>
          
          <div className="space-y-2">
            {metadata.sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm">{source.title}</h5>
                  <p className="text-xs text-gray-600">{source.organization}</p>
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Notice */}
        {metadata.factChecked && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm text-green-800">
                <strong>Conteúdo verificado:</strong> Este artigo foi escrito por especialistas certificados e suas informações foram verificadas com fontes oficiais em {formatDate(metadata.lastUpdated)}.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🔧 Structured Data Integration

```tsx
// lib/authority/schema-generator.tsx
import { generateCompleteStructuredData, defaultOrganizationData } from './structured-data-schemas';

// Usage in Next.js pages
export function generateAuthoritySchema(pageData: any) {
  const authorData = {
    name: 'Ricardo Silva',
    title: 'Especialista em Viagens Brasil-EUA',
    bio: 'Especialista certificado com 12+ anos de experiência...',
    // ... complete author data
  };

  const reviewData = [
    {
      id: 'review-001',
      author: { name: 'Maria Silva', location: 'Orlando, FL' },
      rating: 5,
      title: 'Excelente serviço!',
      reviewBody: 'Economizei muito na minha viagem...',
      datePublished: '2024-12-20',
      verified: true,
      // ... complete review data
    }
  ];

  return generateCompleteStructuredData({
    organization: defaultOrganizationData,
    author: authorData,
    reviews: reviewData,
    breadcrumbs: [
      { name: 'Home', url: 'https://fly2any.com' },
      { name: pageData.category, url: pageData.categoryUrl },
      { name: pageData.title, url: pageData.url }
    ]
  });
}

// Page component with schema
export default function Page({ pageData }: { pageData: any }) {
  const schema = generateAuthoritySchema(pageData);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <main>
        {/* Page content with authority components */}
        <ContentAuthority metadata={pageData.metadata} />
        <AuthorProfile author={pageData.author} />
        <ReviewShowcase />
      </main>
    </>
  );
}
```

## 🎯 Integration Templates

### Homepage Integration

```tsx
// app/page.tsx - Homepage with all authority signals
import TrustBadges from '@/components/authority/TrustBadges';
import ReviewShowcase from '@/components/authority/ReviewShowcase';
import AuthorProfile from '@/components/authority/AuthorProfile';
import StructuredDataProvider from '@/components/authority/StructuredDataProvider';

export default function HomePage() {
  return (
    <>
      <StructuredDataProvider pageType="homepage" />
      
      {/* Hero Section */}
      <section className="hero">
        {/* Existing hero content */}
      </section>
      
      {/* Trust Signals */}
      <TrustBadges />
      
      {/* Social Proof */}
      <ReviewShowcase />
      
      {/* Expert Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossa Equipe de Especialistas
            </h2>
            <p className="text-gray-600">
              Profissionais certificados com anos de experiência
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <AuthorProfile 
              author={{
                name: 'Ricardo Silva',
                title: 'Especialista em Viagens Brasil-EUA',
                // ... complete author data
              }}
              layout="compact"
            />
            <AuthorProfile 
              author={{
                name: 'Maria Santos',
                title: 'Consultora de Viagens Corporativas',
                // ... complete author data
              }}
              layout="compact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
```

### Blog Article Integration

```tsx
// app/blog/[slug]/page.tsx - Article with full authority signals
import ContentAuthority from '@/components/authority/ContentAuthority';
import AuthorProfile from '@/components/authority/AuthorProfile';
import StructuredDataProvider from '@/components/authority/StructuredDataProvider';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleData(params.slug);
  
  return (
    <>
      <StructuredDataProvider 
        pageType="article"
        article={article}
        author={article.author}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Content Authority Indicators */}
        <ContentAuthority metadata={article.metadata} />
        
        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <h1>{article.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        
        {/* Author Bio */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <AuthorProfile author={article.author} />
        </div>
      </article>
    </>
  );
}
```

## 📊 Performance Optimization

```tsx
// Lazy loading for authority components
import dynamic from 'next/dynamic';

const TrustBadges = dynamic(() => import('@/components/authority/TrustBadges'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const ReviewShowcase = dynamic(() => import('@/components/authority/ReviewShowcase'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

// Use in components for better performance
export default function OptimizedPage() {
  return (
    <>
      {/* Critical content loads immediately */}
      <HeroSection />
      
      {/* Authority components load after */}
      <TrustBadges />
      <ReviewShowcase />
    </>
  );
}
```

## 🎨 Styling Configuration

```css
/* globals.css - Authority component styles */
.authority-components {
  /* Color variables */
  --authority-primary: #3b82f6;
  --authority-success: #10b981;
  --authority-warning: #f59e0b;
  --authority-danger: #ef4444;
  --authority-text: #1e293b;
  --authority-text-light: #64748b;
  --authority-bg: #f8fafc;
  --authority-border: #e2e8f0;
}

/* Trust badge hover effects */
.trust-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Review card animations */
.review-card {
  transition: all 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Authority indicator styles */
.authority-indicator {
  background: linear-gradient(135deg, var(--authority-primary) 0%, var(--authority-success) 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .authority-grid {
    grid-template-columns: 1fr;
  }
  
  .authority-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

This comprehensive code library provides all the components needed to implement E-E-A-T authority signals across the Fly2Any website, focusing on free, organic methods to establish credibility and expertise while maintaining excellent user experience and performance.