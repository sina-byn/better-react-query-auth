import { resolve } from 'node:path';

import { defineConfig } from 'vite';

import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx'],
  },

  publicDir: false,

  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.tsx'),
      formats: ['es'],
      fileName: `better-react-query-auth`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],

      // * UMD-only
      // output: {
      //   globals: {
      //     react: 'React',
      //     'react-dom': 'ReactDOM',
      //   },
      // },
    },
  },
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      insertTypesEntry: true,
      rollupTypes: true,
      outDir: 'dist',
    }),
  ],
});
