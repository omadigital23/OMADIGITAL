// Jest setup: polyfills and default mocks for Node environment
import 'jest';

// Polyfill atob/btoa for Node
if (!(global as any).atob) {
  (global as any).atob = (b64: string) => Buffer.from(b64, 'base64').toString('binary');
}
if (!(global as any).btoa) {
  (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

// Polyfill URL.createObjectURL and Blob if needed
if (!(global as any).URL) {
  (global as any).URL = {} as any;
}
if (!(global as any).URL.createObjectURL) {
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}
if (!(global as any).URL.revokeObjectURL) {
  (global as any).URL.revokeObjectURL = jest.fn();
}

// Ensure Blob exists (Node 18+ has Blob)
if (!(global as any).Blob) {
  (global as any).Blob = require('buffer').Blob;
}

beforeEach(() => {
  jest.resetAllMocks();
  if (!(global as any).fetch) {
    (global as any).fetch = jest.fn();
  }
});
