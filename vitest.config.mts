import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000, // the live GitHub walk needs the room
    reporters: [
      "default",
      ["junit", { outputFile: "reports/junit.xml" }],
      "html",
    ],
  },
});
