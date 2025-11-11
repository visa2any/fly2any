import { retryWithExponentialBackoff, fetchWithRetry } from '../retry';

describe('retryWithExponentialBackoff', () => {
  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await retryWithExponentialBackoff(mockFn, 3, 100);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retryWithExponentialBackoff(mockFn, 3, 100);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

    await expect(
      retryWithExponentialBackoff(mockFn, 3, 100)
    ).rejects.toThrow('Always fails');

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff delays', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    await retryWithExponentialBackoff(mockFn, 3, 100);
    const endTime = Date.now();

    // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
    // Adding some buffer for execution time
    expect(endTime - startTime).toBeGreaterThanOrEqual(250);
  });
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully fetch on first attempt', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await fetchWithRetry('https://api.example.com/test');

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on HTTP error status', async () => {
    const failResponse = { ok: false, status: 500 };
    const successResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValue(successResponse);

    const result = await fetchWithRetry('https://api.example.com/test', undefined, {
      maxRetries: 3,
      initialDelay: 50,
    });

    expect(result).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries with HTTP errors', async () => {
    const failResponse = { ok: false, status: 500 };

    (global.fetch as jest.Mock).mockResolvedValue(failResponse);

    await expect(
      fetchWithRetry('https://api.example.com/test', undefined, {
        maxRetries: 2,
        initialDelay: 50,
      })
    ).rejects.toThrow('HTTP 500');

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on network error', async () => {
    const successResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(successResponse);

    const result = await fetchWithRetry('https://api.example.com/test', undefined, {
      maxRetries: 3,
      initialDelay: 50,
    });

    expect(result).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
