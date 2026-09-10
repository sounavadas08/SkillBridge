import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/login') req.url = '/login.html';
          else if (url === '/onboarding') req.url = '/onboarding.html';
          else if (url === '/portal') req.url = '/portal.html';
          else if (url === '/sso-callback') req.url = '/sso-callback.html';
          next();
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {

      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        onboarding: resolve(__dirname, 'onboarding.html'),
        portal: resolve(__dirname, 'portal.html'),
        'sso-callback': resolve(__dirname, 'sso-callback.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
