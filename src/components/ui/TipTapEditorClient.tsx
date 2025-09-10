'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Dynamic import with no SSR to prevent hydration issues
const TipTapEditorInternal = dynamic(() => import('./TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50 border-b-0">
        <div className="text-sm text-gray-500">Loading editor...</div>
      </div>
      <div className="border border-gray-200 rounded-b-lg p-3 min-h-[100px] bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  ),
});

type TipTapEditorClientProps = ComponentProps<typeof TipTapEditorInternal>;

export default function TipTapEditorClient(props: TipTapEditorClientProps) {
  return <TipTapEditorInternal {...props} />;
}