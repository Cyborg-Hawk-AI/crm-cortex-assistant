
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'extension-assets',
      buildEnd() {
        if (mode === 'production') {
          // Ensure the extension directories exist
          const iconDir = path.resolve(__dirname, 'dist/icons');
          if (!existsSync(iconDir)) {
            mkdirSync(iconDir, { recursive: true });
          }
          
          // Copy extension files
          copyFileSync(
            path.resolve(__dirname, 'public/extension/manifest.json'),
            path.resolve(__dirname, 'dist/manifest.json')
          );
          
          // Copy other extension files as needed
          // This would be implemented by a real build script
          console.log('Extension assets copied to dist folder');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sidepanel: mode === 'production' ? path.resolve(__dirname, 'public/extension/sidepanel.html') : undefined
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'sidepanel' ? 'extension/[name].js' : 'assets/[name]-[hash].js';
        },
      }
    }
  }
}));
