'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/page.module.css';

interface ServiceCardsProps {
  onServiceClick: (service: string) => void;
  isMobile?: boolean;
  selectedServices?: Array<{serviceType: string; completed?: boolean}>;
  isAddingService?: boolean;
}

export default function HydrationSafeServiceCards({ 
  onServiceClick, 
  isMobile = false, 
  selectedServices = [], 
  isAddingService = false 
}: ServiceCardsProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const services = [
    {
      id: 'voos',
      icon: '✈️',
      title: 'Voos',
      subtitle: 'Passagens aéreas',
      popular: true
    },
    {
      id: 'hoteis',
      icon: '🏨',
      title: 'Hotéis',
      subtitle: 'Hospedagem'
    },
    {
      id: 'carros',
      icon: '🚗',
      title: 'Carros',
      subtitle: 'Aluguel'
    },
    {
      id: 'passeios',
      icon: '🎯',
      title: 'Tours',
      subtitle: 'Experiências'
    },
    {
      id: 'seguro',
      icon: '🛡️',
      title: 'Seguro Viagem',
      subtitle: 'Proteção 24h mundial'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    try {
      console.log(`🎯 HydrationSafe: ${serviceId} button clicked`);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      onServiceClick(serviceId);

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'service_click', {
          event_category: 'engagement',
          event_label: serviceId,
          value: 1
        });
      }
    } catch (error) {
      console.error('Service click error:', error);
    }
  };

  // Pre-hydration fallback (server-side rendered) - Use CSS classes with minimal inline overrides
  if (!isHydrated) {
    return (
      <div className={`${styles.servicesGrid} ${isMobile ? styles.mobileServicesGrid : styles.desktopServicesGrid}`}>
        {services.map((service) => {
          const isFullWidth = service.id === 'seguro';
          const baseClasses = isMobile 
            ? `${styles.serviceButton} ${styles.mobileServiceButton} ${isFullWidth ? styles.serviceButtonFullWidth : ''}`
            : `${styles.serviceButton} ${styles.desktopServiceButton}`;
            
          return (
            <div
              key={service.id}
              className={`${baseClasses} ${styles.hydrationSafePreRender}`}
              style={{ 
                opacity: 0.7,
                cursor: 'default',
                pointerEvents: 'none'
              }}
            >
              {isMobile ? (
                // Mobile Layout
                <>
                  <div className={styles.mobileServiceIcon}>
                    {service.icon}
                  </div>
                  <div className={styles.mobileServiceLabel}>
                    {service.title}
                  </div>
                  <div className={styles.mobileServiceSubtitle}>
                    {service.subtitle}
                  </div>
                  {service.popular && (
                    <div className={styles.popularBadge}>
                      Popular
                    </div>
                  )}
                </>
              ) : (
                // Desktop Layout - Match live site structure
                <>
                  <span className={`${styles.serviceIcon} ${styles.desktopServiceIcon}`}>{service.icon}</span>
                  <span>{service.title}</span>
                  {service.popular && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#f97316',
                      color: 'white',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(249, 115, 22, 0.25)'
                    }}>
                      Popular
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Post-hydration interactive version - Use CSS classes with dynamic inline styles only for states
  return (
    <div className={`${styles.servicesGrid} ${isMobile ? styles.mobileServicesGrid : styles.desktopServicesGrid}`}>
      {services.map((service) => {
        const isSelected = selectedServices.some(s => s.serviceType === service.id);
        const isMaxServices = selectedServices.length >= 5;
        const isFullWidth = service.id === 'seguro';
        
        const baseClasses = isMobile 
          ? `${styles.serviceButton} ${styles.mobileServiceButton} ${isFullWidth ? styles.serviceButtonFullWidth : ''}`
          : `${styles.serviceButton} ${styles.desktopServiceButton}`;

        const stateClasses = [
          isSelected ? styles.serviceButtonSelected : '',
          (isSelected || isMaxServices) ? styles.serviceButtonDisabled : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            disabled={isSelected || isMaxServices}
            className={`${baseClasses} ${stateClasses} ${styles.hydrationSafeInteractive}`}
            onTouchStart={(e) => {
              if (isMobile && !isSelected && !isMaxServices) {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.transition = 'all 0.1s ease';
              }
            }}
            onTouchEnd={(e) => {
              if (isMobile && !isSelected && !isMaxServices) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            // Minimal inline styles - only for dynamic states that can't be in CSS
            style={{
              ...(isSelected && {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
              }),
              opacity: isSelected || isMaxServices ? 0.7 : 1
            }}
          >
            {isMobile ? (
              // Mobile Layout
              <>
                <div className={styles.mobileServiceIcon}>
                  {service.icon}
                </div>
                <div className={styles.mobileServiceLabel}>
                  {service.title}
                </div>
                <div className={styles.mobileServiceSubtitle}>
                  {service.subtitle}
                </div>
                {service.popular && (
                  <div className={styles.popularBadge}>
                    Popular
                  </div>
                )}
                {isSelected && (
                  <div className={styles.selectedCheckmark}>
                    ✓
                  </div>
                )}
              </>
            ) : (
              // Desktop Layout - Match live site structure
              <>
                <span className={`${styles.serviceIcon} ${styles.desktopServiceIcon}`}>{service.icon}</span>
                <span>{service.title}</span>
                {service.popular && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#f97316',
                    color: 'white',
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.25)'
                  }}>
                    Popular
                  </span>
                )}
                {isSelected && (
                  <span className={styles.selectedCheckmark}>
                    ✓
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}