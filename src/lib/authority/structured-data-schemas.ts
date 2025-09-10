// Schema.org type definitions with JSON-LD support
interface Person {
  '@type': 'Person';
  '@id'?: string;
  name: string;
  url?: string;
  sameAs?: string[];
  jobTitle?: string;
  description?: string;
  email?: string;
  telephone?: string;
  address?: any;
  knowsAbout?: string[];
  hasCredential?: any[];
  aggregateRating?: any;
  interactionStatistic?: any[];
  [key: string]: any; // Allow additional JSON-LD properties
}

interface Organization {
  '@type': 'Organization' | string[] | string;
  '@id'?: string;
  name: string;
  url?: string;
  logo?: string | any;
  description?: string;
  image?: string;
  foundingDate?: string;
  address?: any;
  contactPoint?: any;
  sameAs?: string[];
  hasCredential?: any[];
  award?: any[];
  additionalProperty?: any[];
  serviceArea?: any;
  areaServed?: string[];
  currenciesAccepted?: string[];
  paymentAccepted?: string[];
  priceRange?: string;
  [key: string]: any; // Allow additional JSON-LD properties
}

interface Review {
  '@type': 'Review';
  '@id'?: string;
  author: Person;
  reviewRating?: any;
  reviewBody?: string;
  itemReviewed?: any;
  name?: string;
  datePublished?: string;
  positiveNotes?: string;
  additionalProperty?: any[];
  [key: string]: any; // Allow additional JSON-LD properties
}

interface Product {
  '@type': 'Product';
  name: string;
  description?: string;
  review?: Review[];
  [key: string]: any; // Allow additional JSON-LD properties
}

interface Article {
  '@type': 'Article';
  '@id'?: string;
  headline: string;
  author: Person;
  datePublished?: string;
  description?: string;
  url?: string;
  publisher?: any;
  dateModified?: string;
  articleBody?: string;
  wordCount?: number;
  timeRequired?: string;
  keywords?: string;
  articleSection?: string;
  about?: any[];
  citation?: any[];
  reviewedBy?: any;
  isAccessibleForFree?: boolean;
  inLanguage?: string;
  [key: string]: any; // Allow additional JSON-LD properties
}

interface LocalBusiness {
  '@type': 'LocalBusiness';
  name: string;
  address?: any;
  telephone?: string;
  [key: string]: any; // Allow additional JSON-LD properties
}

interface WebSite {
  '@type': 'WebSite';
  '@id'?: string;
  url: string;
  name: string;
  description?: string;
  publisher?: any;
  potentialAction?: any;
  sameAs?: string[];
  inLanguage?: string[];
  audience?: any;
  [key: string]: any; // Allow additional JSON-LD properties
}

interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: any[];
  [key: string]: any; // Allow additional JSON-LD properties
}

// Author Schema Generation
export interface AuthorData {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  location: string;
  yearsOfExperience: number;
  credentials: Array<{
    title: string;
    organization: string;
    year: string;
    verified: boolean;
  }>;
  specializations: string[];
  publishedArticles: number;
  clientsHelped: number;
  rating: number;
  reviewCount: number;
  socialProfiles: Array<{
    platform: string;
    url: string;
  }>;
}

export function generateAuthorSchema(author: AuthorData): any {
  return {
    "@type": "Person",
    "@id": `https://fly2any.com/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    email: author.email,
    telephone: author.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: author.location
    },
    knowsAbout: author.specializations,
    hasCredential: author.credentials.filter(cred => cred.verified).map(cred => ({
      "@type": "EducationalOccupationalCredential",
      name: cred.title,
      credentialCategory: "professional certification",
      recognizedBy: {
        "@type": "Organization",
        name: cred.organization
      },
      dateCreated: cred.year
    })),
    sameAs: author.socialProfiles.map(profile => profile.url),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: author.rating.toString(),
      reviewCount: author.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1"
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WriteAction",
        userInteractionCount: author.publishedArticles
      },
      {
        "@type": "InteractionCounter", 
        interactionType: "https://schema.org/HelpAction",
        userInteractionCount: author.clientsHelped
      }
    ]
  };
}

// Organization Schema for Business Credibility
export interface OrganizationData {
  name: string;
  description: string;
  url: string;
  logo: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  foundingDate: string;
  socialProfiles: string[];
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    dateIssued: string;
    validUntil?: string;
  }>;
  awards: Array<{
    name: string;
    awardingBody: string;
    dateReceived: string;
  }>;
  businessMetrics: {
    yearsInOperation: number;
    customersServed: number;
    satisfactionRate: number;
    averageSavings: string;
  };
}

export function generateOrganizationSchema(org: OrganizationData): any {
  return {
    "@type": ["Organization", "LocalBusiness", "TravelAgency"],
    "@id": `${org.url}#organization`,
    name: org.name,
    description: org.description,
    url: org.url,
    logo: {
      "@type": "ImageObject",
      url: org.logo,
      width: 400,
      height: 400
    },
    image: org.logo,
    foundingDate: org.foundingDate,
    address: {
      "@type": "PostalAddress",
      streetAddress: org.address.street,
      addressLocality: org.address.city,
      addressRegion: org.address.state,
      postalCode: org.address.postalCode,
      addressCountry: org.address.country
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: org.contactInfo.phone,
      email: org.contactInfo.email,
      contactType: "customer service",
      availableLanguage: ["Portuguese", "English"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", 
          "Friday", "Saturday", "Sunday"
        ],
        opens: "00:00",
        closes: "23:59"
      }
    },
    sameAs: org.socialProfiles,
    hasCredential: org.certifications.map(cert => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
      credentialCategory: "business certification",
      recognizedBy: {
        "@type": "Organization",
        name: cert.issuingOrganization
      },
      dateCreated: cert.dateIssued,
      expires: cert.validUntil
    })),
    award: org.awards.map(award => ({
      "@type": "Award",
      name: award.name,
      awardingBody: {
        "@type": "Organization",
        name: award.awardingBody
      },
      dateGiven: award.dateReceived
    })),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Years in Operation",
        value: org.businessMetrics.yearsInOperation
      },
      {
        "@type": "PropertyValue",
        name: "Customers Served",
        value: org.businessMetrics.customersServed
      },
      {
        "@type": "PropertyValue",
        name: "Customer Satisfaction Rate",
        value: `${org.businessMetrics.satisfactionRate}%`
      },
      {
        "@type": "PropertyValue",
        name: "Average Customer Savings",
        value: org.businessMetrics.averageSavings
      }
    ],
    serviceArea: {
      "@type": "AdministrativeArea",
      name: "United States and Brazil"
    },
    areaServed: ["US", "BR"],
    currenciesAccepted: ["USD", "BRL"],
    paymentAccepted: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer"],
    priceRange: "$$"
  };
}

// Review Schema for Customer Testimonials
export interface ReviewData {
  id: string;
  author: {
    name: string;
    location: string;
  };
  rating: number;
  title: string;
  reviewBody: string;
  datePublished: string;
  verified: boolean;
  helpful: number;
  route: string;
  savedAmount: string;
}

export function generateReviewSchema(review: ReviewData, businessId: string): any {
  return {
    "@type": "Review",
    "@id": `https://fly2any.com/reviews/${review.id}`,
    itemReviewed: {
      "@type": "Service",
      "@id": businessId,
      name: "Flight Booking Service"
    },
    author: {
      "@type": "Person",
      name: review.author.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: review.author.location
      }
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating.toString(),
      bestRating: "5",
      worstRating: "1"
    },
    name: review.title,
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    positiveNotes: review.verified ? "Verified Purchase" : undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Travel Route",
        value: review.route
      },
      {
        "@type": "PropertyValue",
        name: "Amount Saved",
        value: review.savedAmount
      },
      {
        "@type": "PropertyValue",
        name: "Helpful Votes",
        value: review.helpful
      }
    ]
  };
}

// Article Schema for Content Authority
export interface ArticleData {
  title: string;
  description: string;
  url: string;
  author: AuthorData;
  publishDate: string;
  modifiedDate: string;
  content: string;
  keywords: string[];
  category: string;
  readingTime: number;
  wordCount: number;
  sources: Array<{
    title: string;
    url: string;
    organization: string;
    publishDate: string;
  }>;
  factChecked: boolean;
  lastFactCheck?: string;
  reviewer?: string;
}

export function generateArticleSchema(article: ArticleData): any {
  return {
    "@type": "Article",
    "@id": article.url,
    headline: article.title,
    description: article.description,
    url: article.url,
    author: generateAuthorSchema(article.author),
    publisher: {
      "@type": "Organization",
      "@id": "https://fly2any.com#organization",
      name: "Fly2Any",
      logo: {
        "@type": "ImageObject",
        url: "https://fly2any.com/logo.png"
      }
    },
    datePublished: article.publishDate,
    dateModified: article.modifiedDate,
    articleBody: article.content,
    wordCount: article.wordCount,
    timeRequired: `PT${article.readingTime}M`,
    keywords: article.keywords.join(", "),
    articleSection: article.category,
    about: article.keywords.map(keyword => ({
      "@type": "Thing",
      name: keyword
    })),
    citation: article.sources.map(source => ({
      "@type": "WebPage",
      name: source.title,
      url: source.url,
      publisher: {
        "@type": "Organization",
        name: source.organization
      },
      datePublished: source.publishDate
    })),
    ...(article.factChecked && {
      reviewedBy: {
        "@type": "Person",
        name: article.reviewer || "Editorial Team"
      },
      dateModified: article.lastFactCheck || article.modifiedDate
    }),
    isAccessibleForFree: true,
    inLanguage: "pt-BR"
  };
}

// Website Schema for Overall Authority
export function generateWebsiteSchema(): any {
  return {
    "@type": "WebSite",
    "@id": "https://fly2any.com#website",
    name: "Fly2Any - Passagens Aéreas Brasil-EUA",
    description: "Especialistas em passagens aéreas para brasileiros nos EUA. Economize até 40% em voos para o Brasil com atendimento em português.",
    url: "https://fly2any.com",
    publisher: {
      "@type": "Organization",
      "@id": "https://fly2any.com#organization"
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://fly2any.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    sameAs: [
      "https://facebook.com/fly2any",
      "https://instagram.com/fly2any",
      "https://linkedin.com/company/fly2any"
    ],
    inLanguage: ["pt-BR", "en-US"],
    audience: {
      "@type": "Audience",
      audienceType: "Brazilians living in the United States",
      geographicArea: {
        "@type": "Country",
        name: "United States"
      }
    }
  };
}

// Breadcrumb Schema for Navigation
export function generateBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>): any {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// FAQ Schema for E-E-A-T
export interface FAQData {
  question: string;
  answer: string;
  author?: string;
  dateCreated?: string;
  sources?: string[];
}

export function generateFAQSchema(faqs: FAQData[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        author: faq.author ? {
          "@type": "Person",
          name: faq.author
        } : undefined,
        dateCreated: faq.dateCreated,
        citation: faq.sources
      }
    }))
  };
}

// Service Schema for Travel Services
export function generateServiceSchema() {
  return {
    "@type": "Service",
    "@id": "https://fly2any.com/services/flight-booking",
    name: "Flight Booking Services for Brazilians",
    description: "Specialized flight booking services for Brazilian travelers in the United States, with Portuguese-speaking support and exclusive deals.",
    provider: {
      "@type": "Organization",
      "@id": "https://fly2any.com#organization"
    },
    serviceType: "Travel Agency Services",
    areaServed: ["US", "BR"],
    availableLanguage: ["Portuguese", "English"],
    category: "Travel and Tourism",
    audience: {
      "@type": "Audience",
      audienceType: "Brazilian expatriates in the United States"
    },
    offers: {
      "@type": "Offer",
      description: "Flight booking with up to 40% savings",
      price: "0",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "0",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false
      },
      availability: "https://schema.org/InStock",
      availableDeliveryMethod: "https://schema.org/OnSitePickup"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Flight Deals Catalog",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Economy Class Flights",
          description: "Budget-friendly flights to Brazil"
        },
        {
          "@type": "Offer", 
          name: "Premium Class Flights",
          description: "Comfortable premium flights with extra amenities"
        },
        {
          "@type": "Offer",
          name: "Business Class Flights", 
          description: "Luxury business class travel experience"
        }
      ]
    }
  };
}

// Utility function to combine all schemas
export function generateCompleteStructuredData(data: {
  organization: OrganizationData;
  author?: AuthorData;
  article?: ArticleData;
  reviews?: ReviewData[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: FAQData[];
}) {
  const schemas: any[] = [];

  // Always include website and organization
  schemas.push(generateWebsiteSchema());
  schemas.push(generateOrganizationSchema(data.organization));
  schemas.push(generateServiceSchema());

  // Add author schema if provided
  if (data.author) {
    schemas.push(generateAuthorSchema(data.author));
  }

  // Add article schema if provided
  if (data.article) {
    schemas.push(generateArticleSchema(data.article));
  }

  // Add review schemas if provided
  if (data.reviews && data.reviews.length > 0) {
    const reviewSchemas = data.reviews.map(review => 
      generateReviewSchema(review, "https://fly2any.com#organization")
    );
    schemas.push(...reviewSchemas);
  }

  // Add breadcrumb schema if provided
  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(data.breadcrumbs));
  }

  // Add FAQ schema if provided
  if (data.faqs && data.faqs.length > 0) {
    schemas.push(generateFAQSchema(data.faqs));
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
}

// Default organization data for Fly2Any
export const defaultOrganizationData: OrganizationData = {
  name: "Fly2Any",
  description: "Especialistas em passagens aéreas para brasileiros nos EUA. Economize até 40% em voos para o Brasil com atendimento especializado em português.",
  url: "https://fly2any.com",
  logo: "https://fly2any.com/logo.png",
  address: {
    street: "1001 Brickell Bay Dr",
    city: "Miami",
    state: "FL",
    postalCode: "33131",
    country: "US"
  },
  contactInfo: {
    phone: "+1-305-555-0123",
    email: "contato@fly2any.com"
  },
  foundingDate: "2012-03-15",
  socialProfiles: [
    "https://facebook.com/fly2any",
    "https://instagram.com/fly2any",
    "https://linkedin.com/company/fly2any"
  ],
  certifications: [
    {
      name: "IATA Certification",
      issuingOrganization: "International Air Transport Association",
      dateIssued: "2018-03-15",
      validUntil: "2026-03-15"
    },
    {
      name: "Better Business Bureau A+",
      issuingOrganization: "Better Business Bureau",
      dateIssued: "2019-01-10"
    },
    {
      name: "BRAZTOA Member",
      issuingOrganization: "Associação Brasileira das Operadoras de Turismo",
      dateIssued: "2017-06-20"
    }
  ],
  awards: [
    {
      name: "Best Travel Agency for Brazilians 2024",
      awardingBody: "Brazilian Chamber of Commerce Florida",
      dateReceived: "2024-05-15"
    }
  ],
  businessMetrics: {
    yearsInOperation: 12,
    customersServed: 12500,
    satisfactionRate: 98.5,
    averageSavings: "R$ 485"
  }
};