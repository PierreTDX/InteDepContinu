import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:5173/InteDepContinu/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
