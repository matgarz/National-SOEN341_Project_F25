import "@testing-library/jest-dom";

Object.defineProperty(globalThis as any, "import", {
  value: { meta: { env: { VITE_API_BASE_URL: "http://test.api" } } },
  configurable: true,
});
