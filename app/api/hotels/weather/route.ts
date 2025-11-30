// Weather API Route - LiteAPI Integration
// Returns weather data for hotel destinations
import { NextRequest, NextResponse } from 'next/server';

const LITEAPI_BASE_URL = 'https://api.liteapi.travel/v3.0';
const LITEAPI_KEY = process.env.LITEAPI_PUBLIC_KEY || process.env.LITEAPI_SANDBOX_PUBLIC_KEY || '';

interface WeatherData {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  temperatureAvg: number;
  humidity: number;
  precipitationProbability: number;
  precipitationAmount: number;
  windSpeed: number;
  windDirection: string;
  weatherCode: number;
  weatherDescription: string;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

interface WeatherResponse {
  success: boolean;
  data?: {
    location: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    currentWeather?: {
      temperature: number;
      humidity: number;
      description: string;
      icon: string;
    };
    forecast: WeatherData[];
    summary: {
      avgTemperature: number;
      avgHumidity: number;
      totalPrecipitation: number;
      weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'mixed';
      recommendation: string;
    };
  };
  error?: string;
}

// Weather code to description mapping
const weatherDescriptions: Record<number, { description: string; icon: string; condition: string }> = {
  0: { description: 'Clear sky', icon: '☀️', condition: 'sunny' },
  1: { description: 'Mainly clear', icon: '🌤️', condition: 'sunny' },
  2: { description: 'Partly cloudy', icon: '⛅', condition: 'cloudy' },
  3: { description: 'Overcast', icon: '☁️', condition: 'cloudy' },
  45: { description: 'Foggy', icon: '🌫️', condition: 'cloudy' },
  48: { description: 'Depositing rime fog', icon: '🌫️', condition: 'cloudy' },
  51: { description: 'Light drizzle', icon: '🌧️', condition: 'rainy' },
  53: { description: 'Moderate drizzle', icon: '🌧️', condition: 'rainy' },
  55: { description: 'Dense drizzle', icon: '🌧️', condition: 'rainy' },
  61: { description: 'Slight rain', icon: '🌧️', condition: 'rainy' },
  63: { description: 'Moderate rain', icon: '🌧️', condition: 'rainy' },
  65: { description: 'Heavy rain', icon: '🌧️', condition: 'rainy' },
  71: { description: 'Slight snow', icon: '🌨️', condition: 'rainy' },
  73: { description: 'Moderate snow', icon: '🌨️', condition: 'rainy' },
  75: { description: 'Heavy snow', icon: '❄️', condition: 'rainy' },
  80: { description: 'Slight rain showers', icon: '🌦️', condition: 'mixed' },
  81: { description: 'Moderate rain showers', icon: '🌦️', condition: 'mixed' },
  82: { description: 'Violent rain showers', icon: '⛈️', condition: 'rainy' },
  95: { description: 'Thunderstorm', icon: '⛈️', condition: 'rainy' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️', condition: 'rainy' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️', condition: 'rainy' },
};

function getWeatherInfo(code: number) {
  return weatherDescriptions[code] || { description: 'Unknown', icon: '🌡️', condition: 'mixed' };
}

function generateRecommendation(summary: { avgTemperature: number; avgHumidity: number; totalPrecipitation: number; weatherCondition: string }): string {
  const { avgTemperature, avgHumidity, totalPrecipitation, weatherCondition } = summary;

  const recommendations: string[] = [];

  if (weatherCondition === 'sunny' && avgTemperature > 25) {
    recommendations.push('Perfect beach weather! Pack sunscreen and light clothing.');
  } else if (weatherCondition === 'sunny' && avgTemperature > 15) {
    recommendations.push('Great weather for sightseeing! Light layers recommended.');
  } else if (weatherCondition === 'rainy') {
    recommendations.push('Pack an umbrella and waterproof jacket.');
  } else if (weatherCondition === 'cloudy') {
    recommendations.push('Comfortable weather for outdoor activities.');
  }

  if (avgTemperature < 10) {
    recommendations.push('Bring warm clothing.');
  } else if (avgTemperature > 30) {
    recommendations.push('Stay hydrated! Consider hotels with pools.');
  }

  if (avgHumidity > 80) {
    recommendations.push('High humidity expected - lightweight breathable fabrics recommended.');
  }

  if (totalPrecipitation > 10) {
    recommendations.push('Some rain expected during your stay.');
  }

  return recommendations.join(' ') || 'Enjoy your trip!';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');

  if (!latitude || !longitude) {
    return NextResponse.json<WeatherResponse>({
      success: false,
      error: 'Latitude and longitude are required',
    }, { status: 400 });
  }

  if (!checkin || !checkout) {
    return NextResponse.json<WeatherResponse>({
      success: false,
      error: 'Check-in and check-out dates are required',
    }, { status: 400 });
  }

  try {
    // Try LiteAPI weather endpoint first
    const liteApiUrl = `${LITEAPI_BASE_URL}/data/weather?latitude=${latitude}&longitude=${longitude}&checkin=${checkin}&checkout=${checkout}`;

    const response = await fetch(liteApiUrl, {
      headers: {
        'X-API-Key': LITEAPI_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.ok) {
      const data = await response.json();

      if (data.data) {
        // Process LiteAPI weather data
        const forecast: WeatherData[] = (data.data.daily || []).map((day: any) => {
          const weatherInfo = getWeatherInfo(day.weatherCode || 0);
          return {
            date: day.date,
            temperatureMin: day.temperatureMin || day.temperature_min || 0,
            temperatureMax: day.temperatureMax || day.temperature_max || 0,
            temperatureAvg: ((day.temperatureMin || 0) + (day.temperatureMax || 0)) / 2,
            humidity: day.humidity || 0,
            precipitationProbability: day.precipitationProbability || day.precipitation_probability || 0,
            precipitationAmount: day.precipitationAmount || day.precipitation || 0,
            windSpeed: day.windSpeed || day.wind_speed || 0,
            windDirection: day.windDirection || 'N',
            weatherCode: day.weatherCode || 0,
            weatherDescription: weatherInfo.description,
            uvIndex: day.uvIndex || 0,
            sunrise: day.sunrise || '',
            sunset: day.sunset || '',
          };
        });

        // Calculate summary
        const avgTemperature = forecast.length > 0
          ? forecast.reduce((sum, d) => sum + d.temperatureAvg, 0) / forecast.length
          : 0;
        const avgHumidity = forecast.length > 0
          ? forecast.reduce((sum, d) => sum + d.humidity, 0) / forecast.length
          : 0;
        const totalPrecipitation = forecast.reduce((sum, d) => sum + d.precipitationAmount, 0);

        // Determine overall weather condition
        const conditions = forecast.map(d => getWeatherInfo(d.weatherCode).condition);
        const sunnyDays = conditions.filter(c => c === 'sunny').length;
        const rainyDays = conditions.filter(c => c === 'rainy').length;

        let weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'mixed' = 'mixed';
        if (sunnyDays > forecast.length * 0.6) weatherCondition = 'sunny';
        else if (rainyDays > forecast.length * 0.4) weatherCondition = 'rainy';
        else if (sunnyDays === 0 && rainyDays === 0) weatherCondition = 'cloudy';

        const summary = {
          avgTemperature: Math.round(avgTemperature * 10) / 10,
          avgHumidity: Math.round(avgHumidity),
          totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
          weatherCondition,
          recommendation: generateRecommendation({
            avgTemperature,
            avgHumidity,
            totalPrecipitation,
            weatherCondition,
          }),
        };

        return NextResponse.json<WeatherResponse>({
          success: true,
          data: {
            location: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
            forecast,
            summary,
          },
        });
      }
    }

    // Fallback to Open-Meteo (free, no API key needed)
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,relative_humidity_2m_max,uv_index_max,sunrise,sunset&timezone=auto&start_date=${checkin}&end_date=${checkout}`;

    const openMeteoResponse = await fetch(openMeteoUrl, {
      next: { revalidate: 3600 },
    });

    if (!openMeteoResponse.ok) {
      throw new Error('Weather service unavailable');
    }

    const openMeteoData = await openMeteoResponse.json();

    const forecast: WeatherData[] = (openMeteoData.daily?.time || []).map((date: string, i: number) => {
      const weatherCode = openMeteoData.daily.weathercode?.[i] || 0;
      const weatherInfo = getWeatherInfo(weatherCode);
      const tempMin = openMeteoData.daily.temperature_2m_min?.[i] || 0;
      const tempMax = openMeteoData.daily.temperature_2m_max?.[i] || 0;

      return {
        date,
        temperatureMin: tempMin,
        temperatureMax: tempMax,
        temperatureAvg: (tempMin + tempMax) / 2,
        humidity: openMeteoData.daily.relative_humidity_2m_max?.[i] || 0,
        precipitationProbability: openMeteoData.daily.precipitation_probability_max?.[i] || 0,
        precipitationAmount: openMeteoData.daily.precipitation_sum?.[i] || 0,
        windSpeed: openMeteoData.daily.windspeed_10m_max?.[i] || 0,
        windDirection: 'N',
        weatherCode,
        weatherDescription: weatherInfo.description,
        uvIndex: openMeteoData.daily.uv_index_max?.[i] || 0,
        sunrise: openMeteoData.daily.sunrise?.[i] || '',
        sunset: openMeteoData.daily.sunset?.[i] || '',
      };
    });

    // Calculate summary
    const avgTemperature = forecast.length > 0
      ? forecast.reduce((sum, d) => sum + d.temperatureAvg, 0) / forecast.length
      : 0;
    const avgHumidity = forecast.length > 0
      ? forecast.reduce((sum, d) => sum + d.humidity, 0) / forecast.length
      : 0;
    const totalPrecipitation = forecast.reduce((sum, d) => sum + d.precipitationAmount, 0);

    const conditions = forecast.map(d => getWeatherInfo(d.weatherCode).condition);
    const sunnyDays = conditions.filter(c => c === 'sunny').length;
    const rainyDays = conditions.filter(c => c === 'rainy').length;

    let weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'mixed' = 'mixed';
    if (sunnyDays > forecast.length * 0.6) weatherCondition = 'sunny';
    else if (rainyDays > forecast.length * 0.4) weatherCondition = 'rainy';
    else if (sunnyDays === 0 && rainyDays === 0) weatherCondition = 'cloudy';

    const summary = {
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity),
      totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
      weatherCondition,
      recommendation: generateRecommendation({
        avgTemperature,
        avgHumidity,
        totalPrecipitation,
        weatherCondition,
      }),
    };

    return NextResponse.json<WeatherResponse>({
      success: true,
      data: {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        forecast,
        summary,
      },
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json<WeatherResponse>({
      success: false,
      error: 'Failed to fetch weather data',
    }, { status: 500 });
  }
}
