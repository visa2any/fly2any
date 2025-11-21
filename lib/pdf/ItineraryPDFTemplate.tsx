import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register fonts (using default system fonts)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica", fontWeight: 400 },
    { src: "Helvetica-Bold", fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  // Page styles
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2px solid #2563EB",
  },
  headerLeft: {
    flexDirection: "column",
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: "#2563EB",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 10,
    color: "#6B7280",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  quoteNumber: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  quoteDate: {
    fontSize: 9,
    color: "#9CA3AF",
  },

  // Title section
  titleSection: {
    backgroundColor: "#EFF6FF",
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  tripName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1F2937",
    marginBottom: 8,
  },
  destination: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 10,
  },
  travelDates: {
    fontSize: 11,
    color: "#6B7280",
    flexDirection: "row",
  },
  datesIcon: {
    marginRight: 6,
  },

  // Client info
  clientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
  },
  clientInfo: {
    flexDirection: "column",
  },
  clientLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clientValue: {
    fontSize: 11,
    color: "#1F2937",
    marginBottom: 8,
  },

  // Itinerary section
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1F2937",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: "1px solid #E5E7EB",
  },

  // Product items
  productCategory: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2563EB",
    marginTop: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  productItem: {
    marginBottom: 12,
    paddingLeft: 20,
    flexDirection: "column",
  },
  productName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  productPrice: {
    fontSize: 10,
    color: "#059669",
    fontWeight: 700,
  },

  // Pricing section
  pricingSection: {
    marginTop: 25,
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  pricingValue: {
    fontSize: 10,
    color: "#1F2937",
    fontWeight: 700,
  },
  pricingDivider: {
    borderTop: "1px solid #E5E7EB",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTop: "2px solid #2563EB",
  },
  totalLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 18,
    color: "#2563EB",
    fontWeight: 700,
  },
  perPersonNote: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 4,
  },

  // Notes section
  notesSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#FFFBEB",
    borderLeft: "4px solid #F59E0B",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#92400E",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: "#78350F",
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #E5E7EB",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
  },
  footerLink: {
    fontSize: 8,
    color: "#2563EB",
  },

  // Page number
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 30,
    right: 40,
    color: "#9CA3AF",
  },
});

interface QuoteData {
  quoteNumber: string;
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
  subtotal: number;
  agentMarkup: number;
  agentMarkupPercent: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
  notes: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  agent: {
    businessName?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface ItineraryPDFTemplateProps {
  quote: QuoteData;
}

export const ItineraryPDFTemplate: React.FC<ItineraryPDFTemplateProps> = ({ quote }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    const symbol = quote.currency === "USD" ? "$" : quote.currency;
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCurrencySymbol = () => {
    return quote.currency === "USD" ? "$" : quote.currency;
  };

  return (
    <Document>
      {/* Page 1: Overview & Itinerary */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>
              {quote.agent.businessName || "Fly2Any Travel"}
            </Text>
            <Text style={styles.tagline}>Professional Travel Planning</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteNumber}>Quote #{quote.quoteNumber}</Text>
            <Text style={styles.quoteDate}>
              Created: {formatDate(quote.createdAt)}
            </Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.tripName}>{quote.tripName}</Text>
          <Text style={styles.destination}>📍 {quote.destination}</Text>
          <View style={styles.travelDates}>
            <Text style={styles.datesIcon}>📅</Text>
            <Text>
              {formatDate(quote.startDate)} - {formatDate(quote.endDate)} ({quote.duration} days)
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientSection}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Prepared For</Text>
            <Text style={styles.clientValue}>
              {quote.client.firstName} {quote.client.lastName}
            </Text>
            <Text style={styles.clientValue}>{quote.client.email}</Text>
            {quote.client.phone && (
              <Text style={styles.clientValue}>{quote.client.phone}</Text>
            )}
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Travelers</Text>
            <Text style={styles.clientValue}>{quote.travelers} Total</Text>
            <Text style={styles.clientValue}>
              {quote.adults} Adult{quote.adults !== 1 ? "s" : ""}
            </Text>
            {quote.children > 0 && (
              <Text style={styles.clientValue}>
                {quote.children} Child{quote.children !== 1 ? "ren" : ""}
              </Text>
            )}
            {quote.infants > 0 && (
              <Text style={styles.clientValue}>
                {quote.infants} Infant{quote.infants !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Trip Itinerary */}
        <View>
          <Text style={styles.sectionTitle}>Trip Itinerary</Text>

          {/* Flights */}
          {quote.flights.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>✈️</Text>
                <Text>FLIGHTS</Text>
              </View>
              {quote.flights.map((flight: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{flight.name}</Text>
                  {flight.description && (
                    <Text style={styles.productDescription}>{flight.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(flight.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hotels */}
          {quote.hotels.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>🏨</Text>
                <Text>ACCOMMODATION</Text>
              </View>
              {quote.hotels.map((hotel: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{hotel.name}</Text>
                  {hotel.description && (
                    <Text style={styles.productDescription}>{hotel.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(hotel.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Activities */}
          {quote.activities.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>🎯</Text>
                <Text>ACTIVITIES & EXPERIENCES</Text>
              </View>
              {quote.activities.map((activity: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{activity.name}</Text>
                  {activity.description && (
                    <Text style={styles.productDescription}>{activity.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(activity.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Transfers */}
          {quote.transfers.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>🚗</Text>
                <Text>TRANSFERS</Text>
              </View>
              {quote.transfers.map((transfer: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{transfer.name}</Text>
                  {transfer.description && (
                    <Text style={styles.productDescription}>{transfer.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(transfer.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Car Rentals */}
          {quote.carRentals.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>🚙</Text>
                <Text>CAR RENTALS</Text>
              </View>
              {quote.carRentals.map((car: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{car.name}</Text>
                  {car.description && (
                    <Text style={styles.productDescription}>{car.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(car.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Insurance */}
          {quote.insurance.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>🛡️</Text>
                <Text>TRAVEL INSURANCE</Text>
              </View>
              {quote.insurance.map((ins: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{ins.name}</Text>
                  {ins.description && (
                    <Text style={styles.productDescription}>{ins.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(ins.price)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Custom Items */}
          {quote.customItems.length > 0 && (
            <View>
              <View style={styles.productCategory}>
                <Text style={styles.categoryIcon}>📝</Text>
                <Text>ADDITIONAL ITEMS</Text>
              </View>
              {quote.customItems.map((item: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.productDescription}>{item.description}</Text>
                  )}
                  <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {quote.agent.businessName || "Fly2Any Travel"} •{" "}
            {quote.agent.email} •{" "}
            {quote.agent.phone || ""}
          </Text>
          <Text style={styles.footerLink}>www.fly2any.com</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 2: Pricing & Terms */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>
              {quote.agent.businessName || "Fly2Any Travel"}
            </Text>
            <Text style={styles.tagline}>Professional Travel Planning</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteNumber}>Quote #{quote.quoteNumber}</Text>
          </View>
        </View>

        {/* Pricing Breakdown */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Pricing Breakdown</Text>

          {quote.flights.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Flights</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.flights.reduce((sum, f) => sum + f.price, 0))}
              </Text>
            </View>
          )}

          {quote.hotels.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Accommodation</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.hotels.reduce((sum, h) => sum + h.price, 0))}
              </Text>
            </View>
          )}

          {quote.activities.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Activities & Experiences</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.activities.reduce((sum, a) => sum + a.price, 0))}
              </Text>
            </View>
          )}

          {quote.transfers.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Transfers</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.transfers.reduce((sum, t) => sum + t.price, 0))}
              </Text>
            </View>
          )}

          {quote.carRentals.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Car Rentals</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.carRentals.reduce((sum, c) => sum + c.price, 0))}
              </Text>
            </View>
          )}

          {quote.insurance.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Travel Insurance</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.insurance.reduce((sum, i) => sum + i.price, 0))}
              </Text>
            </View>
          )}

          {quote.customItems.length > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Additional Items</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(quote.customItems.reduce((sum, item) => sum + item.price, 0))}
              </Text>
            </View>
          )}

          <View style={styles.pricingDivider} />

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal</Text>
            <Text style={styles.pricingValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>

          {quote.taxes > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Taxes & Fees</Text>
              <Text style={styles.pricingValue}>{formatCurrency(quote.taxes)}</Text>
            </View>
          )}

          {quote.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Discount</Text>
              <Text style={styles.pricingValue}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
          </View>

          <Text style={styles.perPersonNote}>
            {formatCurrency(quote.total / quote.travelers)} per person
          </Text>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Important Information</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        <View style={{ marginTop: 25 }}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
              • This quote is valid for 7 days from the date of issue
            </Text>
            <Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
              • Prices are subject to availability and may change without notice
            </Text>
            <Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
              • A deposit of 25% is required to confirm booking
            </Text>
            <Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
              • Full payment is due 30 days before departure
            </Text>
            <Text style={{ fontSize: 9, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
              • Cancellation fees may apply as per supplier terms
            </Text>
            <Text style={{ fontSize: 9, color: "#6B7280", lineHeight: 1.4 }}>
              • Travel insurance is highly recommended to protect your investment
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={{ marginTop: 25, padding: 15, backgroundColor: "#EFF6FF", borderRadius: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>
            Questions? We're Here to Help!
          </Text>
          <Text style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>
            📧 Email: {quote.agent.email}
          </Text>
          {quote.agent.phone && (
            <Text style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>
              📞 Phone: {quote.agent.phone}
            </Text>
          )}
          <Text style={{ fontSize: 9, color: "#4B5563" }}>
            🌐 Website: www.fly2any.com
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing {quote.agent.businessName || "Fly2Any Travel"}!
          </Text>
          <Text style={styles.footerText}>
            Let's make your travel dreams a reality ✈️
          </Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
