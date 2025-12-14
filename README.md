# text-diff

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
