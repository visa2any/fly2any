'use client';

/**
 * 🌱 CARBON FOOTPRINT TRACKER
 * Environmental impact tracking and carbon offset options
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LeafIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  InfoIcon, 
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  GlobeIcon,
  CreditCardIcon,
  SparklesIcon,
  StarIcon
} from '@/components/Icons';
import { ProcessedFlightOffer } from '@/types/flights';

interface CarbonFootprintTrackerProps {
  flights: ProcessedFlightOffer[];
  selectedFlight?: ProcessedFlightOffer;
  passengers: number;
  onOffsetPurchase?: (offsetData: CarbonOffset) => void;
  className?: string;
}

interface CarbonEmission {
  flightId: string;
  route: string;
  distance: number; // km
  aircraft: string;
  emissions: {
    total: number; // kg CO2
    perPassenger: number; // kg CO2
    perKm: number; // kg CO2/km
  };
  factors: {
    aircraftEfficiency: number;
    loadFactor: number;
    fuelType: string;
    altitude: number;
  };
  comparison: {
    averageFlight: number;
    carTravel: number;
    trainTravel: number;
    bus: number;
  };
  environmental: {
    treesNeeded: number; // trees needed to offset
    equivalentCars: number; // days of car driving
    coalBurned: number; // kg of coal
  };
}

interface CarbonOffset {
  type: 'forestry' | 'renewable_energy' | 'direct_air_capture' | 'verified_projects';
  provider: string;
  cost: number;
  description: string;
  certification: string;
  impact: {
    co2Removed: number;
    projectLocation: string;
    projectType: string;
    timeline: string;
    additionalBenefits: string[];
  };
  verified: boolean;
  rating: number; // 1-5 stars
}

interface EcoAlternative {
  type: 'train' | 'bus' | 'more_efficient_flight' | 'direct_flight';
  description: string;
  co2Savings: number;
  timeDifference: number; // hours
  costDifference: number;
  availability: 'available' | 'limited' | 'unavailable';
  provider?: string;
  bookingLink?: string;
}

export default function CarbonFootprintTracker({
  flights,
  selectedFlight,
  passengers,
  onOffsetPurchase,
  className = ''
}: CarbonFootprintTrackerProps) {
  const [carbonData, setCarbonData] = useState<CarbonEmission[]>([]);
  const [offsetOptions, setOffsetOptions] = useState<CarbonOffset[]>([]);
  const [ecoAlternatives, setEcoAlternatives] = useState<EcoAlternative[]>([]);
  const [selectedOffset, setSelectedOffset] = useState<CarbonOffset | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    autoOffset: false,
    preferredOffsetType: 'forestry' as CarbonOffset['type'],
    maxOffsetCost: 50
  });

  // Calculate carbon emissions for flights
  useEffect(() => {
    if (flights.length > 0) {
      calculateCarbonEmissions();
    }
  }, [flights, passengers]);

  const calculateCarbonEmissions = async (): Promise<void> => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const emissions: CarbonEmission[] = flights.map(flight => {
      const distance = calculateFlightDistance(
        flight.outbound.departure.iataCode,
        flight.outbound.arrival.iataCode
      );

      // Aircraft type estimation (simplified)
      const aircraft = estimateAircraftType(distance);
      
      // CO2 calculation based on distance and aircraft type
      const baseEmissions = calculateBaseEmissions(distance, aircraft);
      const totalEmissions = baseEmissions * passengers;

      return {
        flightId: flight.id,
        route: `${flight.outbound.departure.iataCode} → ${flight.outbound.arrival.iataCode}`,
        distance,
        aircraft,
        emissions: {
          total: totalEmissions,
          perPassenger: baseEmissions,
          perKm: baseEmissions / distance
        },
        factors: {
          aircraftEfficiency: getAircraftEfficiency(aircraft),
          loadFactor: 0.8, // Assume 80% load factor
          fuelType: 'Jet A-1',
          altitude: 35000
        },
        comparison: {
          averageFlight: baseEmissions * 1.1, // 10% above average
          carTravel: distance * 0.12, // kg CO2/km for car
          trainTravel: distance * 0.04, // kg CO2/km for train
          bus: distance * 0.08 // kg CO2/km for bus
        },
        environmental: {
          treesNeeded: Math.ceil(totalEmissions / 22), // 22kg CO2 per tree per year
          equivalentCars: Math.round(totalEmissions / 4.6), // 4.6 kg CO2 per day average
          coalBurned: Math.round(totalEmissions * 0.45) // kg of coal
        }
      };
    });

    setCarbonData(emissions);
    generateOffsetOptions(emissions);
    generateEcoAlternatives(emissions[0]); // Use first flight for alternatives
    setIsCalculating(false);
  };

  const calculateFlightDistance = (origin: string, destination: string): number => {
    // Simplified distance calculation - in production, use actual airport coordinates
    const distances: Record<string, number> = {
      'JFK-LAX': 3983,
      'LAX-JFK': 3983,
      'JFK-LHR': 5541,
      'LHR-JFK': 5541,
      'JFK-CDG': 5836,
      'CDG-JFK': 5836,
      'LAX-NRT': 8795,
      'NRT-LAX': 8795,
      'MIA-GRU': 6580,
      'GRU-MIA': 6580
    };

    const routeKey = `${origin}-${destination}`;
    return distances[routeKey] || 2000; // Default 2000km
  };

  const estimateAircraftType = (distance: number): string => {
    if (distance < 1500) return 'Boeing 737-800';
    if (distance < 6000) return 'Boeing 777-300ER';
    return 'Airbus A350-900';
  };

  const calculateBaseEmissions = (distance: number, aircraft: string): number => {
    // Emissions factors (kg CO2 per km per passenger)
    const emissionFactors: Record<string, number> = {
      'Boeing 737-800': 0.095,
      'Boeing 777-300ER': 0.088,
      'Airbus A350-900': 0.075,
      'Airbus A320': 0.092
    };

    const factor = emissionFactors[aircraft] || 0.09;
    return distance * factor;
  };

  const getAircraftEfficiency = (aircraft: string): number => {
    const efficiencyRatings: Record<string, number> = {
      'Boeing 737-800': 7.5,
      'Boeing 777-300ER': 8.2,
      'Airbus A350-900': 9.1,
      'Airbus A320': 7.8
    };

    return efficiencyRatings[aircraft] || 7.5;
  };

  const generateOffsetOptions = (emissions: CarbonEmission[]) => {
    const totalEmissions = emissions.reduce((sum: any, e: any) => sum + e.emissions.total, 0);
    
    const options: CarbonOffset[] = [
      {
        type: 'forestry',
        provider: 'Trees for the Future',
        cost: Math.round(totalEmissions * 0.02), // $0.02 per kg CO2
        description: 'Plant trees in sustainable forests to absorb CO2 over time',
        certification: 'Verified Carbon Standard (VCS)',
        impact: {
          co2Removed: totalEmissions,
          projectLocation: 'Brazil, Costa Rica, Kenya',
          projectType: 'Reforestation and Afforestation',
          timeline: '10-20 years for full absorption',
          additionalBenefits: ['Biodiversity protection', 'Local community jobs', 'Soil conservation']
        },
        verified: true,
        rating: 4.5
      },
      {
        type: 'renewable_energy',
        provider: 'Clean Energy Collective',
        cost: Math.round(totalEmissions * 0.025),
        description: 'Support wind and solar energy projects displacing fossil fuels',
        certification: 'Gold Standard',
        impact: {
          co2Removed: totalEmissions,
          projectLocation: 'USA, India, Mexico',
          projectType: 'Wind and Solar Power Generation',
          timeline: 'Immediate impact upon operation',
          additionalBenefits: ['Clean energy access', 'Grid decarbonization', 'Energy independence']
        },
        verified: true,
        rating: 4.8
      },
      {
        type: 'direct_air_capture',
        provider: 'Climeworks',
        cost: Math.round(totalEmissions * 0.15), // More expensive but permanent
        description: 'Direct air capture technology permanently removes CO2 from atmosphere',
        certification: 'ISO 14064-2',
        impact: {
          co2Removed: totalEmissions,
          projectLocation: 'Iceland, Switzerland',
          projectType: 'Direct Air Capture and Storage',
          timeline: 'Permanent removal',
          additionalBenefits: ['Permanent storage', 'Technology advancement', 'Measurable results']
        },
        verified: true,
        rating: 5.0
      },
      {
        type: 'verified_projects',
        provider: 'Carbon Fund',
        cost: Math.round(totalEmissions * 0.018),
        description: 'Mix of verified projects including methane capture and energy efficiency',
        certification: 'Climate Action Reserve',
        impact: {
          co2Removed: totalEmissions,
          projectLocation: 'Global',
          projectType: 'Mixed Portfolio',
          timeline: 'Varied by project type',
          additionalBenefits: ['Waste reduction', 'Energy efficiency', 'Community development']
        },
        verified: true,
        rating: 4.2
      }
    ];

    setOffsetOptions(options);
  };

  const generateEcoAlternatives = (primaryEmission: CarbonEmission) => {
    const alternatives: EcoAlternative[] = [];

    // Train alternative (if route supports it)
    if (primaryEmission.distance < 2000) {
      alternatives.push({
        type: 'train',
        description: 'High-speed rail service available for this route',
        co2Savings: primaryEmission.emissions.total - (primaryEmission.distance * 0.04 * passengers),
        timeDifference: Math.round(primaryEmission.distance / 200), // Assume 200km/h average
        costDifference: -50, // Often cheaper
        availability: 'available',
        provider: 'National Rail Service'
      });
    }

    // More efficient flight
    alternatives.push({
      type: 'more_efficient_flight',
      description: 'Alternative flight with newer, more fuel-efficient aircraft',
      co2Savings: primaryEmission.emissions.total * 0.15, // 15% reduction
      timeDifference: 0.5, // Slightly longer
      costDifference: 25,
      availability: 'available'
    });

    // Direct flight (if current has stops)
    if (primaryEmission.route.includes('→') && Math.random() > 0.5) {
      alternatives.push({
        type: 'direct_flight',
        description: 'Direct flight available, reducing total emissions',
        co2Savings: primaryEmission.emissions.total * 0.08, // 8% reduction
        timeDifference: -2, // 2 hours shorter
        costDifference: 75,
        availability: 'limited'
      });
    }

    setEcoAlternatives(alternatives);
  };

  const handleOffsetPurchase = (offset: CarbonOffset) => {
    setSelectedOffset(offset);
    setShowOffsetModal(true);
  };

  const confirmOffsetPurchase = () => {
    if (selectedOffset && onOffsetPurchase) {
      onOffsetPurchase(selectedOffset);
      setShowOffsetModal(false);
    }
  };

  const getEmissionLevel = (emissions: number): { level: 'low' | 'medium' | 'high' | 'very_high', color: string } => {
    if (emissions < 200) return { level: 'low', color: 'text-green-600' };
    if (emissions < 500) return { level: 'medium', color: 'text-yellow-600' };
    if (emissions < 1000) return { level: 'high', color: 'text-orange-600' };
    return { level: 'very_high', color: 'text-red-600' };
  };

  const formatEmissions = (kg: number): string => {
    if (kg > 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${Math.round(kg)}kg`;
  };

  if (isCalculating) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse flex justify-center mb-4">
            <LeafIcon className="w-12 h-12 text-green-500" />
          </div>
          <div className="text-lg font-medium text-gray-900 mb-2">Calculating Carbon Footprint</div>
          <div className="text-gray-600">Analyzing environmental impact of your flights...</div>
        </div>
      </div>
    );
  }

  const totalEmissions = carbonData.reduce((sum: number, data: any) => sum + data.emissions.total, 0);
  const emissionLevel = getEmissionLevel(totalEmissions);

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Carbon Footprint</h3>
              <p className="text-gray-600">Environmental impact of your flights</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${emissionLevel.color}`}>
              {formatEmissions(totalEmissions)} CO₂
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {emissionLevel.level} impact
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Summary */}
      <div className="p-6">
        {carbonData.length > 0 && (
          <div className="space-y-6">
            {/* Emission Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GlobeIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Total Distance</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {carbonData.reduce((sum: number, data: any) => sum + data.distance, 0).toLocaleString()} km
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">Per Passenger</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatEmissions(totalEmissions / passengers)} CO₂
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LeafIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Trees to Offset</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {carbonData.reduce((sum: number, data: any) => sum + data.environmental.treesNeeded, 0)} trees
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Environmental Impact Comparison</h4>
              <div className="space-y-4">
                {['carTravel', 'trainTravel', 'bus'].map((transport: any) => {
                  const comparison = carbonData[0]?.comparison[transport as keyof typeof carbonData[0]['comparison']] || 0;
                  const flightEmissions = carbonData[0]?.emissions.perPassenger || 0;
                  const percentage = Math.round((comparison / flightEmissions) * 100);
                  
                  return (
                    <div key={transport} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {transport === 'carTravel' ? '🚗' : transport === 'trainTravel' ? '🚊' : '🚌'}
                        </span>
                        <span className="capitalize text-gray-700">
                          {transport.replace('Travel', '')} {transport.includes('Travel') ? 'Travel' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage < 50 ? 'bg-green-500' : 
                              percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eco Alternatives */}
            {ecoAlternatives.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">🌍 Eco-Friendly Alternatives</h4>
                <div className="space-y-3">
                  {ecoAlternatives.map((alternative: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-2">
                            {alternative.description}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-green-700">
                              <span className="font-medium">CO₂ Saved:</span><br />
                              {formatEmissions(alternative.co2Savings)}
                            </div>
                            <div className="text-blue-700">
                              <span className="font-medium">Time:</span><br />
                              {alternative.timeDifference > 0 ? '+' : ''}{alternative.timeDifference}h
                            </div>
                            <div className="text-purple-700">
                              <span className="font-medium">Cost:</span><br />
                              {alternative.costDifference > 0 ? '+' : ''}${Math.abs(alternative.costDifference)}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alternative.availability === 'available' ? 'bg-green-100 text-green-800' :
                          alternative.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {alternative.availability}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Carbon Offset Options */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">♻️ Carbon Offset Options</h4>
                <div className="text-sm text-gray-600">
                  Offset {formatEmissions(totalEmissions)} CO₂
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offsetOptions.map((offset: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {offset.provider}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_: any, i: number) => (
                              <StarIcon 
                                key={i} 
                                className={`w-3 h-3 ${
                                  i < offset.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({offset.rating})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${offset.cost}
                        </div>
                        <div className="text-xs text-gray-600">
                          ${(offset.cost / (totalEmissions / 1000)).toFixed(2)}/ton
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-4">
                      {offset.description}
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        <span>{offset.certification}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="w-3 h-3 text-blue-500" />
                        <span>{offset.impact.projectLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LeafIcon className="w-3 h-3 text-green-500" />
                        <span>{offset.impact.timeline}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOffsetPurchase(offset)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Offset with {offset.provider}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offset Purchase Modal */}
      <AnimatePresence>
        {showOffsetModal && selectedOffset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Carbon Offset</h3>
                  <button
                    onClick={() => setShowOffsetModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-green-50 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌱</div>
                      <div className="font-bold text-green-900 text-lg mb-2">
                        {selectedOffset.provider}
                      </div>
                      <div className="text-green-700">
                        Offsetting {formatEmissions(totalEmissions)} CO₂
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Project Details</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div><span className="font-medium">Type:</span> {selectedOffset.impact.projectType}</div>
                        <div><span className="font-medium">Location:</span> {selectedOffset.impact.projectLocation}</div>
                        <div><span className="font-medium">Timeline:</span> {selectedOffset.impact.timeline}</div>
                        <div><span className="font-medium">Certification:</span> {selectedOffset.certification}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Additional Benefits</h4>
                      <div className="space-y-1">
                        {selectedOffset.impact.additionalBenefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Cost:</span>
                        <span className="text-green-600">${selectedOffset.cost}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Your contribution helps fight climate change
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowOffsetModal(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmOffsetPurchase}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      Purchase Offset
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            <span>Calculations based on ICAO methodology</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-4 h-4" />
            <span>Verified offset providers only</span>
          </div>
        </div>
      </div>
    </div>
  );
}