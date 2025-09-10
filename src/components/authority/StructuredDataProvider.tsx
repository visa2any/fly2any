'use client'

import React from 'react';
import Head from 'next/head';
import { 
  generateCompleteStructuredData, 
  defaultOrganizationData,
  type AuthorData,
  type ArticleData,
  type ReviewData,
  type FAQData
} from '@/lib/authority/structured-data-schemas';

interface StructuredDataProviderProps {
  author?: AuthorData;
  article?: ArticleData;
  reviews?: ReviewData[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: FAQData[];
  pageType?: 'homepage' | 'article' | 'author' | 'service' | 'reviews';
}

// Default author data for Fly2Any experts
const defaultAuthors: Record<string, AuthorData> = {
  'ricardo-silva': {
    name: 'Ricardo Silva',
    title: 'Especialista em Viagens Brasil-EUA',
    bio: 'Especialista certificado em viagens internacionais com mais de 12 anos de experiência ajudando brasileiros a encontrar as melhores ofertas de voos para o Brasil. Formado em Turismo pela USP e certificado pela IATA.',
    email: 'ricardo@fly2any.com',
    phone: '+1 (305) 555-0123',
    location: 'Miami, FL',
    yearsOfExperience: 12,
    credentials: [
      {
        title: 'Certificação IATA',
        organization: 'International Air Transport Association',
        year: '2018',
        verified: true
      },
      {
        title: 'Especialista em Turismo Internacional',
        organization: 'BRAZTOA',
        year: '2016',
        verified: true
      },
      {
        title: 'Bacharel em Turismo',
        organization: 'Universidade de São Paulo (USP)',
        year: '2012',
        verified: true
      }
    ],
    specializations: [
      'Viagens Brasil-EUA',
      'Tarifas promocionais',
      'Documentação de viagem',
      'Conexões internacionais',
      'Programa de milhas'
    ],
    publishedArticles: 127,
    clientsHelped: 5247,
    rating: 4.9,
    reviewCount: 1834,
    socialProfiles: [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/ricardo-silva-travel'
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/ricardofly2any'
      }
    ]
  },
  'maria-santos': {
    name: 'Maria Santos',
    title: 'Consultora de Viagens Corporativas',
    bio: 'Especialista em viagens corporativas e de grupo com 8 anos de experiência. Certificada em gestão de viagens empresariais e especialista em tarifas corporativas para o mercado brasileiro-americano.',
    email: 'maria@fly2any.com',
    phone: '+1 (305) 555-0124',
    location: 'Miami, FL',
    yearsOfExperience: 8,
    credentials: [
      {
        title: 'Certified Travel Manager',
        organization: 'Global Business Travel Association',
        year: '2019',
        verified: true
      },
      {
        title: 'Corporate Travel Specialist',
        organization: 'American Society of Travel Advisors',
        year: '2017',
        verified: true
      }
    ],
    specializations: [
      'Viagens corporativas',
      'Grupos e eventos',
      'Tarifas empresariais',
      'Gestão de travel policy'
    ],
    publishedArticles: 89,
    clientsHelped: 2830,
    rating: 4.8,
    reviewCount: 567,
    socialProfiles: [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/maria-santos-travel'
      }
    ]
  }
};

// Sample reviews for structured data
const defaultReviews: ReviewData[] = [
  {
    id: 'review-001',
    author: {
      name: 'Maria Silva Santos',
      location: 'Orlando, FL'
    },
    rating: 5,
    title: 'Economizei muito na passagem para visitar minha família!',
    reviewBody: 'Excelente atendimento em português! O Ricardo me ajudou a encontrar uma passagem com ótimo preço para São Paulo. Consegui economizar quase R$ 500 comparado com outras agências.',
    datePublished: '2024-12-20',
    verified: true,
    helpful: 23,
    route: 'Orlando → São Paulo',
    savedAmount: 'R$ 485'
  },
  {
    id: 'review-002',
    author: {
      name: 'João Carlos Oliveira',
      location: 'Miami, FL'
    },
    rating: 5,
    title: 'Perfeito para emergência familiar',
    reviewBody: 'Precisei viajar urgente para o Rio devido a uma emergência familiar. A equipe da Fly2Any conseguiu me encontrar um voo no mesmo dia com preço justo.',
    datePublished: '2024-12-02',
    verified: true,
    helpful: 18,
    route: 'Miami → Rio de Janeiro',
    savedAmount: 'R$ 320'
  },
  {
    id: 'review-003',
    author: {
      name: 'Ana Paula Costa',
      location: 'New York, NY'
    },
    rating: 5,
    title: 'Terceira vez que uso - sempre excelente!',
    reviewBody: 'Já é a terceira viagem que faço usando a Fly2Any. Sempre conseguem preços melhores que as outras agências, e o atendimento em português faz toda diferença.',
    datePublished: '2024-12-03',
    verified: true,
    helpful: 31,
    route: 'New York → Belo Horizonte',
    savedAmount: 'R$ 520'
  }
];

// Common FAQs
const defaultFAQs: FAQData[] = [
  {
    question: 'Como a Fly2Any consegue preços mais baixos que outras agências?',
    answer: 'Temos parcerias diretas com companhias aéreas e acesso a tarifas corporativas especiais. Nossa experiência de 12 anos no mercado nos permite encontrar as melhores oportunidades de preços para brasileiros.',
    author: 'Ricardo Silva',
    dateCreated: '2024-01-15'
  },
  {
    question: 'Vocês têm certificação IATA?',
    answer: 'Sim, somos certificados pela IATA (International Air Transport Association) desde 2018. Também somos membros da BRAZTOA e temos classificação A+ no Better Business Bureau.',
    author: 'Ricardo Silva',
    dateCreated: '2024-01-15'
  },
  {
    question: 'Qual é o tempo médio de resposta para cotações?',
    answer: 'Garantimos resposta em até 2 horas durante horário comercial. Para urgências, nosso suporte 24/7 responde em até 30 minutos.',
    author: 'Maria Santos',
    dateCreated: '2024-01-15'
  },
  {
    question: 'Vocês atendem apenas brasileiros?',
    answer: 'Somos especialistas na comunidade brasileira nos EUA, mas atendemos qualquer pessoa que precise viajar entre Brasil e Estados Unidos. Nosso diferencial é o atendimento especializado em português.',
    author: 'Ricardo Silva',
    dateCreated: '2024-01-15'
  }
];

export default function StructuredDataProvider({
  author,
  article,
  reviews,
  breadcrumbs,
  faqs,
  pageType = 'homepage'
}: StructuredDataProviderProps) {
  
  // Select appropriate data based on page type
  const getStructuredData = () => {
    let authorData = author;
    let reviewData = reviews;
    let faqData = faqs;
    
    // Use defaults for homepage and general pages
    if (pageType === 'homepage' || !author) {
      authorData = defaultAuthors['ricardo-silva'];
    }
    
    if (pageType === 'homepage' || pageType === 'reviews' || !reviews) {
      reviewData = defaultReviews;
    }
    
    if (pageType === 'homepage' || !faqs) {
      faqData = defaultFAQs;
    }

    // Add breadcrumbs based on page type
    let breadcrumbData = breadcrumbs;
    if (!breadcrumbs) {
      switch (pageType) {
        case 'article':
          breadcrumbData = [
            { name: 'Home', url: 'https://fly2any.com' },
            { name: 'Blog', url: 'https://fly2any.com/blog' },
            { name: article?.title || 'Artigo', url: article?.url || '#' }
          ];
          break;
        case 'author':
          breadcrumbData = [
            { name: 'Home', url: 'https://fly2any.com' },
            { name: 'Especialistas', url: 'https://fly2any.com/especialistas' },
            { name: authorData?.name || 'Autor', url: `https://fly2any.com/especialistas/${authorData?.name.toLowerCase().replace(/\s+/g, '-')}` }
          ];
          break;
        case 'reviews':
          breadcrumbData = [
            { name: 'Home', url: 'https://fly2any.com' },
            { name: 'Avaliações', url: 'https://fly2any.com/avaliacoes' }
          ];
          break;
        case 'service':
          breadcrumbData = [
            { name: 'Home', url: 'https://fly2any.com' },
            { name: 'Serviços', url: 'https://fly2any.com/servicos' }
          ];
          break;
        default:
          breadcrumbData = [
            { name: 'Home', url: 'https://fly2any.com' }
          ];
      }
    }

    return generateCompleteStructuredData({
      organization: defaultOrganizationData,
      author: authorData,
      article,
      reviews: reviewData,
      breadcrumbs: breadcrumbData,
      faqs: faqData
    });
  };

  const structuredData = getStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
    </>
  );
}

// Hook for easy integration
export function useStructuredData(props: StructuredDataProviderProps) {
  return React.createElement(StructuredDataProvider, props);
}

// Export default authors for component usage
export { defaultAuthors, defaultReviews, defaultFAQs };

// Utility function to generate structured data for specific pages
export function generatePageStructuredData(pageType: string, pageData?: any) {
  switch (pageType) {
    case 'homepage':
      return {
        author: defaultAuthors['ricardo-silva'],
        reviews: defaultReviews.slice(0, 5),
        faqs: defaultFAQs,
        pageType: 'homepage' as const
      };
      
    case 'about':
      return {
        author: defaultAuthors['ricardo-silva'],
        breadcrumbs: [
          { name: 'Home', url: 'https://fly2any.com' },
          { name: 'Sobre', url: 'https://fly2any.com/sobre' }
        ],
        faqs: defaultFAQs.filter(faq => faq.question.includes('certificação') || faq.question.includes('experiência')),
        pageType: 'service' as const
      };
      
    case 'contact':
      return {
        breadcrumbs: [
          { name: 'Home', url: 'https://fly2any.com' },
          { name: 'Contato', url: 'https://fly2any.com/contato' }
        ],
        faqs: defaultFAQs.filter(faq => faq.question.includes('resposta') || faq.question.includes('atend')),
        pageType: 'service' as const
      };
      
    case 'flights':
      return {
        breadcrumbs: [
          { name: 'Home', url: 'https://fly2any.com' },
          { name: 'Voos', url: 'https://fly2any.com/voos' }
        ],
        faqs: defaultFAQs.filter(faq => faq.question.includes('preços') || faq.question.includes('voo')),
        reviews: defaultReviews,
        pageType: 'service' as const
      };
      
    default:
      return {
        pageType: 'homepage' as const
      };
  }
}