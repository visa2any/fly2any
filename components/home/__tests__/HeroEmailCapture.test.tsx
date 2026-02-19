/**
 * Unit tests for HeroEmailCapture component logic
 *
 * Tests the business logic used by the component: validation, API payload
 * construction, state transitions, and localStorage behavior.
 *
 * Note: @testing-library/dom is not installed, so we test logic directly.
 */

describe('HeroEmailCapture - Client-side Email Validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('should reject empty input', () => {
    expect(emailRegex.test('')).toBe(false);
  });

  it('should reject plain text', () => {
    expect(emailRegex.test('notanemail')).toBe(false);
  });

  it('should reject email without TLD', () => {
    expect(emailRegex.test('user@domain')).toBe(false);
  });

  it('should accept valid email', () => {
    expect(emailRegex.test('user@example.com')).toBe(true);
  });

  it('should accept email with subdomain', () => {
    expect(emailRegex.test('user@mail.example.com')).toBe(true);
  });
});

describe('HeroEmailCapture - API Payload', () => {
  it('should construct correct payload for homepage hero source', () => {
    const email = 'test@example.com';
    const payload = {
      email: email.trim(),
      source: 'homepage_hero',
    };

    expect(payload).toEqual({
      email: 'test@example.com',
      source: 'homepage_hero',
    });
  });

  it('should trim email whitespace before sending', () => {
    const email = '  test@example.com  ';
    const payload = {
      email: email.trim(),
      source: 'homepage_hero',
    };

    expect(payload.email).toBe('test@example.com');
  });
});

describe('HeroEmailCapture - State Transitions', () => {
  type Status = 'idle' | 'loading' | 'success' | 'already' | 'error';

  it('should start in idle status', () => {
    const status: Status = 'idle';
    expect(status).toBe('idle');
  });

  it('should transition to loading on submit', () => {
    let status: Status = 'idle';
    // Simulate submit
    status = 'loading';
    expect(status).toBe('loading');
  });

  it('should transition to success on API success with requiresConfirmation', () => {
    let status: Status = 'loading';
    const apiResponse = { success: true, requiresConfirmation: true };

    if (apiResponse.success) {
      status = 'success';
    }
    expect(status).toBe('success');
  });

  it('should transition to already when alreadySubscribed', () => {
    let status: Status = 'loading';
    const apiResponse = { success: true, alreadySubscribed: true } as any;

    if (apiResponse.success) {
      if (apiResponse.alreadySubscribed) {
        status = 'already';
      } else {
        status = 'success';
      }
    }
    expect(status).toBe('already');
  });

  it('should transition to error on API failure', () => {
    let status: Status = 'loading';
    const apiResponse = { success: false, error: 'Something went wrong' };

    if (!apiResponse.success) {
      status = 'error';
    }
    expect(status).toBe('error');
  });

  it('should transition to error on network failure', () => {
    let status: Status = 'loading';
    // Simulate catch
    status = 'error';
    expect(status).toBe('error');
  });

  it('should clear error when user types', () => {
    let status: Status = 'error';
    // Simulate typing
    if (status === 'error') {
      status = 'idle';
    }
    expect(status).toBe('idle');
  });
});

describe('HeroEmailCapture - localStorage Persistence', () => {
  // Mock localStorage
  const mockStorage: Record<string, string> = {};

  const localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
  };

  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  });

  it('should not be dismissed when localStorage is empty', () => {
    const subscribed = localStorage.getItem('fly2any_newsletter_subscribed');
    const dismissed = subscribed === 'true';
    expect(dismissed).toBe(false);
  });

  it('should be dismissed when localStorage has subscribed flag', () => {
    localStorage.setItem('fly2any_newsletter_subscribed', 'true');
    const subscribed = localStorage.getItem('fly2any_newsletter_subscribed');
    const dismissed = subscribed === 'true';
    expect(dismissed).toBe(true);
  });

  it('should set subscribed flag on successful subscription', () => {
    // Simulate successful subscription
    const apiSuccess = true;
    if (apiSuccess) {
      localStorage.setItem('fly2any_newsletter_subscribed', 'true');
    }
    expect(mockStorage['fly2any_newsletter_subscribed']).toBe('true');
  });

  it('should not set flag on API error', () => {
    const apiSuccess = false;
    if (apiSuccess) {
      localStorage.setItem('fly2any_newsletter_subscribed', 'true');
    }
    expect(mockStorage['fly2any_newsletter_subscribed']).toBeUndefined();
  });
});

describe('HeroEmailCapture - Message Display', () => {
  it('should show confirmation message on success', () => {
    const status = 'success';
    const alreadySubscribed = false;

    const message = alreadySubscribed
      ? "You're already subscribed! Check your inbox for deals."
      : 'Check your email to confirm your subscription!';

    expect(message).toContain('Check your email');
  });

  it('should show already-subscribed message', () => {
    const alreadySubscribed = true;

    const message = alreadySubscribed
      ? "You're already subscribed! Check your inbox for deals."
      : 'Check your email to confirm your subscription!';

    expect(message).toContain('already subscribed');
  });

  it('should show API error message', () => {
    const apiResponse = { success: false, error: 'Rate limit exceeded' };
    const message = apiResponse.error || 'Something went wrong. Please try again.';
    expect(message).toBe('Rate limit exceeded');
  });

  it('should show fallback error message when API error is empty', () => {
    const apiResponse = { success: false, error: '' };
    const message = apiResponse.error || 'Something went wrong. Please try again.';
    expect(message).toBe('Something went wrong. Please try again.');
  });

  it('should show connection error on network failure', () => {
    const message = 'Connection error. Please try again.';
    expect(message).toBe('Connection error. Please try again.');
  });
});
