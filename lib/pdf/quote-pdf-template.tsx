// lib/pdf/quote-pdf-template.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Register fonts if needed (optional - falls back to default sans-serif)
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#1C1C1C",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingBottom: 24,
    borderBottom: "3pt solid #E74035",
  },
  logo: {
    fontSize: 32,
    fontWeight: 700,
    color: "#E74035",
    letterSpacing: -1,
  },
  quoteNumber: {
    fontSize: 10,
    color: "#6B6B6B",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  metaInfo: {
    textAlign: "right",
  },
  metaLabel: {
    fontSize: 8,
    color: "#9F9F9F",
    marginBottom: 3,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0A0A0A",
    letterSpacing: -0.2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#E74035",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    border: "1.5pt solid #E6E6E6",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0A0A0A",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardDetail: {
    fontSize: 9,
    color: "#6B6B6B",
    marginBottom: 3,
    lineHeight: 1.4,
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: 700,
    color: "#E74035",
    marginTop: 8,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#6B6B6B",
    letterSpacing: -0.1,
  },
  value: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0A0A0A",
    letterSpacing: -0.2,
  },
  pricingSection: {
    marginTop: 32,
    paddingTop: 20,
    borderTop: "2pt solid #DCDCDC",
    backgroundColor: "#FAFAFA",
    padding: 20,
    borderRadius: 8,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "2.5pt solid #E74035",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#E74035",
    letterSpacing: -0.5,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1pt solid #E6E6E6",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9F9F9F",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  clientInfo: {
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    border: "1pt solid #E6E6E6",
  },
  tripHeader: {
    backgroundColor: "#E74035",
    color: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tripSubtitle: {
    fontSize: 10,
    opacity: 0.95,
    lineHeight: 1.5,
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: "#F7C928",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 600,
    color: "#0A0A0A",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginVertical: 16,
  },
  emphasizedText: {
    fontWeight: 700,
    color: "#E74035",
  },
});

interface QuotePDFProps {
  quote: any;
}

const QuotePDFTemplate: React.FC<QuotePDFProps> = ({ quote }) => {
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Fly2Any</Text>
            <Text style={styles.quoteNumber}>QUOTE #{quote.quoteNumber}</Text>
            {quote.status && (
              <View style={[styles.badge, { marginTop: 8, display: 'inline-block' as any }]}>
                <Text style={styles.badgeText}>{quote.status.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaInfo}>
            <Text style={styles.metaLabel}>ISSUE DATE</Text>
            <Text style={styles.metaValue}>{formatDate(quote.createdAt)}</Text>
            <Text style={[styles.metaLabel, { marginTop: 12 }]}>VALID UNTIL</Text>
            <Text style={styles.metaValue}>{formatDate(quote.expiresAt)}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT DETAILS</Text>
          <View style={styles.clientInfo}>
            <Text style={styles.cardTitle}>
              {quote.client.firstName} {quote.client.lastName}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.cardDetail}>{quote.client.email}</Text>
            {quote.client.phone && (
              <Text style={styles.cardDetail}>{quote.client.phone}</Text>
            )}
          </View>
        </View>

        {/* Trip Overview */}
        <View style={styles.section}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>{quote.tripName}</Text>
            <Text style={styles.tripSubtitle}>
              {quote.destination} • {formatDate(quote.startDate)} - {formatDate(quote.endDate)} • {quote.duration} {quote.duration === 1 ? 'day' : 'days'}
            </Text>
            <Text style={[styles.tripSubtitle, { marginTop: 4 }]}>
              {quote.travelers} {quote.travelers === 1 ? 'Traveler' : 'Travelers'} ({quote.adults} {quote.adults === 1 ? 'Adult' : 'Adults'}
              {quote.children > 0 && `, ${quote.children} ${quote.children === 1 ? 'Child' : 'Children'}`}
              {quote.infants > 0 && `, ${quote.infants} ${quote.infants === 1 ? 'Infant' : 'Infants'}`})
            </Text>
          </View>
        </View>

        {/* Flights */}
        {quote.flights && quote.flights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✈ FLIGHTS</Text>
            {quote.flights.map((flight: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {flight.origin} → {flight.destination}
                </Text>
                <Text style={styles.cardDetail}>
                  {flight.airline} {flight.flightNumber}
                </Text>
                <Text style={styles.cardDetail}>
                  Departure: {formatDate(flight.departureTime)} • Arrival: {formatDate(flight.arrivalTime)}
                </Text>
                {flight.cabin && (
                  <Text style={styles.cardDetail}>Cabin: {flight.cabin}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(flight.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hotels */}
        {quote.hotels && quote.hotels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 ACCOMMODATIONS</Text>
            {quote.hotels.map((hotel: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{hotel.name}</Text>
                <Text style={styles.cardDetail}>
                  {hotel.location || hotel.city}
                </Text>
                <Text style={styles.cardDetail}>
                  Check-in: {formatDate(hotel.checkIn)} • Check-out: {formatDate(hotel.checkOut)}
                </Text>
                {hotel.roomType && (
                  <Text style={styles.cardDetail}>Room: {hotel.roomType}</Text>
                )}
                {hotel.nights && (
                  <Text style={styles.cardDetail}>{hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(hotel.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Activities */}
        {quote.activities && quote.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 ACTIVITIES & TOURS</Text>
            {quote.activities.map((activity: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{activity.name || activity.title}</Text>
                {activity.description && (
                  <Text style={styles.cardDetail}>{activity.description}</Text>
                )}
                {activity.date && (
                  <Text style={styles.cardDetail}>Date: {formatDate(activity.date)}</Text>
                )}
                {activity.duration && (
                  <Text style={styles.cardDetail}>Duration: {activity.duration}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(activity.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transfers */}
        {quote.transfers && quote.transfers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚗 TRANSFERS</Text>
            {quote.transfers.map((transfer: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {transfer.from} → {transfer.to}
                </Text>
                {transfer.vehicleType && (
                  <Text style={styles.cardDetail}>Vehicle: {transfer.vehicleType}</Text>
                )}
                {transfer.date && (
                  <Text style={styles.cardDetail}>Date: {formatDate(transfer.date)}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(transfer.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Car Rentals */}
        {quote.carRentals && quote.carRentals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚙 CAR RENTALS</Text>
            {quote.carRentals.map((car: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{car.vehicleType || car.name}</Text>
                {car.company && (
                  <Text style={styles.cardDetail}>Company: {car.company}</Text>
                )}
                <Text style={styles.cardDetail}>
                  Pick-up: {formatDate(car.pickUpDate)} • Drop-off: {formatDate(car.dropOffDate)}
                </Text>
                {car.location && (
                  <Text style={styles.cardDetail}>Location: {car.location}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(car.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Insurance */}
        {quote.insurance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡 TRAVEL INSURANCE</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{quote.insurance.name || 'Travel Insurance'}</Text>
              {quote.insurance.coverage && (
                <Text style={styles.cardDetail}>Coverage: {quote.insurance.coverage}</Text>
              )}
              {quote.insurance.provider && (
                <Text style={styles.cardDetail}>Provider: {quote.insurance.provider}</Text>
              )}
              <Text style={styles.cardPrice}>{formatCurrency(quote.insuranceCost)}</Text>
            </View>
          </View>
        )}

        {/* Custom Items */}
        {quote.customItems && quote.customItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>➕ ADDITIONAL SERVICES</Text>
            {quote.customItems.map((item: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{item.name || item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDetail}>{item.description}</Text>
                )}
                <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing Breakdown */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>💰 PRICING SUMMARY</Text>

          {quote.flightsCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Flights</Text>
              <Text style={styles.value}>{formatCurrency(quote.flightsCost)}</Text>
            </View>
          )}

          {quote.hotelsCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Accommodations</Text>
              <Text style={styles.value}>{formatCurrency(quote.hotelsCost)}</Text>
            </View>
          )}

          {quote.activitiesCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Activities & Tours</Text>
              <Text style={styles.value}>{formatCurrency(quote.activitiesCost)}</Text>
            </View>
          )}

          {quote.transfersCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Transfers</Text>
              <Text style={styles.value}>{formatCurrency(quote.transfersCost)}</Text>
            </View>
          )}

          {quote.carRentalsCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Car Rentals</Text>
              <Text style={styles.value}>{formatCurrency(quote.carRentalsCost)}</Text>
            </View>
          )}

          {quote.insuranceCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Travel Insurance</Text>
              <Text style={styles.value}>{formatCurrency(quote.insuranceCost)}</Text>
            </View>
          )}

          {quote.customItemsCost > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Additional Services</Text>
              <Text style={styles.value}>{formatCurrency(quote.customItemsCost)}</Text>
            </View>
          )}

          <View style={styles.pricingRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatCurrency(quote.subtotal)}</Text>
          </View>

          {!quote.hideMarkupBreakdown && quote.agentMarkup > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>
                {quote.commissionLabel || 'Service Fee'}
                {quote.agentMarkupPercent && ` (${quote.agentMarkupPercent.toFixed(1)}%)`}
              </Text>
              <Text style={styles.value}>{formatCurrency(quote.agentMarkup)}</Text>
            </View>
          )}

          {quote.taxes > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Taxes</Text>
              <Text style={styles.value}>{formatCurrency(quote.taxes)}</Text>
            </View>
          )}

          {quote.fees > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Fees</Text>
              <Text style={styles.value}>{formatCurrency(quote.fees)}</Text>
            </View>
          )}

          {quote.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.label}>Discount</Text>
              <Text style={[styles.value, { color: "#27C56B" }]}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.total)} {quote.currency}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontSize: 10, color: "#6B6B6B", marginBottom: 8 }]}>
            This quote is valid until {formatDate(quote.expiresAt)}
          </Text>
          <View style={[styles.divider, { width: 120, marginHorizontal: 'auto' as any, marginVertical: 12 }]} />
          <Text style={styles.footerText}>
            For questions or to book, please contact your travel agent
          </Text>
          {quote.agent?.user && (
            <Text style={[styles.footerText, { fontWeight: 600, color: "#6B6B6B" }]}>
              {quote.agent.user.name} • {quote.agent.user.email}
            </Text>
          )}
          <Text style={[styles.footerText, { marginTop: 16, fontSize: 8, color: "#9F9F9F" }]}>
            Fly2Any • Ultra-Premium Travel Booking Platform
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDFTemplate;
