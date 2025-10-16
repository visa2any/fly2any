'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AirportAutocomplete } from './AirportAutocomplete';
import { PriceDatePicker } from './PriceDatePicker';

interface Flight {
  from: string;
  to: string;
  date: string;
}

interface MultiCitySearchFormProps {
  onSearch: (flights: Flight[], passengers: { adults: number; children: number; infants: number }, travelClass: string) => void;
}

export function MultiCitySearchForm({ onSearch }: MultiCitySearchFormProps) {
  const [flights, setFlights] = useState<Flight[]>([
    { from: '', to: '', date: '' },
    { from: '', to: '', date: '' },
  ]);

  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [travelClass, setTravelClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');

  const addFlight = () => {
    if (flights.length < 6) {
      setFlights([...flights, { from: '', to: '', date: '' }]);
    }
  };

  const removeFlight = (index: number) => {
    if (flights.length > 2) {
      setFlights(flights.filter((_, i) => i !== index));
    }
  };

  const updateFlight = (index: number, field: keyof Flight, value: string) => {
    const newFlights = [...flights];
    newFlights[index][field] = value;
    setFlights(newFlights);
  };

  const handleSearch = () => {
    // Validate all flights
    const errors: string[] = [];
    flights.forEach((flight, index) => {
      if (!flight.from) errors.push(`Flight ${index + 1}: Please select origin`);
      if (!flight.to) errors.push(`Flight ${index + 1}: Please select destination`);
      if (!flight.date) errors.push(`Flight ${index + 1}: Please select date`);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    onSearch(flights, passengers, travelClass);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Multi-City Flights</h3>
        <span className="text-sm text-gray-600">{flights.length} flights</span>
      </div>

      {flights.map((flight, index) => (
        <Card key={index} variant="white" padding="md" className="relative">
          {flights.length > 2 && (
            <button
              onClick={() => removeFlight(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-error transition-colors"
              aria-label="Remove flight"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-bold">
                {index + 1}
              </span>
              <span className="font-semibold text-gray-700">Flight {index + 1}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <AirportAutocomplete
                  label=""
                  placeholder="Origin"
                  value={flight.from}
                  onChange={(val) => updateFlight(index, 'from', val)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <AirportAutocomplete
                  label=""
                  placeholder="Destination"
                  value={flight.to}
                  onChange={(val) => updateFlight(index, 'to', val)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <PriceDatePicker
                  label=""
                  value={flight.date}
                  onChange={(val) => updateFlight(index, 'date', val)}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}

      {flights.length < 6 && (
        <Button variant="outline" onClick={addFlight} className="w-full">
          + Add Another Flight
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Passengers"
          placeholder="1 Adult"
          value={`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`}
          readOnly
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Travel Class</label>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleSearch} className="py-4 text-lg">
        Search Multi-City Flights
      </Button>
    </div>
  );
}
