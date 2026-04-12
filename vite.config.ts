import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    // HTML minification — strip whitespace, comments, collapse everything
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        collapseInlineTagWhitespace: true,
        removeAttributeQuotes: true,
        sortAttributes: true,
        sortClassName: true,
      },
    }),
  ],
  base: process.env.GITHUB_PAGES ? '/goelrah-code/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    // Zero source maps — nothing to reverse-engineer
    sourcemap: false,
    // Terser for maximum obfuscation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.trace'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        booleans_as_integers: true,
        ecma: 2020,
        toplevel: true,
        hoist_funs: true,
        hoist_vars: false,
      },
      mangle: {
        toplevel: true,
        eval: true,
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
        ascii_only: true,
        beautify: false,
        ecma: 2020,
      },
      ecma: 2020,
    },
    // Hashed filenames — no readable names
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Scramble chunk splitting to make code harder to trace
        manualChunks: undefined,
      },
    },
    // CSS minification
    cssMinify: 'lightningcss',
    // Inline small assets as base64
    assetsInlineLimit: 4096,
    // Remove CSS code split comments
    cssCodeSplit: true,
  },
  // No CSS source maps either
  css: {
    devSourcemap: false,
  },
});
