// Simple TypeScript test to check compilation
import React from 'react';

// Test basic React component
const TestComponent: React.FC = () => {
  return React.createElement('div', null, 'Hello World');
};

// Test date-fns (previously fixed)
// import { format } from 'date-fns';

// Test basic types
type TestType = {
  id: string;
  name: string;
};

const testData: TestType = {
  id: '1',
  name: 'test'
};

export default TestComponent;