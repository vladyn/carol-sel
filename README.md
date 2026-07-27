# carol-sel

An infinite card carousel driven entirely by vertical page scroll. As you scroll down the page, the carousel section pins in place and cards slide through; reaching either end silently wraps back around, so the motion loops infinitely in both directions without ever feeling like it stopped.

## Features

- Scroll-only interaction — no buttons, dots, or autoplay; the carousel advances purely from the user's vertical scroll (mouse wheel, trackpad, or touch)
- Seamless infinite loop in both directions via duplicated item copies and imperceptible scroll-position resets
- Per-card scale/opacity animation driven by the Web Animations API, scrubbed in sync with scroll position
- Built with React, TypeScript, and Vite

## Getting Started

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn — swap the commands below accordingly)

### Install
```bash
npm install
```

### Run in development
```bash
npm run dev
```
Starts the Vite dev server with hot module replacement.

### Build for production
```bash
npm run build
```
Type-checks the project (`tsc -b`) and outputs a production-ready bundle to `dist/`.

### Preview the production build
```bash
npm run preview
```
Serves the built `dist/` output locally so you can sanity-check the production bundle.

### Lint
```bash
npm run lint
```
Runs Oxlint over the project.

## Project Structure
```
src/
  components/
    Carousel.tsx   # Scroll-driven infinite carousel
    Card.tsx       # Individual slide/card
  App.tsx
  main.tsx
```
