'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Thermometer, Droplets, Wind, Umbrella } from 'lucide-react';

interface WeatherData {
  avgTemperature: number;
  avgHumidity: number;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'mixed';
  recommendation: string;
  totalPrecipitation: number;
}

interface WeatherBadgeProps {
  latitude: number;
  longitude: number;
  checkin: string;
  checkout: string;
  compact?: boolean;
  showRecommendation?: boolean;
  className?: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  mixed: Cloud,
  snow: CloudSnow,
};

const weatherColors = {
  sunny: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  cloudy: 'text-gray-500 bg-gray-50 border-gray-200',
  rainy: 'text-blue-500 bg-blue-50 border-blue-200',
  mixed: 'text-purple-500 bg-purple-50 border-purple-200',
};

export function WeatherBadge({
  latitude,
  longitude,
  checkin,
  checkout,
  compact = true,
  showRecommendation = false,
  className = '',
}: WeatherBadgeProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!latitude || !longitude || !checkin || !checkout) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/hotels/weather?latitude=${latitude}&longitude=${longitude}&checkin=${checkin}&checkout=${checkout}`
        );
        const data = await response.json();

        if (data.success && data.data?.summary) {
          setWeather(data.data.summary);
        } else {
          setError('Weather unavailable');
        }
      } catch (err) {
        setError('Failed to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, checkin, checkout]);

  if (loading) {
    return (
      <div className={`animate-pulse flex items-center gap-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-12 h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const WeatherIcon = weatherIcons[weather.weatherCondition] || Cloud;
  const colorClass = weatherColors[weather.weatherCondition] || weatherColors.mixed;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
        title={weather.recommendation}
      >
        <WeatherIcon className="w-3 h-3" />
        <span>{Math.round(weather.avgTemperature)}°C</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-3 border ${colorClass} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <WeatherIcon className="w-5 h-5" />
        <span className="font-medium capitalize">{weather.weatherCondition}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          <span>{Math.round(weather.avgTemperature)}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{Math.round(weather.avgHumidity)}%</span>
        </div>
        {weather.totalPrecipitation > 0 && (
          <div className="flex items-center gap-1">
            <Umbrella className="w-3 h-3" />
            <span>{Math.round(weather.totalPrecipitation)}mm</span>
          </div>
        )}
      </div>

      {showRecommendation && weather.recommendation && (
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
          {weather.recommendation}
        </p>
      )}
    </div>
  );
}

// Compact inline version for hotel cards
export function WeatherBadgeInline({
  latitude,
  longitude,
  checkin,
  checkout,
  className = '',
}: Omit<WeatherBadgeProps, 'compact' | 'showRecommendation'>) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!latitude || !longitude || !checkin || !checkout) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/hotels/weather?latitude=${latitude}&longitude=${longitude}&checkin=${checkin}&checkout=${checkout}`
        );
        const data = await response.json();

        if (data.success && data.data?.summary) {
          setWeather(data.data.summary);
        }
      } catch {
        // Silently fail for inline version
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, checkin, checkout]);

  if (loading || !weather) {
    return null;
  }

  const getIcon = () => {
    switch (weather.weatherCondition) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      default:
        return '🌤️';
    }
  };

  return (
    <span className={`inline-flex items-center text-xs text-gray-500 ${className}`}>
      <span className="mr-0.5">{getIcon()}</span>
      <span>{Math.round(weather.avgTemperature)}°C</span>
    </span>
  );
}

export default WeatherBadge;
