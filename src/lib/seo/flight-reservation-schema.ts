/**
 * FlightReservation Schema Generator for Rich Snippets
 * Generates structured data for flight bookings to enable rich search results
 */

export interface FlightReservationData {
  reservationNumber: string;
  reservationStatus: 'ReservationConfirmed' | 'ReservationPending' | 'ReservationCancelled';
  underName: {
    name: string;
    email?: string;
  };
  reservationFor: {
    // Flight details
    flightNumber: string;
    airline: {
      name: string;
      iataCode: string;
    };
    departureAirport: {
      name: string;
      iataCode: string;
      address: {
        addressLocality: string;
        addressRegion?: string;
        addressCountry: string;
      };
    };
    arrivalAirport: {
      name: string;
      iataCode: string;
      address: {
        addressLocality: string;
        addressRegion?: string;
        addressCountry: string;
      };
    };
    departureTime: string; // ISO 8601 format
    arrivalTime: string;   // ISO 8601 format
    aircraft?: string;
  };
  totalPrice?: {
    value: number;
    currency: string;
  };
  bookingAgent?: {
    name: string;
    url?: string;
  };
}

export class FlightReservationSchema {
  /**
   * Generate FlightReservation schema for flight booking confirmations
   */
  static generateFlightReservation(data: FlightReservationData): object {
    return {
      "@context": "https://schema.org",
      "@type": "FlightReservation",
      "reservationNumber": data.reservationNumber,
      "reservationStatus": `https://schema.org/${data.reservationStatus}`,
      "underName": {
        "@type": "Person",
        "name": data.underName.name,
        ...(data.underName.email && { "email": data.underName.email })
      },
      "reservationFor": {
        "@type": "Flight",
        "flightNumber": data.reservationFor.flightNumber,
        "airline": {
          "@type": "Airline",
          "name": data.reservationFor.airline.name,
          "iataCode": data.reservationFor.airline.iataCode
        },
        "departureAirport": {
          "@type": "Airport",
          "name": data.reservationFor.departureAirport.name,
          "iataCode": data.reservationFor.departureAirport.iataCode,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.reservationFor.departureAirport.address.addressLocality,
            ...(data.reservationFor.departureAirport.address.addressRegion && {
              "addressRegion": data.reservationFor.departureAirport.address.addressRegion
            }),
            "addressCountry": data.reservationFor.departureAirport.address.addressCountry
          }
        },
        "arrivalAirport": {
          "@type": "Airport", 
          "name": data.reservationFor.arrivalAirport.name,
          "iataCode": data.reservationFor.arrivalAirport.iataCode,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.reservationFor.arrivalAirport.address.addressLocality,
            ...(data.reservationFor.arrivalAirport.address.addressRegion && {
              "addressRegion": data.reservationFor.arrivalAirport.address.addressRegion
            }),
            "addressCountry": data.reservationFor.arrivalAirport.address.addressCountry
          }
        },
        "departureTime": data.reservationFor.departureTime,
        "arrivalTime": data.reservationFor.arrivalTime,
        ...(data.reservationFor.aircraft && { "aircraft": data.reservationFor.aircraft })
      },
      ...(data.totalPrice && {
        "totalPrice": {
          "@type": "PriceSpecification",
          "price": data.totalPrice.value,
          "priceCurrency": data.totalPrice.currency
        }
      }),
      ...(data.bookingAgent && {
        "bookingAgent": {
          "@type": "Organization",
          "name": data.bookingAgent.name,
          ...(data.bookingAgent.url && { "url": data.bookingAgent.url })
        }
      })
    };
  }

  /**
   * Generate Trip schema for multi-flight itineraries
   */
  static generateTripReservation(
    reservationNumber: string,
    passengerName: string,
    flights: FlightReservationData['reservationFor'][],
    totalPrice?: { value: number; currency: string }
  ): object {
    return {
      "@context": "https://schema.org",
      "@type": "TripReservation", 
      "reservationNumber": reservationNumber,
      "reservationStatus": "https://schema.org/ReservationConfirmed",
      "underName": {
        "@type": "Person",
        "name": passengerName
      },
      "reservationFor": {
        "@type": "Trip",
        "name": `${flights[0].departureAirport.address.addressLocality} to ${flights[flights.length - 1].arrivalAirport.address.addressLocality}`,
        "description": `${flights.length}-segment flight itinerary`,
        "itinerary": flights.map((flight, index) => ({
          "@type": "Flight",
          "position": index + 1,
          "flightNumber": flight.flightNumber,
          "airline": {
            "@type": "Airline",
            "name": flight.airline.name,
            "iataCode": flight.airline.iataCode
          },
          "departureAirport": {
            "@type": "Airport",
            "name": flight.departureAirport.name,
            "iataCode": flight.departureAirport.iataCode
          },
          "arrivalAirport": {
            "@type": "Airport",
            "name": flight.arrivalAirport.name, 
            "iataCode": flight.arrivalAirport.iataCode
          },
          "departureTime": flight.departureTime,
          "arrivalTime": flight.arrivalTime
        }))
      },
      ...(totalPrice && {
        "totalPrice": {
          "@type": "PriceSpecification",
          "price": totalPrice.value,
          "priceCurrency": totalPrice.currency
        }
      }),
      "bookingAgent": {
        "@type": "Organization",
        "name": "Fly2Any",
        "url": "https://fly2any.com"
      }
    };
  }

  /**
   * Generate example FlightReservation for testing
   */
  static generateExampleMiamiSaoPaulo(): object {
    const exampleData: FlightReservationData = {
      reservationNumber: "FLY2ANY-MIA-SAO-2024-001",
      reservationStatus: "ReservationConfirmed",
      underName: {
        name: "Maria Silva",
        email: "maria.silva@example.com"
      },
      reservationFor: {
        flightNumber: "LA8084",
        airline: {
          name: "LATAM Airlines",
          iataCode: "LA"
        },
        departureAirport: {
          name: "Miami International Airport",
          iataCode: "MIA", 
          address: {
            addressLocality: "Miami",
            addressRegion: "FL",
            addressCountry: "US"
          }
        },
        arrivalAirport: {
          name: "São Paulo-Guarulhos International Airport",
          iataCode: "GRU",
          address: {
            addressLocality: "São Paulo",
            addressRegion: "SP", 
            addressCountry: "BR"
          }
        },
        departureTime: "2024-12-15T23:45:00-05:00",
        arrivalTime: "2024-12-16T12:30:00-03:00",
        aircraft: "Boeing 787-9"
      },
      totalPrice: {
        value: 1299.99,
        currency: "USD"
      },
      bookingAgent: {
        name: "Fly2Any",
        url: "https://fly2any.com"
      }
    };

    return this.generateFlightReservation(exampleData);
  }

  /**
   * Generate FlightReservation schema script tag for HTML injection
   */
  static generateFlightReservationScript(data: FlightReservationData): string {
    const schema = this.generateFlightReservation(data);
    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }
}

/**
 * Common flight routes for Fly2Any with pre-configured airport data
 */
export const COMMON_FLIGHT_ROUTES = {
  MIA_SAO: {
    departureAirport: {
      name: "Miami International Airport",
      iataCode: "MIA",
      address: { addressLocality: "Miami", addressRegion: "FL", addressCountry: "US" }
    },
    arrivalAirport: {
      name: "São Paulo-Guarulhos International Airport", 
      iataCode: "GRU",
      address: { addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" }
    }
  },
  JFK_GIG: {
    departureAirport: {
      name: "John F. Kennedy International Airport",
      iataCode: "JFK",
      address: { addressLocality: "New York", addressRegion: "NY", addressCountry: "US" }
    },
    arrivalAirport: {
      name: "Rio de Janeiro-Galeão International Airport",
      iataCode: "GIG", 
      address: { addressLocality: "Rio de Janeiro", addressRegion: "RJ", addressCountry: "BR" }
    }
  },
  LAX_GRU: {
    departureAirport: {
      name: "Los Angeles International Airport",
      iataCode: "LAX",
      address: { addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" }
    },
    arrivalAirport: {
      name: "São Paulo-Guarulhos International Airport",
      iataCode: "GRU",
      address: { addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" }
    }
  }
} as const;