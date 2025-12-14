# text-diff

[![Deploy](https://github.com/ohmrefresh/text-diff/actions/workflows/deploy.yml/badge.svg)](https://github.com/ohmrefresh/text-diff/actions/workflows/deploy.yml)
[![CI](https://github.com/ohmrefresh/text-diff/actions/workflows/ci.yml/badge.svg)](https://github.com/ohmrefresh/text-diff/actions/workflows/ci.yml)

Browser-only, client-side text diff viewer built with Vite + React + TypeScript.

## Setup

```bash
npm install
npm run dev   # start Vite dev server
npm run build # type-check and build for production
```

## Usage

1. Paste or type the **Original** text on the left and the **Updated** text on the right.
2. Choose a diff mode: **Line by line** or **Word level**.
3. Toggle formatting between **Highlighted** (color-coded) and **Plain text** output.
4. Copy the plain diff to your clipboard or export it as a `.txt` file.

## Features

- Client-side rendering only—no backend or runtime server required.
- Color-coded diff with added, removed, and unchanged segments.
- Plain text view for exporting or sharing.
- Line-by-line and word-level diff modes powered by a browser-compatible diff library.
- Handles large inputs efficiently using deferred updates and memoized diff calculations.
- Simple, responsive layout with side-by-side editors and diff output.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Header with stats
│   ├── TextInput.tsx   # Text input component with file upload
│   ├── Toolbar.tsx     # Toolbar with controls
│   └── DiffView.tsx    # Diff visualization component
├── hooks/              # Custom React hooks
│   ├── useDiff.ts      # Hook for diff computation
│   └── useFileUpload.ts # Hook for file upload handling
├── utils/              # Utility functions
│   ├── textUtils.ts    # Text processing utilities
│   └── diffUtils.ts    # Diff computation utilities
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── App.css             # Application styles
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Code Organization

The codebase follows a modular structure:

- **Components**: Reusable UI components with clear responsibilities
- **Hooks**: Custom hooks for managing complex state and side effects
- **Utils**: Pure utility functions for text processing and diff computation
- **Types**: Centralized TypeScript type definitions

## Testing

The project uses Vitest for unit testing. Test files are organized in the `src/__tests__` directory:

```
src/__tests__/
├── components/      # Component tests
│   ├── Header.test.tsx
│   ├── TextInput.test.tsx
│   └── Toolbar.test.tsx
├── hooks/          # Hook tests
│   ├── useDiff.test.ts
│   └── useFileUpload.test.ts
├── utils/          # Utility function tests
│   ├── textUtils.test.ts
│   └── diffUtils.test.ts
└── setup.ts        # Test setup file
```

### Running Tests

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Test Coverage

All tests passing: **7 test files, 54 tests**

Tests cover:
- ✅ **Text utility functions** (10 tests) - normalize newlines, split lines
- ✅ **Diff computation logic** (12 tests) - building aligned rows, formatting output
- ✅ **React components** (22 tests) - Header, TextInput, Toolbar
- ✅ **Custom hooks** (10 tests) - useDiff, useFileUpload

**Test Breakdown by Module:**
- `textUtils.test.ts`: 10 tests covering text normalization and line splitting
- `diffUtils.test.ts`: 12 tests covering diff row alignment and plain text formatting
- `Header.test.tsx`: 6 tests covering header display and stats
- `TextInput.test.tsx`: 6 tests covering textarea and file upload UI
- `Toolbar.test.tsx`: 10 tests covering mode selection and action buttons
- `useDiff.test.ts`: 7 tests covering diff computation hook
- `useFileUpload.test.ts`: 3 tests covering file upload handler
