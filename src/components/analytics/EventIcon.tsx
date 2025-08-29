import React from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  EyeIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface EventIconProps {
  eventName: string;
  className?: string;
}

export const EventIcon = ({ eventName, className = "w-5 h-5" }: EventIconProps) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'form_submission':
        return <EnvelopeIcon className={className} />;
      case 'phone_click':
        return <PhoneIcon className={className} />;
      case 'whatsapp_click':
        return <PhoneIcon className={className} />;
      case 'page_view':
        return <EyeIcon className={className} />;
      default:
        return <ChartBarIcon className={className} />;
    }
  };

  return getIcon(eventName);
};