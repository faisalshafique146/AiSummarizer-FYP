import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { summarizeDevPlugin } from "./config/summarizeDevPlugin.ts";

export default defineConfig(({ mode }) => {
  const serverEnvironment = loadEnv(
    mode,
    process.cwd(),
    "HUGGING_FACE_API_TOKEN",
  );

  return {
    plugins: [
      react(),
      tailwindcss(),
      summarizeDevPlugin(serverEnvironment.HUGGING_FACE_API_TOKEN),
    ],
  };
});
