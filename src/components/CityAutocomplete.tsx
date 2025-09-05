'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LocationIcon } from './Icons';
import { City } from '@/data/cities';

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

export default function CityAutocomplete({
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
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.length >= 3) {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.code.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6); // Mostrar no máximo 6 sugestões
      
      setFilteredCities(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
      setFilteredCities([]);
    }
  }, [inputValue, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(''); // Limpar valor selecionado quando digitando
  };

  const handleCitySelect = (city: City) => {
    setInputValue(`${city.name} (${city.code})`);
    onChange(city.code);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev: any) => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev: any) => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCities[selectedIndex]) {
          handleCitySelect(filteredCities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={className} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>
          <LocationIcon style={{ width: '14px', height: '14px', color: iconColor }} />
          {label}
        </label>
      )}
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '14px 16px',
          border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '16px',
          background: 'white',
          outline: 'none',
          transition: 'all 0.3s ease'
        }}
        onFocus={() => {
          if (inputValue.length >= 3 && filteredCities.length > 0) {
            setIsOpen(true);
          }
        }}
      />

      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}

      {/* Dropdown de sugestões */}
      {isOpen && filteredCities.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '2px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            maxHeight: '240px',
            overflowY: 'auto'
          }}
        >
          {filteredCities.map((city, index) => (
            <div
              key={city.code}
              onClick={() => handleCitySelect(city)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: index === selectedIndex ? '#f3f4f6' : 'white',
                borderBottom: index < filteredCities.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span style={{ fontSize: '20px' }}>{city.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {city.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {city.code} • {city.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dica de uso */}
      {inputValue.length > 0 && inputValue.length < 3 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#6b7280',
          zIndex: 999
        }}>
          Digite pelo menos 3 letras para ver sugestões
        </div>
      )}
    </div>
  );
}