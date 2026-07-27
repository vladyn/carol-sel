# Infinite Scroll Carousel

A horizontal card carousel driven entirely by vertical page scroll. As you scroll down the page, the carousel section pins in place and cards slide through; reaching either end silently wraps back around, so the motion loops infinitely in both directions without ever feeling like it stopped.

## Live Demo

[https://carol-j65nzywq5-vladyns-projects.vercel.app/](https://carol-j65nzywq5-vladyns-projects.vercel.app/)

## Features

- Scroll-only interaction — no buttons, dots, or autoplay; the carousel advances purely from the user's vertical scroll (mouse wheel, trackpad, or touch)
- Seamless infinite loop in both directions via duplicated item copies and imperceptible scroll-position resets
- Per-card scale/opacity animation driven by the Web Animations API, scrubbed in sync with scroll position
- Built with React + TypeScript

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
Starts a local dev server with hot reload.

### Build for production
```bash
npm run build
```
Outputs a production-ready bundle to `dist/`.

### Preview the production build
```bash
npm run preview
```

### Run tests
```bash
npm run test
```
Runs the Vitest suite (`jsdom` environment) covering carousel scroll/wrap behavior and card rendering.

## Project Structure
