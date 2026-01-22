/**
 * OpenAPI 3.1.0 Specification for Fly2Any Public APIs
 * 
 * This file documents all public API endpoints for AI agents and developers.
 * Used by ChatGPT, Claude, Perplexity, and external integrations.
 * 
 * @version 1.0.0
 * @last-updated 2025-01-22
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Fly2Any API',
    version: '1.0.0',
    description: 'Official Fly2Any API for flight, hotel, car, and tour searches. Compares 900+ airlines, 2M+ hotels, and 100K+ tours worldwide.',
    contact: {
      name: 'Fly2Any API Support',
      email: 'api@fly2any.com',
      url: `${SITE_URL}/contact`,
    },
    license: {
      name: 'Commercial License',
      url: `${SITE_URL}/terms`,
    },
  },
  servers: [
    {
      url: SITE_URL,
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Flights',
      description: 'Flight search and booking operations',
    },
    {
      name: 'Hotels',
      description: 'Hotel search and availability',
    },
    {
      name: 'Cars',
      description: 'Car rental search',
    },
    {
      name: 'Tours',
      description: 'Tour and activity search',
    },
    {
      name: 'Transfers',
      description: 'Airport transfer services',
    },
    {
      name: 'Content',
      description: 'Travel guides and information',
    },
  ],
  paths: {
    '/api/flights/search': {
      get: {
        tags: ['Flights'],
        summary: 'Search flights',
        description: 'Search for flights across 900+ airlines. Returns real-time pricing and availability.',
        operationId: 'searchFlights',
        parameters: [
          {
            name: 'origin',
            in: 'query',
            required: true,
            description: 'Origin airport code (e.g., JFK, LAX, LHR)',
            schema: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              examples: ['JFK', 'LAX', 'LHR'],
            },
          },
          {
            name: 'destination',
            in: 'query',
            required: true,
            description: 'Destination airport code (e.g., SFO, CDG, DXB)',
            schema: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              examples: ['SFO', 'CDG', 'DXB'],
            },
          },
          {
            name: 'departureDate',
            in: 'query',
            required: true,
            description: 'Departure date in YYYY-MM-DD format',
            schema: {
              type: 'string',
              format: 'date',
              example: '2025-06-15',
            },
          },
          {
            name: 'returnDate',
            in: 'query',
            required: false,
            description: 'Return date in YYYY-MM-DD format (for round-trip)',
            schema: {
              type: 'string',
              format: 'date',
              example: '2025-06-22',
            },
          },
          {
            name: 'passengers',
            in: 'query',
            required: false,
            description: 'Number of passengers (1-9)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 9,
              default: 1,
            },
          },
          {
            name: 'cabinClass',
            in: 'query',
            required: false,
            description: 'Cabin class preference',
            schema: {
              type: 'string',
              enum: ['economy', 'premium_economy', 'business', 'first'],
              default: 'economy',
            },
          },
          {
            name: 'directOnly',
            in: 'query',
            required: false,
            description: 'Filter for direct flights only',
            schema: {
              type: 'boolean',
              default: false,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful flight search',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          airline: { type: 'string' },
                          flightNumber: { type: 'string' },
                          departure: {
                            type: 'object',
                            properties: {
                              airport: { type: 'string' },
                              time: { type: 'string' },
                            },
                          },
                          arrival: {
                            type: 'object',
                            properties: {
                              airport: { type: 'string' },
                              time: { type: 'string' },
                            },
                          },
                          duration: { type: 'string' },
                          stops: { type: 'integer' },
                          price: {
                            type: 'object',
                            properties: {
                              amount: { type: 'number' },
                              currency: { type: 'string' },
                            },
                          },
                          bookingUrl: { type: 'string' },
                        },
                      },
                    },
                    totalResults: { type: 'integer' },
                    currency: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' },
                  },
                },
              },
            },
          },
          '429': {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
    '/api/hotels/search': {
      get: {
        tags: ['Hotels'],
        summary: 'Search hotels',
        description: 'Search for hotels from 2M+ properties worldwide with real-time availability and pricing.',
        operationId: 'searchHotels',
        parameters: [
          {
            name: 'destination',
            in: 'query',
            required: true,
            description: 'City name, airport code, or hotel name',
            schema: {
              type: 'string',
              examples: ['New York', 'LAX', 'Hilton Paris'],
            },
          },
          {
            name: 'checkIn',
            in: 'query',
            required: true,
            description: 'Check-in date in YYYY-MM-DD format',
            schema: {
              type: 'string',
              format: 'date',
              example: '2025-06-15',
            },
          },
          {
            name: 'checkOut',
            in: 'query',
            required: true,
            description: 'Check-out date in YYYY-MM-DD format',
            schema: {
              type: 'string',
              format: 'date',
              example: '2025-06-22',
            },
          },
          {
            name: 'rooms',
            in: 'query',
            required: false,
            description: 'Number of rooms (1-10)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              default: 1,
            },
          },
          {
            name: 'guests',
            in: 'query',
            required: false,
            description: 'Number of guests per room',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              default: 2,
            },
          },
          {
            name: 'starRating',
            in: 'query',
            required: false,
            description: 'Minimum star rating',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
          },
          {
            name: 'amenities',
            in: 'query',
            required: false,
            description: 'Required amenities (comma-separated)',
            schema: {
              type: 'string',
              example: 'wifi,pool,gym',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful hotel search',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          rating: {
                            type: 'object',
                            properties: {
                              stars: { type: 'integer' },
                              guestRating: { type: 'number' },
                              reviews: { type: 'integer' },
                            },
                          },
                          address: { type: 'string' },
                          amenities: { type: 'array', items: { type: 'string' } },
                          images: { type: 'array', items: { type: 'string' } },
                          price: {
                            type: 'object',
                            properties: {
                              perNight: { type: 'number' },
                              total: { type: 'number' },
                              currency: { type: 'string' },
                            },
                          },
                          bookingUrl: { type: 'string' },
                        },
                      },
                    },
                    totalResults: { type: 'integer' },
                    currency: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request parameters',
          },
          '429': {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
    '/llms.txt': {
      get: {
        tags: ['Content'],
        summary: 'AI/LLM Instructions',
        description: 'Provides instructions for AI systems on how to represent and cite Fly2Any data.',
        operationId: 'getLLMInstructions',
        responses: {
          '200': {
            description: 'LLM instructions in plain text format',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/.well-known/ai-plugin.json': {
      get: {
        tags: ['Content'],
        summary: 'AI Plugin Manifest',
        description: 'Plugin manifest for ChatGPT, Claude, and other AI systems.',
        operationId: 'getAIPluginManifest',
        responses: {
          '200': {
            description: 'AI plugin configuration in JSON format',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schema_version: { type: 'string' },
                    name_for_human: { type: 'string' },
                    name_for_model: { type: 'string' },
                    description_for_human: { type: 'string' },
                    description_for_model: { type: 'string' },
                    auth: { type: 'object' },
                    api: { type: 'object' },
                    capabilities: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/robots.txt': {
      get: {
        tags: ['Content'],
        summary: 'Robots.txt',
        description: 'Crawler access control for search engines and AI bots.',
        operationId: 'getRobots',
        responses: {
          '200': {
            description: 'Robots.txt in plain text format',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authenticated requests (future feature)',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          code: {
            type: 'string',
            description: 'Error code for programmatic handling',
          },
          details: {
            type: 'string',
            description: 'Additional error details',
          },
        },
        required: ['error'],
      },
      Price: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Price amount',
          },
          currency: {
            type: 'string',
            description: 'ISO 4217 currency code',
            pattern: '^[A-Z]{3}$',
          },
        },
        required: ['amount', 'currency'],
      },
    },
  },
  externalDocs: {
    description: 'Fly2Any Documentation',
    url: `${SITE_URL}/travel-guide`,
  },
};

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
      'Access-Control-Allow-Origin': '*',
    },
  });
}
