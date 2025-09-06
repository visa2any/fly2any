'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationIcon } from './Icons';
import { City } from '@/data/cities';
import '@/styles/city-autocomplete.css';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  iconColor?: string;
  error?: string;
  cities: City[];
  className?: string;
}

// ULTRATHINK: Normalize string for accent-insensitive search
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export default function CityAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  iconColor = '#6b7280',
  error,
  cities,
  className = ''
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ULTRATHINK: Advanced Mobile Detection (from AirportAutocomplete)
  useEffect(() => {
    const checkMobile = () => {
      const isMobileViewport = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
      
      setIsMobile(isMobileViewport || isTouchDevice || isMobileUserAgent);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize portal container
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Calculate dropdown position for portal rendering
  const calculateDropdownPosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const containerRect = wrapperRef.current.getBoundingClientRect();
    const inputRect = inputRef.current?.getBoundingClientRect();
    
    if (!inputRect) return;

    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(320, Math.max(filteredCities.length, 1) * 68 + 40);
    
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    let top, maxHeight;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow + 50) {
      // Position above input
      setDropdownPosition('top');
      top = inputRect.top - dropdownHeight - 8;
      maxHeight = Math.min(dropdownHeight, inputRect.top - 20);
    } else {
      // Position below input  
      setDropdownPosition('bottom');
      top = inputRect.bottom + 8;
      maxHeight = Math.min(dropdownHeight, spaceBelow - 20);
    }

    setDropdownStyle({
      position: 'fixed',
      top: `${Math.max(10, top)}px`,
      left: `${inputRect.left}px`,
      width: `${inputRect.width}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 11000
    });
  }, [filteredCities.length]);

  // Recalculate position when dropdown opens or results change
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen, filteredCities.length, calculateDropdownPosition]);

  // Sync with external value prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue.length >= 3) {
      const normalizedInput = normalizeString(inputValue);
      
      const filtered = cities.filter(city => {
        const normalizedName = normalizeString(city.name);
        const normalizedCode = normalizeString(city.code);
        const normalizedCountry = normalizeString(city.country);
        
        return normalizedName.includes(normalizedInput) ||
               normalizedCode.includes(normalizedInput) ||
               normalizedCountry.includes(normalizedInput);
      }).slice(0, 6);
      
      setFilteredCities(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
      setFilteredCities([]);
    }
  }, [inputValue, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };

  const handleCitySelect = (city: City) => {
    const selectedText = `${city.name} (${city.code})`;
    setInputValue(selectedText);
    onChange(selectedText);
    setIsOpen(false);
    setFilteredCities([]);
    
    // ULTRATHINK: Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Delay closing to allow click events to fire
    // Longer delay on mobile for better touch interaction
    const delay = isMobile ? 300 : 150;
    setTimeout(() => {
      setIsOpen(false);
      setFilteredCities([]);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < filteredCities.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      if (isOpen) {
        // Recalculate position when virtual keyboard opens/closes
        setTimeout(calculateDropdownPosition, 100);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, calculateDropdownPosition, isMobile]);

  return (
    <div ref={wrapperRef} className={`city-autocomplete-wrapper ${className}`}>
      {label && (
        <label className="city-autocomplete-label">
          <LocationIcon className="city-autocomplete-label-icon" />
          {label}
        </label>
      )}
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={`city-autocomplete-input ${error ? 'error' : ''}`}
        onFocus={() => {
          if (inputValue.length >= 3 && filteredCities.length > 0) {
            setIsOpen(true);
          }
          // On mobile, add extra delay to ensure dropdown positioning
          if (isMobile) {
            setTimeout(calculateDropdownPosition, 150);
          }
        }}
      />

      {error && (
        <span className="city-autocomplete-error">
          {error}
        </span>
      )}

      {/* ULTRATHINK: Portal-Based Dropdown (from AirportAutocomplete) */}
      {portalContainer && createPortal(
        <AnimatePresence>
          {isOpen && filteredCities.length > 0 && (
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, scale: 0.95, y: dropdownPosition === 'bottom' ? -10 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: dropdownPosition === 'bottom' ? -10 : 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-y-auto"
              style={{
                ...dropdownStyle,
                background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(226,232,240,0.8)',
                borderRadius: isMobile ? '16px' : '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15), inset 3px 3px 6px rgba(255,255,255,0.9), inset -3px -3px 6px rgba(226,232,240,0.4)',
                pointerEvents: 'auto'
              }}
            >
              {filteredCities.map((city, index) => (
                <motion.button
                  key={`${city.code}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCitySelect(city);
                  }}
                  onTouchStart={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCitySelect(city);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className={`
                    w-full text-left focus:outline-none transition-all duration-200 border-b last:border-b-0 touch-manipulation
                    ${isMobile 
                      ? 'px-4 py-3 min-h-[68px]' 
                      : 'px-3 py-3 min-h-[58px]'
                    }
                  `}
                  style={{
                    borderBottom: index < filteredCities.length - 1 ? '1px solid rgba(226,232,240,0.4)' : 'none',
                    background: selectedIndex === index 
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.06))' 
                      : 'transparent'
                  }}
                  onMouseEnter={() => !isMobile && setSelectedIndex(index)}
                  onMouseLeave={() => !isMobile && setSelectedIndex(-1)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isMobile ? 'text-2xl' : 'text-xl'} flex-shrink-0`}>
                      {city.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
                        {city.name}
                      </div>
                      <div className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'} mt-1`}>
                        {city.code} • {city.country}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        portalContainer
      )}
    </div>
  );
}