import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      'pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '(components)': path.resolve(__dirname, './src/(components)'),
    }
  },
  server: {
    proxy: {
      '/api/3d/analyze': {
        target: process.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/3d\/analyze/, '/api/v1/autodesk/process'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // '/api/aps': {
      //   target: process.env.VITE_API_3D_BASE_URL || 'http://localhost:3001',
      //   changeOrigin: true,
      //   configure: (proxy, options) => {
      //     proxy.on('error', (err, req, res) => {
      //       console.log('3D API proxy error', err);
      //     });
      //     proxy.on('proxyReq', (proxyReq, req, res) => {
      //       console.log('Sending Request to 3D API:', req.method, req.url);
      //     });
      //     proxy.on('proxyRes', (proxyRes, req, res) => {
      //       console.log('Received Response from 3D API:', proxyRes.statusCode, req.url);
      //     });
      //   },
      // }
    }
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-darwin-arm64', '@rollup/rollup-darwin-x64']
  },
  build: {
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-darwin-arm64', '@rollup/rollup-darwin-x64']
    }
  },
  define: {
    'process.env.ROLLUP_SKIP_NATIVE': 'true'
  },
  esbuild: {
    target: 'es2020'
  }
})
