import { defineConfig } from "vitest";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          globals: true,
        },
      },
      {
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          globals: true,
          setupFiles: ["./tests/setup.ts"],
        },
      },
    ],
  },
});
