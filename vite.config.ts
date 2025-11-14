import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Your existing shims
      'use-sync-external-store/with-selector': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
      'react-use/lib/useLocalStorage': path.resolve(__dirname, 'src/shims/useLocalStorage.js'),
      'events': path.resolve(__dirname, 'src/shims/events.js'),
      'mitt': path.resolve(__dirname, 'src/shims/mitt.js'),
      'pino/browser': path.resolve(__dirname, 'src/shims/pino-browser.js'),
      
      // Add direct shim resolution for the missing specifiers
      'use-sync-external-store/shim/with-selector.js': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
      'use-sync-external-store/shim': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
    }
  },
  server: {
    host: true,
    port: 3000,
    cors: true,
    headers: {
      // Allow cross-origin communication for wallet SDKs
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    },
    proxy: {
      '/api': {
        target: 'https://api.clonex.wtf',
        changeOrigin: true,
        secure: true
      }
    }
  },
  preview: {
    host: true,
    port: 3000
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/style-[hash].css';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: (id) => {
          // CRITICAL FIX: Only split out Web3 libraries
          // Keep React and ALL React-dependent code in main bundle
          
          // Web3 libraries only - this is the ONLY thing we split out
          if (
            id.includes('node_modules/wagmi') ||
            id.includes('node_modules/viem') ||
            id.includes('node_modules/@rainbow-me/rainbowkit') ||
            id.includes('node_modules/@wagmi/') ||
            id.includes('node_modules/@reown/') ||
            id.includes('node_modules/@walletconnect/')
          ) {
            return 'vendor-web3';
          }
          
          // Everything else (React, UI libs, utilities) stays with app code
          // This ensures React is ALWAYS available before anything tries to use it
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vendor-web3') {
            return 'assets/vendor/[name]-[hash].js';
          }
          return 'assets/chunks/[name]-[hash].js';
        },
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
  },
  
  define: {
    global: 'globalThis'
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-router-dom',
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
      'eventemitter3'
    ],
    exclude: [
      'lucide-react',
      'use-sync-external-store',
      'zustand',
      '@walletconnect/logger'
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
});
