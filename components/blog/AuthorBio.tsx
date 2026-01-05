import React from 'react';
import Image from 'next/image';
import { Linkedin, Twitter, Globe, Mail } from 'lucide-react';

export interface Author {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  experience: string;
  avatarUrl: string;
  website?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  email?: string;
  articlesCount?: number;
  lastUpdated?: string;
  verified?: boolean;
}

interface AuthorBioProps {
  author: Author;
  variant?: 'compact' | 'detailed' | 'card';
  showStats?: boolean;
  className?: string;
}

/**
 * AuthorBio Component
 * 
 * Displays author information with E-E-A-T signals for SEO
 * - Author expertise and credentials
 * - Social proof and verification
 * - Article count and engagement metrics
 */
export default function AuthorBio({
  author,
  variant = 'detailed',
  showStats = true,
  className = '',
}: AuthorBioProps) {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';

  // E-E-A-T Signals: Display verified badge for authoritative authors
  const VerifiedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Verified Expert
    </span>
  );

  // Social Links Component
  const SocialLinks = () => (
    <div className="flex items-center gap-3 mt-4">
      {author.website && (
        <a
          href={author.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-600 transition-colors"
          aria-label={`Visit ${author.name}'s website`}
        >
          <Globe className="w-5 h-5" />
        </a>
      )}
      {author.twitterHandle && (
        <a
          href={`https://twitter.com/${author.twitterHandle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-400 transition-colors"
          aria-label={`Follow ${author.name} on Twitter`}
        >
          <Twitter className="w-5 h-5" />
        </a>
      )}
      {author.linkedinUrl && (
        <a
          href={author.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-700 transition-colors"
          aria-label={`Connect with ${author.name} on LinkedIn`}
        >
          <Linkedin className="w-5 h-5" />
        </a>
      )}
      {author.email && (
        <a
          href={`mailto:${author.email}`}
          className="text-gray-500 hover:text-red-600 transition-colors"
          aria-label={`Email ${author.name}`}
        >
          <Mail className="w-5 h-5" />
        </a>
      )}
    </div>
  );

  // Expertise Tags Component
  const ExpertiseTags = () => (
    <div className="flex flex-wrap gap-2 mt-3">
      {author.expertise.map((skill, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
        >
          {skill}
        </span>
      ))}
    </div>
  );

  // Stats Component
  const AuthorStats = () => (
    <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{author.articlesCount || 0}</div>
        <div className="text-xs text-gray-600">Articles</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">10+</div>
        <div className="text-xs text-gray-600">Years Exp</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">4.9</div>
        <div className="text-xs text-gray-600">Rating</div>
      </div>
    </div>
  );

  // Compact Version
  if (isCompact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={author.avatarUrl}
            alt={author.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{author.name}</h4>
            {author.verified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-gray-600">{author.title}</p>
        </div>
      </div>
    );
  }

  // Card Version
  if (isCard) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{author.name}</h3>
              {author.verified && <VerifiedBadge />}
            </div>
            <p className="text-gray-700">{author.title}</p>
            <p className="text-sm text-gray-600 mt-1">{author.experience}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700 text-sm">{author.bio}</p>
          <ExpertiseTags />
          <SocialLinks />
          {showStats && <AuthorStats />}
        </div>
      </div>
    );
  }

  // Detailed Version (Default)
  return (
    <div className={`border-t border-b border-gray-200 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Author Avatar */}
          <div className="md:w-1/4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto md:mx-0">
              <Image
                src={author.avatarUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            </div>
          </div>

          {/* Author Info */}
          <div className="md:w-3/4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{author.name}</h2>
                  {author.verified && <VerifiedBadge />}
                </div>
                <p className="text-lg text-gray-700 font-medium">{author.title}</p>
                <p className="text-gray-600 mt-1">{author.experience}</p>
              </div>
              
              {author.lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(author.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Bio */}
            <p className="text-gray-700 mb-6">{author.bio}</p>

            {/* Expertise */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h4>
              <ExpertiseTags />
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-between">
              <SocialLinks />
              
              {author.articlesCount && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{author.articlesCount}</span> articles on Fly2Any
                </div>
              )}
            </div>

            {/* Stats (Optional) */}
            {showStats && <AuthorStats />}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AuthorBioSkeleton Component
 * Loading skeleton for AuthorBio
 */
export function AuthorBioSkeleton({ variant = 'detailed' }: { variant?: 'compact' | 'detailed' | 'card' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-b border-gray-200 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mx-auto md:mx-0" />
          </div>
          <div className="md:w-3/4 space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
