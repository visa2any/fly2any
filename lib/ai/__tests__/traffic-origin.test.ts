/**
 * Traffic Origin Extraction Tests
 *
 * Validates: Correct classification, No PII, No false positives
 */

import { extractTrafficOrigin, isValidOrigin } from '../learning/traffic-origin';

describe('Traffic Origin Extraction', () => {
  describe('Search Engine Detection', () => {
    it('should detect Google search', () => {
      const result = extractTrafficOrigin({ referrer: 'https://www.google.com/search?q=flights' });
      expect(result.origin).toBe('search');
      expect(result.source).toBe('google');
      expect(result.medium).toBe('organic');
    });

    it('should detect Bing search', () => {
      const result = extractTrafficOrigin({ referrer: 'https://www.bing.com/search?q=hotels' });
      expect(result.origin).toBe('search');
      expect(result.source).toBe('bing');
    });

    it('should detect regional Google (google.co.uk)', () => {
      const result = extractTrafficOrigin({ referrer: 'https://www.google.co.uk/' });
      expect(result.origin).toBe('search');
      expect(result.source).toBe('google');
    });

    it('should detect DuckDuckGo', () => {
      const result = extractTrafficOrigin({ referrer: 'https://duckduckgo.com/' });
      expect(result.origin).toBe('search');
      expect(result.source).toBe('duckduckgo');
    });
  });

  describe('Direct Traffic', () => {
    it('should classify empty referrer as direct', () => {
      const result = extractTrafficOrigin({ referrer: '' });
      expect(result.origin).toBe('direct');
      expect(result.source).toBeNull();
    });

    it('should classify null referrer as direct', () => {
      const result = extractTrafficOrigin({ referrer: null });
      expect(result.origin).toBe('direct');
    });

    it('should classify undefined referrer as direct', () => {
      const result = extractTrafficOrigin({});
      expect(result.origin).toBe('direct');
    });
  });

  describe('Campaign Detection (UTM)', () => {
    it('should detect utm_campaign', () => {
      const result = extractTrafficOrigin({
        url: 'https://fly2any.com/?utm_campaign=summer_sale',
      });
      expect(result.origin).toBe('campaign');
    });

    it('should detect CPC medium', () => {
      const result = extractTrafficOrigin({
        url: 'https://fly2any.com/?utm_source=google&utm_medium=cpc',
      });
      expect(result.origin).toBe('campaign');
      expect(result.medium).toBe('cpc');
      expect(result.source).toBe('google');
    });

    it('should detect email medium', () => {
      const result = extractTrafficOrigin({
        url: 'https://fly2any.com/?utm_medium=email',
      });
      expect(result.origin).toBe('campaign');
      expect(result.medium).toBe('email');
    });

    it('should detect social medium', () => {
      const result = extractTrafficOrigin({
        url: 'https://fly2any.com/?utm_medium=social&utm_source=facebook',
      });
      expect(result.origin).toBe('campaign');
      expect(result.medium).toBe('social');
      expect(result.source).toBe('facebook');
    });
  });

  describe('Referral Detection', () => {
    it('should detect Facebook as social referral', () => {
      const result = extractTrafficOrigin({ referrer: 'https://www.facebook.com/' });
      expect(result.origin).toBe('referral');
      expect(result.source).toBe('facebook');
      expect(result.medium).toBe('social');
    });

    it('should detect mobile Facebook (m.facebook.com)', () => {
      const result = extractTrafficOrigin({ referrer: 'https://m.facebook.com/' });
      expect(result.origin).toBe('referral');
      expect(result.source).toBe('facebook');
    });

    it('should detect Instagram', () => {
      const result = extractTrafficOrigin({ referrer: 'https://www.instagram.com/' });
      expect(result.origin).toBe('referral');
      expect(result.source).toBe('instagram');
    });

    it('should detect other websites as referral', () => {
      const result = extractTrafficOrigin({ referrer: 'https://travelblog.com/best-flights' });
      expect(result.origin).toBe('referral');
      expect(result.source).toBe('travelblog');
      expect(result.medium).toBe('referral');
    });
  });

  describe('Voice Assistant Detection (Future-Safe)', () => {
    it('should detect Google Assistant', () => {
      const result = extractTrafficOrigin({ userAgent: 'assistant.google.com/...' });
      expect(result.origin).toBe('voice');
      expect(result.medium).toBe('voice');
    });

    it('should detect Alexa', () => {
      const result = extractTrafficOrigin({ userAgent: 'alexa/1.0' });
      expect(result.origin).toBe('voice');
    });
  });

  describe('No PII Leakage', () => {
    it('should NOT include query strings from referrer', () => {
      const result = extractTrafficOrigin({
        referrer: 'https://google.com/search?q=john+doe+email',
      });
      expect(JSON.stringify(result)).not.toContain('john');
      expect(JSON.stringify(result)).not.toContain('email');
    });

    it('should NOT include paths from referrer', () => {
      const result = extractTrafficOrigin({
        referrer: 'https://facebook.com/users/123456789/profile',
      });
      expect(JSON.stringify(result)).not.toContain('123456789');
      expect(JSON.stringify(result)).not.toContain('profile');
    });

    it('should truncate long source names', () => {
      const result = extractTrafficOrigin({
        url: 'https://fly2any.com/?utm_source=verylongsourcenamethatexceedslimit&utm_campaign=test',
      });
      expect(result.source!.length).toBeLessThanOrEqual(20);
    });
  });

  describe('False Positive Prevention', () => {
    it('should NOT classify googledrive as search', () => {
      const result = extractTrafficOrigin({ referrer: 'https://drive.google.com/' });
      expect(result.origin).toBe('referral'); // Not search
    });

    it('should NOT classify googlemail as search', () => {
      const result = extractTrafficOrigin({ referrer: 'https://mail.google.com/' });
      expect(result.origin).toBe('referral');
    });

    it('should NOT classify analytics.google as search', () => {
      const result = extractTrafficOrigin({ referrer: 'https://analytics.google.com/' });
      expect(result.origin).toBe('referral');
    });

    it('should handle malformed URLs gracefully', () => {
      const result = extractTrafficOrigin({ referrer: 'not-a-valid-url' });
      expect(result.origin).toBe('direct'); // Fails to parse = treat as direct
    });

    it('should handle special characters in referrer', () => {
      const result = extractTrafficOrigin({
        referrer: 'https://example.com/<script>alert(1)</script>',
      });
      expect(result.origin).toBe('referral');
      expect(JSON.stringify(result)).not.toContain('script');
    });
  });

  describe('Type Guard', () => {
    it('should validate known origins', () => {
      expect(isValidOrigin('search')).toBe(true);
      expect(isValidOrigin('direct')).toBe(true);
      expect(isValidOrigin('campaign')).toBe(true);
      expect(isValidOrigin('referral')).toBe(true);
      expect(isValidOrigin('voice')).toBe(true);
      expect(isValidOrigin('unknown')).toBe(true);
    });

    it('should reject invalid origins', () => {
      expect(isValidOrigin('invalid')).toBe(false);
      expect(isValidOrigin('')).toBe(false);
      expect(isValidOrigin('SEARCH')).toBe(false); // Case-sensitive
    });
  });
});
