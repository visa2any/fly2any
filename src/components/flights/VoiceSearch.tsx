'use client';

/**
 * 🎤 VOICE SEARCH INTEGRATION
 * Advanced voice-to-flight search with natural language processing
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  VolumeUpIcon, 
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshIcon,
  SparklesIcon
} from '@/components/Icons';
import { FlightSearchFormData, AirportSelection } from '@/types/flights';

interface VoiceSearchProps {
  onSearchGenerated: (searchData: FlightSearchFormData) => void;
  onClose: () => void;
  className?: string;
}

interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  intent: 'flight_search' | 'hotel_search' | 'general_query' | 'unclear';
  extractedData: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    travelClass?: string;
    tripType?: 'one-way' | 'round-trip' | 'multi-city';
    flexibility?: {
      dates: boolean;
      airports: boolean;
    };
  };
  missingData: string[];
  suggestions: string[];
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceSearch({
  onSearchGenerated,
  onClose,
  className = ''
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Speech recognition not supported in this browser');
        return;
      }

      synthRef.current = window.speechSynthesis;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        addToConversation('system', 'Listening... You can say something like "Find flights from New York to Paris tomorrow"');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          addToConversation('user', finalTranscript.trim());
          analyzeVoiceInput(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const addToConversation = (type: 'user' | 'system', content: string) => {
    setConversationHistory(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const analyzeVoiceInput = async (input: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis (in production, this would call a real NLP service)
      const analysis = await processNaturalLanguage(input);
      setAnalysis(analysis);
      
      if (analysis.intent === 'flight_search') {
        if (analysis.missingData.length === 0) {
          // All required data is present, generate search
          const searchData = convertAnalysisToSearchData(analysis);
          addToConversation('system', `Perfect! I found all the details. Searching for ${analysis.extractedData.tripType} flights from ${analysis.extractedData.origin} to ${analysis.extractedData.destination}.`);
          setTimeout(() => onSearchGenerated(searchData), 1500);
        } else {
          // Ask for missing information
          const missingInfo = analysis.missingData.join(', ');
          const question = generateFollowUpQuestion(analysis.missingData[0]);
          addToConversation('system', question);
          speakResponse(question);
        }
      } else if (analysis.intent === 'unclear') {
        const clarification = "I didn't quite understand that. Try saying something like 'Find flights from New York to London next week for 2 passengers'";
        addToConversation('system', clarification);
        speakResponse(clarification);
      }
    } catch (error) {
      console.error('Voice analysis error:', error);
      setError('Failed to analyze voice input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processNaturalLanguage = async (input: string): Promise<VoiceAnalysis> => {
    // Simulate NLP processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerInput = input.toLowerCase();
    const analysis: VoiceAnalysis = {
      transcript: input,
      confidence: 0.8,
      intent: 'unclear',
      extractedData: {},
      missingData: [],
      suggestions: []
    };

    // Flight search intent detection
    const flightKeywords = ['flight', 'fly', 'book', 'ticket', 'travel', 'trip'];
    if (flightKeywords.some(keyword => lowerInput.includes(keyword))) {
      analysis.intent = 'flight_search';
      
      // Extract locations
      const locationPatterns = [
        /from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|on|tomorrow|next|in)/i,
        /([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|on|tomorrow|next|in)/i
      ];
      
      for (const pattern of locationPatterns) {
        const match = input.match(pattern);
        if (match) {
          analysis.extractedData.origin = match[1].trim();
          analysis.extractedData.destination = match[2].trim();
          break;
        }
      }

      // Extract dates
      const datePatterns = [
        /tomorrow/i,
        /next\s+(week|month|friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i,
        /on\s+(january|february|march|april|may|june|july|august|september|october|november|december|\d+)/i,
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i
      ];

      for (const pattern of datePatterns) {
        const match = input.match(pattern);
        if (match) {
          analysis.extractedData.departureDate = match[0];
          break;
        }
      }

      // Extract passengers
      const passengerMatch = input.match(/(\d+)\s+(passenger|person|people|adult)/i);
      if (passengerMatch) {
        analysis.extractedData.passengers = parseInt(passengerMatch[1]);
      }

      // Extract travel class
      const classKeywords = {
        'first class': 'FIRST',
        'business class': 'BUSINESS',
        'business': 'BUSINESS',
        'premium economy': 'PREMIUM_ECONOMY',
        'economy': 'ECONOMY'
      };

      for (const [keyword, classCode] of Object.entries(classKeywords)) {
        if (lowerInput.includes(keyword)) {
          analysis.extractedData.travelClass = classCode;
          break;
        }
      }

      // Determine trip type
      if (lowerInput.includes('round trip') || lowerInput.includes('return')) {
        analysis.extractedData.tripType = 'round-trip';
      } else if (lowerInput.includes('one way')) {
        analysis.extractedData.tripType = 'one-way';
      }

      // Check for flexibility
      if (lowerInput.includes('flexible') || lowerInput.includes('any date') || lowerInput.includes('anytime')) {
        analysis.extractedData.flexibility = { dates: true, airports: false };
      }

      // Determine missing data
      if (!analysis.extractedData.origin) analysis.missingData.push('origin');
      if (!analysis.extractedData.destination) analysis.missingData.push('destination');
      if (!analysis.extractedData.departureDate) analysis.missingData.push('departure date');
      if (!analysis.extractedData.tripType) analysis.extractedData.tripType = 'round-trip';
      if (!analysis.extractedData.passengers) analysis.extractedData.passengers = 1;
      if (!analysis.extractedData.travelClass) analysis.extractedData.travelClass = 'ECONOMY';
    }

    return analysis;
  };

  const generateFollowUpQuestion = (missingData: string): string => {
    switch (missingData) {
      case 'origin':
        return "Where would you like to fly from? Please tell me your departure city or airport.";
      case 'destination':
        return "Where would you like to go? Please tell me your destination city.";
      case 'departure date':
        return "When would you like to travel? You can say dates like 'tomorrow', 'next Friday', or 'March 15th'.";
      case 'return date':
        return "When would you like to return? Or would you prefer a one-way ticket?";
      default:
        return "Could you provide more details about your travel plans?";
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a pleasant voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      synthRef.current.speak(utterance);
    }
  };

  const convertAnalysisToSearchData = (analysis: VoiceAnalysis): FlightSearchFormData => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const returnDate = new Date(tomorrow);
    returnDate.setDate(returnDate.getDate() + 7); // Default 7 days later

    return {
      tripType: analysis.extractedData.tripType || 'round-trip',
      origin: createAirportSelection(analysis.extractedData.origin || ''),
      destination: createAirportSelection(analysis.extractedData.destination || ''),
      departureDate: parseDateString(analysis.extractedData.departureDate) || tomorrow,
      returnDate: analysis.extractedData.tripType === 'round-trip' ? returnDate : undefined,
      passengers: {
        adults: analysis.extractedData.passengers || 1,
        children: 0,
        infants: 0
      },
      travelClass: (analysis.extractedData.travelClass as any) || 'ECONOMY',
      preferences: {
        nonStop: false,
        preferredAirlines: []
      }
    };
  };

  const createAirportSelection = (location: string): AirportSelection => {
    // Simple mapping - in production, this would use a proper airport lookup service
    const locationMap: Record<string, AirportSelection> = {
      'new york': { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
      'london': { iataCode: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom' },
      'paris': { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
      'tokyo': { iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
      'los angeles': { iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
      'miami': { iataCode: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
      'san francisco': { iataCode: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' }
    };

    const normalizedLocation = location.toLowerCase();
    return locationMap[normalizedLocation] || {
      iataCode: '',
      name: location,
      city: location,
      country: 'Unknown'
    };
  };

  const parseDateString = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lowerDateStr = dateStr.toLowerCase();

    if (lowerDateStr.includes('tomorrow')) {
      return tomorrow;
    }

    if (lowerDateStr.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    // Add more sophisticated date parsing here
    return tomorrow;
  };

  if (!isSupported) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Search Not Supported</h3>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support voice recognition. Please try using Chrome or Safari.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Use Regular Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎤</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Voice Search</h3>
              <p className="text-gray-600">Tell me where you'd like to fly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Voice Controls */}
        <div className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={isAnalyzing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
            } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            ) : isListening ? (
              <StopIcon className="w-8 h-8 text-white" />
            ) : (
              <MicrophoneIcon className="w-8 h-8 text-white" />
            )}
          </motion.button>

          <div className="mt-4">
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 font-semibold"
              >
                🔴 Listening...
              </motion.div>
            )}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-600 font-semibold flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                AI Analyzing...
              </motion.div>
            )}
            {!isListening && !isAnalyzing && (
              <div className="text-gray-600">
                Click to start voice search
              </div>
            )}
          </div>
        </div>

        {/* Live Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-lg p-4 mb-6"
          >
            <div className="text-sm text-blue-700 mb-1">You said:</div>
            <div className="text-blue-900 font-medium">{transcript}</div>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            {analysis.intent === 'flight_search' && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Flight Search Detected</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {analysis.extractedData.origin && (
                    <div>
                      <span className="text-green-700">From:</span>
                      <span className="ml-1 font-medium text-green-900">{analysis.extractedData.origin}</span>
                    </div>
                  )}
                  {analysis.extractedData.destination && (
                    <div>
                      <span className="text-green-700">To:</span>
                      <span className="ml-1 font-medium text-green-900">{analysis.extractedData.destination}</span>
                    </div>
                  )}
                  {analysis.extractedData.departureDate && (
                    <div>
                      <span className="text-green-700">When:</span>
                      <span className="ml-1 font-medium text-green-900">{analysis.extractedData.departureDate}</span>
                    </div>
                  )}
                  {analysis.extractedData.passengers && (
                    <div>
                      <span className="text-green-700">Passengers:</span>
                      <span className="ml-1 font-medium text-green-900">{analysis.extractedData.passengers}</span>
                    </div>
                  )}
                </div>

                {analysis.missingData.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      <span className="font-medium">Still need:</span> {analysis.missingData.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="text-sm font-medium text-gray-900 mb-3">Conversation</div>
            <div className="space-y-3">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <div className="text-red-700 text-sm mt-1">{error}</div>
          </motion.div>
        )}

        {/* Example Commands */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Try saying:</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• "Find flights from New York to Paris tomorrow"</div>
            <div>• "Book a round trip to London next week for 2 passengers"</div>
            <div>• "I need a business class flight to Tokyo on March 15th"</div>
            <div>• "Show me one-way flights from Miami to Barcelona"</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <VolumeUpIcon className="w-4 h-4" />
            <span>AI will respond with voice</span>
          </div>
          <div>Powered by advanced speech recognition</div>
        </div>
      </div>
    </div>
  );
}