'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingDown, TrendingUp, DollarSign, AlertCircle, CheckCircle, Zap } from 'lucide-react'

interface Route {
  from: string
  to: string
  basePrice: number
  seasonality: { [key: string]: number }
  popularity: number
}

interface PriceEstimate {
  economy: number
  premium: number
  business: number
  savings: number
  competitorPrice: number
  trend: 'up' | 'down' | 'stable'
}

const popularRoutes: Route[] = [
  {
    from: 'Miami',
    to: 'São Paulo',
    basePrice: 650,
    seasonality: { 
      'jan': 1.3, 'feb': 1.2, 'mar': 1.0, 'apr': 0.9, 'may': 0.8, 'jun': 0.85,
      'jul': 1.1, 'aug': 0.9, 'sep': 0.8, 'oct': 0.85, 'nov': 1.0, 'dec': 1.4 
    },
    popularity: 9
  },
  {
    from: 'Orlando',
    to: 'Rio de Janeiro', 
    basePrice: 680,
    seasonality: {
      'jan': 1.3, 'feb': 1.35, 'mar': 1.0, 'apr': 0.9, 'may': 0.8, 'jun': 0.85,
      'jul': 1.1, 'aug': 0.9, 'sep': 0.8, 'oct': 0.85, 'nov': 1.0, 'dec': 1.5
    },
    popularity: 8
  },
  {
    from: 'New York',
    to: 'São Paulo',
    basePrice: 720,
    seasonality: {
      'jan': 1.2, 'feb': 1.1, 'mar': 1.0, 'apr': 0.9, 'may': 0.85, 'jun': 0.9,
      'jul': 1.15, 'aug': 0.95, 'sep': 0.85, 'oct': 0.9, 'nov': 1.0, 'dec': 1.3
    },
    popularity: 7
  },
  {
    from: 'Boston',
    to: 'Salvador',
    basePrice: 750,
    seasonality: {
      'jan': 1.1, 'feb': 1.4, 'mar': 1.0, 'apr': 0.9, 'may': 0.8, 'jun': 0.9,
      'jul': 1.0, 'aug': 0.9, 'sep': 0.8, 'oct': 0.85, 'nov': 0.95, 'dec': 1.2
    },
    popularity: 6
  }
]

const usDollarToReal = 5.20 // Mock exchange rate

export default function PriceCalculator() {
  const [selectedFrom, setSelectedFrom] = useState('')
  const [selectedTo, setSelectedTo] = useState('')
  const [departureMonth, setDepartureMonth] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD')

  const months = [
    { value: 'jan', label: 'Janeiro' },
    { value: 'feb', label: 'Fevereiro' },
    { value: 'mar', label: 'Março' },
    { value: 'apr', label: 'Abril' },
    { value: 'may', label: 'Maio' },
    { value: 'jun', label: 'Junho' },
    { value: 'jul', label: 'Julho' },
    { value: 'aug', label: 'Agosto' },
    { value: 'sep', label: 'Setembro' },
    { value: 'oct', label: 'Outubro' },
    { value: 'nov', label: 'Novembro' },
    { value: 'dec', label: 'Dezembro' }
  ]

  const fromCities = ['Miami', 'Orlando', 'New York', 'Boston', 'Los Angeles', 'Chicago']
  const toCities = ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Belo Horizonte', 'Brasília', 'Fortaleza']

  const calculatePrice = useCallback(() => {
    if (!selectedFrom || !selectedTo || !departureMonth) return

    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const route = popularRoutes.find(r => r.from === selectedFrom && r.to === selectedTo)
      const basePrice = route?.basePrice || 700 // Default price for unlisted routes
      const seasonalMultiplier = route?.seasonality[departureMonth] || 1.0
      
      const economyPrice = Math.round(basePrice * seasonalMultiplier)
      const premiumPrice = Math.round(economyPrice * 1.4)
      const businessPrice = Math.round(economyPrice * 2.2)
      
      // Calculate competitor price (usually 10-25% higher)
      const competitorPrice = Math.round(economyPrice * (1 + Math.random() * 0.15 + 0.1))
      const savings = competitorPrice - economyPrice
      
      // Determine trend
      const currentMonth = new Date().getMonth() + 1
      const targetMonth = months.findIndex(m => m.value === departureMonth) + 1
      let trend: 'up' | 'down' | 'stable' = 'stable'
      
      if (targetMonth > currentMonth) {
        if (seasonalMultiplier > 1.1) trend = 'up'
        else if (seasonalMultiplier < 0.9) trend = 'down'
      }

      setPriceEstimate({
        economy: economyPrice,
        premium: premiumPrice,
        business: businessPrice,
        savings,
        competitorPrice,
        trend
      })
      
      setIsLoading(false)
      setShowComparison(true)
    }, 1500)
  }, [selectedFrom, selectedTo, departureMonth])

  const formatPrice = (price: number) => {
    if (currency === 'BRL') {
      return `R$ ${(price * usDollarToReal).toLocaleString('pt-BR')}`
    }
    return `$${price.toLocaleString('en-US')}`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <DollarSign className="w-4 h-4 text-blue-500" />
    }
  }

  const getTrendMessage = (trend: string) => {
    switch (trend) {
      case 'up': return 'Preços subindo - reserve logo!'
      case 'down': return 'Ótima época para viajar'
      default: return 'Preços estáveis'
    }
  }

  useEffect(() => {
    if (selectedFrom && selectedTo && departureMonth) {
      calculatePrice()
    }
  }, [selectedFrom, selectedTo, departureMonth, calculatePrice])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Calculadora de Preços Instantânea
          </h2>
          <p className="text-gray-600">
            Estime o valor da sua passagem antes mesmo de solicitar a cotação
          </p>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saindo de (EUA)
          </label>
          <select
            value={selectedFrom}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Escolher cidade</option>
            {fromCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indo para (Brasil)
          </label>
          <select
            value={selectedTo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Escolher cidade</option>
            {toCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mês da viagem
          </label>
          <select
            value={departureMonth}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartureMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Escolher mês</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passageiros
          </label>
          <select
            value={passengers}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassengers(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Currency Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-600">Moeda:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currency === 'USD' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('BRL')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currency === 'BRL' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            BRL
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Calculando melhor preço...</span>
          </div>
        </div>
      )}

      {/* Price Results */}
      {priceEstimate && !isLoading && (
        <div className="space-y-6">
          {/* Trend Alert */}
          <div className={`
            flex items-center gap-3 p-4 rounded-lg
            ${priceEstimate.trend === 'up' ? 'bg-red-50 border border-red-200' : 
              priceEstimate.trend === 'down' ? 'bg-green-50 border border-green-200' : 
              'bg-blue-50 border border-blue-200'}
          `}>
            {getTrendIcon(priceEstimate.trend)}
            <span className="font-medium text-sm">
              {getTrendMessage(priceEstimate.trend)}
            </span>
          </div>

          {/* Price Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-green-500 rounded-lg p-4 relative">
              <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                RECOMENDADO
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Econômica</h3>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatPrice(priceEstimate.economy * passengers)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(priceEstimate.economy)} por pessoa
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Premium Economy</h3>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPrice(priceEstimate.premium * passengers)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(priceEstimate.premium)} por pessoa
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Executiva</h3>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatPrice(priceEstimate.business * passengers)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(priceEstimate.business)} por pessoa
              </div>
            </div>
          </div>

          {/* Savings Comparison */}
          {showComparison && priceEstimate.savings > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-green-900">
                  Economia vs Concorrentes
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Outros sites</div>
                  <div className="text-lg text-gray-400 line-through">
                    {formatPrice(priceEstimate.competitorPrice * passengers)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-600 mb-1">Com a Fly2Any</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(priceEstimate.economy * passengers)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Economize {formatPrice(priceEstimate.savings * passengers)}!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Solicitar Cotação Oficial
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Salvar Estimativa
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>Importante:</strong> Estes são valores estimados baseados em dados históricos. 
                Os preços finais podem variar conforme disponibilidade, datas exatas e promoções ativas. 
                Solicite uma cotação oficial para valores precisos.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedFrom && !selectedTo && !departureMonth && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Preencha os campos acima para ver a estimativa de preços</p>
        </div>
      )}
    </div>
  )
}