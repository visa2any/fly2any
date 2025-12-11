/**
 * Centralized Selectors for E2E Tests
 * Keep all CSS selectors in one place for easy maintenance
 */

export const selectors = {
  // Search Form
  search: {
    originInput: 'input[name="origin"], input[placeholder*="From"], input[placeholder*="Origin"]',
    destinationInput: 'input[name="destination"], input[placeholder*="To"], input[placeholder*="Destination"]',
    departureDateInput: 'input[name="departureDate"], input[placeholder*="Departure"]',
    returnDateInput: 'input[name="returnDate"], input[placeholder*="Return"]',
    adultsInput: 'input[name="adults"], select[name="adults"]',
    childrenInput: 'input[name="children"], select[name="children"]',
    infantsInput: 'input[name="infants"], select[name="infants"]',
    cabinClassSelect: 'select[name="class"], select[name="cabinClass"]',
    searchButton: 'button[type="submit"]:has-text("Search"), button:has-text("Search Flights")',
    tripTypeRadio: 'input[name="tripType"]',
    directFlightsCheckbox: 'input[name="directOnly"], input[type="checkbox"]:has-text("Direct")',
  },

  // Flight Results
  results: {
    container: '[data-testid="results-container"], .results-container',
    flightCard: '[data-testid="flight-card"], [class*="FlightCard"], article:has([class*="price"])',
    flightPrice: '[data-testid="flight-price"], [class*="price"]',
    flightAirline: '[data-testid="airline"], [class*="airline"]',
    flightDuration: '[data-testid="duration"], [class*="duration"]',
    flightStops: '[data-testid="stops"], [class*="stops"]',
    selectButton: 'button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")',
    loadMoreButton: 'button:has-text("Load More"), button:has-text("Show More")',
    loadingSpinner: '[class*="loading"], [class*="spinner"], [role="progressbar"]',
    errorMessage: '[role="alert"], [class*="error"]',
    noResults: 'text=/no flights found|no results/i',
  },

  // Filters
  filters: {
    container: '[data-testid="filters"], aside, [class*="filters"]',
    priceSlider: 'input[type="range"][name*="price"]',
    priceMin: 'input[name="priceMin"]',
    priceMax: 'input[name="priceMax"]',
    stopsFilter: '[data-testid="stops-filter"]',
    directFlightsCheckbox: 'input[type="checkbox"]:has-text("Direct")',
    oneStopCheckbox: 'input[type="checkbox"]:has-text("1 Stop")',
    twoStopsCheckbox: 'input[type="checkbox"]:has-text("2+ Stops")',
    airlineFilter: '[data-testid="airline-filter"]',
    departureTimeFilter: '[data-testid="departure-time-filter"]',
    resetButton: 'button:has-text("Reset"), button:has-text("Clear All")',
    applyButton: 'button:has-text("Apply")',
  },

  // Sort
  sort: {
    dropdown: 'select[name="sort"], [role="combobox"][aria-label*="Sort"]',
    bestOption: 'option[value="best"], option:has-text("Best")',
    cheapestOption: 'option[value="cheapest"], option:has-text("Cheapest")',
    fastestOption: 'option[value="fastest"], option:has-text("Fastest")',
    earliestOption: 'option[value="earliest"], option:has-text("Earliest")',
  },

  // Seat Selection (Updated for Apple-class UI)
  seats: {
    // Modal & container
    modal: '[data-testid="seat-map-modal"]',
    container: '[data-testid="seat-map"]',
    grid: '[data-testid="seat-grid"]',
    legend: '[data-testid="seat-legend"]',
    closeButton: '[data-testid="close-seat-map"]',
    // Individual seats
    seatButton: 'button[data-testid^="seat-"]',
    availableSeat: 'button[data-testid^="seat-"][data-available="true"]',
    selectedSeat: 'button[data-testid^="seat-"][data-selected="true"]',
    occupiedSeat: 'button[data-testid^="seat-"][data-available="false"]',
    // Preference cards
    preferenceWindow: '[data-testid="seat-preference-window"]',
    preferenceAisle: '[data-testid="seat-preference-aisle"]',
    preferenceLegroom: '[data-testid="seat-preference-extra_legroom"]',
    preferenceFront: '[data-testid="seat-preference-front"]',
    // Actions
    skipSeatsButton: '[data-testid="skip-seats-button"]',
    confirmSeatsButton: '[data-testid="confirm-seats-button"]',
    // Legacy selectors (fallback)
    exitRowSeat: 'button[class*="seat"][data-exit-row="true"], button[title*="Exit Row"]',
    economySeat: 'button[class*="seat"][data-cabin="economy"]',
    businessSeat: 'button[class*="seat"][data-cabin="business"]',
  },

  // Passenger Form
  passenger: {
    form: '[data-testid="passenger-form"], form[name="passengers"]',
    titleSelect: 'select[name*="title"]',
    firstNameInput: 'input[name*="firstName"]',
    lastNameInput: 'input[name*="lastName"]',
    dateOfBirthInput: 'input[name*="dateOfBirth"], input[name*="dob"]',
    emailInput: 'input[name*="email"][type="email"]',
    phoneInput: 'input[name*="phone"], input[type="tel"]',
    passportInput: 'input[name*="passport"]',
    nationalitySelect: 'select[name*="nationality"]',
    frequentFlyerInput: 'input[name*="frequentFlyer"]',
    addPassengerButton: 'button:has-text("Add Passenger")',
    continueButton: 'button:has-text("Continue"), button[type="submit"]',
    errorMessage: '[class*="error"], [role="alert"]',
  },

  // Payment
  payment: {
    form: '[data-testid="payment-form"], form[name="payment"]',
    cardNumberInput: 'input[name="cardNumber"], iframe[name*="card-number"]',
    expiryInput: 'input[name="expiry"], iframe[name*="expiry"]',
    cvcInput: 'input[name="cvc"], iframe[name*="cvc"]',
    nameOnCardInput: 'input[name="cardholderName"]',
    billingAddressInput: 'input[name*="address"]',
    billingCityInput: 'input[name*="city"]',
    billingPostalInput: 'input[name*="postal"], input[name*="zip"]',
    billingCountrySelect: 'select[name*="country"]',
    termsCheckbox: 'input[type="checkbox"][name*="terms"]',
    submitButton: 'button:has-text("Pay"), button:has-text("Complete Booking")',
    totalAmount: '[data-testid="total-amount"], [class*="total"]',
    stripeIframe: 'iframe[name^="__privateStripeFrame"]',
  },

  // Confirmation
  confirmation: {
    container: '[data-testid="confirmation"], [class*="confirmation"]',
    bookingReference: '[data-testid="booking-reference"], [class*="reference"]',
    successMessage: 'text=/booking confirmed|success/i',
    downloadButton: 'button:has-text("Download"), a:has-text("Download")',
    emailSentMessage: 'text=/email sent|confirmation sent/i',
    flightDetails: '[data-testid="flight-details"]',
    passengerDetails: '[data-testid="passenger-details"]',
    priceBreakdown: '[data-testid="price-breakdown"]',
  },

  // Navigation
  nav: {
    logo: 'a[href="/"], img[alt*="Fly2Any"]',
    flightsLink: 'a[href="/flights"]',
    hotelsLink: 'a[href="/hotels"]',
    myBookingsLink: 'a[href*="bookings"], a[href*="trips"]',
    userMenu: '[data-testid="user-menu"], button[aria-label*="user"]',
    loginButton: 'button:has-text("Sign In"), a:has-text("Login")',
    signupButton: 'button:has-text("Sign Up"), a:has-text("Register")',
    logoutButton: 'button:has-text("Logout"), button:has-text("Sign Out")',
  },

  // AI Assistant
  ai: {
    chatButton: 'button[data-testid="ai-chat"], button:has-text("Chat")',
    chatWindow: '[data-testid="chat-window"], [class*="chat-window"]',
    chatInput: 'input[name="message"], textarea[placeholder*="message"]',
    sendButton: 'button:has-text("Send")',
    chatMessages: '[data-testid="chat-message"]',
    closeButton: 'button[aria-label*="close"]',
  },

  // Mobile
  mobile: {
    menuButton: 'button[aria-label*="menu"], button:has-text("Menu")',
    backButton: 'button:has-text("Back"), a:has-text("Back")',
    filterToggle: 'button:has-text("Filter"), button:has-text("Filters")',
    sortToggle: 'button:has-text("Sort")',
  },

  // Common
  common: {
    loadingOverlay: '[class*="overlay"][class*="loading"]',
    modal: '[role="dialog"], [class*="modal"]',
    closeModalButton: 'button[aria-label*="close"], button:has(svg[class*="close"])',
    toast: '[role="alert"], [class*="toast"], [class*="notification"]',
    tooltip: '[role="tooltip"]',
    dropdown: '[role="listbox"]',
    errorBoundary: '[data-testid="error-boundary"]',
  },
};
