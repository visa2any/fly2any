// Minimal test case to isolate JSX fragment issue
import React from 'react';

function TestComponent() {
  return (
    <>
      <div>Test content</div>
    </>
  );
}

export default TestComponent;