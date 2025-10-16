'use client';

import { ReactNode } from 'react';

export interface MasonryItem {
  id: string;
  size: '1x1' | '2x1' | '1x2' | '2x2';
  [key: string]: any;
}

interface DynamicMasonryGridProps {
  items: MasonryItem[];
  renderCard: (item: MasonryItem, index: number) => ReactNode;
  className?: string;
}

export function DynamicMasonryGrid({ items, renderCard, className = '' }: DynamicMasonryGridProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case '2x1':
        return 'md:col-span-2';
      case '1x2':
        return 'md:row-span-2';
      case '2x2':
        return 'md:col-span-2 md:row-span-2';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        w-[90%] mx-auto
        grid gap-2 sm:gap-3
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-5
        xl:grid-cols-6
        2xl:grid-cols-7
        auto-rows-[200px]
        ${className}
      `}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${getSizeClasses(item.size)} transition-all duration-300`}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}
