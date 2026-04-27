import path from "path";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      hmr: {
        overlay: false, // Keep the laggy overlay disabled
      },
      watch: {
        usePolling: true,   // ESSENTIAL for OneDrive/Windows stability
        interval: 2000,     // Increased to 2s to reduce CPU load and "not stable" refreshes
        binaryInterval: 3000,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.tanstack/**', 
          '**/*.tmp',
          '**/~$*',
        ],
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      force: false,
      include: [
        'react', 'react-dom', 'lucide-react', 'recharts', 'framer-motion', 
        '@supabase/supabase-js'
      ],
    },
    define: envDefine,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tanstackStart(),
      viteReact(),
    ].filter(Boolean),
  };
});
