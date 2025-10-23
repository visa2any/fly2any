/**
 * Parser for Amadeus Branded Fares API responses
 * Converts branded fares data into user-friendly format
 */

export interface BrandedFare {
  type: string; // 'Basic', 'Standard', 'Flex', etc.
  price: number;
  currency: string;
  isSelected: boolean;
  includedBags: number;
  changeable: boolean;
  changeFee: number | null;
  refundable: boolean;
  refundFee: number | null;
  seatSelectionIncluded: boolean;
  seatSelectionFee: number | null;
  priorityBoarding: boolean;
  amenities: string[];
}

export interface ParsedBrandedFares {
  fares: BrandedFare[];
  hasRealData: boolean;
  currentFareType: string;
  savingsInsight: string | null; // e.g., "Upgrade to Flex for $118 → Save on changes"
}

/**
 * Parse Amadeus branded fares response
 */
export function parseBrandedFares(
  brandedFaresResponse: any,
  currentPrice: number,
  currentCurrency: string,
  currentFareType: string = 'Standard'
): ParsedBrandedFares {
  const data = brandedFaresResponse?.data || [];
  const hasRealData = Array.isArray(data) && data.length > 0;

  if (!hasRealData) {
    return {
      fares: [],
      hasRealData: false,
      currentFareType,
      savingsInsight: null,
    };
  }

  // Parse each branded fare option
  const fares: BrandedFare[] = data.map((fareOption: any) => {
    const brandedFare = fareOption.brandedFare || {};
    const price = parseFloat(fareOption.price?.total || '0');

    // Extract amenities from services
    const services = brandedFare.includedServices || [];
    const amenities: string[] = [];

    let includedBags = 0;
    let changeable = false;
    let changeFee: number | null = null;
    let refundable = false;
    let refundFee: number | null = null;
    let seatSelectionIncluded = false;
    let seatSelectionFee: number | null = null;
    let priorityBoarding = false;

    services.forEach((service: any) => {
      const serviceType = service.type?.toUpperCase() || '';

      if (serviceType.includes('BAGGAGE') || serviceType.includes('BAG')) {
        const bagsCount = parseInt(service.quantity || '0', 10);
        includedBags = Math.max(includedBags, bagsCount);
        if (bagsCount > 0) amenities.push(`${bagsCount} checked bag${bagsCount > 1 ? 's' : ''}`);
      }

      if (serviceType.includes('CHANGE') || serviceType.includes('EXCHANGE')) {
        changeable = true;
        if (service.fee) {
          changeFee = parseFloat(service.fee);
          amenities.push(`Changes: $${changeFee} fee`);
        } else {
          amenities.push('Free changes');
        }
      }

      if (serviceType.includes('REFUND')) {
        refundable = true;
        if (service.fee) {
          refundFee = parseFloat(service.fee);
          amenities.push(`Refundable: $${refundFee} fee`);
        } else {
          amenities.push('Free refund');
        }
      }

      if (serviceType.includes('SEAT')) {
        seatSelectionIncluded = true;
        if (service.fee && parseFloat(service.fee) > 0) {
          seatSelectionFee = parseFloat(service.fee);
        }
        if (!seatSelectionFee) {
          amenities.push('Free seat selection');
        }
      }

      if (serviceType.includes('PRIORITY')) {
        priorityBoarding = true;
        amenities.push('Priority boarding');
      }
    });

    return {
      type: brandedFare.name || brandedFare.brandText || 'Standard',
      price,
      currency: fareOption.price?.currency || currentCurrency,
      isSelected: Math.abs(price - currentPrice) < 1, // Consider selected if price matches
      includedBags,
      changeable,
      changeFee,
      refundable,
      refundFee,
      seatSelectionIncluded,
      seatSelectionFee,
      priorityBoarding,
      amenities,
    };
  });

  // Sort fares by price (ascending)
  fares.sort((a, b) => a.price - b.price);

  // Generate savings insight
  let savingsInsight: string | null = null;
  const selectedFare = fares.find(f => f.isSelected);
  const nextTierFare = fares.find(f => f.price > (selectedFare?.price || currentPrice));

  if (selectedFare && nextTierFare) {
    const priceDiff = nextTierFare.price - selectedFare.price;

    // Check what benefits the upgrade provides
    const benefits: string[] = [];
    if (nextTierFare.refundable && !selectedFare.refundable) {
      benefits.push('refunds');
    }
    if (nextTierFare.changeable && !selectedFare.changeable) {
      benefits.push('changes');
    }
    if (nextTierFare.includedBags > selectedFare.includedBags) {
      benefits.push('extra bags');
    }
    if (nextTierFare.priorityBoarding && !selectedFare.priorityBoarding) {
      benefits.push('priority boarding');
    }

    if (benefits.length > 0) {
      savingsInsight = `Upgrade to ${nextTierFare.type} for $${priceDiff.toFixed(0)} → Get ${benefits.join(' + ')}`;
    }
  }

  return {
    fares,
    hasRealData: true,
    currentFareType: selectedFare?.type || currentFareType,
    savingsInsight,
  };
}

/**
 * Format branded fares for display in compact single-line view
 */
export function formatBrandedFaresCompact(parsedFares: ParsedBrandedFares): {
  displayText: string;
  hasMultipleFares: boolean;
} {
  if (!parsedFares.hasRealData || parsedFares.fares.length === 0) {
    return {
      displayText: 'No fare options available',
      hasMultipleFares: false,
    };
  }

  const selectedFare = parsedFares.fares.find(f => f.isSelected) || parsedFares.fares[0];

  return {
    displayText: `${parsedFares.currentFareType} selected`,
    hasMultipleFares: parsedFares.fares.length > 1,
  };
}
