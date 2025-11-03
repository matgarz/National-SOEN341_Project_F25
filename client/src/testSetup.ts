import "@testing-library/jest-dom";

// Provide a value for import.meta.env.* used by components
Object.defineProperty(globalThis as any, "import", {
  value: { meta: { env: { VITE_API_BASE_URL: "http://test.api" } } },
  configurable: true,
});
