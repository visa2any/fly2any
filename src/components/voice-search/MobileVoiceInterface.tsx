'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  StopIcon,
  PlayIcon,
  PauseIcon,
  SpeakerXMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface VoiceSearchResult {
  query: string;
  answer: string;
  confidence: number;
  followUpQuestions: string[];
  relatedContent: string[];
}

interface MobileVoiceInterfaceProps {
  onVoiceSearch?: (query: string) => void;
  language?: 'pt-BR' | 'pt-PT' | 'en-US';
  region?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MobileVoiceInterface: React.FC<MobileVoiceInterfaceProps> = ({
  onVoiceSearch,
  language = 'pt-BR',
  region = 'general',
  placeholder = 'Toque para fazer uma pergunta por voz...',
  disabled = false
}) => {
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  
  // Voice synthesis states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  
  // UI states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Check for browser support and permissions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSupport = async () => {
      // Check Web Speech API support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Seu navegador não suporta reconhecimento de voz');
        return;
      }

      // Check microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
        setError('Permissão de microfone necessária para usar a busca por voz');
      }
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    
    // Configure recognition for Brazilian Portuguese
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    // Optimize for mobile
    if ('webkitSpeechRecognition' in window) {
      (recognition as any).webkitSpeechRecognition = true;
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        if (result.isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setConfidence(maxConfidence);
        setIsProcessing(true);
        
        // Process the voice query
        processVoiceQuery(finalTranscript, maxConfidence);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);
      
      const errorMessages: Record<string, string> = {
        'no-speech': 'Não conseguimos ouvir nada. Tente novamente.',
        'audio-capture': 'Erro no microfone. Verifique as configurações.',
        'not-allowed': 'Permissão de microfone negada.',
        'network': 'Erro de conexão. Verifique sua internet.',
        'service-not-allowed': 'Serviço de voz não disponível.',
        'bad-grammar': 'Não conseguimos entender. Tente falar mais claramente.',
        'language-not-supported': 'Idioma não suportado.'
      };
      
      setError(errorMessages[event.error] || 'Erro no reconhecimento de voz. Tente novamente.');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isProcessing) {
        setTranscript('');
      }
    };

    return recognition;
  }, [language, isProcessing]);

  // Process voice query and generate response
  const processVoiceQuery = async (query: string, confidence: number) => {
    try {
      // Simulate API call to process voice query
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResult: VoiceSearchResult = {
        query: query,
        answer: generateMockAnswer(query),
        confidence: confidence,
        followUpQuestions: generateFollowUpQuestions(query),
        relatedContent: generateRelatedContent(query)
      };

      setLastResult(mockResult);
      
      // Trigger callback
      onVoiceSearch?.(query);
      
      // Auto-speak the answer on mobile
      if (window.innerWidth <= 768) {
        speakText(mockResult.answer);
      }
      
    } catch (error) {
      setError('Erro ao processar sua pergunta. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate mock answer based on query
  const generateMockAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('quanto custa') || lowerQuery.includes('preço')) {
      return 'Os preços de passagens para o Brasil variam entre mil e oitocentos e quatro mil e quinhentos reais, dependendo da época e destino. Para conseguir os melhores preços, recomendamos comprar com antecedência de quarenta e cinco a sessenta dias.';
    }
    
    if (lowerQuery.includes('visto') || lowerQuery.includes('documento')) {
      return 'Sim, brasileiros precisam de visto para entrar nos Estados Unidos. É necessário solicitar o visto de turista B um barra B dois no consulado americano. O processo leva entre cinco e sessenta dias úteis.';
    }
    
    if (lowerQuery.includes('melhor época') || lowerQuery.includes('quando')) {
      return 'A melhor época para viajar ao Brasil depende da região. Para o Sudeste e Sul, recomendamos março a setembro. Para o Nordeste, o ano todo é uma boa opção, evitando apenas junho a agosto quando há mais chuvas.';
    }
    
    return 'Obrigado pela sua pergunta. Nossa equipe especializada está sempre disponível para ajudar com suas dúvidas sobre viagens para o Brasil. Entre em contato conosco para informações mais detalhadas.';
  };

  // Generate follow-up questions
  const generateFollowUpQuestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('preço') || lowerQuery.includes('custa')) {
      return [
        'De qual cidade você quer partir?',
        'Para qual destino no Brasil?',
        'Quando você pretende viajar?'
      ];
    }
    
    if (lowerQuery.includes('visto')) {
      return [
        'Precisa de ajuda com documentação?',
        'Quer saber sobre o processo de solicitação?',
        'Tem dúvidas sobre a entrevista?'
      ];
    }
    
    return [
      'Quer mais informações sobre este tópico?',
      'Precisa de ajuda com o planejamento?',
      'Gostaria de falar com um especialista?'
    ];
  };

  // Generate related content
  const generateRelatedContent = (query: string): string[] => {
    return [
      'Guia completo de viagens para o Brasil',
      'Dicas para conseguir passagens baratas',
      'Melhores destinos brasileiros',
      'Como obter visto americano'
    ];
  };

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if (!synthesisRef.current) return;

    // Cancel any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    currentUtteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  // Control speech playback
  const pauseSpeech = () => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (synthesisRef.current && isPaused) {
      synthesisRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Start voice recognition
  const startListening = () => {
    if (disabled || !hasPermission) return;

    recognitionRef.current = initializeRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Erro ao iniciar reconhecimento de voz');
      }
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Voice Interface */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <h3 className="text-lg font-semibold text-center">
            🎤 Busca por Voz
          </h3>
          <p className="text-sm opacity-90 text-center mt-1">
            Faça sua pergunta em português
          </p>
        </div>

        {/* Voice Button */}
        <div className="p-6 text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={disabled || hasPermission === false}
            className={`relative w-20 h-20 rounded-full transition-all duration-300 transform ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse shadow-lg shadow-red-500/50'
                : isProcessing
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-bounce'
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 shadow-lg'
            } ${disabled || hasPermission === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : undefined
            }}
          >
            {isProcessing ? (
              <div className="animate-spin w-8 h-8 text-white mx-auto">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            ) : isListening ? (
              <StopIcon className="w-8 h-8 text-white mx-auto" />
            ) : (
              <MicrophoneIcon className="w-8 h-8 text-white mx-auto" />
            )}
          </button>

          {/* Status Text */}
          <div className="mt-4 min-h-[3rem]">
            {isListening && (
              <div className="text-red-600 font-medium">
                🔴 Ouvindo... Fale agora!
              </div>
            )}
            {isProcessing && (
              <div className="text-yellow-600 font-medium">
                ⏳ Processando sua pergunta...
              </div>
            )}
            {transcript && !isProcessing && (
              <div className="text-gray-700 italic">
                "{transcript}"
                {confidence > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Confiança: {Math.round(confidence * 100)}%
                  </div>
                )}
              </div>
            )}
            {!isListening && !isProcessing && !transcript && (
              <div className="text-gray-500">
                {placeholder}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Permission Request */}
          {hasPermission === false && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Para usar a busca por voz, permita o acesso ao microfone nas configurações do navegador.
              </p>
            </div>
          )}
        </div>

        {/* Voice Response */}
        {lastResult && (
          <div className="border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-4 text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Resposta</h4>
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {lastResult.answer}
                </p>

                {/* Audio Controls */}
                <div className="flex items-center gap-2 mb-4">
                  {!isSpeaking ? (
                    <button
                      onClick={() => speakText(lastResult.answer)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      <SpeakerWaveIcon className="w-4 h-4" />
                      Ouvir resposta
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isPaused ? (
                        <button
                          onClick={resumeSpeech}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          <PlayIcon className="w-4 h-4" />
                          Continuar
                        </button>
                      ) : (
                        <button
                          onClick={pauseSpeech}
                          className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                        >
                          <PauseIcon className="w-4 h-4" />
                          Pausar
                        </button>
                      )}
                      <button
                        onClick={stopSpeech}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        <SpeakerXMarkIcon className="w-4 h-4" />
                        Parar
                      </button>
                    </div>
                  )}
                </div>

                {/* Follow-up Questions */}
                {lastResult.followUpQuestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Perguntas relacionadas:</h5>
                    <div className="space-y-1">
                      {lastResult.followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setTranscript(question);
                            processVoiceQuery(question, 1.0);
                          }}
                          className="block text-left text-blue-600 hover:text-blue-800 text-sm hover:underline"
                        >
                          • {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Settings */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Configurações de voz</span>
              {showAdvanced ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
              {/* Speech Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velocidade da fala: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Speech Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tom da voz: {speechPitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Language Info */}
              <div className="text-xs text-gray-500">
                <p>Idioma: {language}</p>
                <p>Região: {region}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Dicas de uso:</h4>
        <ul className="text-blue-800 text-xs space-y-1">
          <li>• Fale claramente e em tom natural</li>
          <li>• Faça perguntas específicas sobre viagens</li>
          <li>• Use frases completas como "Quanto custa viajar para o Brasil?"</li>
          <li>• Aguarde o sinal vermelho antes de falar</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileVoiceInterface;