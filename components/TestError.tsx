/**
 * Test Error Component
 *
 * Use this component to test error boundaries in development.
 * This component intentionally throws errors to verify error handling.
 *
 * ⚠️ DO NOT USE IN PRODUCTION ⚠️
 */

'use client';

import { useState } from 'react';

interface TestErrorProps {
  /** Error message to throw */
  message?: string;
  /** Delay before throwing error (ms) */
  delay?: number;
  /** Throw on mount instead of button click */
  throwOnMount?: boolean;
}

/**
 * Test Error Component
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@/components/ErrorBoundary';
 * import { TestError } from '@/components/TestError';
 *
 * export default function TestPage() {
 *   return (
 *     <ErrorBoundary variant="section">
 *       <TestError message="Test error" />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */
export function TestError({
  message = 'Test error triggered intentionally',
  delay = 0,
  throwOnMount = false,
}: TestErrorProps) {
  const [shouldThrow, setShouldThrow] = useState(throwOnMount);

  const handleClick = () => {
    if (delay > 0) {
      setTimeout(() => {
        setShouldThrow(true);
      }, delay);
    } else {
      setShouldThrow(true);
    }
  };

  if (shouldThrow) {
    throw new Error(message);
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800 mb-3">
        ⚠️ Test Error Component (Development Only)
      </p>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Trigger Error {delay > 0 && `(after ${delay}ms)`}
      </button>
    </div>
  );
}

/**
 * Test Error Component that throws on render
 */
export function TestErrorOnMount({ message = 'Error on mount' }: { message?: string }) {
  throw new Error(message);
}

/**
 * Test Error Component that simulates async error
 */
export function TestAsyncError({ message = 'Async error' }: { message?: string }) {
  const [error, setError] = useState<Error | null>(null);

  const handleAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), 500);
      });
    } catch (err) {
      setError(err as Error);
    }
  };

  if (error) {
    throw error;
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800 mb-3">
        ⚠️ Test Async Error Component
      </p>
      <button
        onClick={handleAsyncError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Trigger Async Error
      </button>
    </div>
  );
}

/**
 * Test Multiple Errors
 *
 * Component that can throw different types of errors
 */
export function TestMultipleErrors() {
  const [errorType, setErrorType] = useState<string | null>(null);

  if (errorType === 'null-reference') {
    // @ts-expect-error - Intentionally accessing null
    return <div>{null.toString()}</div>;
  }

  if (errorType === 'undefined-reference') {
    // @ts-expect-error - Intentionally accessing undefined
    return <div>{undefined.map(() => null)}</div>;
  }

  if (errorType === 'type-error') {
    // @ts-expect-error - Intentional type error
    return <div>{(42).map(() => null)}</div>;
  }

  if (errorType === 'custom-error') {
    throw new Error('Custom error with additional context');
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
      <p className="text-sm text-yellow-800 mb-3">
        ⚠️ Test Multiple Error Types
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setErrorType('null-reference')}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Null Reference
        </button>

        <button
          onClick={() => setErrorType('undefined-reference')}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Undefined Reference
        </button>

        <button
          onClick={() => setErrorType('type-error')}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Type Error
        </button>

        <button
          onClick={() => setErrorType('custom-error')}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Custom Error
        </button>
      </div>
    </div>
  );
}

/**
 * Error Boundary Test Suite
 *
 * Complete test page showing all error boundary variants
 */
export function ErrorBoundaryTestSuite() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Boundary Test Suite</h1>
        <p className="text-gray-600">
          Test different error boundary variants and error types
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h2>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click any "Trigger Error" button to test error boundaries</li>
          <li>Each section should catch errors independently</li>
          <li>Full-page errors should take over the entire page</li>
          <li>Section errors should be contained within their section</li>
          <li>Inline errors should show compact error messages</li>
          <li>Use "Try Again" or "Retry" to reset the error state</li>
        </ul>
      </div>

      {/* Test Sections */}
      <div className="space-y-6">
        {/* Section Error Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Section Error Variant</h2>
          <TestError message="Section error test" />
        </div>

        {/* Inline Error Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Inline Error Variant</h2>
          <TestError message="Inline error test" />
        </div>

        {/* Async Error Test */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Async Error Test</h2>
          <TestAsyncError message="Async error test" />
        </div>

        {/* Multiple Error Types */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Multiple Error Types</h2>
          <TestMultipleErrors />
        </div>
      </div>
    </div>
  );
}
