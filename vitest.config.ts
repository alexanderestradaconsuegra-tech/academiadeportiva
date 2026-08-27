import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Scope to this project's own source only. The .impeccable submodule ships
    // its own suite written for bun:test, which vitest picks up and fails on
    // if the whole tree is scanned.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
})
