import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two HTML pages. The dev server serves both without this, but `vite build` only emits
// index.html unless every page is listed as an input.
export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        team: resolve(import.meta.dirname, 'team.html'),
      },
    },
  },
});
