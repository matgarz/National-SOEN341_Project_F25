import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

Object.defineProperty(globalThis as any, "import", {
  value: { meta: { env: { VITE_API_BASE_URL: "http://test.api" } } },
  configurable: true,
});
