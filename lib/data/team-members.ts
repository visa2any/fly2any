// lib/data/team-members.ts
// Shared team member data for E-E-A-T author pages and structured data

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  credentials: string[];
  yearsExp: number;
  articles: number;
  slug: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Marcus Rivera',
    role: 'Head of Travel Operations & Airline Relations',
    bio: 'Former airline revenue management analyst with 14 years at three major US carriers. Marcus oversees our airline partnerships and ensures fare accuracy across 900+ carriers.',
    expertise: ['Airline Revenue Management', 'GDS Systems', 'Fare Rules', 'Transatlantic Routes'],
    credentials: ['IATA Certified Travel Agent', 'Sabre GDS Certified', 'BA in Economics — University of Texas'],
    yearsExp: 14,
    articles: 48,
    slug: 'marcus-rivera',
  },
  {
    name: 'Priya Nambiar',
    role: 'Senior Travel Content Strategist',
    bio: 'Priya has visited 67 countries across 6 continents and writes our destination guides with first-hand knowledge. Previously travel editor at a major US digital publication for 8 years.',
    expertise: ['Asia-Pacific Routes', 'Budget Travel', 'Visa Requirements', 'Destination Guides'],
    credentials: ['MA in Journalism — Columbia University', 'ASTA Member', 'Google Travel Certified'],
    yearsExp: 11,
    articles: 120,
    slug: 'priya-nambiar',
  },
  {
    name: 'David Chen',
    role: 'Chief Technology Officer',
    bio: 'David architected Fly2Any\'s real-time fare comparison engine. With a background in distributed systems and 12 years in travel technology, he ensures our pricing data is always accurate and current.',
    expertise: ['Real-time Pricing APIs', 'Amadeus Integration', 'System Architecture', 'Flight Data'],
    credentials: ['MS Computer Science — Stanford', 'AWS Certified Solutions Architect', 'Former Amadeus Tech Lead'],
    yearsExp: 12,
    articles: 22,
    slug: 'david-chen',
  },
  {
    name: 'Sofia Mendes',
    role: 'Latin America & Iberia Travel Specialist',
    bio: 'Born in Sao Paulo, Sofia specializes in travel between the Americas, with deep expertise on South American routes, visa requirements, and airline networks operated by LATAM, Gol, and Avianca.',
    expertise: ['South America Routes', 'Portuguese/Spanish Markets', 'LATAM Network', 'Visa Guidance'],
    credentials: ['IATA Certified', 'BA Tourism Management — USP Brazil', 'Bilingual EN/PT/ES'],
    yearsExp: 9,
    articles: 76,
    slug: 'sofia-mendes',
  },
  {
    name: 'James Whitfield',
    role: 'Loyalty Programs & Premium Cabin Expert',
    bio: 'James has flown over 2 million miles across premium cabins worldwide and is recognized as a leading authority on airline loyalty programs, award booking, and business class value.',
    expertise: ['Airline Miles & Points', 'Business Class', 'Oneworld Alliance', 'Award Booking'],
    credentials: ['Former American Airlines Platinum Pro', 'Points Authority Contributor', '30+ Countries Visited'],
    yearsExp: 8,
    articles: 95,
    slug: 'james-whitfield',
  },
  {
    name: 'Aisha Okonkwo',
    role: 'Middle East & Africa Routes Specialist',
    bio: 'Aisha has extensive experience with Gulf carrier operations — Emirates, Qatar Airways, and Etihad — and African aviation networks. She guides thousands of travelers on optimal routings through the Middle East.',
    expertise: ['Emirates Network', 'Qatar Airways', 'African Routes', 'Dubai Hub Connections'],
    credentials: ['IATA Travel & Tourism Diploma', 'Former Emirates Customer Experience Team', 'MBA — AUB'],
    yearsExp: 10,
    articles: 55,
    slug: 'aisha-okonkwo',
  },
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return TEAM.find(m => m.slug === slug);
}

export function getTeamMemberByName(name: string): TeamMember | undefined {
  return TEAM.find(m => m.name.toLowerCase() === name.toLowerCase());
}
