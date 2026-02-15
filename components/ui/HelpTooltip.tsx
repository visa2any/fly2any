'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  trigger?: React.ReactNode;
}

export function HelpTooltip({ content, trigger }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block ml-1 align-middle"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="cursor-help text-gray-400 hover:text-primary-500 transition-colors">
        {trigger || <Info className="w-4 h-4" />}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-neutral-900"></div>
        </div>
      )}
    </div>
  );
}
