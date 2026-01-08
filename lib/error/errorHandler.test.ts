import {
  handleError,
  normalizeError,
  generateFingerprint,
  ensureError,
  addErrorListener,
  dispatchError,
} from './errorHandler';
import { ErrorCategory, ErrorSeverity } from './errorTypes';

describe('errorHandler', () => {
  beforeEach(() => {
    // Clear any listeners between tests
    // Note: Since listeners are in a module scope, we need to reset them.
    // We'll use a direct approach by calling a cleanup function if available.
    // For now, we rely on the fact that tests run in separate processes.
  });

  describe('normalizeError', () => {
    it('normalizes a standard Error object', () => {
      const error = new Error('Test error');
      const normalized = normalizeError(error);

      expect(normalized).toMatchObject({
        name: 'Error',
        message: 'Test error',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        timestamp: expect.any(Number),
      });
      expect(normalized.id).toMatch(/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(normalized.fingerprint).toMatch(/^ERR-[A-Z0-9]+$/);
    });

    it('categorizes network errors', () => {
      const error = new Error('Network request failed');
      error.name = 'NetworkError';
      const normalized = normalizeError(error);

      expect(normalized.category).toBe(ErrorCategory.NETWORK);
    });

    it('categorizes authentication errors', () => {
      const error = new Error('Unauthorized');
      error.name = 'AuthError';
      const normalized = normalizeError(error);

      expect(normalized.category).toBe(ErrorCategory.AUTH);
      expect(normalized.severity).toBe(ErrorSeverity.HIGH);
    });

    it('detects critical errors from message', () => {
      const error = new Error('Critical: Database connection failed');
      const normalized = normalizeError(error);

      expect(normalized.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('includes context metadata', () => {
      const error = new Error('Test');
      const context = {
        componentStack: 'TestComponent',
        context: 'test-context',
        metadata: { userId: '123' },
      };
      const normalized = normalizeError(error, context);

      expect(normalized.componentStack).toBe('TestComponent');
      expect(normalized.metadata.context).toBe('test-context');
      expect(normalized.metadata.userId).toBe('123');
    });
  });

  describe('generateFingerprint', () => {
    it('generates consistent fingerprints for same error', () => {
      const error1 = new Error('Duplicate error');
      error1.stack = 'Error: Duplicate error\n    at test.js:1:1';
      const error2 = new Error('Duplicate error');
      error2.stack = 'Error: Duplicate error\n    at test.js:1:1';

      const fp1 = generateFingerprint(error1);
      const fp2 = generateFingerprint(error2);

      expect(fp1).toBe(fp2);
      expect(fp1).toMatch(/^ERR-[A-Z0-9]+$/);
    });

    it('generates different fingerprints for different errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const fp1 = generateFingerprint(error1);
      const fp2 = generateFingerprint(error2);

      expect(fp1).not.toBe(fp2);
    });
  });

  describe('ensureError', () => {
    it('returns Error instances unchanged', () => {
      const error = new Error('Test');
      expect(ensureError(error)).toBe(error);
    });

    it('converts strings to Error', () => {
      const result = ensureError('String error');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error');
    });

    it('converts objects with message property to Error', () => {
      const result = ensureError({ message: 'Object error' });
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Object error');
    });

    it('converts arbitrary objects to Error with JSON string', () => {
      const obj = { code: 500, data: 'test' };
      const result = ensureError(obj);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain('"code":500');
    });

    it('converts other types to Error with String conversion', () => {
      const result = ensureError(123);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('123');
    });
  });

  describe('listeners', () => {
    it('adds and removes error listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const remove1 = addErrorListener(listener1);
      const remove2 = addErrorListener(listener2);

      const error = new Error('Test');
      const normalized = normalizeError(error);
      dispatchError(normalized);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith(normalized);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledWith(normalized);

      // Remove first listener
      remove1();
      dispatchError(normalized);

      expect(listener1).toHaveBeenCalledTimes(1); // Not called again
      expect(listener2).toHaveBeenCalledTimes(2); // Called again

      remove2();
    });

    it('handles listener errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const listener = jest.fn(() => {
        throw new Error('Listener error');
      });

      addErrorListener(listener);

      const error = new Error('Test');
      const normalized = normalizeError(error);
      expect(() => dispatchError(normalized)).not.toThrow();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ErrorHandler] Listener error'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('handleError', () => {
    it('normalizes and dispatches error', () => {
      const listener = jest.fn();
      addErrorListener(listener);

      const error = new Error('Test');
      const normalized = handleError(error);

      expect(normalized).toMatchObject({
        name: 'Error',
        message: 'Test',
      });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(normalized);
    });
  });
});