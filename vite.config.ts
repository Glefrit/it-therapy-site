import vinext from "vinext";
import { defineConfig } from "vite";

// Render pages during the build for static hosting on GitHub Pages.
export default defineConfig({ plugins: [vinext()] });
