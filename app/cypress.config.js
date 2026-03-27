import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Ajout du plugin grep
      require('@cypress/grep/src/plugin')(config);
      return config
    },
    baseUrl: "http://localhost:5173/InteDepContinu/",
  },
});
