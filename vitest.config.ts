import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true, // lets RTL auto-detect afterEach and clean up on its own
        setupFiles: ['./vitest.setup.ts'],
    },
});
