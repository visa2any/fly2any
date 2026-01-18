'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="w-full bg-white border-b border-gray-200">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 py-3 sm:py-4">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
          <li className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 active:text-blue-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-semibold truncate max-w-[120px] sm:max-w-none">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 active:text-blue-700 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
