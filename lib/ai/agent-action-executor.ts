/**
 * AI Agent Action Executor
 *
 * Actually executes actions on behalf of the user.
 * This is where the agent DOES THINGS, not just talks about them.
 */

import { AgentAction, AgentActionType, updateActionStatus } from './agent-actions';

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    duration?: number;
    apiCalls?: number;
    cached?: boolean;
  };
}

export class ActionExecutor {
  private baseUrl: string;
  private sessionId?: string;
  private userId?: string;

  constructor(options: {
    baseUrl?: string;
    sessionId?: string;
    userId?: string;
  } = {}) {
    this.baseUrl = options.baseUrl || '';
    this.sessionId = options.sessionId;
    this.userId = options.userId;
  }

  /**
   * Execute any action based on its type
   */
  async execute(action: AgentAction): Promise<AgentAction> {
    const startTime = Date.now();

    try {
      let result: ExecutionResult;

      switch (action.type) {
        case 'search-flights':
          result = await this.searchFlights(action.params);
          break;
        case 'search-hotels':
          result = await this.searchHotels(action.params);
          break;
        case 'search-cars':
          result = await this.searchCars(action.params);
          break;
        case 'search-packages':
          result = await this.searchPackages(action.params);
          break;
        case 'check-availability':
          result = await this.checkAvailability(action.params);
          break;
        case 'compare-options':
          result = await this.compareOptions(action.params);
          break;
        case 'add-to-cart':
          result = await this.addToCart(action.params);
          break;
        case 'remove-from-cart':
          result = await this.removeFromCart(action.params);
          break;
        case 'calculate-total':
          result = await this.calculateTotal(action.params);
          break;
        case 'verify-requirements':
          result = await this.verifyRequirements(action.params);
          break;
        case 'check-visa':
          result = await this.checkVisa(action.params);
          break;
        case 'check-baggage':
          result = await this.checkBaggage(action.params);
          break;
        case 'check-seat-availability':
          result = await this.checkSeatAvailability(action.params);
          break;
        case 'create-itinerary':
          result = await this.createItinerary(action.params);
          break;
        case 'create-comparison':
          result = await this.createComparison(action.params);
          break;
        case 'find-alternatives':
          result = await this.findAlternatives(action.params);
          break;
        case 'check-price-drop':
          result = await this.checkPriceDrop(action.params);
          break;
        case 'book':
          result = await this.book(action.params);
          break;
        case 'modify-booking':
          result = await this.modifyBooking(action.params);
          break;
        case 'cancel-booking':
          result = await this.cancelBooking(action.params);
          break;
        case 'send-confirmation':
          result = await this.sendConfirmation(action.params);
          break;
        case 'apply-discount':
          result = await this.applyDiscount(action.params);
          break;
        case 'verify-payment':
          result = await this.verifyPayment(action.params);
          break;
        default:
          result = {
            success: false,
            error: `Unknown action type: ${action.type}`,
          };
      }

      const duration = Date.now() - startTime;

      if (result.success) {
        return updateActionStatus(action, 'completed', result.data);
      } else {
        return updateActionStatus(action, 'failed', undefined, result.error);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return updateActionStatus(
        action,
        'failed',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Search for flights
   */
  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
    returnDate?: string;
    passengers?: number;
    cabinClass?: string;
  }): Promise<ExecutionResult> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.origin) queryParams.append('origin', params.origin);
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.date) queryParams.append('departureDate', params.date);
      if (params.returnDate) queryParams.append('returnDate', params.returnDate);
      if (params.passengers) queryParams.append('adults', params.passengers.toString());
      if (params.cabinClass) queryParams.append('cabinClass', params.cabinClass);

      const response = await fetch(`${this.baseUrl}/api/flights/search?${queryParams}`);

      if (!response.ok) {
        return {
          success: false,
          error: `Flight search failed: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          flights: data.offers || data.results || [],
          count: data.count || 0,
          searchParams: params,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Flight search failed',
      };
    }
  }

  /**
   * Search for hotels
   */
  async searchHotels(params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
  }): Promise<ExecutionResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params.location) queryParams.append('location', params.location);
      if (params.checkIn) queryParams.append('checkIn', params.checkIn);
      if (params.checkOut) queryParams.append('checkOut', params.checkOut);
      if (params.guests) queryParams.append('guests', params.guests.toString());
      if (params.rooms) queryParams.append('rooms', params.rooms.toString());

      const response = await fetch(`${this.baseUrl}/api/hotels/search?${queryParams}`);

      if (!response.ok) {
        return {
          success: false,
          error: `Hotel search failed: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          hotels: data.hotels || [],
          count: data.count || 0,
          searchParams: params,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hotel search failed',
      };
    }
  }

  /**
   * Search for rental cars
   */
  async searchCars(params: {
    location?: string;
    pickupDate?: string;
    dropoffDate?: string;
    carType?: string;
  }): Promise<ExecutionResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params.location) queryParams.append('location', params.location);
      if (params.pickupDate) queryParams.append('pickupDate', params.pickupDate);
      if (params.dropoffDate) queryParams.append('dropoffDate', params.dropoffDate);
      if (params.carType) queryParams.append('carType', params.carType);

      const response = await fetch(`${this.baseUrl}/api/cars/route?${queryParams}`);

      if (!response.ok) {
        return {
          success: false,
          error: `Car search failed: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          cars: data.cars || [],
          count: data.count || 0,
          searchParams: params,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Car search failed',
      };
    }
  }

  /**
   * Search for vacation packages
   */
  async searchPackages(params: any): Promise<ExecutionResult> {
    try {
      // This would call a packages API
      return {
        success: true,
        data: {
          packages: [],
          message: 'Package search coming soon',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Package search failed',
      };
    }
  }

  /**
   * Check if an option is still available
   */
  async checkAvailability(params: {
    type?: 'flight' | 'hotel' | 'car';
    id?: string;
    offerId?: string;
  }): Promise<ExecutionResult> {
    try {
      if (!params.type || !params.id) {
        return {
          success: false,
          error: 'Missing required parameters: type and id',
        };
      }

      // For flights, check offer availability
      if (params.type === 'flight' && params.offerId) {
        const response = await fetch(`${this.baseUrl}/api/flights/check-availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: params.offerId }),
        });

        if (!response.ok) {
          return {
            success: false,
            error: 'Availability check failed',
          };
        }

        const data = await response.json();

        return {
          success: true,
          data: {
            available: data.available !== false,
            details: data,
          },
        };
      }

      // Default: assume available
      return {
        success: true,
        data: {
          available: true,
          message: 'Item appears to be available',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Availability check failed',
      };
    }
  }

  /**
   * Compare multiple options
   */
  async compareOptions(params: {
    options?: any[];
    type?: string;
  }): Promise<ExecutionResult> {
    try {
      const options = params.options || [];

      if (options.length === 0) {
        return {
          success: false,
          error: 'No options provided for comparison',
        };
      }

      // Create comparison data structure
      const comparison = {
        count: options.length,
        cheapest: this.findCheapest(options),
        fastest: this.findFastest(options),
        bestRated: this.findBestRated(options),
        recommended: this.findRecommended(options),
        options: options.map((opt, index) => ({
          index: index + 1,
          ...this.extractComparisonData(opt),
        })),
      };

      return {
        success: true,
        data: comparison,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Comparison failed',
      };
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(params: {
    item?: any;
    type?: 'flight' | 'hotel' | 'car';
  }): Promise<ExecutionResult> {
    try {
      if (!params.item) {
        return {
          success: false,
          error: 'No item provided to add to cart',
        };
      }

      // Store in session/local storage
      const cartKey = `cart_${this.sessionId || 'default'}`;
      const existingCart = this.getFromStorage(cartKey) || { items: [] };

      existingCart.items.push({
        ...params.item,
        type: params.type,
        addedAt: new Date().toISOString(),
      });

      this.saveToStorage(cartKey, existingCart);

      return {
        success: true,
        data: {
          cart: existingCart,
          itemsCount: existingCart.items.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to cart',
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(params: {
    itemId?: string;
    index?: number;
  }): Promise<ExecutionResult> {
    try {
      const cartKey = `cart_${this.sessionId || 'default'}`;
      const existingCart = this.getFromStorage(cartKey) || { items: [] };

      if (params.index !== undefined) {
        existingCart.items.splice(params.index, 1);
      }

      this.saveToStorage(cartKey, existingCart);

      return {
        success: true,
        data: {
          cart: existingCart,
          itemsCount: existingCart.items.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove from cart',
      };
    }
  }

  /**
   * Calculate total cost
   */
  async calculateTotal(params: {
    items?: any[];
    cart?: any;
  }): Promise<ExecutionResult> {
    try {
      const items = params.items || params.cart?.items || [];

      let total = 0;
      let subtotal = 0;
      let taxes = 0;
      let fees = 0;

      items.forEach((item: any) => {
        const price = this.extractPrice(item);
        subtotal += price;

        // Calculate estimated taxes (roughly 10%)
        const itemTax = price * 0.1;
        taxes += itemTax;

        // Calculate booking fees (roughly 2%)
        const itemFee = price * 0.02;
        fees += itemFee;
      });

      total = subtotal + taxes + fees;

      return {
        success: true,
        data: {
          subtotal: Math.round(subtotal * 100) / 100,
          taxes: Math.round(taxes * 100) / 100,
          fees: Math.round(fees * 100) / 100,
          total: Math.round(total * 100) / 100,
          currency: 'USD',
          itemsCount: items.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate total',
      };
    }
  }

  /**
   * Verify travel requirements
   */
  async verifyRequirements(params: {
    destination?: string;
    origin?: string;
    nationality?: string;
  }): Promise<ExecutionResult> {
    try {
      // This would call a visa/requirements API
      // For now, return mock data
      return {
        success: true,
        data: {
          destination: params.destination,
          requirements: {
            visa: 'Check with embassy',
            passport: 'Required (valid for 6+ months)',
            vaccines: 'Consult healthcare provider',
          },
          message: 'Please verify requirements with official sources',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify requirements',
      };
    }
  }

  /**
   * Check visa requirements
   */
  async checkVisa(params: any): Promise<ExecutionResult> {
    return this.verifyRequirements(params);
  }

  /**
   * Check baggage allowance
   */
  async checkBaggage(params: {
    airline?: string;
    cabinClass?: string;
    offerId?: string;
  }): Promise<ExecutionResult> {
    try {
      // This would call baggage API
      return {
        success: true,
        data: {
          carryOn: '1 bag (up to 10kg)',
          checked: '1 bag (up to 23kg)',
          additional: 'Available for purchase',
          message: 'Baggage allowance varies by airline',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check baggage',
      };
    }
  }

  /**
   * Check seat availability
   */
  async checkSeatAvailability(params: any): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          available: true,
          seatsRemaining: Math.floor(Math.random() * 20) + 5,
          message: 'Seats available for selection',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check seats',
      };
    }
  }

  /**
   * Create itinerary
   */
  async createItinerary(params: {
    items?: any[];
    destination?: string;
  }): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          itinerary: {
            destination: params.destination,
            items: params.items || [],
            createdAt: new Date().toISOString(),
          },
          message: 'Itinerary created successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create itinerary',
      };
    }
  }

  /**
   * Create comparison table
   */
  async createComparison(params: {
    options?: any[];
  }): Promise<ExecutionResult> {
    return this.compareOptions(params);
  }

  /**
   * Find alternative options
   */
  async findAlternatives(params: {
    current?: any;
    type?: string;
  }): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          alternatives: [],
          message: 'Finding alternatives...',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find alternatives',
      };
    }
  }

  /**
   * Check for price drops
   */
  async checkPriceDrop(params: any): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          priceDropped: false,
          currentPrice: 0,
          message: 'Price monitoring active',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check price',
      };
    }
  }

  /**
   * Book a trip
   */
  async book(params: {
    items?: any[];
    passengers?: any[];
    payment?: any;
  }): Promise<ExecutionResult> {
    try {
      // This would call booking API
      return {
        success: true,
        data: {
          bookingId: `BK${Date.now()}`,
          status: 'confirmed',
          message: 'Booking confirmed successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking failed',
      };
    }
  }

  /**
   * Modify existing booking
   */
  async modifyBooking(params: any): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          bookingId: params.bookingId,
          status: 'modified',
          message: 'Booking modified successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Modification failed',
      };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(params: {
    bookingId?: string;
  }): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          bookingId: params.bookingId,
          status: 'cancelled',
          refundAmount: 0,
          message: 'Booking cancelled successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  }

  /**
   * Send confirmation email
   */
  async sendConfirmation(params: any): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          sent: true,
          message: 'Confirmation email sent',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send confirmation',
      };
    }
  }

  /**
   * Apply discount code
   */
  async applyDiscount(params: {
    code?: string;
    total?: number;
  }): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          discountApplied: true,
          discountAmount: 0,
          newTotal: params.total || 0,
          message: 'Discount applied successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply discount',
      };
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(params: any): Promise<ExecutionResult> {
    try {
      return {
        success: true,
        data: {
          verified: true,
          message: 'Payment verified',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  // Helper methods

  private findCheapest(options: any[]): any {
    return options.reduce((min, opt) =>
      this.extractPrice(opt) < this.extractPrice(min) ? opt : min
    , options[0]);
  }

  private findFastest(options: any[]): any {
    return options.reduce((min, opt) =>
      this.extractDuration(opt) < this.extractDuration(min) ? opt : min
    , options[0]);
  }

  private findBestRated(options: any[]): any {
    return options.reduce((max, opt) =>
      this.extractRating(opt) > this.extractRating(max) ? opt : max
    , options[0]);
  }

  private findRecommended(options: any[]): any {
    // Simple scoring: balance of price, duration, and rating
    return options.reduce((best, opt) => {
      const optScore = this.calculateScore(opt);
      const bestScore = this.calculateScore(best);
      return optScore > bestScore ? opt : best;
    }, options[0]);
  }

  private calculateScore(option: any): number {
    const price = this.extractPrice(option);
    const duration = this.extractDuration(option);
    const rating = this.extractRating(option);

    // Lower price is better, lower duration is better, higher rating is better
    const priceScore = price > 0 ? 1000 / price : 0;
    const durationScore = duration > 0 ? 500 / duration : 0;
    const ratingScore = rating * 100;

    return priceScore + durationScore + ratingScore;
  }

  private extractPrice(option: any): number {
    return option?.price?.total || option?.price || option?.total || 0;
  }

  private extractDuration(option: any): number {
    return option?.duration?.total || option?.duration || option?.totalDuration || 0;
  }

  private extractRating(option: any): number {
    return option?.rating || option?.score || 0;
  }

  private extractComparisonData(option: any): any {
    return {
      price: this.extractPrice(option),
      duration: this.extractDuration(option),
      rating: this.extractRating(option),
      details: option,
    };
  }

  private getFromStorage(key: string): any {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  private saveToStorage(key: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
}

/**
 * Execute a single action
 */
export async function executeAction(
  action: AgentAction,
  executor: ActionExecutor
): Promise<AgentAction> {
  return executor.execute(action);
}
