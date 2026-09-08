import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// The generated `backend.ts` bindings import `ExternalBlob` from
// `@caffeineai/object-storage`, whose `dist/index.js` re-exports a `./blob`
// subpath that does not resolve under Vitest's node resolution in this
// environment. The production build resolves it through Vite's bundler, but
// the test runner cannot. Provide a minimal mock so the generated bindings
// load; the app's own code never exercises blob upload/download in these tests.
vi.mock("@caffeineai/object-storage", () => ({
  ExternalBlob: class ExternalBlob {},
}));

// recharts' ResponsiveContainer observes its container with ResizeObserver,
// which jsdom does not implement. Provide a minimal no-op so chart components
// render in tests.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);
