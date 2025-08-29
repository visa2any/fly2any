'use client';

/**
 * Hotel Search Form Component
 * Main search interface for hotel booking system
 */

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Minus, Search, Loader2 } from 'lucide-react';
import type { HotelSearchParams } from '@/types/hotels';

interface HotelSearchFormProps {
  onSearch: (params: HotelSearchParams) => void;
  isLoading?: boolean;
  initialValues?: Partial<HotelSearchParams>;
  compact?: boolean;
}

interface FormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

interface FormErrors {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
  rooms?: string;
}

// Popular destinations for autocomplete
const POPULAR_DESTINATIONS = [
  { id: 'sao-paulo', name: 'São Paulo, Brasil', type: 'city' as const },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro, Brasil', type: 'city' as const },
  { id: 'salvador', name: 'Salvador, Brasil', type: 'city' as const },
  { id: 'brasilia', name: 'Brasília, Brasil', type: 'city' as const },
  { id: 'belo-horizonte', name: 'Belo Horizonte, Brasil', type: 'city' as const },
  { id: 'fortaleza', name: 'Fortaleza, Brasil', type: 'city' as const },
  { id: 'recife', name: 'Recife, Brasil', type: 'city' as const },
  { id: 'porto-alegre', name: 'Porto Alegre, Brasil', type: 'city' as const },
  { id: 'curitiba', name: 'Curitiba, Brasil', type: 'city' as const },
  { id: 'manaus', name: 'Manaus, Brasil', type: 'city' as const },
  { id: 'miami', name: 'Miami, EUA', type: 'city' as const },
  { id: 'new-york', name: 'Nova York, EUA', type: 'city' as const },
  { id: 'orlando', name: 'Orlando, EUA', type: 'city' as const },
  { id: 'las-vegas', name: 'Las Vegas, EUA', type: 'city' as const },
  { id: 'los-angeles', name: 'Los Angeles, EUA', type: 'city' as const }
];

export default function HotelSearchForm({ 
  onSearch, 
  isLoading = false, 
  initialValues = {},
  compact = false 
}: HotelSearchFormProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return {
      destination: initialValues.destination || '',
      checkIn: initialValues.checkIn?.toISOString().split('T')[0] || tomorrow.toISOString().split('T')[0],
      checkOut: initialValues.checkOut?.toISOString().split('T')[0] || dayAfterTomorrow.toISOString().split('T')[0],
      adults: initialValues.adults || 2,
      children: initialValues.children || 0,
      childrenAges: initialValues.childrenAges || [],
      rooms: initialValues.rooms || 1
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(POPULAR_DESTINATIONS);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  // Filter destinations based on input
  useEffect(() => {
    if (formData.destination.length > 0) {
      const filtered = POPULAR_DESTINATIONS.filter(dest =>
        dest.name.toLowerCase().includes(formData.destination.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(POPULAR_DESTINATIONS);
    }
  }, [formData.destination]);

  // Update children ages array when children count changes
  useEffect(() => {
    if (formData.children !== formData.childrenAges.length) {
      const newAges = Array(formData.children).fill(0).map((_, index) => 
        formData.childrenAges[index] || 8
      );
      setFormData((prev: any) => ({ ...prev, childrenAges: newAges }));
    }
  }, [formData.children, formData.childrenAges.length]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Destination validation
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destino é obrigatório';
    }

    // Date validation
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      newErrors.checkIn = 'Data de entrada deve ser hoje ou posterior';
    }

    if (checkOutDate <= checkInDate) {
      newErrors.checkOut = 'Data de saída deve ser posterior à entrada';
    }

    // Guest validation
    if (formData.adults < 1) {
      newErrors.adults = 'Pelo menos 1 adulto é obrigatório';
    }

    if (formData.adults > 8) {
      newErrors.adults = 'Máximo 8 adultos';
    }

    if (formData.children > 8) {
      newErrors.children = 'Máximo 8 crianças';
    }

    // Room validation
    if (formData.rooms < 1) {
      newErrors.rooms = 'Pelo menos 1 quarto é obrigatório';
    }

    if (formData.rooms > 5) {
      newErrors.rooms = 'Máximo 5 quartos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const searchParams: HotelSearchParams = {
      destination: formData.destination,
      destinationType: 'city',
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      adults: formData.adults,
      children: formData.children,
      childrenAges: formData.childrenAges,
      rooms: formData.rooms,
      currency: 'BRL'
    };

    onSearch(searchParams);
  };

  const handleDestinationSelect = (destination: typeof POPULAR_DESTINATIONS[0]) => {
    setFormData((prev: any) => ({ ...prev, destination: destination.name }));
    setShowDestinationSuggestions(false);
  };

  const updateGuests = (type: 'adults' | 'children' | 'rooms', increment: boolean) => {
    setFormData((prev: any) => {
      const newValue = increment ? prev[type] + 1 : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1);
      return { ...prev, [type]: newValue };
    });
  };

  const updateChildAge = (index: number, age: number) => {
    setFormData((prev: any) => ({
      ...prev,
      childrenAges: prev.childrenAges.map((currentAge: number, i: number) => i === index ? age : currentAge)
    }));
  };

  const guestSummary = `${formData.adults} adulto${formData.adults > 1 ? 's' : ''}${
    formData.children > 0 ? `, ${formData.children} criança${formData.children > 1 ? 's' : ''}` : ''
  }, ${formData.rooms} quarto${formData.rooms > 1 ? 's' : ''}`;

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="search-form-compact">
        <div className="search-row">
          <div className="search-field">
            <input
              type="text"
              placeholder="Para onde?"
              value={formData.destination}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, destination: e.target.value }))}
              className={`search-input ${errors.destination ? 'error' : ''}`}
            />
          </div>
          
          <div className="search-field date-field">
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, checkIn: e.target.value }))}
              className={`search-input ${errors.checkIn ? 'error' : ''}`}
            />
          </div>
          
          <div className="search-field date-field">
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, checkOut: e.target.value }))}
              className={`search-input ${errors.checkOut ? 'error' : ''}`}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="search-button compact"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>
        
        <style jsx={true}>{`
          .search-form-compact {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .search-row {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          
          .search-field {
            flex: 1;
          }
          
          .date-field {
            flex: 0 0 140px;
          }
          
          .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid rgba(30, 64, 175, 0.1);
            border-radius: 12px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          }
          
          .search-input.error {
            border-color: #ef4444;
          }
          
          .search-button {
            background: linear-gradient(135deg, #1e40af 0%, #a21caf 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .search-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
          }
          
          .search-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          @media (max-width: 768px) {
            .search-row {
              flex-direction: column;
            }
            
            .search-field,
            .date-field {
              flex: 1;
              width: 100%;
            }
          }
        `}</style>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="hotel-search-form">
      <div className="form-header">
        <h2>🏨 Buscar Hotéis</h2>
        <p>Encontre o hotel perfeito para sua estadia</p>
      </div>

      <div className="form-grid">
        {/* Destination Field */}
        <div className="form-field destination-field">
          <label className="form-label">
            <MapPin size={18} />
            Destino
          </label>
          <div className="input-container">
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={formData.destination}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev: any) => ({ ...prev, destination: e.target.value }));
                setShowDestinationSuggestions(true);
              }}
              onFocus={() => setShowDestinationSuggestions(true)}
              className={`form-input ${errors.destination ? 'error' : ''}`}
            />
            {errors.destination && (
              <span className="error-message">{errors.destination}</span>
            )}
            
            {/* Destination Suggestions */}
            {showDestinationSuggestions && filteredDestinations.length > 0 && (
              <div className="suggestions-dropdown">
                {filteredDestinations.slice(0, 8).map((destination) => (
                  <button
                    key={destination.id}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleDestinationSelect(destination)}
                  >
                    <MapPin size={16} />
                    <span>{destination.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-in Date */}
        <div className="form-field">
          <label className="form-label">
            <Calendar size={18} />
            Check-in
          </label>
          <input
            type="date"
            value={formData.checkIn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, checkIn: e.target.value }))}
            className={`form-input ${errors.checkIn ? 'error' : ''}`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.checkIn && (
            <span className="error-message">{errors.checkIn}</span>
          )}
        </div>

        {/* Check-out Date */}
        <div className="form-field">
          <label className="form-label">
            <Calendar size={18} />
            Check-out
          </label>
          <input
            type="date"
            value={formData.checkOut}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, checkOut: e.target.value }))}
            className={`form-input ${errors.checkOut ? 'error' : ''}`}
            min={formData.checkIn}
          />
          {errors.checkOut && (
            <span className="error-message">{errors.checkOut}</span>
          )}
        </div>

        {/* Guests & Rooms */}
        <div className="form-field guests-field">
          <label className="form-label">
            <Users size={18} />
            Hóspedes e Quartos
          </label>
          <div className="input-container">
            <button
              type="button"
              className="guests-selector"
              onClick={() => setShowGuestSelector(!showGuestSelector)}
            >
              {guestSummary}
            </button>
            
            {showGuestSelector && (
              <div className="guests-dropdown">
                {/* Adults */}
                <div className="guest-row">
                  <div className="guest-info">
                    <span className="guest-type">Adultos</span>
                    <span className="guest-description">18+ anos</span>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('adults', false)}
                      disabled={formData.adults <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="guest-count">{formData.adults}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('adults', true)}
                      disabled={formData.adults >= 8}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="guest-row">
                  <div className="guest-info">
                    <span className="guest-type">Crianças</span>
                    <span className="guest-description">0-17 anos</span>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('children', false)}
                      disabled={formData.children <= 0}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="guest-count">{formData.children}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('children', true)}
                      disabled={formData.children >= 8}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Children Ages */}
                {formData.children > 0 && (
                  <div className="children-ages">
                    <span className="ages-label">Idade das crianças:</span>
                    <div className="ages-grid">
                      {formData.childrenAges.map((age, index) => (
                        <select
                          key={index}
                          value={age}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateChildAge(index, parseInt(e.target.value))}
                          className="age-select"
                        >
                          {Array.from({ length: 18 }, (_, i) => (
                            <option key={i} value={i}>{i} anos</option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rooms */}
                <div className="guest-row">
                  <div className="guest-info">
                    <span className="guest-type">Quartos</span>
                    <span className="guest-description">Máximo 5</span>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('rooms', false)}
                      disabled={formData.rooms <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="guest-count">{formData.rooms}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests('rooms', true)}
                      disabled={formData.rooms >= 5}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="guests-done"
                  onClick={() => setShowGuestSelector(false)}
                >
                  Pronto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="search-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Buscando...
          </>
        ) : (
          <>
            <Search size={20} />
            Buscar Hotéis
          </>
        )}
      </button>

      {/* Click outside handler */}
      {(showDestinationSuggestions || showGuestSelector) && (
        <div 
          className="backdrop"
          onClick={() => {
            setShowDestinationSuggestions(false);
            setShowGuestSelector(false);
          }}
        />
      )}

      <style jsx={true}>{`
        .hotel-search-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .form-header h2 {
          font-size: 32px;
          font-weight: bold;
          background: linear-gradient(135deg, #1e40af 0%, #a21caf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }
        
        .form-header p {
          color: #64748b;
          font-size: 16px;
          margin: 0;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .form-field {
          position: relative;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .input-container {
          position: relative;
        }
        
        .form-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(30, 64, 175, 0.1);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.1);
        }
        
        .form-input.error {
          border-color: #ef4444;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
        
        /* Destination Suggestions */
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 4px;
        }
        
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: 14px;
        }
        
        .suggestion-item:hover {
          background: #f3f4f6;
        }
        
        /* Guests Selector */
        .guests-selector {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(30, 64, 175, 0.1);
          border-radius: 16px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
        }
        
        .guests-selector:hover {
          border-color: #1e40af;
        }
        
        .guests-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          padding: 20px;
          margin-top: 4px;
        }
        
        .guest-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .guest-row:last-of-type {
          border-bottom: none;
        }
        
        .guest-info {
          display: flex;
          flex-direction: column;
        }
        
        .guest-type {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .guest-description {
          color: #64748b;
          font-size: 12px;
        }
        
        .guest-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .guest-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .guest-btn:hover:not(:disabled) {
          border-color: #1e40af;
          background: #f0f9ff;
        }
        
        .guest-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .guest-count {
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }
        
        .children-ages {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }
        
        .ages-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 8px;
        }
        
        .ages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        }
        
        .age-select {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .guests-done {
          width: 100%;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px;
          margin-top: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }
        
        .guests-done:hover {
          background: #1d4ed8;
        }
        
        /* Search Button */
        .search-submit {
          width: 100%;
          background: linear-gradient(135deg, #1e40af 0%, #a21caf 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 20px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .search-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
        }
        
        .search-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }
        
        @media (max-width: 768px) {
          .hotel-search-form {
            padding: 20px;
            margin: 16px;
            border-radius: 16px;
          }
          
          .form-header h2 {
            font-size: 24px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .suggestions-dropdown,
          .guests-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 16px 16px 0 0;
            max-height: 50vh;
          }
        }
      `}</style>
    </form>
  );
}