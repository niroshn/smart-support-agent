// Jest setup file
import '@testing-library/jest-dom';
import { ReadableStream, TextEncoder, TextDecoder } from 'web-streams-polyfill';

// Polyfill ReadableStream for Jest (Node environment doesn't have it)
global.ReadableStream = ReadableStream as any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock import.meta
global.importMeta = {
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock scrollTo
window.scrollTo = jest.fn();
