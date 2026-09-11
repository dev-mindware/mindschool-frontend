import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import crypto from "crypto";

// ============================================================================
// Polyfills
// ============================================================================
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

if (!global.crypto) {
  global.crypto = crypto.webcrypto as any;
}

// ============================================================================
// Mock do next/navigation
// ============================================================================
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ============================================================================
// Suprimir warnings irrelevantes
// ============================================================================
const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Warning: An update to") ||
        args[0].includes("act()"))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// ============================================================================
// Reset de mocks entre testes
// ============================================================================
afterEach(() => {
  jest.clearAllMocks();
});