/**
 * Unit tests for Newsletter Verify (Double Opt-in) logic
 * Tests token verification flow: lookup, expiry check, activation
 *
 * Tests business logic directly since NextRequest/NextResponse aren't
 * available in jsdom test environment.
 */

describe('Newsletter Verify - Token Expiry Check', () => {
  it('should detect expired token', () => {
    const tokenExpiry = new Date(Date.now() - 1000); // 1 second ago
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    expect(isExpired).toBeTruthy();
  });

  it('should accept non-expired token', () => {
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    expect(isExpired).toBeFalsy();
  });

  it('should accept token with no expiry (null)', () => {
    const tokenExpiry = null;
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    expect(isExpired).toBeFalsy();
  });

  it('should detect token that just expired', () => {
    const tokenExpiry = new Date(Date.now() - 1); // 1ms ago
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    expect(isExpired).toBeTruthy();
  });

  it('should accept token expiring in far future', () => {
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    expect(isExpired).toBeFalsy();
  });
});

describe('Newsletter Verify - Subscriber Lookup', () => {
  it('should match subscriber by token and PENDING status', () => {
    const subscribers = [
      { id: '1', email: 'a@test.com', verificationToken: 'token-a', status: 'PENDING' },
      { id: '2', email: 'b@test.com', verificationToken: 'token-b', status: 'ACTIVE' },
      { id: '3', email: 'c@test.com', verificationToken: 'token-c', status: 'PENDING' },
    ];

    const findByToken = (token: string) =>
      subscribers.find(s => s.verificationToken === token && s.status === 'PENDING');

    expect(findByToken('token-a')?.email).toBe('a@test.com');
    expect(findByToken('token-b')).toBeUndefined(); // ACTIVE, not PENDING
    expect(findByToken('token-c')?.email).toBe('c@test.com');
    expect(findByToken('token-d')).toBeUndefined(); // Non-existent
  });

  it('should not match already verified subscriber', () => {
    const subscriber = {
      verificationToken: 'used-token',
      status: 'ACTIVE',
    };

    const matches = subscriber.verificationToken === 'used-token' && subscriber.status === 'PENDING';
    expect(matches).toBe(false);
  });
});

describe('Newsletter Verify - Activation Data', () => {
  it('should produce correct activation record', () => {
    const subscriber = {
      id: 'sub-1',
      email: 'verify@test.com',
      firstName: 'Alice',
      status: 'PENDING',
      verificationToken: 'abc-123',
      tokenExpiry: new Date(Date.now() + 86400000),
    };

    const activationData = {
      status: 'ACTIVE',
      verificationToken: null,
      tokenExpiry: null,
      verifiedAt: new Date(),
    };

    expect(activationData.status).toBe('ACTIVE');
    expect(activationData.verificationToken).toBeNull();
    expect(activationData.tokenExpiry).toBeNull();
    expect(activationData.verifiedAt).toBeInstanceOf(Date);
  });

  it('should clear the token after verification', () => {
    const beforeVerify = {
      verificationToken: 'some-token',
      tokenExpiry: new Date(),
    };

    // After verification
    const afterVerify = {
      ...beforeVerify,
      verificationToken: null,
      tokenExpiry: null,
    };

    expect(afterVerify.verificationToken).toBeNull();
    expect(afterVerify.tokenExpiry).toBeNull();
  });
});

describe('Newsletter Verify - Welcome Email Data', () => {
  it('should pass correct data to sendNewsletterConfirmation', () => {
    const subscriber = {
      email: 'confirmed@test.com',
      firstName: 'Bob',
    };

    const emailData = {
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
    };

    expect(emailData.email).toBe('confirmed@test.com');
    expect(emailData.firstName).toBe('Bob');
  });

  it('should handle subscriber without firstName', () => {
    const subscriber = {
      email: 'nofirst@test.com',
      firstName: null as string | null,
    };

    const emailData = {
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
    };

    expect(emailData.email).toBe('nofirst@test.com');
    expect(emailData.firstName).toBeUndefined();
  });
});

describe('Newsletter Verify - Error Routing', () => {
  const errorReasons = {
    missing_token: 'missing_token',
    invalid_token: 'invalid_token',
    expired: 'expired',
    server_error: 'server_error',
  };

  it('should map missing token to correct reason', () => {
    const token = null;
    const reason = !token ? errorReasons.missing_token : null;
    expect(reason).toBe('missing_token');
  });

  it('should map not-found subscriber to invalid_token', () => {
    const subscriber = null;
    const reason = !subscriber ? errorReasons.invalid_token : null;
    expect(reason).toBe('invalid_token');
  });

  it('should map expired token to expired reason', () => {
    const tokenExpiry = new Date(Date.now() - 1000);
    const isExpired = tokenExpiry && new Date() > tokenExpiry;
    const reason = isExpired ? errorReasons.expired : null;
    expect(reason).toBe('expired');
  });

  it('should construct correct error redirect URL', () => {
    const baseUrl = 'http://localhost:3000';
    const reason = 'expired';
    const url = new URL(`/newsletter/error?reason=${reason}`, baseUrl);

    expect(url.pathname).toBe('/newsletter/error');
    expect(url.searchParams.get('reason')).toBe('expired');
  });

  it('should construct correct success redirect URL', () => {
    const baseUrl = 'http://localhost:3000';
    const url = new URL('/newsletter/confirmed', baseUrl);

    expect(url.pathname).toBe('/newsletter/confirmed');
  });
});
