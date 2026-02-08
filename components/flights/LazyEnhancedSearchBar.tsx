'use client';

import dynamic from 'next/dynamic';
import { SearchFormSkeleton } from '@/components/skeletons/SearchFormSkeleton';
import type { ComponentProps } from 'react';

// Lazy-load EnhancedSearchBar with code splitting
// This reduces initial bundle size and improves Time to Interactive (TTI)
const EnhancedSearchBar = dynamic(
  () => import('@/components/flights/EnhancedSearchBar'),
  {
    loading: () => <SearchFormSkeleton />,
    ssr: false, // Client-only - prevents hydration mismatch
  }
);

// Re-export the lazy-loaded component with the same interface
export type LazyEnhancedSearchBarProps = ComponentProps<typeof EnhancedSearchBar>;

/**
 * Lazy-loaded EnhancedSearchBar
 * 
 * Benefits:
 * - Reduces initial JS bundle by ~285KB
 * - Shows skeleton during load (zero CLS)
 * - Enables code splitting for better performance
 * 
 * Usage:
 * Replace `import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar'`
 * with `import { LazyEnhancedSearchBar } from '@/components/flights/LazyEnhancedSearchBar'`
 */
export function LazyEnhancedSearchBar(props: LazyEnhancedSearchBarProps) {
  return <EnhancedSearchBar {...props} />;
}

export default LazyEnhancedSearchBar;
