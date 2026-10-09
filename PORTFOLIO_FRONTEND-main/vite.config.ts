import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: {
      'process.env.REACT_APP_BASE_URL': JSON.stringify(
        env.REACT_APP_BASE_URL || env.VITE_BASE_URL || 'http://localhost:3001'
      ),
      'process.env': {},
    },
    server: {
      port: 3000,
      open: false,
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/react-icons')) {
              return 'vendor-icons';
            }
          },
        },
      },
    },
  };
});
