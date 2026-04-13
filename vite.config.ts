import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

function fixForElectron(): Plugin {
  return {
    name: 'fix-for-electron',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '');
    },
  };
}

export default defineConfig({
  plugins: [vue(), fixForElectron()],
  base: process.env.GITHUB_PAGES ? '/goelrah-code/' : './',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true, passes: 2, dead_code: true },
      mangle: true,
      format: { comments: false },
    },
    cssMinify: 'lightningcss',
    assetsInlineLimit: 4096,
  },
  css: { devSourcemap: false },
});
