/**
 * Conversation Stage Tracking Tests
 *
 * Tests that AI properly tracks conversation stages and enforces stage rules.
 * Agents MUST NOT skip stages.
 */

import { processUserIntent, type ConversationStage } from '../reasoning-layer';

describe('Conversation Stage Detection', () => {
  // Test 1: Vague input → DISCOVERY
  it('should stay in DISCOVERY for vague input', () => {
    const result = processUserIntent({
      message: 'quero viajar',
      language: 'pt',
    });
    expect(result.conversation_stage).toBe('DISCOVERY');
  });

  // Test 2: Exploratory → DISCOVERY
  it('should classify exploratory query as DISCOVERY', () => {
    const result = processUserIntent({
      message: 'dreaming of visiting europe someday',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('DISCOVERY');
  });

  // Test 3: With destination only → NARROWING
  it('should move to NARROWING when destination is mentioned', () => {
    const result = processUserIntent({
      message: 'I want to go to Paris',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('NARROWING');
  });

  // Test 4: Budget-sensitive → NARROWING
  it('should classify budget query as NARROWING', () => {
    const result = processUserIntent({
      message: 'looking for cheap flights',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('NARROWING');
  });

  // Test 5: Family travel → NARROWING
  it('should classify family travel as NARROWING', () => {
    const result = processUserIntent({
      message: 'trip with kids',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('NARROWING');
  });

  // Test 6: With dates → READY_TO_SEARCH
  it('should move to READY_TO_SEARCH when dates and destination provided', () => {
    const result = processUserIntent({
      message: 'I want to fly to Paris on January 15th',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('READY_TO_SEARCH');
  });

  // Test 7: With dates via session context → READY_TO_SEARCH
  it('should use session context for stage determination', () => {
    const result = processUserIntent({
      message: 'sounds good',
      language: 'en',
      sessionState: {
        collectedContext: {
          destination: 'Paris',
          dates: 'January 15th',
        },
      },
    });
    expect(result.conversation_stage).toBe('READY_TO_SEARCH');
  });

  // Test 8: Flight selected → READY_TO_BOOK
  it('should be READY_TO_BOOK when flight is selected', () => {
    const result = processUserIntent({
      message: 'I want to book this flight',
      language: 'en',
      sessionState: {
        hasSelectedFlight: true,
      },
    });
    expect(result.conversation_stage).toBe('READY_TO_BOOK');
  });

  // Test 9: Booking complete → POST_BOOKING
  it('should be POST_BOOKING after booking is complete', () => {
    const result = processUserIntent({
      message: 'what is my confirmation number?',
      language: 'en',
      sessionState: {
        hasBookingComplete: true,
      },
    });
    expect(result.conversation_stage).toBe('POST_BOOKING');
  });

  // Test 10: Portuguese dates → READY_TO_SEARCH
  it('should detect Portuguese date patterns', () => {
    const result = processUserIntent({
      message: 'quero ir para Lisboa em janeiro',
      language: 'pt',
    });
    expect(result.conversation_stage).toBe('READY_TO_SEARCH');
  });
});

describe('Stage-Specific Actions', () => {
  // DISCOVERY stage rules
  it('should allow inspiration in DISCOVERY stage', () => {
    const result = processUserIntent({
      message: 'dreaming about traveling someday',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('DISCOVERY');
    expect(result.stage_actions).toContain('inspire');
    expect(result.stage_actions).toContain('ask_open_questions');
  });

  it('should forbid showing prices in DISCOVERY stage', () => {
    const result = processUserIntent({
      message: 'just exploring options',
      language: 'en',
    });
    expect(result.stage_forbidden).toContain('show_prices');
    expect(result.stage_forbidden).toContain('initiate_search');
  });

  // NARROWING stage rules
  it('should allow suggesting destinations in NARROWING stage', () => {
    const result = processUserIntent({
      message: 'I want to travel somewhere cheap',
      language: 'en',
    });
    expect(result.conversation_stage).toBe('NARROWING');
    expect(result.stage_actions).toContain('suggest_destinations');
    expect(result.stage_actions).toContain('ask_dates');
  });

  it('should forbid prices in NARROWING stage', () => {
    const result = processUserIntent({
      message: 'I want something affordable',
      language: 'en',
    });
    expect(result.stage_forbidden).toContain('show_prices');
  });

  // READY_TO_SEARCH stage rules
  it('should allow search in READY_TO_SEARCH stage', () => {
    const result = processUserIntent({
      message: 'fly to Rome next week',
      language: 'en',
    });
    expect(result.stage_actions).toContain('initiate_search');
    expect(result.stage_actions).toContain('show_flight_results');
  });

  // READY_TO_BOOK stage rules
  it('should require explicit permission in READY_TO_BOOK', () => {
    const result = processUserIntent({
      message: 'proceed with booking',
      language: 'en',
      sessionState: { hasSelectedFlight: true },
    });
    expect(result.stage_forbidden).toContain('auto_book_without_permission');
    expect(result.stage_actions).toContain('show_booking_summary');
  });

  // POST_BOOKING stage rules
  it('should allow support in POST_BOOKING', () => {
    const result = processUserIntent({
      message: 'can I add luggage?',
      language: 'en',
      sessionState: { hasBookingComplete: true },
    });
    expect(result.stage_actions).toContain('provide_support');
    expect(result.stage_actions).toContain('offer_add_ons');
  });
});

describe('Stage Transition Rules', () => {
  it('should NOT skip from DISCOVERY to READY_TO_BOOK', () => {
    // Vague input should not trigger booking actions
    const result = processUserIntent({
      message: 'book it',
      language: 'en',
      // No session context = should stay in early stage
    });
    expect(result.conversation_stage).not.toBe('READY_TO_BOOK');
    expect(result.forbidden_actions).toContain('skip_stages');
  });

  it('should include skip_stages in forbidden actions', () => {
    const result = processUserIntent({
      message: 'hello',
      language: 'en',
    });
    expect(result.forbidden_actions).toContain('skip_stages');
  });

  it('should include stage in response strategy', () => {
    const result = processUserIntent({
      message: 'looking for flights',
      language: 'en',
    });
    expect(result.response_strategy).toMatch(/\[DISCOVERY\]|\[NARROWING\]/);
  });
});

describe('Agent Persona Stage Behavior', () => {
  // Lisa Thompson (flights) should follow stages
  it('should guide Lisa Thompson with stage rules in DISCOVERY', () => {
    const result = processUserIntent({
      message: 'dreaming about my next vacation',
      language: 'en',
    });
    // Pure exploratory = DISCOVERY, Lisa should inspire
    expect(result.conversation_stage).toBe('DISCOVERY');
    expect(result.response_strategy).toContain('Inspire and explore');
    expect(result.stage_forbidden).toContain('initiate_search');
  });

  // Lisa with budget context → NARROWING
  it('should guide Lisa Thompson in NARROWING stage', () => {
    const result = processUserIntent({
      message: 'I want cheap flights to somewhere warm',
      language: 'en',
    });
    // Has budget signal = NARROWING
    expect(result.conversation_stage).toBe('NARROWING');
    expect(result.stage_actions).toContain('suggest_destinations');
    expect(result.stage_forbidden).toContain('show_prices');
  });

  // Sarah Chen (hotels) should follow stages
  it('should guide Sarah Chen with stage rules', () => {
    const result = processUserIntent({
      message: 'I need a hotel in Paris for March 15',
      language: 'en',
    });
    // Has destination (Paris) + date (March 15) = READY_TO_SEARCH
    expect(result.conversation_stage).toBe('READY_TO_SEARCH');
    expect(result.stage_actions).toContain('initiate_search');
  });
});
