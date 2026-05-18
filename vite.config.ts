import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import path, { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src/components", "src/index.ts"],
      exclude: ["src/main.tsx", "src/App.tsx"],
      tsconfigPath: "./tsconfig.build.json",
      entryRoot: "src",
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AppointmentPlugin",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "redux",
        "react-redux",
        "redux-persist",
        'tailwindcss',

        // add these
        "lodash",
        "luxon",
        "react-toastify",
        "react-hook-form",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
      },
    },
    cssCodeSplit: false,
  },
});
