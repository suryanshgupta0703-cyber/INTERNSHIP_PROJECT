// Test setup file for Vitest
import { vi } from 'vitest';

// Mock window object for node environment
Object.defineProperty(global, 'window', {
  value: {
    transformers: null,
    addEventListener: vi.fn(),
  },
  writable: true
});

// Mock PDF.js worker for testing environment
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: '/pdf.worker.js'
  },
  getDocument: vi.fn()
}));

// Mock URL constructor for older environments
if (!globalThis.URL) {
  globalThis.URL = class {
    constructor(url: string) {
      return { toString: () => url } as any;
    }
  } as any;
}

// Mock File API for testing
global.File = class MockFile {
  name: string;
  type: string;
  size: number;
  content: string;

  constructor(content: string[], name: string, options: { type: string }) {
    this.content = content[0];
    this.name = name;
    this.type = options.type;
    this.size = content[0].length;
  }

  text() {
    return Promise.resolve(this.content);
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
} as any;