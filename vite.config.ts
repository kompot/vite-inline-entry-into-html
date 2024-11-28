import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { injectBuildResults } from "./viteInjectBuildResultsPlugin.ts";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: ["index.html", "src/loader.ts"],
      output: {
        entryFileNames: "entry-[name].[hash].js",
      },
    },
  },
  plugins: [
    react(),

    injectBuildResults({
      tagType: "script",
      position: "head",
      assetFilter: (asset) => asset.name === "loader",
    }),
  ],
});
