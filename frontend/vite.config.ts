import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  // Retrieve VITE_API_BASE_URL from environment variables
  const apiBaseUrl = env.VITE_API_BASE_URL;

  // Define your preset CORS origins
  const presetCorsOrigins = [
    "http://localhost:5227",
    "http://localhost:5000",
  ];

  // Conditionally add VITE_API_BASE_URL to the CORS origins if it's defined and not already included
  if (apiBaseUrl && !presetCorsOrigins.includes(apiBaseUrl)) {
    presetCorsOrigins.push(apiBaseUrl);
  }

  // Define your preset allowed hosts
  const presetAllowedHosts = ["furnx.bitmutex.com", "localhost"];

  // Retrieve additional allowed hosts from environment variable
  const additionalAllowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_FRONTEND_URLS.split(",").map((host) => host.trim())
    : [];

  // Combine preset and additional allowed hosts, ensuring uniqueness
  const allowedHosts = Array.from(new Set([...presetAllowedHosts, ...additionalAllowedHosts]));

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts,
      cors: {
        origin: presetCorsOrigins,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
