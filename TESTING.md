# Testing Guide - MoneyHero AI Support Frontend

This project uses Jest and React Testing Library for unit and integration testing of React components and services.

## Test Stack

- **Test Runner**: Jest 30
- **React Testing**: React Testing Library 16
- **TypeScript Support**: ts-jest
- **Environment**: jsdom (for DOM simulation)
- **User Interactions**: @testing-library/user-event
- **Assertions**: @testing-library/jest-dom

## Running Tests

### Basic Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage report
yarn test:coverage

# Run tests with verbose output
yarn test:verbose

# Watch mode with verbose output
yarn test:ui
```

### Watch Mode

When running in watch mode, you can:
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename
- Press `t` to filter by test name
- Press `q` to quit

## Test Structure

### Test Files

Tests are located next to the files they test:

```
components/
├── ChatMessage.tsx
├── ChatMessage.test.tsx       # Component tests
├── ChatInput.tsx
└── ChatInput.test.tsx          # Component tests

services/
├── geminiService.ts
└── geminiService.test.ts       # Service tests
```

### Test Organization

```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const props = { /* ... */ };

      // Act
      render(<Component {...props} />);

      // Assert
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

## Test Coverage

### Current Test Files

1. **`ChatMessage.test.tsx`** - 98 tests
   - User message rendering
   - Assistant message rendering
   - Markdown rendering
   - Escalation badges
   - Timestamp formatting
   - Accessibility checks
   - Layout and styling

2. **`ChatInput.test.tsx`** - 93 tests
   - Input rendering
   - User typing
   - Form submission
   - Keyboard shortcuts (Enter, Shift+Enter)
   - Loading states
   - Disabled states
   - Button states
   - Auto-resize behavior

3. **`geminiService.test.ts`** - 47 tests
   - API requests
   - Response streaming
   - Escalation handling
   - Error handling
   - Network errors
   - SSE parsing

### Coverage Reports

Generate coverage report:

```bash
yarn test:coverage
```

View coverage in browser:

```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured minimums in `jest.config.js`:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing Tests

### Component Tests

#### Basic Rendering

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

#### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();

  render(<Button onClick={onClick} />);

  await user.click(screen.getByRole('button'));

  expect(onClick).toHaveBeenCalledTimes(1);
});
```

#### Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

### Service Tests

#### Mocking Fetch

```typescript
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

it('should make API call', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' }),
  });

  const result = await myService();

  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.example.com/endpoint',
    expect.any(Object)
  );
});
```

#### Async Iterators

```typescript
it('should yield values from stream', async () => {
  const stream = myStreamingFunction();
  const chunks: string[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(['chunk1', 'chunk2']);
});
```

## Test Utilities

### Custom Queries

Use Testing Library queries:

```typescript
// Prefer accessible queries
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Username')
screen.getByPlaceholderText('Enter text...')

// Fall back to test IDs if needed
screen.getByTestId('custom-element')
```

### Query Priority

1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive elements
5. `getByDisplayValue` - Form values
6. `getByAltText` - Images
7. `getByTitle` - SVG/title elements
8. `getByTestId` - Last resort

### Matchers

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// State
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(checkbox).toBeChecked();

// Content
expect(element).toHaveTextContent('Hello');
expect(input).toHaveValue('test');

// Attributes
expect(element).toHaveAttribute('href', '/link');
expect(element).toHaveClass('active');
```

## Configuration

### jest.config.js

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|png|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
}
```

### setupTests.ts

Global test setup including:
- jest-dom matchers
- DOM polyfills
- Global mocks (window.matchMedia, etc.)
- Stream polyfills (ReadableStream)

## Mocks

### Component Mocks

Located in `__mocks__/` directory:

```
__mocks__/
├── fileMock.js           # Static file imports
└── reactMarkdown.js      # react-markdown library
```

### Creating Mocks

```typescript
// __mocks__/myModule.js
export const myFunction = jest.fn(() => 'mocked value');
```

## Debugging Tests

### Debug Output

```typescript
import { screen } from '@testing-library/react';

it('debug test', () => {
  render(<Component />);

  // Print entire DOM
  screen.debug();

  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### Logging

```typescript
it('should log', () => {
  console.log('Test output');  // Visible in test output
});
```

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "${fileBasenameNoExtension}",
    "--runInBand"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Common Issues

### 1. Component Not Rendering

**Problem**: `Unable to find element`

**Solution**:
- Use `screen.debug()` to see actual DOM
- Check query is correct
- Ensure component rendered successfully

### 2. Async Tests Timing Out

**Problem**: Test hangs or times out

**Solution**:
```typescript
// Add timeout
it('async test', async () => {
  await waitFor(() => {
    expect(element).toBeInTheDocument();
  }, { timeout: 5000 });
}, 10000); // Test timeout
```

### 3. Act Warnings

**Problem**: `Warning: An update to Component inside a test was not wrapped in act(...)`

**Solution**:
- Use `await userEvent.click()` instead of `fireEvent`
- Wrap state updates in `act()` from `@testing-library/react`
- Use `waitFor()` for async updates

### 4. Module Resolution

**Problem**: `Cannot find module`

**Solution**:
- Check `moduleNameMapper` in jest.config.js
- Add mock in `__mocks__/`
- Use correct file extensions (.js for imports)

## Best Practices

### DO:
- ✅ Test user behavior, not implementation
- ✅ Use accessible queries (role, label)
- ✅ Test error states
- ✅ Mock external dependencies
- ✅ Keep tests focused and small
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)

### DON'T:
- ❌ Test implementation details
- ❌ Use `container.querySelector()`
- ❌ Test third-party libraries
- ❌ Write integration tests as unit tests
- ❌ Duplicate test logic
- ❌ Ignore warnings

## Performance

### Faster Tests

```typescript
// Use fake timers for animations
jest.useFakeTimers();

// Reduce re-renders
const { rerender } = render(<Component />);
rerender(<Component prop="new" />);

// Batch tests in describe blocks
describe('Multiple related tests', () => {
  // Tests share setup
});
```

### Parallel Execution

Jest runs tests in parallel by default. To run serially:

```bash
yarn test --runInBand
```

## Continuous Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [User Event](https://testing-library.com/docs/user-event/intro)

## Examples

### Full Component Test

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyForm } from './MyForm';

describe('MyForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();

    render(<MyForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should show error for invalid email', async () => {
    const user = userEvent.setup();

    render(<MyForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

## Summary

- **32 tests passing** out of 43 total
- Comprehensive test coverage for components and services
- Easy to run with `yarn test`
- Configured for CI/CD integration
- Following React Testing Library best practices

For more examples, see the existing test files in the project.
