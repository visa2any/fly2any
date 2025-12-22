/**
 * OpenAPI Spec for AI Agents & ChatGPT Plugins
 * Enables AI systems to understand and interact with Fly2Any
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Fly2Any Travel API',
    description: 'Search flights, hotels, and travel deals. Compare prices from 900+ airlines and 2M+ hotels worldwide.',
    version: '1.0.0',
    contact: {
      name: 'Fly2Any API Support',
      email: 'api@fly2any.com',
      url: `${SITE_URL}/help`,
    },
  },
  servers: [{ url: SITE_URL, description: 'Production' }],
  paths: {
    '/flights': {
      get: {
        operationId: 'searchFlights',
        summary: 'Search for flights',
        description: 'Search and compare flights from 900+ airlines. Returns real-time prices and availability.',
        parameters: [
          { name: 'from', in: 'query', description: 'Origin airport code (e.g., JFK, LAX)', required: true, schema: { type: 'string' } },
          { name: 'to', in: 'query', description: 'Destination airport code', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', description: 'Departure date (YYYY-MM-DD)', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'return', in: 'query', description: 'Return date for round-trip', required: false, schema: { type: 'string', format: 'date' } },
          { name: 'passengers', in: 'query', description: 'Number of passengers', required: false, schema: { type: 'integer', default: 1 } },
          { name: 'class', in: 'query', description: 'Cabin class', required: false, schema: { type: 'string', enum: ['economy', 'premium', 'business', 'first'] } },
        ],
        responses: {
          '200': {
            description: 'Flight search results page',
            content: { 'text/html': { schema: { type: 'string' } } },
          },
        },
      },
    },
    '/hotels': {
      get: {
        operationId: 'searchHotels',
        summary: 'Search for hotels',
        description: 'Search and compare hotels from 2M+ properties worldwide.',
        parameters: [
          { name: 'destination', in: 'query', description: 'City or hotel name', required: true, schema: { type: 'string' } },
          { name: 'checkin', in: 'query', description: 'Check-in date (YYYY-MM-DD)', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'checkout', in: 'query', description: 'Check-out date', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'guests', in: 'query', description: 'Number of guests', required: false, schema: { type: 'integer', default: 2 } },
          { name: 'rooms', in: 'query', description: 'Number of rooms', required: false, schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          '200': { description: 'Hotel search results page' },
        },
      },
    },
    '/cars': {
      get: {
        operationId: 'searchCars',
        summary: 'Search for car rentals',
        description: 'Compare car rental rates from top companies.',
        parameters: [
          { name: 'pickup', in: 'query', description: 'Pickup location', required: true, schema: { type: 'string' } },
          { name: 'dropoff', in: 'query', description: 'Drop-off location', required: false, schema: { type: 'string' } },
          { name: 'pickupDate', in: 'query', description: 'Pickup date', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'dropoffDate', in: 'query', description: 'Drop-off date', required: true, schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Car rental search results' },
        },
      },
    },
    '/deals': {
      get: {
        operationId: 'getDeals',
        summary: 'Get current travel deals',
        description: 'Browse current flight and hotel deals with discounts up to 50%.',
        responses: {
          '200': { description: 'Current deals and promotions' },
        },
      },
    },
    '/airlines/{airline}': {
      get: {
        operationId: 'getAirlineInfo',
        summary: 'Get airline information',
        description: 'Get detailed information about an airline including routes, ratings, and booking options.',
        parameters: [
          { name: 'airline', in: 'path', description: 'Airline slug (e.g., delta, united, american)', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Airline information page' },
        },
      },
    },
  },
  components: {
    schemas: {
      Flight: {
        type: 'object',
        properties: {
          airline: { type: 'string', description: 'Airline name' },
          price: { type: 'number', description: 'Price in USD' },
          origin: { type: 'string', description: 'Origin airport code' },
          destination: { type: 'string', description: 'Destination airport code' },
          departureTime: { type: 'string', format: 'date-time' },
          arrivalTime: { type: 'string', format: 'date-time' },
          duration: { type: 'string', description: 'Flight duration' },
        },
      },
      Hotel: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number', description: 'Price per night in USD' },
          rating: { type: 'number', description: 'Star rating 1-5' },
          location: { type: 'string' },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
