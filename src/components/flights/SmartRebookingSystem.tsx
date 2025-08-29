'use client';

/**
 * 🔄 SMART REBOOKING SYSTEM
 * AI-powered automatic rebooking for flight disruptions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  RefreshIcon, 
  PhoneIcon, 
  MailIcon,
  ZapIcon,
  ShieldIcon,
  CreditCardIcon,
  CalendarIcon,
  FlightIcon
} from '@/components/Icons';

interface SmartRebookingSystemProps {
  bookingId: string;
  originalFlight: FlightBooking;
  disruption: FlightDisruption;
  onRebookingComplete: (newBooking: FlightBooking) => void;
  className?: string;
}

interface FlightBooking {
  id: string;
  passengerName: string;
  confirmationCode: string;
  flight: {
    number: string;
    airline: string;
    departure: {
      airport: string;
      time: Date;
      gate?: string;
    };
    arrival: {
      airport: string;
      time: Date;
      gate?: string;
    };
    status: 'on_time' | 'delayed' | 'cancelled' | 'boarding' | 'departed';
  };
  seat?: string;
  services: string[];
  price: number;
  bookingClass: string;
}

interface FlightDisruption {
  type: 'delay' | 'cancellation' | 'gate_change' | 'aircraft_change' | 'weather' | 'strike';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  reason: string;
  estimatedDelay?: number; // minutes
  newDepartureTime?: Date;
  affectedServices: string[];
  compensation?: {
    type: 'voucher' | 'refund' | 'upgrade' | 'miles';
    amount: number;
    description: string;
  };
  alternativeOptions: AlternativeOption[];
}

interface AlternativeOption {
  id: string;
  type: 'same_day' | 'next_day' | 'different_route' | 'different_airline';
  flight: {
    number: string;
    airline: string;
    departure: {
      airport: string;
      time: Date;
    };
    arrival: {
      airport: string;
      time: Date;
    };
    duration: number;
    stops: number;
  };
  price: {
    difference: number; // positive = additional cost, negative = refund
    total: number;
  };
  pros: string[];
  cons: string[];
  aiRecommendation: number; // 0-100 score
  availableSeats: number;
  bookingClass: string;
}

interface RebookingStrategy {
  type: 'automatic' | 'assisted' | 'manual';
  confidence: number;
  reasoning: string;
  estimatedTime: number; // minutes
  actions: RebookingAction[];
}

interface RebookingAction {
  type: 'book_alternative' | 'request_compensation' | 'notify_passenger' | 'update_services' | 'process_refund';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
}

export default function SmartRebookingSystem({
  bookingId,
  originalFlight,
  disruption,
  onRebookingComplete,
  className = ''
}: SmartRebookingSystemProps) {
  const [rebookingStrategy, setRebookingStrategy] = useState<RebookingStrategy | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<AlternativeOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rebookingStatus, setRebookingStatus] = useState<'analyzing' | 'options' | 'processing' | 'completed' | 'failed'>('analyzing');
  const [passengerPreferences, setPassengerPreferences] = useState({
    prioritizeTime: true,
    acceptStops: false,
    maxAdditionalCost: 200,
    preferSameAirline: true,
    autoRebook: false
  });

  // Analyze disruption and generate rebooking strategy
  useEffect(() => {
    analyzeDisruptionAndGenerateStrategy();
  }, [disruption]);

  const analyzeDisruptionAndGenerateStrategy = async (): Promise<void> => {
    setRebookingStatus('analyzing');
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const strategy = generateRebookingStrategy(disruption, originalFlight);
    setRebookingStrategy(strategy);
    setRebookingStatus('options');
  };

  const generateRebookingStrategy = (disruption: FlightDisruption, originalFlight: FlightBooking): RebookingStrategy => {
    let confidence = 0.8;
    let type: RebookingStrategy['type'] = 'assisted';
    let estimatedTime = 15;

    // Determine strategy based on disruption severity and passenger profile
    if (disruption.severity === 'minor' && disruption.alternativeOptions.length > 0) {
      type = 'automatic';
      confidence = 0.9;
      estimatedTime = 5;
    } else if (disruption.severity === 'severe') {
      type = 'manual';
      confidence = 0.6;
      estimatedTime = 45;
    }

    const actions: RebookingAction[] = [
      {
        type: 'notify_passenger',
        description: 'Send disruption notification with options',
        status: 'completed',
        result: 'SMS and email sent'
      },
      {
        type: 'book_alternative',
        description: 'Book best alternative flight',
        status: 'pending'
      }
    ];

    if (disruption.compensation) {
      actions.push({
        type: 'request_compensation',
        description: `Process ${disruption.compensation.type} compensation`,
        status: 'pending'
      });
    }

    return {
      type,
      confidence,
      reasoning: generateRebookingReasoning(disruption, type),
      estimatedTime,
      actions
    };
  };

  const generateRebookingReasoning = (disruption: FlightDisruption, strategyType: RebookingStrategy['type']): string => {
    switch (strategyType) {
      case 'automatic':
        return `Minor ${disruption.type} detected. AI found excellent alternative with minimal impact. Auto-booking recommended.`;
      case 'assisted':
        return `${disruption.type} requires passenger input. Multiple good options available. AI will guide through selection.`;
      case 'manual':
        return `Complex ${disruption.type} situation. Limited alternatives available. Human agent assistance recommended.`;
      default:
        return 'Analyzing best rebooking approach...';
    }
  };

  const handleAutomaticRebooking = async (): Promise<void> => {
    if (!disruption.alternativeOptions.length) return;

    setIsProcessing(true);
    setRebookingStatus('processing');

    try {
      // Select best alternative based on AI scoring
      const bestOption = disruption.alternativeOptions.reduce((best: any, current: any) => 
        current.aiRecommendation > best.aiRecommendation ? current : best
      );

      setSelectedAlternative(bestOption);

      // Simulate booking process
      await processRebooking(bestOption);
      
      setRebookingStatus('completed');
    } catch (error) {
      console.error('Automatic rebooking failed:', error);
      setRebookingStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSelection = async (option: AlternativeOption) => {
    setSelectedAlternative(option);
    setIsProcessing(true);
    setRebookingStatus('processing');

    try {
      await processRebooking(option);
      setRebookingStatus('completed');
    } catch (error) {
      console.error('Manual rebooking failed:', error);
      setRebookingStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const processRebooking = async (option: AlternativeOption) => {
    const actions = rebookingStrategy?.actions || [];
    
    // Process each action
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      action.status = 'in_progress';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action.type) {
        case 'book_alternative':
          action.result = `Booked ${option.flight.airline} ${option.flight.number}`;
          break;
        case 'request_compensation':
          action.result = `${disruption.compensation?.type} processed: $${disruption.compensation?.amount}`;
          break;
        case 'update_services':
          action.result = 'Seat and meal preferences transferred';
          break;
      }
      
      action.status = 'completed';
    }

    // Create new booking
    const newBooking: FlightBooking = {
      ...originalFlight,
      id: `${originalFlight.id}_reboked`,
      flight: {
        number: option.flight.number,
        airline: option.flight.airline,
        departure: {
          airport: option.flight.departure.airport,
          time: option.flight.departure.time
        },
        arrival: {
          airport: option.flight.arrival.airport,
          time: option.flight.arrival.time
        },
        status: 'on_time'
      },
      price: option.price.total
    };

    onRebookingComplete(newBooking);
  };

  const getDisruptionIcon = (type: FlightDisruption['type']) => {
    switch (type) {
      case 'cancellation':
        return '❌';
      case 'delay':
        return '⏰';
      case 'gate_change':
        return '🚪';
      case 'weather':
        return '🌧️';
      case 'strike':
        return '✊';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity: FlightDisruption['severity']) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'major':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'severe':
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-red-50">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{getDisruptionIcon(disruption.type)}</span>
          <div>
            <h3 className="text-xl font-bold text-red-900">Flight Disruption Detected</h3>
            <p className="text-red-700">
              {originalFlight.flight.airline} {originalFlight.flight.number} • {originalFlight.confirmationCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(disruption.severity)}`}>
            {disruption.severity} {disruption.type}
          </span>
          <span className="text-red-700 text-sm">{disruption.reason}</span>
        </div>
      </div>

      {/* Smart Rebooking Status */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ZapIcon className="w-6 h-6 text-blue-600" />
          <h4 className="text-lg font-bold text-gray-900">Smart Rebooking System</h4>
          <div className="ml-auto">
            {rebookingStatus === 'analyzing' && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">AI Analyzing...</span>
              </div>
            )}
            {rebookingStatus === 'completed' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-sm">Rebooked Successfully</span>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Analysis Phase */}
          {rebookingStatus === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">🤖</div>
              <div className="text-lg font-medium text-gray-900 mb-2">AI Analyzing Disruption</div>
              <div className="text-gray-600">
                Evaluating alternatives, checking availability, and calculating best options...
              </div>
            </motion.div>
          )}

          {/* Options Phase */}
          {rebookingStatus === 'options' && rebookingStrategy && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Strategy Recommendation */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <ShieldIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900 mb-2">
                      Recommended Strategy: {rebookingStrategy.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-blue-800 mb-3">{rebookingStrategy.reasoning}</div>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span>Confidence: {(rebookingStrategy.confidence * 100).toFixed(0)}%</span>
                      <span>Est. Time: {rebookingStrategy.estimatedTime}min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Rebooking Option */}
              {rebookingStrategy.type === 'automatic' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <ZapIcon className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 mb-2">Smart Auto-Rebooking Available</div>
                      <div className="text-green-800 mb-4">
                        AI found an excellent alternative that matches your preferences. 
                        We can automatically rebook you with one click.
                      </div>
                      <button
                        onClick={handleAutomaticRebooking}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Auto-Rebook Now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternative Options */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-4">Alternative Flight Options</h5>
                <div className="space-y-4">
                  {disruption.alternativeOptions.map((option: any, index: number) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FlightIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {option.flight.airline} {option.flight.number}
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.flight.departure.time.toLocaleString()} → {option.flight.arrival.time.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(option.aiRecommendation)}`}>
                            AI Score: {option.aiRecommendation}/100
                          </div>
                          <div className="text-lg font-bold text-gray-900 mt-1">
                            {option.price.difference > 0 ? '+' : ''}${option.price.difference}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-1 font-medium">{Math.floor(option.flight.duration / 60)}h {option.flight.duration % 60}m</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Stops:</span>
                          <span className="ml-1 font-medium">{option.flight.stops === 0 ? 'Direct' : `${option.flight.stops} stop${option.flight.stops > 1 ? 's' : ''}`}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Available seats:</span>
                          <span className="ml-1 font-medium">{option.availableSeats}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {option.pros.map((pro: any, i: number) => (
                          <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            ✓ {pro}
                          </span>
                        ))}
                        {option.cons.map((con: any, i: number) => (
                          <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            ⚠ {con}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleManualSelection(option)}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Select This Flight'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing Phase */}
          {rebookingStatus === 'processing' && rebookingStrategy && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <div className="text-lg font-medium text-gray-900 mb-2">Processing Rebooking</div>
                <div className="text-gray-600">Please wait while we secure your new flight...</div>
              </div>

              {/* Action Progress */}
              <div className="space-y-3">
                {rebookingStrategy.actions.map((action: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${
                      action.status === 'completed' ? 'bg-green-500' :
                      action.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                      action.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{action.description}</div>
                      {action.result && (
                        <div className="text-sm text-gray-600">{action.result}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed Phase */}
          {rebookingStatus === 'completed' && selectedAlternative && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-8 bg-green-50 rounded-xl">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-2xl font-bold text-green-900 mb-2">Rebooking Successful!</div>
                <div className="text-green-700">
                  Your new flight has been confirmed. All details sent via email and SMS.
                </div>
              </div>

              {/* New Flight Details */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h5 className="font-semibold text-blue-900 mb-4">Your New Flight</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Flight</div>
                    <div className="font-medium text-blue-900">
                      {selectedAlternative.flight.airline} {selectedAlternative.flight.number}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Departure</div>
                    <div className="font-medium text-blue-900">
                      {selectedAlternative.flight.departure.time.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Arrival</div>
                    <div className="font-medium text-blue-900">
                      {selectedAlternative.flight.arrival.time.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Price Difference</div>
                    <div className="font-medium text-blue-900">
                      {selectedAlternative.price.difference >= 0 ? '+' : ''}${selectedAlternative.price.difference}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              {disruption.compensation && (
                <div className="bg-purple-50 rounded-xl p-6">
                  <h5 className="font-semibold text-purple-900 mb-2">Compensation Applied</h5>
                  <div className="text-purple-800">
                    {disruption.compensation.description}: ${disruption.compensation.amount}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h5 className="font-semibold text-gray-900 mb-4">Next Steps</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">New boarding passes sent to your mobile wallet</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Calendar updated with new flight times</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Connecting flight automatically adjusted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Check-in opens 24 hours before departure</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Support Contact */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">Need help with your rebooking?</div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <PhoneIcon className="w-4 h-4" />
              <span>Call Support</span>
            </button>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <MailIcon className="w-4 h-4" />
              <span>Live Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}