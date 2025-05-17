import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
	// the hostname of the frontend 
	allowedHosts: [
	"furnx.bitmutex.com",
	"localhost"
	],
  cors: {
    // the origin you will be accessing via browser for req from frontend to backend
    origin: [
      "http://localhost:5227",
      "http://localhost",
      "https://furnx-backend.bitmutex.com"
    ]
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
