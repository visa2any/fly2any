import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (optional - using default fonts)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Open Sans',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: '#3B82F6',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 20,
  },
  tripSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    width: 120,
  },
  value: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 600,
    flex: 1,
  },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  pricingLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  pricingValue: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 600,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#3B82F6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 3,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontSize: 8,
    fontWeight: 600,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  highlight: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 10,
    color: '#92400E',
    lineHeight: 1.4,
  },
  daySection: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#3B82F6',
    marginBottom: 8,
  },
  dayItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayTime: {
    fontSize: 9,
    color: '#6B7280',
    width: 60,
  },
  dayDescription: {
    fontSize: 9,
    color: '#1F2937',
    flex: 1,
    lineHeight: 1.4,
  },
});

interface ItineraryData {
  quote: {
    tripName: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: number;
    travelers: number;
    adults: number;
    children: number;
    infants: number;
    flights: any[];
    hotels: any[];
    activities: any[];
    transfers: any[];
    carRentals: any[];
    insurance: any[];
    customItems: any[];
    flightsCost: number;
    hotelsCost: number;
    activitiesCost: number;
    transfersCost: number;
    carRentalsCost: number;
    insuranceCost: number;
    customItemsCost: number;
    subtotal: number;
    agentMarkup: number;
    agentMarkupPercent: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
    notes: string | null;
    quoteNumber: string;
    createdAt: string;
    expiresAt: string;
  };
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
}

export const ItineraryTemplate: React.FC<{ data: ItineraryData }> = ({ data }) => {
  const { quote, client, agent } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${quote.currency === 'USD' ? '$' : quote.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const flights = Array.isArray(quote.flights) ? quote.flights : JSON.parse(quote.flights as any || '[]');
  const hotels = Array.isArray(quote.hotels) ? quote.hotels : JSON.parse(quote.hotels as any || '[]');
  const activities = Array.isArray(quote.activities) ? quote.activities : JSON.parse(quote.activities as any || '[]');
  const transfers = Array.isArray(quote.transfers) ? quote.transfers : JSON.parse(quote.transfers as any || '[]');
  const carRentals = Array.isArray(quote.carRentals) ? quote.carRentals : JSON.parse(quote.carRentals as any || '[]');
  const insurance = Array.isArray(quote.insurance) ? quote.insurance : JSON.parse(quote.insurance as any || '[]');
  const customItems = Array.isArray(quote.customItems) ? quote.customItems : JSON.parse(quote.customItems as any || '[]');

  return (
    <Document>
      {/* Page 1: Overview & Details */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Fly2Any</Text>
          <Text style={styles.tagline}>Your Journey, Our Expertise</Text>
        </View>

        {/* Trip Title */}
        <Text style={styles.tripTitle}>{quote.tripName}</Text>
        <Text style={styles.tripSubtitle}>
          {quote.destination} • {quote.duration} {quote.duration === 1 ? 'Day' : 'Days'} • Quote #{quote.quoteNumber}
        </Text>

        {/* Highlight Box */}
        <View style={styles.highlight}>
          <Text style={styles.highlightText}>
            This personalized travel itinerary has been carefully crafted for your {quote.tripName}.
            All arrangements are subject to availability and final confirmation upon booking.
          </Text>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traveler Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{client.firstName} {client.lastName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{client.email}</Text>
          </View>
          {client.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{client.phone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Total Travelers:</Text>
            <Text style={styles.value}>
              {quote.travelers} ({quote.adults} Adults
              {quote.children > 0 && `, ${quote.children} Children`}
              {quote.infants > 0 && `, ${quote.infants} Infants`})
            </Text>
          </View>
        </View>

        {/* Trip Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Departure Date:</Text>
            <Text style={styles.value}>{formatDate(quote.startDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Return Date:</Text>
            <Text style={styles.value}>{formatDate(quote.endDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{quote.duration} {quote.duration === 1 ? 'Day' : 'Days'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quote Valid Until:</Text>
            <Text style={styles.value}>{formatDate(quote.expiresAt)}</Text>
          </View>
        </View>

        {/* Flights */}
        {flights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✈️ Flights</Text>
            {flights.map((flight: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{flight.name}</Text>
                {flight.description && (
                  <Text style={styles.cardText}>{flight.description}</Text>
                )}
                {flight.airline && (
                  <Text style={styles.cardText}>Airline: {flight.airline}</Text>
                )}
                {flight.flightNumber && (
                  <Text style={styles.cardText}>Flight: {flight.flightNumber}</Text>
                )}
                {flight.class && (
                  <Text style={styles.cardText}>Class: {flight.class}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(flight.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 Accommodations</Text>
            {hotels.map((hotel: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{hotel.name}</Text>
                {hotel.description && (
                  <Text style={styles.cardText}>{hotel.description}</Text>
                )}
                {hotel.checkIn && (
                  <Text style={styles.cardText}>Check-in: {formatDate(hotel.checkIn)}</Text>
                )}
                {hotel.checkOut && (
                  <Text style={styles.cardText}>Check-out: {formatDate(hotel.checkOut)}</Text>
                )}
                {hotel.nights && (
                  <Text style={styles.cardText}>{hotel.nights} {hotel.nights === 1 ? 'Night' : 'Nights'}</Text>
                )}
                {hotel.roomType && (
                  <Text style={styles.cardText}>Room: {hotel.roomType}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(hotel.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Quote generated on {formatDate(quote.createdAt)}
          </Text>
          <Text style={styles.footerText}>
            Page 1 of 2
          </Text>
        </View>
      </Page>

      {/* Page 2: Activities, Pricing & Terms */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Fly2Any</Text>
          <Text style={styles.tagline}>{quote.tripName} - Continued</Text>
        </View>

        {/* Activities */}
        {activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Activities & Experiences</Text>
            {activities.map((activity: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{activity.name}</Text>
                {activity.description && (
                  <Text style={styles.cardText}>{activity.description}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(activity.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transfers */}
        {transfers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚗 Ground Transportation</Text>
            {transfers.map((transfer: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{transfer.name}</Text>
                {transfer.description && (
                  <Text style={styles.cardText}>{transfer.description}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(transfer.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Car Rentals */}
        {carRentals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚙 Car Rentals</Text>
            {carRentals.map((car: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{car.name}</Text>
                {car.description && (
                  <Text style={styles.cardText}>{car.description}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(car.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Insurance */}
        {insurance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Travel Insurance</Text>
            {insurance.map((ins: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{ins.name}</Text>
                {ins.description && (
                  <Text style={styles.cardText}>{ins.description}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(ins.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Custom Items */}
        {customItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Additional Items</Text>
            {customItems.map((item: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardText}>{item.description}</Text>
                )}
                <Text style={styles.cardText}>Price: {formatCurrency(item.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing Summary</Text>
          <View style={{ backgroundColor: '#F9FAFB', padding: 15, borderRadius: 4 }}>
            {quote.flightsCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Flights</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.flightsCost)}</Text>
              </View>
            )}
            {quote.hotelsCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Accommodations</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.hotelsCost)}</Text>
              </View>
            )}
            {quote.activitiesCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Activities</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.activitiesCost)}</Text>
              </View>
            )}
            {quote.transfersCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Transportation</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.transfersCost)}</Text>
              </View>
            )}
            {quote.carRentalsCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Car Rentals</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.carRentalsCost)}</Text>
              </View>
            )}
            {quote.insuranceCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Insurance</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.insuranceCost)}</Text>
              </View>
            )}
            {quote.customItemsCost > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Additional Items</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.customItemsCost)}</Text>
              </View>
            )}

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal</Text>
              <Text style={styles.pricingValue}>{formatCurrency(quote.subtotal)}</Text>
            </View>

            {quote.agentMarkup > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Service Fee ({quote.agentMarkupPercent}%)</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.agentMarkup)}</Text>
              </View>
            )}

            {quote.taxes > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Taxes & Fees</Text>
                <Text style={styles.pricingValue}>{formatCurrency(quote.taxes)}</Text>
              </View>
            )}

            {quote.discount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Discount</Text>
                <Text style={{ ...styles.pricingValue, color: '#DC2626' }}>-{formatCurrency(quote.discount)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
            </View>

            <View style={{ ...styles.pricingRow, marginTop: 10, backgroundColor: '#DBEAFE', padding: 8, borderRadius: 3 }}>
              <Text style={styles.pricingLabel}>Per Person</Text>
              <Text style={styles.pricingValue}>{formatCurrency(quote.total / quote.travelers)}</Text>
            </View>
          </View>
        </View>

        {/* Agent Notes */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 Message from Your Travel Agent</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Agent Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Your Travel Agent</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{agent.firstName} {agent.lastName}</Text>
          </View>
          {agent.company && (
            <View style={styles.row}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{agent.company}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{agent.email}</Text>
          </View>
          {agent.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{agent.phone}</Text>
            </View>
          )}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Important Information</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              • This quote is valid until {formatDate(quote.expiresAt)}
            </Text>
            <Text style={styles.cardText}>
              • All prices are in {quote.currency} and subject to availability
            </Text>
            <Text style={styles.cardText}>
              • A deposit may be required to confirm your booking
            </Text>
            <Text style={styles.cardText}>
              • Cancellation policies vary by supplier - details provided upon booking
            </Text>
            <Text style={styles.cardText}>
              • Travel insurance is highly recommended for all international trips
            </Text>
            <Text style={styles.cardText}>
              • Valid travel documents (passport, visa) are the traveler's responsibility
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This quote was generated by Fly2Any - Professional Travel Services
          </Text>
          <Text style={styles.footerText}>
            Page 2 of 2
          </Text>
        </View>
      </Page>
    </Document>
  );
};
