# Biome Linter & Formatter Setup

## Overview

Biome has been installed and configured for both frontend and backend. Biome is a fast all-in-one toolchain for web projects that provides linting, formatting, and more.

## What Was Added

### Dependencies
- **Frontend**: `@biomejs/biome@^2.3.7`
- **Backend**: `@biomejs/biome@^2.3.7`

### Configuration Files
- `/biome.json` - Frontend Biome configuration
- `/server/biome.json` - Backend Biome configuration
- `/.biomeignore` - Frontend ignore patterns
- `/server/.biomeignore` - Backend ignore patterns

### Package.json Scripts

#### Frontend Scripts
```bash
yarn lint         # Check for lint errors
yarn lint:fix     # Fix auto-fixable lint errors
yarn format       # Format code
yarn check        # Lint + format in one command
yarn type-check   # TypeScript type checking
```

#### Backend Scripts
```bash
cd server
yarn lint         # Check for lint errors
yarn lint:fix     # Fix auto-fixable lint errors
yarn format       # Format code
yarn check        # Lint + format in one command
yarn type-check   # TypeScript type checking
```

## Biome Configuration

### Frontend (`biome.json`)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.7/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      },
      "complexity": {
        "noForEach": "off"
      },
      "correctness": {
        "noUnusedVariables": "warn"
      },
      "a11y": {
        "useButtonType": "warn",
        "useKeyWithClickEvents": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  }
}
```

### Backend (`server/biome.json`)

Similar configuration with backend-specific adjustments:
- No accessibility rules (not applicable to backend)
- Console.log allowed for logging

### Ignore Files

Files ignored from linting/formatting:
- `node_modules/`
- `dist/`, `build/`
- `.next/`, `.vite/`
- `coverage/`
- `*.config.js`, `*.config.ts`
- Environment files (`.env`, `.env.local`)
- Lock files

## Usage Guide

### Daily Workflow

Before committing code:
```bash
# Frontend
yarn check        # Lint and format all files
yarn type-check   # Check TypeScript types

# Backend
cd server
yarn check        # Lint and format all files
yarn type-check   # Check TypeScript types
```

### Fixing Issues

```bash
# Auto-fix what Biome can fix
yarn lint:fix
yarn format

# Manual fixes required for:
# - Complex logic issues
# - Type errors
# - Accessibility issues
```

### VS Code Integration

Install the Biome VS Code extension:
```
ext install biomejs.biome
```

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit"
  }
}
```

### Pre-commit Hook (Optional)

Using Husky:
```bash
yarn add -D husky lint-staged
npx husky install
```

`.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

## Rules Overview

### Enabled Rules

#### Suspicious
- `noExplicitAny`: Warn on `any` type usage
  ```typescript
  // ⚠️ Warning
  function foo(x: any) {}

  // ✅ Good
  function foo(x: unknown) {}
  ```

#### Style
- `useConst`: Error on mutable variables that could be const
  ```typescript
  // ❌ Error
  let x = 5; // x never reassigned

  // ✅ Good
  const x = 5;
  ```

- `noNonNullAssertion`: Warn on non-null assertions
  ```typescript
  // ⚠️ Warning
  const value = maybeNull!;

  // ✅ Good
  const value = maybeNull ?? defaultValue;
  ```

#### Complexity
- `noForEach`: Disabled (forEach is allowed)

#### Correctness
- `noUnusedVariables`: Warn on unused variables
  ```typescript
  // ⚠️ Warning
  const unusedVar = 5;

  // ✅ Good (prefix with _)
  const _unusedVar = 5;
  ```

#### Accessibility (Frontend only)
- `useButtonType`: Warn on buttons without type
  ```typescript
  // ⚠️ Warning
  <button>Click</button>

  // ✅ Good
  <button type="button">Click</button>
  ```

- `useKeyWithClickEvents`: Warn on onClick without keyboard handler
  ```typescript
  // ⚠️ Warning
  <div onClick={handler} />

  // ✅ Good
  <button onClick={handler}>Click</button>
  ```

### Formatting Style

- **Indentation**: 2 spaces
- **Line Width**: 100 characters
- **Quotes**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Always required
- **Trailing Commas**: ES5 style
- **Arrow Parentheses**: Always
- **Bracket Spacing**: Enabled

Example:
```typescript
// Before
const foo = (x) => {
return x + 1
}

// After formatting
const foo = (x) => {
  return x + 1;
};
```

## CI/CD Integration

### GitHub Actions

`.github/workflows/lint.yml`:
```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      # Frontend
      - run: yarn install
      - run: yarn check
      - run: yarn type-check

      # Backend
      - run: cd server && yarn install
      - run: cd server && yarn check
      - run: cd server && yarn type-check
```

## Comparison with Other Tools

### Biome vs ESLint + Prettier

**Advantages of Biome:**
- ⚡ **10-100x faster** than ESLint + Prettier
- 🔧 **All-in-one** tool (no plugin hell)
- 🚀 **Zero config** defaults
- 📦 **Single dependency**
- 🎯 **Consistent** formatting and linting

**When to use ESLint:**
- Need specific plugins not available in Biome
- Existing large ESLint configuration
- Team preference/familiarity

## Troubleshooting

### "Cannot find module @biomejs/biome"
**Solution**: Run `yarn install` in the respective directory

### Configuration errors
**Solution**: Check schema version matches installed Biome version
```bash
npx biome --version
```

### Ignoring specific files
Add to `.biomeignore`:
```
path/to/file.ts
path/to/directory/
```

### Disable rule for specific line
```typescript
// biome-ignore lint/style/useConst: explanation here
let x = 5;
```

### Disable rule for file
```typescript
/* biome-ignore-file */
```

## Common Commands Reference

```bash
# Check for issues (no changes)
yarn lint

# Fix auto-fixable issues
yarn lint:fix

# Format code
yarn format

# Check + format
yarn check

# Type check (TypeScript)
yarn type-check

# Check specific files
npx biome check src/file.ts

# Format specific files
npx biome format --write src/file.ts

# Print configuration
npx biome rage

# Migrate from ESLint/Prettier
npx biome migrate
```

## Resources

- [Biome Website](https://biomejs.dev/)
- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [Biome Rules Reference](https://biomejs.dev/linter/rules/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)

## Benefits

### Performance
- Linting: ~50ms for entire codebase
- Formatting: ~100ms for entire codebase
- Total: <1 second for all checks

### Developer Experience
- Instant feedback
- Consistent formatting
- Auto-fix capabilities
- Type-aware linting (with TypeScript)

### Code Quality
- Catch common errors
- Enforce best practices
- Improve accessibility
- Maintain consistency

## Future Enhancements

1. **Custom Rules**: Add project-specific lint rules
2. **Import Sorting**: Configure import organization
3. **Git Hooks**: Add pre-commit linting
4. **CI/CD**: Integrate into pipeline
5. **Editor Integration**: Set up for all team members

## Notes

- Biome is actively developed and improving rapidly
- Rule set may expand in future versions
- Configuration is intentionally minimal for maintainability
- Focus on recommended rules for best practices
