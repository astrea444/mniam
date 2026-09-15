import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 375,
    viewportHeight: 812,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
