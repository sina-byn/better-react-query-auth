import { resolve } from 'node:path';

import { defineConfig } from 'vite';

import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  publicDir: false,

  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      formats: ['es'],
      fileName: `better-react-query-auth`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-dom/client',
        '@tanstack/react-query',
      ],

      // * UMD-only
      // output: {
      //   globals: {
      //     react: 'React',
      //     'react-dom': 'ReactDOM',
      //     'react-dom/client': 'ReactDOM',  // Maps to same global
      //     'react/jsx-runtime': 'ReactJSXRuntime',
      //     '@tanstack/react-query': 'ReactQuery',
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
