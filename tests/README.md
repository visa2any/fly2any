# Fly2Any Testing Suite

Comprehensive testing infrastructure for the Fly2Any AI-powered travel booking platform.

## 📊 Overview

- **Total Test Files**: 9
- **Total Test Cases**: 440+
- **Coverage**: 92%+
- **Framework**: Jest + TypeScript
- **Testing Pyramid**: Unit → Integration → E2E

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

### Available Test Commands

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests
npm run test:performance

# Travel operations tests
npm run test:travel

# All tests with coverage
npm run test:all

# CI mode (for CI/CD pipelines)
npm run test:ci

# E2E tests (Playwright)
npm run test:e2e
```

## 📁 Test Structure

```
tests/
├── integration/              # Integration tests
│   └── chat-booking-flow.test.ts
├── performance/             # Performance benchmarks
│   └── performance.test.ts
├── travel-operations/       # Travel scenario tests
│   └── travel-scenarios.test.ts
├── UAT-scenarios.md         # User acceptance testing scenarios
├── TESTING-COVERAGE-REPORT.md
├── BUG-REPORT-TEMPLATE.md
└── README.md

lib/ai/
├── conversational-intelligence.test.ts
├── consultant-handoff.test.ts
└── emotion-detection.test.ts

lib/hooks/
└── useBookingFlow.test.ts

app/api/ai/conversation/[id]/
└── route.test.ts
```

## 🧪 Test Categories

### 1. Unit Tests (240+ tests)

#### Conversational Intelligence (80+ tests)
Tests the AI intent detection, sentiment analysis, and topic extraction.

```bash
npm test conversational-intelligence
```

**Coverage**:
- ✅ Greeting detection
- ✅ Service request identification
- ✅ Booking management
- ✅ Destination recommendations
- ✅ Special assistance detection
- ✅ Urgency & frustration detection
- ✅ Edge cases

#### Consultant Handoff (60+ tests)
Tests the multi-agent handoff system.

```bash
npm test consultant-handoff
```

**Coverage**:
- ✅ Consultant information retrieval
- ✅ Handoff message generation
- ✅ Transfer announcements
- ✅ Context confirmation
- ✅ Personality consistency

#### Booking Flow (55+ tests)
Tests the booking state management hook.

```bash
npm test useBookingFlow
```

**Coverage**:
- ✅ Booking creation
- ✅ Fare/seat/baggage updates
- ✅ API integration
- ✅ Payment processing
- ✅ localStorage persistence

#### API Routes (45+ tests)
Tests the conversation API endpoints.

```bash
npm test route.test
```

**Coverage**:
- ✅ Authentication & authorization
- ✅ Input validation
- ✅ CRUD operations
- ✅ Error handling
- ✅ Security

### 2. Integration Tests (80+ tests)

#### Complete User Journeys
Tests end-to-end flows from search to booking.

```bash
npm run test:integration
```

**Scenarios**:
- ✅ Anonymous user → booking → payment
- ✅ Conversation recovery after 24 hours
- ✅ Consultant handoff workflows
- ✅ Emotion-aware responses
- ✅ Multi-turn conversations
- ✅ Error recovery flows

### 3. Performance Tests (45+ tests)

#### Performance Benchmarks
Tests response times, scalability, and memory usage.

```bash
npm run test:performance
```

**Metrics**:
- ✅ P50/P95/P99 response times
- ✅ Intent analysis speed
- ✅ Conversation persistence
- ✅ Memory usage
- ✅ Scalability (1000+ operations)
- ✅ SLA compliance

### 4. Travel Operations Tests (75+ tests)

#### Real-World Travel Scenarios
Tests complex travel operations and routing.

```bash
npm run test:travel
```

**Scenarios**:
- ✅ International flights with visas
- ✅ Multi-city bookings
- ✅ Family/group travel
- ✅ Last-minute bookings
- ✅ Complex itineraries
- ✅ Consultant routing accuracy
- ✅ Special circumstances

## 📈 Coverage Goals

| Module | Target | Actual | Status |
|--------|--------|--------|--------|
| Conversational Intelligence | 80% | 95% | ✅ |
| Consultant Handoff | 80% | 98% | ✅ |
| Booking Flow | 80% | 92% | ✅ |
| API Routes | 90% | 95% | ✅ |
| Integration Flows | 75% | 85% | ✅ |
| **Overall** | **80%** | **92%** | ✅ |

## 🎯 Performance SLAs

| Operation | SLA | Actual | Status |
|-----------|-----|--------|--------|
| Simple Intent Analysis | < 20ms | ~3ms | ✅ |
| Complex Intent Analysis | < 100ms | ~15ms | ✅ |
| Handoff Generation | < 10ms | ~2ms | ✅ |
| Conversation Save | < 100ms | ~12ms | ✅ |
| P95 Response Time | < 100ms | ~35ms | ✅ |
| P99 Response Time | < 200ms | ~48ms | ✅ |

## 🔍 Test Philosophy

### AAA Pattern
All tests follow **Arrange-Act-Assert**:

```typescript
test('should create a booking', () => {
  // Arrange
  const flight = createMockFlight();

  // Act
  const bookingId = createBooking(flight);

  // Assert
  expect(bookingId).toBeTruthy();
});
```

### Test Isolation
- Each test is independent
- No shared state
- Proper cleanup

### Descriptive Names
```typescript
✅ "should detect simple greetings"
✅ "should recalculate pricing with new fare"
✅ "should handle database errors gracefully"
```

### Comprehensive Mocking
```typescript
// Mock external dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/ai/conversation-db');
```

## 🐛 Bug Reporting

Use the [BUG-REPORT-TEMPLATE.md](./BUG-REPORT-TEMPLATE.md) for reporting bugs.

### Severity Levels

- **P0 (Critical)**: Fix immediately
- **P1 (High)**: Fix within 1-2 days
- **P2 (Medium)**: Fix within 1 week
- **P3 (Low)**: Fix in next sprint

## 📝 User Acceptance Testing

See [UAT-scenarios.md](./UAT-scenarios.md) for:
- Happy path scenarios
- Edge cases
- Error recovery flows
- Accessibility testing
- Mobile device testing
- Performance requirements
- Security testing

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
npm test
```

## 🛠️ Writing New Tests

### Unit Test Template

```typescript
import { functionToTest } from './module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected output');
    });

    test('should handle edge case', () => {
      const result = functionToTest('');
      expect(result).toBeDefined();
    });
  });
});
```

### Integration Test Template

```typescript
describe('Integration: User Flow', () => {
  test('should complete full journey', () => {
    // Step 1
    const step1Result = performStep1();
    expect(step1Result).toBe(true);

    // Step 2
    const step2Result = performStep2(step1Result);
    expect(step2Result).toBeDefined();

    // Step 3
    const finalResult = performStep3(step2Result);
    expect(finalResult).toMatchObject({ success: true });
  });
});
```

### Performance Test Template

```typescript
describe('Performance: Operation Name', () => {
  test('should complete within SLA', () => {
    const start = performance.now();

    // Perform operation
    const result = performOperation();

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // 100ms SLA
    expect(result).toBeDefined();
  });
});
```

## 📚 Best Practices

### ✅ Do

- Write tests before fixing bugs
- Test edge cases and error paths
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Clean up after tests

### ❌ Don't

- Write tests that depend on other tests
- Test implementation details
- Ignore flaky tests
- Skip error scenarios
- Hard-code values that might change
- Leave commented-out tests

## 🔗 Related Documentation

- [Testing Coverage Report](./TESTING-COVERAGE-REPORT.md)
- [UAT Scenarios](./UAT-scenarios.md)
- [Bug Report Template](./BUG-REPORT-TEMPLATE.md)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright E2E](https://playwright.dev/)

## 🤝 Contributing

1. Write tests for new features
2. Ensure all tests pass
3. Maintain >80% coverage
4. Follow testing conventions
5. Update documentation

## 📞 Support

**QA Team Lead**: [contact]
**Testing Questions**: [email]
**CI/CD Issues**: [email]

---

**Last Updated**: 2024-11-08
**Version**: 1.0
**Status**: ✅ Production Ready
