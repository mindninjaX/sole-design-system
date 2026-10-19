import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The page documents the package's source, so it always shows the code in the repository.
export default defineConfig({
  base: process.env.DOCS_BASE ?? '/sole-design-system/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@sole-ui\/react\/hq$/, replacement: path('../../packages/ui/src/hq/index.ts') },
      { find: /^@sole-ui\/react$/, replacement: path('../../packages/ui/src/index.ts') },
    ],
  },
  build: { outDir: path('../../site'), emptyOutDir: true },
});
