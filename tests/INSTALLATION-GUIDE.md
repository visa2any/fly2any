# Testing Suite Installation & Setup Guide

Complete guide to install and configure the comprehensive testing infrastructure.

## 📋 Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /home/user/fly2any

# Install all dependencies (including test dependencies)
npm install

# Or if you prefer yarn
yarn install
```

The following testing dependencies will be installed:
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@testing-library/react` - React testing utilities (includes native hook testing for React 18)
- `@testing-library/jest-dom` - Custom Jest matchers
- `@types/jest` - TypeScript types for Jest

### Step 2: Verify Installation

```bash
# Check Jest version
npx jest --version

# Should output: 29.7.0 or higher
```

### Step 3: Run Initial Test Suite

```bash
# Run all tests
npm test

# Expected output:
# Test Suites: 9 passed, 9 total
# Tests:       440+ passed, 440+ total
# Time:        ~15-30s
```

## 🔧 Configuration Files

The testing suite includes the following configuration files:

### jest.config.js
Main Jest configuration file
```javascript
// Location: /home/user/fly2any/jest.config.js
```

### jest.setup.js
Global test setup and mocks
```javascript
// Location: /home/user/fly2any/jest.setup.js
```

### package.json
Test scripts and dependencies
```json
// Location: /home/user/fly2any/package.json
```

## 📁 Test Files Structure

```
fly2any/
├── lib/
│   ├── ai/
│   │   ├── conversational-intelligence.test.ts (80+ tests)
│   │   ├── consultant-handoff.test.ts (60+ tests)
│   │   └── emotion-detection.test.ts (existing)
│   └── hooks/
│       └── useBookingFlow.test.ts (55+ tests)
├── app/
│   └── api/
│       └── ai/
│           └── conversation/
│               └── [id]/
│                   └── route.test.ts (45+ tests)
├── tests/
│   ├── integration/
│   │   └── chat-booking-flow.test.ts (80+ tests)
│   ├── performance/
│   │   └── performance.test.ts (45+ tests)
│   ├── travel-operations/
│   │   └── travel-scenarios.test.ts (75+ tests)
│   ├── UAT-scenarios.md
│   ├── TESTING-COVERAGE-REPORT.md
│   ├── BUG-REPORT-TEMPLATE.md
│   ├── README.md
│   └── INSTALLATION-GUIDE.md (this file)
├── jest.config.js
├── jest.setup.js
└── package.json
```

## 🎯 Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run all tests with coverage
npm run test:coverage

# Run in watch mode (development)
npm run test:watch
```

### Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Travel operations tests only
npm run test:travel

# Verbose output with coverage
npm run test:all

# CI mode (for CI/CD pipelines)
npm run test:ci
```

### Individual Test Files

```bash
# Run specific test file
npm test conversational-intelligence.test.ts

# Run with coverage for specific file
npm test -- conversational-intelligence.test.ts --coverage

# Run in watch mode for specific file
npm test -- conversational-intelligence.test.ts --watch
```

### Pattern Matching

```bash
# Run tests matching pattern
npm test -- --testNamePattern="should detect"

# Run test files matching pattern
npm test -- --testPathPattern="integration"
```

## 📊 Coverage Reports

### Generate Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Output will be in: coverage/
# - coverage/lcov-report/index.html (HTML report)
# - coverage/coverage-final.json (JSON data)
```

### View Coverage in Browser

```bash
# Generate and open coverage report
npm run test:coverage
open coverage/lcov-report/index.html

# Or on Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:

```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
}
```

Tests will fail if coverage drops below these thresholds.

## 🔍 Debugging Tests

### Debug Individual Test

```bash
# Run test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open Chrome DevTools:
# chrome://inspect
```

### VSCode Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Jest Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-coverage", "${fileBasename}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Verbose Output

```bash
# Run with verbose output
npm test -- --verbose

# Run with debug logging
npm test -- --debug
```

## 🐛 Troubleshooting

### Issue: Tests Not Found

**Problem**: `No tests found`

**Solution**:
```bash
# Clear Jest cache
npm test -- --clearCache

# Verify test files exist
ls -la lib/ai/*.test.ts
ls -la tests/
```

### Issue: Module Import Errors

**Problem**: `Cannot find module '@/...'`

**Solution**:
Ensure `jest.config.js` has correct path mapping:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Issue: TypeScript Compilation Errors

**Problem**: `TypeScript error in test file`

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update ts-jest if needed
npm install -D ts-jest@latest
```

### Issue: Timeout Errors

**Problem**: `Timeout - Async callback was not invoked`

**Solution**:
```bash
# Increase timeout in test
test('long running test', async () => {
  // ... test code
}, 10000); // 10 second timeout

# Or set global timeout in jest.config.js
testTimeout: 10000
```

### Issue: Mock Not Working

**Problem**: Mock functions not being called

**Solution**:
```bash
# Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

# Or in jest.setup.js
clearMocks: true,
```

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:
  image: node:18
  stage: test
  script:
    - npm ci
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### Pre-commit Hooks

Install Husky:

```bash
npm install -D husky
npx husky init
```

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm test
```

## 📈 Performance Optimization

### Run Tests in Parallel

```bash
# Use all CPU cores
npm test -- --maxWorkers=100%

# Use specific number of workers
npm test -- --maxWorkers=4
```

### Only Changed Files

```bash
# Run tests related to changed files
npm test -- --onlyChanged

# Run tests related to uncommitted changes
npm test -- --changedSince=origin/main
```

### Cache Results

```bash
# Jest automatically caches results
# Clear cache if needed
npm test -- --clearCache
```

## 🎓 Best Practices

### 1. Run Tests Before Committing

```bash
# Always run tests before pushing
npm test
```

### 2. Watch Mode During Development

```bash
# Run tests in watch mode while coding
npm run test:watch
```

### 3. Coverage Checks

```bash
# Check coverage regularly
npm run test:coverage
```

### 4. Integration Tests on CI Only

For expensive tests, mark them:

```typescript
const runOnCI = process.env.CI === 'true';

(runOnCI ? test : test.skip)('expensive test', () => {
  // ...
});
```

### 5. Snapshot Testing (if needed)

```bash
# Update snapshots
npm test -- -u

# Review snapshot changes before committing
```

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)

### Project Documentation
- [Testing Coverage Report](./TESTING-COVERAGE-REPORT.md)
- [UAT Scenarios](./UAT-scenarios.md)
- [Bug Report Template](./BUG-REPORT-TEMPLATE.md)
- [Testing README](./README.md)

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] All dependencies installed: `npm install`
- [ ] Jest runs: `npx jest --version`
- [ ] All tests pass: `npm test`
- [ ] Coverage generates: `npm run test:coverage`
- [ ] Watch mode works: `npm run test:watch` (Ctrl+C to exit)
- [ ] Individual suites run: `npm run test:unit`
- [ ] Coverage meets thresholds (80%+)
- [ ] No console errors or warnings

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** - Most common issues are documented above
2. **Clear cache** - `npm test -- --clearCache`
3. **Update dependencies** - `npm update`
4. **Check Node version** - `node --version` (should be 18+)
5. **Review error messages** - They usually point to the issue
6. **Contact QA Team** - [contact info]

## 🎉 Success Indicators

You know the setup is successful when:

- ✅ All 440+ tests pass
- ✅ Coverage is 92%+
- ✅ No errors in console
- ✅ Tests run in under 30 seconds
- ✅ Watch mode works smoothly
- ✅ Coverage report generates

---

**Installation Guide Version**: 1.0
**Last Updated**: 2024-11-08
**Maintained By**: QA Team Lead
